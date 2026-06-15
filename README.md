# AUR checker

Static GitHub Pages site for comparing installed Arch package names against a malicious
AUR list.

## What it does

- Accepts pasted `pacman` output or a text file upload for installed packages.
- Accepts a user-provided malicious package list by paste or file upload.
- Normalizes each line down to a package name.
- Shows any matches in the browser.
- Lets you browse the malicious list in-page without downloading it.

The app runs entirely in the browser and does not upload package data anywhere.

## Commands

The page includes copy buttons for:

- `pacman -Qqm`
- `pacman -Qq`
- `pacman -Q`

Each command also has a `| wl-copy` variant on the page.

## Input format

The checker works with:

- `pacman -Qqm` output
- `pacman -Qq` output
- `pacman -Q` output
- Plain text lists with one package name per line

If version numbers or other fields are present, the app uses the first token on each
line as the package name.

## Local use

Open `index.html` through a static web server so the browser can fetch
`compromised_aurs.list`.

Example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub Pages deployment

1. Push the repository to GitHub.
2. Enable GitHub Pages for the branch that contains `index.html`.
3. Make sure `compromised_aurs.list`, `index.html`, `app.js`, and `styles.css` are
   published together.

## Data source

`compromised_aurs.list` is the bundled starter list. Users can replace it in the page
with their own malicious AUR list by pasting or uploading a file.
