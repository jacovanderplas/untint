# Untint

A colour puzzle for phones. In every row and column of a picture, one colour (red, green or blue)
has slipped out of register. Drag columns up and down and rows sideways until the picture lines up again.

Untint is an installable web app (PWA): open it in a phone browser, add it to the home screen,
and it runs full-screen and offline like a normal app. There is no app store and no build step.

## Files

| File | What it is |
|---|---|
| `index.html` | The page: board, control card, new-puzzle sheet |
| `styles.css` | All styling, light and dark theme |
| `app.js` | The game: picture generators, slipping, dragging, settings, saving |
| `sw.js` | Service worker: makes the app work offline |
| `manifest.webmanifest` | App name, icons and colours for installing |
| `icons/` | App icons, made by `scripts/make_icons.py` |
| `test/pwa-check.mjs` | Automated check in Microsoft Edge |

Settings, best times and a game in progress are kept in the browser's local storage on each phone.
Photos you add yourself are never uploaded and are not kept after the app closes.

## Run it on this PC

```bash
python -m http.server 8080
```

Then open http://localhost:8080. Service workers only run on `localhost` or over HTTPS, so opening
`index.html` straight from the folder works for playing, but not for offline mode.

## Put it online

The game is live at **https://jacovanderplas.github.io/untint/**, served by GitHub Pages from
the `main` branch of this repository (folder `/`). Every push to `main` updates the site within a minute or two.

Any other static web host with HTTPS works too, because the app is just these files.
`test/` and `scripts/` are not needed on the host, but they do no harm.

## Install it on a phone

- **Android (Chrome or Edge):** open the link, then tap **Install** in the app's settings sheet,
  or use the browser menu and choose **Install app**.
- **iPhone or iPad (Safari):** open the link, tap **Share**, then **Add to Home Screen**.
  The settings sheet shows this hint on iPhones.

After the first visit the game works without a connection.

## Release an update

1. Change the files.
2. Change `VERSION` in `sw.js` (for example `untint-1.0.1`) and the version line in `index.html`.
3. Commit and push to `main`.

Phones pick up the new version the next time the app opens with a connection.

## Checks

```bash
cd test
npm install
npm run pwa
```

This starts a local server, opens the app in the Microsoft Edge installed on this PC at phone size,
and checks that:

- the service worker takes control
- the app is installable
- a drag on the picture counts as a move
- a game in progress survives closing and reopening the app
- the app still loads with the server stopped and the browser offline

It saves screenshots in `test/screens/`. If Edge is installed somewhere else, set `EDGE_PATH`.

The Claude desktop app's built-in browser can't run service workers, so use this check instead
when you test offline mode.

## Icons

```bash
python scripts/make_icons.py
```

This redraws every icon in `icons/`, using only the Python standard library.
