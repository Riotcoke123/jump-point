const express = require('express');
const router = express.Router();
const db = require('../db/database');

const PAGE_SIZE = 24;

function getGenres() {
  return db.prepare(`SELECT DISTINCT genre FROM shows ORDER BY genre ASC`).all().map(r => r.genre);
}

// --- Home / browse ---
router.get('/', (req, res) => {
  const q = (req.query.q || '').trim();
  const genre = (req.query.genre || '').trim();
  const sort = (req.query.sort || 'title').trim();
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const where = [];
  const params = {};

  if (q) {
    where.push(`s.title LIKE @q`);
    params.q = `%${q}%`;
  }
  if (genre) {
    where.push(`s.genre = @genre`);
    params.genre = genre;
  }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  let orderClause = `ORDER BY s.title ASC`;
  if (sort === 'moments') orderClause = `ORDER BY moment_count DESC, s.title ASC`;
  if (sort === 'year') orderClause = `ORDER BY s.year_started DESC, s.title ASC`;

  const shows = db.prepare(`
    SELECT s.*, COUNT(m.id) AS moment_count
    FROM shows s
    LEFT JOIN moments m ON m.show_id = s.id
    ${whereClause}
    GROUP BY s.id
    ${orderClause}
    LIMIT @limit OFFSET @offset
  `).all({ ...params, limit: PAGE_SIZE, offset });

  const totalRow = db.prepare(`
    SELECT COUNT(*) AS c FROM shows s ${whereClause}
  `).get(params);
  const totalPages = Math.max(1, Math.ceil(totalRow.c / PAGE_SIZE));

  res.render('index', {
    shows,
    genres: getGenres(),
    q,
    genre,
    sort,
    page,
    totalPages,
  });
});

// --- Show detail ---
router.get('/shows/:slug', (req, res) => {
  const show = db.prepare(`SELECT * FROM shows WHERE slug = ?`).get(req.params.slug);
  if (!show) return res.status(404).render('404');

  const moments = db.prepare(`
    SELECT * FROM moments WHERE show_id = ?
    ORDER BY (upvotes - downvotes) DESC, created_at DESC
  `).all(show.id);

  res.render('show', { show, moments, submitted: req.query.submitted === '1' });
});

// --- Submit a new "jump the shark" argument ---
router.post('/shows/:slug/moments', (req, res) => {
  const show = db.prepare(`SELECT * FROM shows WHERE slug = ?`).get(req.params.slug);
  if (!show) return res.status(404).render('404');

  const { submitted_by, season, episode, episode_title, argument } = req.body;

  if (!argument || !argument.trim()) {
    const moments = db.prepare(`
      SELECT * FROM moments WHERE show_id = ?
      ORDER BY (upvotes - downvotes) DESC, created_at DESC
    `).all(show.id);
    return res.status(400).render('show', {
      show,
      moments,
      error: 'An argument is required to submit a moment.',
      submitted: false,
    });
  }

  db.prepare(`
    INSERT INTO moments (show_id, submitted_by, season, episode, episode_title, argument)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    show.id,
    (submitted_by || '').trim() || 'Anonymous',
    (season || '').trim() || null,
    (episode || '').trim() || null,
    (episode_title || '').trim() || null,
    argument.trim()
  );

  res.redirect(`/shows/${show.slug}?submitted=1#submit`);
});

// --- Vote on a submitted moment ---
router.post('/moments/:id/vote', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const direction = req.body.direction === 'down' ? 'down' : 'up';
  const moment = db.prepare(`SELECT * FROM moments WHERE id = ?`).get(id);
  if (!moment) return res.status(404).render('404');

  const show = db.prepare(`SELECT * FROM shows WHERE id = ?`).get(moment.show_id);

  if (direction === 'up') {
    db.prepare(`UPDATE moments SET upvotes = upvotes + 1 WHERE id = ?`).run(id);
  } else {
    db.prepare(`UPDATE moments SET downvotes = downvotes + 1 WHERE id = ?`).run(id);
  }

  res.redirect(`/shows/${show.slug}#moment-${id}`);
});

module.exports = router;
