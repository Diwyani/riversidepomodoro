from pathlib import Path
import runpy
p=Path(__file__).resolve().parent
runpy.run_path(str(p/'build.py'))
fragment=(p/'fragment.html').read_text()
css=':root{--font-size-base:14px;--foreground:#ede9df;--background:#151d2a;--primary:#ebd8b9;--primary-foreground:#242334}body{margin:0;background:var(--background);color:var(--foreground);font:400 14px system-ui;}main{height:100dvh}.viz-controls{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.btn,input,summary{font:inherit}.btn{padding:9px 15px;border:1px solid #7e8490;border-radius:7px;background:transparent;color:inherit;cursor:pointer}.btn[aria-pressed=true],.btn-primary{background:var(--primary);color:var(--primary-foreground)}.form-check{display:inline-flex;gap:7px;align-items:center}.form-label{display:grid;gap:8px}.form-control{max-width:100%;box-sizing:border-box}.text-small{font-size:12px}button:focus-visible,input:focus-visible,summary:focus-visible{outline:2px solid #f7dba3;outline-offset:3px}@media(pointer:coarse){button,summary{min-height:44px}}'
(p/'index.html').write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Blue & Blush — a quiet walk</title><style>'+css+'</style></head><body><main>'+fragment+'</main></body></html>')
print('Wrote standalone index.html')
