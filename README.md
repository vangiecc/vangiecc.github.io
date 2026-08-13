# vangie.github.io

Vangie's personal publishing site for Blog, Notes, and Research.

## Local Preview

Start the dependency-free static server:

```bash
python3 -m http.server 8000
```

Open <http://127.0.0.1:8000/>.

## Tests

```bash
npm test
```

## Build Notes

The Operating Systems archive is generated from the exported Markdown under `notes/OS+7dcefccb-df9f-49d/`:

```bash
npm install
npm run build:notes
```

This creates the publishable archive at `/notes/operating-systems/`, including seven chapter pages and copied image, CSV, and PDF resources. Edit the Markdown source, then run the build command again before publishing.

## Routes

- `/` - home and archive index
- `/blog/` - essays and viewpoints
- `/notes/` - learning notes
- `/notes/operating-systems/` - Operating Systems study archive
- `/research/` - research progress

The repository is a dependency-free static site and can be published directly with GitHub Pages.
