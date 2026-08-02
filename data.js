/* ------------------------------------------------------------------
   data.js — everything the site knows.

   This file is the single source of truth for now. It is shaped to
   match the Supabase tables we'll add later, so wiring the backend in
   is a swap of where the data comes from, not a rewrite of the page.

   Anything not decided yet should stay null. The page has designed
   states for "not booked yet" and "hasn't told us yet" — leaving a
   field null renders those, which is the honest thing to show.
------------------------------------------------------------------ */

const TRIP = {
  destination: 'Cabo San Lucas',
  region: 'Baja California Sur, México',
  airport: 'SJD',
  origin: 'State College, PA',
  classYear: 2007,
  start: '2027-02-04',   // Thursday
  end: '2027-02-08',     // Monday
  tagline: 'Feliz Cumpleaños',
};

/* ------------------------------------------------------------------
   The flight sheet.

   Everyone's arrival and departure details live in a shared Google
   Sheet, which people edit directly — there's no form on this site.
   Paste the link here and the page reads it on every visit.

   Setting it up, once:
     1. Make a sheet with these headers on row 1, one row per household:
          id | arrival flight | arrival date | arrival time |
               departure flight | departure date | departure time
        Fill the id column with: barry, francois, kunal, rohit, nitin,
        dk, matt — those have to match the ids further down this file.
        Headers are matched loosely, so "arr time" and "arrival time"
        both work, and column order doesn't matter.
     2. Data > Data validation on the date and time columns, so people
        get pickers instead of free text. Worth the two minutes.
     3. Protect row 1 and the id column (Data > Protect sheets) so a
        stray sort can't scramble it.
     4. Share > Publish to web > CSV, and paste that link below. A
        normal /edit link works too.

   Leave it null and the page just uses whatever is written in this
   file. If the sheet is unreachable the page still renders in full —
   it simply won't have the flight details.

   Note: Google caches the published CSV, so edits can take a few
   minutes to appear. That's Google, not the site.
------------------------------------------------------------------ */
/* The editable link to that same sheet, shown as a button under the
   timeline so people know where to go. This is NOT the published CSV
   above — that one is read-only and downloads a file when clicked. Use
   the normal .../edit link from Google's address bar.

   Anyone who can reach the site can then edit the sheet, which is the
   same trust model as everything else here. If you'd rather not put an
   edit link on a public page, paste a view-only link instead and keep
   the edit one in the group chat. Leave it null to show no button. */
const SHEET_EDIT = null;

const SHEET_CSV =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vT1bTiCycP-fU9ZoU2uONtw5ot0e' +
  'HVzMK48_pfisiwzOi4s7fVD6JOoKLDAz732getCIjFK5DxZxeWO/pub?output=csv';

/* The villa. status: 'looking' | 'shortlist' | 'booked' */
const STAY = {
  status: 'looking',
  name: null,
  area: null,
  url: null,
  bedrooms: null,
  notes: null,
};

/* Hero photo pool.

   Shuffled on every page load, so a different one greets you each time.
   Drop files into photos/slideshow/ and add a line here.

   `pos` sets the focal point for the full-bleed crop (any CSS
   background-position). Portrait shots usually want the crop pulled up
   so faces don't get cut off; landscape shots are fine on 'center'.

   Captions are guesses from the filenames — fix any I got wrong.

   While this array is empty the hero falls back to a rendered
   ocean-dusk backdrop, which is a designed state, not a broken one.
*/
const MEMORIES = [
  { src: 'photos/slideshow/kv_wedding.jpg',          caption: 'Kunal and Priya’s wedding' },
  { src: 'photos/slideshow/kv_wedding2.jpg',         caption: 'Kunal and Priya’s wedding' },
  { src: 'photos/slideshow/kv_bachelor_party.jpg',   caption: 'Kunal’s bachelor party' },
  { src: 'photos/slideshow/kv_bachelor_party3.jpg',  caption: 'Kunal’s bachelor party' },
  { src: 'photos/slideshow/matts_wedding.jpg',       caption: 'Matt and Kat’s wedding' },
  { src: 'photos/slideshow/nitin_bachelor_party.JPG', caption: 'Nitin’s bachelor party' },
  { src: 'photos/slideshow/barry_matt_hike.jpg',     caption: 'Barry and Matt, hiking' },
  { src: 'photos/slideshow/escape_room.jpg',         caption: 'The escape room',   pos: 'center 30%' },
  { src: 'photos/slideshow/barry_austin.jpg',        caption: 'Barry in Austin',   pos: 'center 28%' },
  { src: 'photos/slideshow/barry_in_thought.jpg',    caption: 'Barry, in thought', pos: 'center 25%' },
  { src: 'photos/slideshow/barry_is_a_g.jpg',        caption: 'Barry is a G',      pos: 'center 25%' },
  { src: 'photos/slideshow/nitin_neck_tatoo.jpg',    caption: 'Nitin’s neck tattoo', pos: 'center 25%' },
  { src: 'photos/slideshow/nitin-v2.jpg',            caption: null,                pos: 'center 30%' },
  { src: 'photos/slideshow/uncle_g.jpg',             caption: 'Uncle G' },
  { src: 'photos/slideshow/dk_janice.jpg',           caption: 'DK and Janice' },
  { src: 'photos/slideshow/dk_north_korea.jpg',      caption: 'DK in North Korea' },
  { src: 'photos/slideshow/dk_hike.jpg',             caption: 'DK on a hike',       pos: 'center 25%' },
  { src: 'photos/slideshow/dk_topless.jpg',          caption: null,                 pos: 'center 25%' },
  { src: 'photos/slideshow/dk_iv.JPG',               caption: null,                 pos: 'center 25%' },
  { src: 'photos/slideshow/sorrento_nitin.jpg',      caption: 'Nitin in Sorrento',  pos: 'center 25%' },
  { src: 'photos/slideshow/museum_of_illusions.jpg', caption: 'Museum of Illusions', pos: 'center 28%' },
  { src: 'photos/slideshow/musem_of_illusions_2.jpg', caption: 'Museum of Illusions', pos: 'center 28%' },
  { src: 'photos/slideshow/IMG_1811.jpg',            caption: null },
  { src: 'photos/slideshow/IMG_0257.jpg',            caption: null,                 pos: 'center 25%' },
  { src: 'photos/slideshow/IMG_2867.jpg',            caption: null,                 pos: 'center 25%' },
  { src: 'photos/slideshow/kv_family.jpg',           caption: 'Kunal, Priya and the kids' },
  { src: 'photos/slideshow/rohit_family.jpg',        caption: 'Rohit and family' },
  { src: 'photos/slideshow/matching_shades.jpg',     caption: 'Matching shades',    pos: 'center 22%' },
  { src: 'photos/slideshow/IMG_1776.jpg',            caption: null,                 pos: 'center 22%' },

  /* Left out on purpose — all of these are still in photos/slideshow/,
     so uncomment to put any of them back in the rotation:

     nopride_pride.JPG — a two-panel collage with its own caption text
       and a Pic Stitch watermark, which fights the title on top of it.
     kv_wedding_3.GIF — only 538px wide, so it goes soft full-bleed.
     IMG_0698 — a four-panel video-call screenshot; the faces end up too
       small to read once it's cropped to a full-bleed banner.
     IMG_2472 — a screenshot of a photo inside the Messages app, so it
       carries a status bar, a filmstrip and a row of buttons. Re-save
       just the photo itself and it's worth adding.
     IMG_2058 / IMG_2059 / IMG_9541 — real photos, but 473–604px wide,
       which goes to mush at full-bleed size. Re-export them larger from
       the originals and they're worth adding.
  */
];

/* Households.

   arrive / depart are ISO dates within the trip window, or null if that
   household hasn't confirmed. Flights are [] until someone books.
   role: 'og' (one of the seven) | 'partner' | 'kid'

   `sn` is the AIM screen name, which is what the crew section shows
   instead of the real name. Add `away: '...'` to any household to give
   them an away message on the buddy list — that's the spot for a bad
   song lyric.
*/
const HOUSEHOLDS = [
  {
    id: 'barry',
    lead: 'Barry Liu',
    short: 'Barry',
    sn: 'barryliu89',
    photo: 'photos/headshots/barry.jpg',
    members: [{ name: 'Barry', role: 'og' }],
    arrive: null,
    depart: null,
    flights: [],
  },
  {
    id: 'francois',
    lead: 'Francois Greer',
    short: 'Francois',
    sn: 'çois53',
    photo: 'photos/headshots/francois.jpg',
    members: [
      { name: 'Francois', role: 'og' },
      { name: 'Gorety', role: 'partner' },
    ],
    arrive: null,
    depart: null,
    flights: [],
  },
  {
    id: 'kunal',
    lead: 'Kunal Vakharia',
    short: 'Kunal',
    sn: 'basketocorn5',
    photo: 'photos/headshots/kunal.jpg',
    members: [
      { name: 'Kunal', role: 'og' },
      { name: 'Priya', role: 'partner' },
      { name: 'Kai', role: 'kid' },
      { name: 'Ava', role: 'kid' },
    ],
    arrive: null,
    depart: null,
    flights: [],
  },
  {
    id: 'rohit',
    lead: 'Rohit Ananth',
    short: 'Rohit',
    sn: 'rohit430',
    photo: 'photos/headshots/rohit.jpg',
    members: [
      { name: 'Rohit', role: 'og' },
      { name: 'Katie', role: 'partner' },
      { name: 'Maya', role: 'kid' },
      { name: 'Sai', role: 'kid' },
    ],
    arrive: null,
    depart: null,
    flights: [],
  },
  {
    id: 'nitin',
    lead: 'Nitin Kumar',
    short: 'Nitin',
    sn: 'SirTinOfNih',
    photo: 'photos/headshots/nitin.jpg',
    members: [
      { name: 'Nitin', role: 'og' },
      { name: 'Michelle', role: 'partner' },
    ],
    arrive: null,
    depart: null,
    flights: [],
  },
  {
    id: 'dk',
    lead: 'Dongkeun Lee',
    short: 'DK',
    sn: 'toa166',
    photo: 'photos/headshots/dk.jpg',
    members: [
      { name: 'DK', role: 'og' },
      { name: 'Janice', role: 'partner' },
    ],
    arrive: null,
    depart: null,
    flights: [],
  },
  {
    id: 'matt',
    lead: 'Matt Chang',
    short: 'Matt',
    sn: 'sportsmaster117',
    photo: 'photos/headshots/matt.jpg',
    members: [
      { name: 'Matt', role: 'og' },
      { name: 'Kat', role: 'partner' },
    ],
    arrive: null,
    depart: null,
    flights: [],
  },
];

/* ------------------------------------------------------------------
   Preview mode.

   Flip to true to see the page with sample flights, dates and a booked
   villa filled in — useful for judging the design before real data
   exists. The sample data below is invented and clearly fake; never
   ship this as true.
------------------------------------------------------------------ */
const PREVIEW = false;

const PREVIEW_DATA = {
  stay: {
    status: 'booked',
    name: 'Casa Coralina',
    area: 'Pedregal',
    url: null,
    bedrooms: 8,
    notes: 'Pool, chef’s kitchen, ten-minute walk to the marina.',
  },
  households: {
    barry:    { arrive: '2027-02-05', depart: '2027-02-08', flights: [
      { dir: 'in',  airline: 'Alaska',   no: 'AS 1284', date: '2027-02-05', time: '13:20' },
      { dir: 'out', airline: 'Alaska',   no: 'AS 1285', date: '2027-02-08', time: '14:45' },
    ]},
    francois: { arrive: '2027-02-04', depart: '2027-02-08', flights: [
      { dir: 'in',  airline: 'United',   no: 'UA 1902', date: '2027-02-04', time: '11:05' },
    ]},
    kunal:    { arrive: '2027-02-04', depart: '2027-02-08', flights: [
      { dir: 'in',  airline: 'American', no: 'AA 1423', date: '2027-02-04', time: '15:40' },
      { dir: 'out', airline: 'American', no: 'AA 1424', date: '2027-02-08', time: '16:10' },
    ]},
    rohit:    { arrive: '2027-02-04', depart: '2027-02-07', flights: [] },
    nitin:    { arrive: '2027-02-05', depart: '2027-02-08', flights: [
      { dir: 'in',  airline: 'Delta',    no: 'DL 622',  date: '2027-02-05', time: '12:15' },
    ]},
    dk:       { arrive: null, depart: null, flights: [] },
    matt:     { arrive: '2027-02-04', depart: '2027-02-08', flights: [
      { dir: 'in',  airline: 'Southwest', no: 'WN 2210', date: '2027-02-04', time: '10:30' },
      { dir: 'out', airline: 'Southwest', no: 'WN 2211', date: '2027-02-08', time: '13:55' },
    ]},
  },
};
