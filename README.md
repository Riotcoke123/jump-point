# Jump Point

A self-hosted Node/Express site that catalogs the exact moment TV shows
started to decline, seeded with ~200 shows and open to fan-submitted
"jump the shark" arguments with upvote/downvote sorting.

## Stack

- Node.js (**22.5+ required**) + Express
- SQLite via Node's built-in `node:sqlite` module — no separate database
  server, and no native module to compile, so `npm install` works on a
  plain Windows/Mac/Linux machine with no build tools installed. You'll
  see a one-line `ExperimentalWarning: SQLite is an experimental feature`
  on startup — that's expected and harmless, not an error.
- EJS server-rendered views, no build step
- Plain CSS (no framework)

## Getting started

```bash
npm install
npm run seed     # creates db/jumppoint.sqlite and loads ~200 shows
npm start        # runs on http://localhost:3000
```

Set `PORT` in your environment to change the port. The SQLite file lives at
`db/jumppoint.sqlite` — back that one file up and you have the whole site's
data (shows + every fan submission + vote counts).

## What's in the box

- `db/shows-data.js` — the seed catalog (title, network, start/end year,
  genre) for ~200 shows across sitcoms, dramas, sci-fi, reality, animation,
  soaps, procedurals and teen shows. Years are general-knowledge
  approximations — correct any you spot wrong directly in this file and
  re-run `npm run seed` (it uses `INSERT OR IGNORE`, so it won't duplicate
  shows you already have).
- `db/seed.js` — loads the catalog plus 8 starter fan arguments so the site
  isn't empty on first run.
- `routes/shows.js` — browsing (search / genre filter / sort), the show
  detail page, submitting a new argument, and voting.
- `views/` — EJS templates (`index`, `show`, `404`, plus header/footer
  partials).
- `public/style.css` — the whole visual design, no framework.

## Extending it

Some natural next steps if you keep building on this:

- **Moderation** — right now any visitor can submit an argument with no
  approval step. Add an `approved` column on `moments` and a small admin
  route (this matches the pattern you've used before in your other
  admin-panel projects) if you want to review submissions before they're
  public.
- **Duplicate/spam control** — nothing currently stops the same visitor
  voting on a moment repeatedly (no cookies/session tracking on votes).
  Adding a signed cookie or IP+moment hash check would fix that cheaply.
- **Show artwork** — there's no poster/thumbnail field. Adding one (either
  a URL column or an uploads folder) would make the grid a lot more
  visual.
- **Per-show "quality over time" chart** — the data model (season/episode
  per moment) is already there to eventually plot a rough decline curve
  per show using Chart.js, similar to your quota dashboard project.
