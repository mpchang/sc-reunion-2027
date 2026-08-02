# Photos

```
headshots/   square face crops, one per household — the crew cards
slideshow/   group photos — the full-bleed hero at the top of the page
originals/   full-resolution sources, gitignored
```

`data.js` points at both: each household's `photo:` field for headshots,
and the `MEMORIES` array for the slideshow.

## Headshots

400×400, ~30–60 KB each. macOS ships `sips`, so no extra tooling:

```sh
# crop to a square, offset from the top-left, then downscale to 400px
sips -c 1242 1242 --cropOffset 500 0 originals/kv2.PNG --out /tmp/step.png
sips -Z 400 -s format jpeg -s formatOptions 82 /tmp/step.png --out headshots/kunal.jpg
```

`-c H W` takes the square's size; `--cropOffset Y X` positions it. Portrait
phone photos usually need a Y offset of roughly a quarter of the height —
a centered crop tends to cut off the top of the head.

Don't upscale. If a source is smaller than 400px, keep it at its native size
(`matt.jpg` is 271px for this reason) — enlarging just adds bytes and blur.

Avatars display at 54px. Anything above ~200px is plenty.

Leaving `photo: ""` falls back to the household's initials on a color picked
from the site palette. A photo path that 404s falls back the same way, so a
typo degrades quietly instead of breaking the page.

## Slideshow

These load full-bleed behind the title on every visit, so size matters more
here than anywhere else on the site. Cap them at 2000px:

```sh
sips -Z 2000 -s format jpeg -s formatOptions 80 \
  originals/slideshow/some-photo.HEIC --out slideshow/some-photo.jpg
```

Check the result is actually smaller than the source before keeping it —
re-encoding an already-compressed JPEG can make it grow.

Then add a line to `MEMORIES` in `data.js`. Set `pos` on portrait shots
(`'center 28%'` or similar) so the crop doesn't cut faces in half.

Six files in `slideshow/` are deliberately left out of the rotation, with the
reason noted beside each commented-out line in `data.js` — two for their
content (`nopride_pride.JPG` has baked-in caption text and a watermark that
collide with the title; `IMG_0698` is a four-panel video-call screenshot
whose faces vanish once cropped) and four for being too small to survive
full-bleed (`kv_wedding_3.GIF` at 538px, and `IMG_2058` / `IMG_2059` /
`IMG_9541` at 473–604px). The last three are real photos, so re-exporting
them larger from the source would make them usable.

The hero shows a random handful per visit rather than the whole pool — see
`PER_VISIT` in `app.js`. Each photo is a full-size download, so the cap is
what keeps a long visit from pulling the entire library.

## Originals

`originals/` holds the full-resolution files people actually sent, including
`originals/slideshow/`. It's gitignored — the sources total tens of MB — and
it exists so crops can be redone without asking anyone for their photo twice.

Ask people directly rather than pulling images off the internet — you get
better photos, and "send me a headshot, funny is fine" doubles as a nudge on
the availability question.
