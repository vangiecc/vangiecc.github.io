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

## Notes

Both study archives embed their original FlowUs share views directly — no build step is involved. Content updates happen in FlowUs and appear on the site automatically.

## Routes

- `/` - home and archive index
- `/blog/` - essays and viewpoints
- `/notes/` - learning notes
- `/notes/operating-systems/` - Operating Systems notes (embedded FlowUs share)
- `/notes/computer-organization/` - Computer Organization notes (embedded FlowUs share)
- `/research/` - research progress

The repository is a dependency-free static site and can be published directly with GitHub Pages.
