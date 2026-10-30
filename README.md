# Studio Poster · Murabbi Ummah

Fill in the details, and the poster appears in the Murabbi Ummah design; download it as a 1080 × 1350 PNG. No AI and no cost; logos, colours and fonts always follow the brand guide.

## Templates

| Template | File | What it shows |
|---|---|---|
| Poster program | `templates/program.js` | Programme type, title, series, speaker with photo, date, time, venue |
| Profil murabbi | `templates/profil.js` | Murabbi with photo, branch, education and skills lists, community roles, up to 3 offerings |
| Jadual ceramah | `templates/jadual.js` | Speaker with photo, month, and a table of up to 8 programmes (date, time, place, programme); the day is worked out from the date |
| Kata-kata hikmah | `templates/hikmah.js` | A short quote, large and centred, with an optional speaker and an optional background photo under a navy wash |

Each template file lists its form fields (`fields`), sample content (`sample`), and a `draw` function that lays out the poster with the shared helpers in `engine.js`. To add a template, copy one, change the fields and the drawing, and add a `<script>` line in `index.html`.

## How it works

- `index.html`: the app. Home lists the templates with live thumbnails; the editor shows the poster beside a tabbed form (one tab per section), steps through with "Seterusnya", flags text that doesn't fit, and downloads or shares the PNG.
- `engine.js`: canvas helpers shared by all templates: text that shrinks to fit (and reports when it can't), photo in a white box with zoom and position, header logos, footer, bullet lists, Malay dates with the correct weekday.
- Text stays readable: list text never goes below 18 px on the 1080 px poster; anything longer is flagged before download.
- What people type is saved in their browser (per template). Uploaded photos stay in memory only and are never sent anywhere.

## Brand

Biru Iman `#1B325F`, Kuning Melayu `#E9A742`, Krona One (headings), Inter (body). Source: `../brand.md` (from the Figma brand guide).

Logos in `assets/` were cut from the Figma brand guide. On navy the logo is all yellow, as the guide's colour variations show. Replace them with the original logo files when available, keeping the file names.

Social icons: Simple Icons (CC0), in `icons.js`.

## Publishing

Live at https://mu.isma.org.my (cPanel, folder `/public_html/mu.isma.org.my`).

Before a release, bump `VERSION` and the `?v=` on the script tags in `index.html` together, so phones load the new files.

Updates go through cPanel's **Git Version Control**: push to GitHub, then in cPanel open the repository, click **Update from Remote**, then **Deploy HEAD Commit**. `.cpanel.yml` copies the app files into the site folder.

Staging is local: review changes on http://localhost:5082 (it shows a "Local" marker) before they are pushed to `main`. `.cpanel.yml` only deploys the `main` branch.

## Run it locally

```bash
python3 -m http.server 5082 --directory ~/isma-studio/murabbi-ummah/app
```

Then open http://localhost:5082.
