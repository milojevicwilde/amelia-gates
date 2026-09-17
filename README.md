# AMELIA GATES — static site

Plain HTML/CSS/JS. No build step, no npm. Open `index.html` directly and it works.

## Files

```
index.html
css/style.css
js/scroll.js
img/hero-1400.jpg      1.JPG, resized
img/hero-2400.jpg
img/portrait-1400.jpg  2.JPG, resized
img/portrait-2400.jpg
```

## Uploading via the GitHub web interface

1. Open your repo → **Add file** → **Upload files**.
2. Drag the whole unzipped folder in (not the zip itself). GitHub keeps the
   `css/`, `js/` and `img/` subfolders.
3. Commit. Cloudflare Pages redeploys on its own.

Do not add a `CNAME` file — that's a GitHub Pages thing. In Cloudflare Pages
the custom domain (`www.amelia-gates.com`) is set under
**Workers & Pages → your project → Custom domains**.

## Cache busting — read this before you change anything

Every stylesheet and script link carries a version string. Right now:

```html
<link rel="stylesheet" href="css/style.css?v=3">
<script src="js/scroll.js?v=3"></script>
```

**If you edit `css/style.css` or `js/scroll.js`, bump the number in
`index.html` to `?v=4`, then `?v=5`, and so on.** If you don't, Cloudflare and
your browser will keep serving the old file and your change will look like it
did nothing.

Images are versioned by filename instead. If you swap a photo, give the new
file a new name (`hero-2400-b.jpg`) and update `index.html` — replacing a file
with the same name hits the same cache problem.

## How the page works

One page, two full-height panels inside `#scroller`. The masthead and footer
are fixed and never move; the panels slide underneath them. `js/scroll.js`
intercepts the wheel, swipes and arrow keys so one gesture always moves exactly
one panel, never a partial scroll, and animates it with its own eased tween.

Slide speed lives in one place — `DURATION` at the top of `js/scroll.js`,
currently `1250` (milliseconds). Raise it for a slower slide. `COOLDOWN` just
below it swallows trackpad momentum so one flick can't skip a panel.

The two `.veil` divs are the dissolve bands under the masthead and above the
footer. Their depth is `--veil-top` / `--veil-bot` in `css/style.css`.

Everything that jumps between panels uses `data-goto="0"` or `data-goto="1"`:
the two chevrons and both AMELIA GATES wordmarks. To add a third panel, add a
`<section class="panel">` and the JS picks it up automatically.

`#contact` works as a deep link: `www.amelia-gates.com/#contact` opens straight
on the lower panel.
