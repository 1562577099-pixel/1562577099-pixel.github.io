"""Export the current ToyFight portfolio under /toyfight without changing the root site."""
import hashlib
import html
import json
import pathlib
import re
import shutil
import urllib.parse

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / 'toyfight-replica'
DEST = ROOT / 'dist' / 'toyfight'
BASE = '/toyfight'
TEXT = {'.html', '.css', '.js', '.mjs', '.json', '.svg', '.txt', '.xml'}

DEST.mkdir(parents=True, exist_ok=True)
shutil.copytree(SOURCE / 'dist', DEST, dirs_exist_ok=True)

# The Sites preview uses an external CDN for the reference videos to fit its
# storage limit. GitHub Pages can serve the complete set from the same origin.
manifest = json.loads((SOURCE / 'reference-manifest.json').read_text(encoding='utf8'))
video_map = {}
for public_id in manifest['videos']:
    filename = hashlib.sha1(public_id.encode()).hexdigest()[:20] + '.mp4'
    source = SOURCE / 'reference-media' / 'toyfight-videos' / filename
    if not source.is_file():
        raise FileNotFoundError(source)
    output = DEST / 'assets' / 'video' / filename
    output.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, output)
    video_map[public_id] = BASE + '/assets/video/' + filename

(DEST / 'replica' / 'video-map.js').write_text(
    'window.__referenceVideos=' + json.dumps(video_map) +
    ';window.__referenceVideo=(id,fallback)=>window.__referenceVideos[id]||fallback;',
    encoding='utf8')

for path in DEST.rglob('*'):
    if not path.is_file() or path.suffix not in TEXT:
        continue
    text = path.read_text(encoding='utf8')
    for folder in ['_next', 'assets', 'portfolio', 'replica', 'vendor', 'images', 'fonts', 'audio']:
        # Ignore already-prefixed paths; this also covers escaped JSON strings.
        text = re.sub(r'(?<!/toyfight)/' + folder + r'/', BASE + '/' + folder + '/', text)
    text = text.replace('https://toyfight-study-miku.mythicgull18.chatgpt.site',
                        'https://1562577099-pixel.github.io' + BASE)
    if path.suffix == '.html':
        text = re.sub(r'(\bhref=[\"\'])(/(?!/|toyfight(?:/|[\"\']))[^\"\']*)',
                      lambda m: m[1] + BASE + m[2], text)
    if path == DEST / 'portfolio' / 'page-wipe.js':
        text = text.replace('location.assign(path);',
            "const url=new URL(path,location.href);if(url.origin===location.origin&&"
            "url.pathname!=='/toyfight'&&!url.pathname.startsWith('/toyfight/'))"
            "url.pathname='/toyfight'+url.pathname;location.assign(url.href);")
    path.write_text(text, encoding='utf8')

(DEST / '.nojekyll').touch()

# Validate the exported namespace and the route/resource paths referenced by HTML.
errors = []
pages = list(DEST.rglob('*.html'))
for path in pages:
    text = path.read_text(encoding='utf8')
    for raw in re.findall(r'(?:src|href)=[\"\'](/[^\"\'#]*)', text):
        ref = html.unescape(raw).split('?')[0]
        if ref.startswith('//'):
            continue
        if not ref.startswith(BASE + '/'):
            errors.append(f'{path.relative_to(DEST)}: escaped namespace: {ref}')
            continue
        target = ROOT / 'dist' / urllib.parse.unquote(ref).lstrip('/')
        if not target.is_file() and not (target / 'index.html').is_file():
            errors.append(f'{path.relative_to(DEST)}: missing {ref}')
for path in DEST.rglob('*'):
    if path.is_file() and path.stat().st_size >= 100 * 1024 * 1024:
        errors.append(f'GitHub file limit: {path.relative_to(DEST)}')
if errors:
    raise RuntimeError('\n'.join(errors))
print(f'Exported {len(pages)} pages and {len(video_map)} local reference videos under {BASE}/')
print(f'Export size: {sum(p.stat().st_size for p in DEST.rglob("*") if p.is_file()) / 1024**2:.1f} MiB')
