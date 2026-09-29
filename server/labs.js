import express from 'express'
import { HttpError } from './auth.js'
import { now } from './db.js'

export const labsMigration = `
CREATE TABLE student_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT,
  total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  streak INTEGER NOT NULL DEFAULT 0 CHECK (streak >= 0),
  last_study_date TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX student_profiles_ranking ON student_profiles (total_xp DESC);

CREATE TABLE published_labs (
  lab_index INTEGER PRIMARY KEY CHECK (lab_index >= 0),
  course_id TEXT NOT NULL,
  unit_id TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  published_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
WITH RECURSIVE n(i) AS (SELECT 0 UNION ALL SELECT i + 1 FROM n WHERE i < 17)
INSERT INTO published_labs (lab_index, course_id, unit_id)
SELECT i, 'cisco-ccna-200-301-v2', CASE WHEN i < 6 THEN 'unit-1' WHEN i < 12 THEN 'unit-2' ELSE 'unit-3' END
FROM n;

CREATE TABLE lab_completions (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lab_index INTEGER NOT NULL REFERENCES published_labs(lab_index),
  xp_awarded INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  used_help INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  completed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (user_id, lab_index)
);

CREATE TABLE lab_drafts (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lab_index INTEGER NOT NULL CHECK (lab_index >= 0),
  state TEXT NOT NULL CHECK (json_valid(state)),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  used_help INTEGER NOT NULL DEFAULT 0,
  started_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (user_id, lab_index)
);
CREATE INDEX lab_drafts_recent ON lab_drafts (user_id, updated_at DESC);
`

const XP_BASE = 100
const XP_FIRST_TRY_BONUS = 20
const XP_NO_HELP_BONUS = 30
const RANKING_SIZE = 20

function cleanDisplayName(value) {
  const name = String(value ?? '').trim().replace(/\s+/g, ' ')
  return name.length >= 2 && name.length <= 30 ? name : null
}

function initialDisplayName(name) {
  return cleanDisplayName(name) ?? cleanDisplayName(String(name ?? '').trim().split(/\s+/).slice(0, 2).join(' '))
}

function labIndexFrom(value) {
  const index = Number(value)
  if (!Number.isInteger(index) || index < 0) throw new HttpError(400, 'Índice de laboratorio inválido.')
  return index
}

const count = value => Math.min(1_000_000, Math.max(0, Math.floor(Number(value) || 0)))

function isoOrNow(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? now() : date.toISOString()
}

export function createLabs(db) {
  const insertProfile = db.prepare(`
    INSERT INTO student_profiles (user_id, display_name) VALUES (?, ?)
    ON CONFLICT (user_id) DO NOTHING`)
  const getProfile = db.prepare(`
    SELECT user_id, display_name, total_xp, streak, last_study_date
    FROM student_profiles WHERE user_id = ?`)
  const updateDisplayName = db.prepare('UPDATE student_profiles SET display_name = ?, updated_at = ? WHERE user_id = ?')
  const listCompletions = db.prepare(`
    SELECT lab_index, xp_awarded, completed_at FROM lab_completions
    WHERE user_id = ? ORDER BY lab_index`)
  const listRanking = db.prepare(`
    SELECT user_id, display_name, total_xp, streak FROM student_profiles
    ORDER BY total_xp DESC, user_id LIMIT ${RANKING_SIZE}`)
  const listDrafts = db.prepare(`
    SELECT lab_index, state, attempts, used_help, started_at, updated_at FROM lab_drafts
    WHERE user_id = ? ORDER BY updated_at DESC LIMIT 50`)
  const upsertDraft = db.prepare(`
    INSERT INTO lab_drafts (user_id, lab_index, state, attempts, used_help, started_at, updated_at)
    VALUES (@userId, @labIndex, @state, @attempts, @usedHelp, @startedAt, @updatedAt)
    ON CONFLICT (user_id, lab_index) DO UPDATE SET
      state = excluded.state,
      attempts = excluded.attempts,
      used_help = excluded.used_help,
      started_at = excluded.started_at,
      updated_at = excluded.updated_at`)
  const isPublished = db.prepare('SELECT 1 FROM published_labs WHERE lab_index = ? AND active = 1')
  const insertCompletion = db.prepare(`
    INSERT INTO lab_completions (user_id, lab_index, xp_awarded, attempts, used_help, duration_seconds)
    VALUES (@userId, @labIndex, @xp, @attempts, @usedHelp, @durationSeconds)
    ON CONFLICT (user_id, lab_index) DO NOTHING`)
  const addXp = db.prepare(`
    UPDATE student_profiles SET
      total_xp = total_xp + @xp,
      streak = CASE
        WHEN last_study_date = date('now') THEN streak
        WHEN last_study_date = date('now', '-1 day') THEN streak + 1
        ELSE 1
      END,
      last_study_date = date('now'),
      updated_at = @now
    WHERE user_id = @userId`)
  const deleteDraft = db.prepare('DELETE FROM lab_drafts WHERE user_id = ? AND lab_index = ?')

  const ensureProfile = user => insertProfile.run(user.id, initialDisplayName(user.name))

  const award = db.transaction((user, { labIndex, attempts, usedHelp, durationSeconds }) => {
    if (!isPublished.get(labIndex)) throw new HttpError(400, 'Ese laboratorio no está publicado.')
    ensureProfile(user)
    const xp = XP_BASE + (attempts === 0 ? XP_FIRST_TRY_BONUS : 0) + (usedHelp ? 0 : XP_NO_HELP_BONUS)
    const awarded = insertCompletion.run({
      userId: user.id, labIndex, xp, attempts, usedHelp: usedHelp ? 1 : 0, durationSeconds,
    }).changes === 1
    if (awarded) {
      addXp.run({ xp, userId: user.id, now: now() })
      deleteDraft.run(user.id, labIndex)
    }
    const profile = getProfile.get(user.id)
    return { awarded, xp: awarded ? xp : 0, total_xp: profile.total_xp, streak: profile.streak }
  })

  const router = express.Router()

  router.get('/progress', (req, res) => {
    ensureProfile(req.user)
    res.json({
      profile: getProfile.get(req.user.id),
      completions: listCompletions.all(req.user.id),
      ranking: listRanking.all(),
    })
  })

  router.patch('/profile', (req, res) => {
    const displayName = cleanDisplayName(req.body?.displayName)
    if (!displayName) throw new HttpError(400, 'Escribe un nombre o alias válido de 2 a 30 caracteres.')
    ensureProfile(req.user)
    updateDisplayName.run(displayName, now(), req.user.id)
    res.json({ profile: getProfile.get(req.user.id) })
  })

  router.get('/drafts', (req, res) => {
    res.json(listDrafts.all(req.user.id).map(draft => ({
      ...draft,
      state: JSON.parse(draft.state),
      used_help: Boolean(draft.used_help),
    })))
  })

  router.put('/drafts/:labIndex', (req, res) => {
    const labIndex = labIndexFrom(req.params.labIndex)
    const { state, attempts, usedHelp, startedAt } = req.body ?? {}
    if (!state || typeof state !== 'object') throw new HttpError(400, 'El borrador no tiene un estado válido.')
    upsertDraft.run({
      userId: req.user.id,
      labIndex,
      state: JSON.stringify(state),
      attempts: count(attempts),
      usedHelp: usedHelp ? 1 : 0,
      startedAt: isoOrNow(startedAt),
      updatedAt: now(),
    })
    res.status(204).end()
  })

  router.post('/completions', (req, res) => {
    res.json(award(req.user, {
      labIndex: labIndexFrom(req.body?.labIndex),
      attempts: count(req.body?.attempts),
      usedHelp: Boolean(req.body?.usedHelp),
      durationSeconds: count(req.body?.durationSeconds),
    }))
  })

  return { router, ensureProfile }
}
