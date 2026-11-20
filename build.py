from pathlib import Path
import base64
p=Path(__file__).resolve().parent
world=(p/'world.mjs').read_text().replace('export ','')
assets={k:'data:image/png;base64,'+base64.b64encode((p/n).read_bytes()).decode() for k,n in {'leaf':'leaf.png','bark':'bark.png','ground':'ground.png','path':'path.png','fringe':'leaf-fringe.png','stone':'stone.png','barkSoft':'barkSoft.png'}.items()}
import json
# Rive elements (lavender, flowers, pond life): embed rive/meadow.riv when it exists, else the scene skips them.
riv=p/'rive'/'meadow.riv'
riv_data=json.dumps(base64.b64encode(riv.read_bytes()).decode()) if riv.exists() else 'null'
html=(p/'viewer-shell.html').read_text().replace('__RIVE__',(p/'rive-elements.mjs').read_text().replace('export ','')).replace('__RIV__',riv_data)
html=html.replace('__WORLD__',world).replace('__TIMER__',(p/'focus-timer.mjs').read_text().replace('export ','')).replace('__ROOM__',(p/'room-client.mjs').read_text().replace('export ','' )).replace('__ASSETS__',json.dumps(assets))
(p/'fragment.html').write_text(html)
print('Fragment:',len(html.encode()),'bytes')
