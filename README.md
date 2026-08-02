# Cabo 2027

A one-page site for the State College class of ’07 reunion —
Cabo San Lucas, Thursday February 4 to Monday February 8, 2027.

It's a static page: no build step, no dependencies, no server. Open
`index.html` in a browser and it works.

## Files

| File | What it's for |
| --- | --- |
| `index.html` | Page structure |
| `styles.css` | All styling |
| `app.js` | Renders every section from the data |
| `data.js` | **The only file you edit as plans firm up** |
| `photos/` | `headshots/` for the crew cards, `slideshow/` for the hero |

## Updating the trip

Everything lives in `data.js`. Nothing else needs touching.

**Someone books a flight** — add it to that household's `flights` array
and set their `arrive` / `depart`:

```js
arrive: '2027-02-04',
depart: '2027-02-08',
flights: [
  { dir: 'in',  airline: 'American', no: 'AA 1423',
    from: 'JFK', to: 'SJD', date: '2027-02-04', time: '15:40' },
],
```

`dir` is `'in'` or `'out'`. Anything you don't know yet can be left off.

**The villa gets booked** — set `STAY.status` to `'booked'` and fill in
the name, area and link.

Leave anything undecided as `null`. The page has designed states for
"not booked yet" and "hasn't told us yet" — an empty field renders those
rather than breaking, which is the honest thing to show while there are
six months to go.

## Hero photos

The top of the page runs full-bleed photos of the group, shuffled so a
different one greets you each visit. Drop files into `photos/slideshow/`
and list them in `MEMORIES` in `data.js`:

```js
const MEMORIES = [
  { src: 'photos/slideshow/tailgate-2009.jpg', caption: 'Beaver Stadium, 2009' },
  { src: 'photos/slideshow/barry_austin.jpg',  caption: 'Barry in Austin',
    pos: 'center 28%' },
];
```

Landscape shots work best. `caption` is optional and shows small under
the title; `pos` sets the crop's focal point, which portrait shots
usually need so faces don't get cut in half.

The captions currently in `data.js` are guesses from the filenames —
worth a read-through to fix any I got wrong.

Resize before committing so the page stays quick; see `photos/README.md`
for the recipe. While `MEMORIES` is empty the hero renders a Baja dusk
instead — a designed fallback, not a placeholder.

## Previewing the finished design

Most fields are empty this far out, so the page mostly shows its "not
yet" states. To see it fully populated, set `PREVIEW = true` in
`data.js`. That overlays invented sample flights and a fake villa.

**Never commit it as `true`** — the sample flights look real enough to
confuse someone.

## Headshots

See `photos/README.md` for the crop recipe. They live in
`photos/headshots/` and are 400×400 squares; `photo: ''` or a path that
404s falls back to initials on a color from the site palette, so a typo
degrades quietly.

## Publishing

Set up for GitHub Pages — `.nojekyll` is there so Pages serves the files
as-is. Push to `main` and point Pages at the repository root.

## Later

Editing `data.js` by hand is the plan for now. If it turns into a chore,
the data shapes here match the Supabase tables we'd move to, so it's a
change to where `state` comes from in `app.js` and nothing else.
