const db = require('./database');
const shows = require('./shows-data');

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const insertShow = db.prepare(`
  INSERT OR IGNORE INTO shows (title, network, year_started, year_ended, genre, synopsis, slug)
  VALUES (@title, @network, @year_started, @year_ended, @genre, @synopsis, @slug)
`);

const insertMoment = db.prepare(`
  INSERT INTO moments (show_id, submitted_by, season, episode, episode_title, argument, upvotes)
  VALUES (@show_id, @submitted_by, @season, @episode, @episode_title, @argument, @upvotes)
`);

const getShowIdBySlug = db.prepare(`SELECT id FROM shows WHERE slug = ?`);

const starterMomentExists = db.prepare(`
  SELECT 1 FROM moments
  WHERE show_id = @show_id AND submitted_by = @submitted_by AND argument = @argument
  LIMIT 1
`);

const seedTransaction = db.transaction(() => {
  const slugCounts = {};

  for (const [title, network, year_started, year_ended, genre] of shows) {
    let slug = slugify(title);
    if (slugCounts[slug]) {
      slugCounts[slug] += 1;
      slug = `${slug}-${slugCounts[slug]}`;
    } else {
      slugCounts[slug] = 1;
    }

    insertShow.run({
      title,
      network: network || null,
      year_started: year_started || null,
      year_ended: year_ended || null,
      genre: genre || 'Uncategorized',
      synopsis: null,
      slug,
    });
  }

  // A handful of starter arguments so new installs aren't completely empty.
  // Written as opinion/commentary, not reproduced from any source.
  const starterMoments = [
    {
      slug: 'happy-days',
      submitted_by: 'FounderMike',
      season: '5',
      episode: '3',
      episode_title: 'Hollywood',
      argument: "This is the episode that gave the whole phenomenon its name. Once Fonzie is water-skiing over an actual shark, the show stops being about a believable Milwaukee neighborhood and starts being about stunts.",
      upvotes: 42,
    },
    {
      slug: 'the-office',
      submitted_by: 'FounderMike',
      season: '8',
      episode: '1',
      episode_title: 'The List',
      argument: "The moment Michael Scott leaves Dunder Mifflin, the emotional center of the show goes with him. Everything after spends a season trying to find a new lead and never quite does.",
      upvotes: 118,
    },
    {
      slug: 'how-i-met-your-mother',
      submitted_by: 'FounderMike',
      season: '9',
      episode: '24',
      episode_title: 'Last Forever',
      argument: "Nine seasons of build-up get undone in the final episode's twist. It retroactively makes the entire back half of the show feel like it was building to a joke instead of a payoff.",
      upvotes: 205,
    },
    {
      slug: 'dexter',
      submitted_by: 'FounderMike',
      season: '8',
      episode: '12',
      episode_title: 'Remember the Monsters?',
      argument: "The lumberjack ending is treated online as the moment the show's careful moral logic collapsed into something that doesn't track with eight seasons of character work.",
      upvotes: 167,
    },
    {
      slug: 'the-walking-dead',
      submitted_by: 'FounderMike',
      season: '7',
      episode: '1',
      episode_title: 'The Day Will Come When You Won\u2019t Be',
      argument: "The show had already been through several 'the group finds a new dangerous place to live' cycles by this point, but the brutal cold open here is widely pointed to as where the fatigue really set in.",
      upvotes: 89,
    },
    {
      slug: 'scrubs',
      submitted_by: 'FounderMike',
      season: '9',
      episode: '1',
      episode_title: 'Our First Day of School',
      argument: "Season 9 rebrands the show around a mostly new cast of medical students. It's often treated as a spin-off in disguise rather than a real continuation of the original series.",
      upvotes: 54,
    },
    {
      slug: 'roseanne',
      submitted_by: 'FounderMike',
      season: '9',
      episode: '1',
      episode_title: 'Into That Good Night',
      argument: "The Conners winning the lottery pushes a famously grounded working-class sitcom into soap-opera territory it never recovers a tone for.",
      upvotes: 37,
    },
    {
      slug: 'desperate-housewives',
      submitted_by: 'FounderMike',
      season: '1',
      argument: "Most voters on the original fan tally said this one held up fine, but among the dissenters the most common complaints weren't about a specific episode at all — they were about the promotional overkill around the show, especially its infamous Monday Night Football intro, plus some early grumbling that the whole premise felt overhyped from day one.",
      upvotes: 9,
    },
    {
      slug: 'family-ties',
      submitted_by: 'FounderMike',
      season: '5',
      argument: "This is one of the closer calls in the catalog — 'never jumped' and the birth of youngest son Andrew finished almost neck and neck in the original fan vote. Close behind those were Mallory's boyfriend Nick joining the cast and Jennifer's sudden growth spurt, both landing in a near-tie for third.",
      upvotes: 18,
    },
    {
      slug: 'good-times',
      submitted_by: 'FounderMike',
      season: '3',
      argument: "Unlike most shows in this catalog, the plurality pick here wasn't 'never jumped' — it was the death of the father, James, by a wide margin. Voters felt the show leaned much harder on J.J.'s catchphrase-driven comic relief once he was gone, at the expense of the more grounded family dynamic the earlier seasons had.",
      upvotes: 22,
    },
    {
      slug: 'alice',
      submitted_by: 'FounderMike',
      season: '5',
      argument: "The top pick by a wide margin was Flo's departure from the diner, with her replacements never quite recreating the same chemistry with the rest of the cast. Alice's periodic musical-number episodes and Tommy's sudden growth spurt were the next most commonly cited turning points.",
      upvotes: 15,
    },
    {
      slug: '24',
      submitted_by: 'FounderMike',
      season: '1',
      episode: '15',
      argument: "The plurality view among longtime viewers is actually that this one never really lost it, but the most commonly cited stumble is Teri's sudden amnesia in the middle of season one — a soap-opera device that felt out of step with the show's otherwise grounded, real-time premise. The mountain-lion subplot around Kim in season two comes up almost as often.",
      upvotes: 31,
    },
    {
      slug: 'adam-12',
      submitted_by: 'FounderMike',
      season: '7',
      argument: "Most longtime viewers actually maintain this one never jumped at all. Of the fans who do point to a turning point, the most common pick is the final season, when the show swapped in a new patrol car and briefly worked in a rookie-officer storyline that shook up the original two-man dynamic.",
      upvotes: 12,
    },
    {
      slug: 'family-matters',
      submitted_by: 'FounderMike',
      season: '4',
      episode: '1',
      argument: "Steve Urkel goes from a recurring nuisance neighbor to the undisputed center of the show, and the Winslow family sitcom underneath him quietly disappears.",
      upvotes: 29,
    },
  ];

  for (const m of starterMoments) {
    const row = getShowIdBySlug.get(m.slug);
    if (!row) continue;

    // Re-running the seed script (e.g. after adding new shows) must not
    // duplicate starter arguments that are already in the database.
    const alreadySeeded = starterMomentExists.get({
      show_id: row.id,
      submitted_by: m.submitted_by,
      argument: m.argument,
    });
    if (alreadySeeded) continue;

    insertMoment.run({
      show_id: row.id,
      submitted_by: m.submitted_by,
      season: m.season || null,
      episode: m.episode || null,
      episode_title: m.episode_title || null,
      argument: m.argument,
      upvotes: m.upvotes || 0,
    });
  }
});

seedTransaction();

const count = db.prepare('SELECT COUNT(*) AS c FROM shows').get().c;
console.log(`Seeded database with ${count} shows.`);
