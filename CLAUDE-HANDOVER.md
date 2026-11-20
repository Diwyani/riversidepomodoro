# Little Stream movement handover for Claude

Little Stream is a desktop-first Three.js woodland walk and book café. This bundle contains the current source, generated page, painted textures, local Node room server, hosting instructions, and illustrated learning guide. The next task is to review movement with the user and fix the specific behaviors they point out.

## Run locally

1. Open the extracted `Little-Stream` folder in the coding workspace.
2. Run `npm start` and open `http://127.0.0.1:8080/`. Use `PORT=8081 npm start` if needed.
3. Edit the source, run `python3 export.py`, then refresh the browser. `index.html` and `fragment.html` are generated.
4. Run `npm install` followed by `npm test` for scene and timer checks. Run `node check-room.mjs` for the local room integration check.

## Where movement lives

| Source | What to inspect |
| --- | --- |
| `viewer-shell.html` | `frame`, keyboard handlers, and pointer handlers read WASD/arrows, handle drag-to-look, and move the camera using elapsed time. `stop` clears held keys. |
| `world.mjs` | `move` handles map limits, tree trunks, pond and river banks, café entry, stair ascent, landing and loft floor. `heightAt` is shared by terrain, path and camera. |
| `viewer-shell.html` | The café, desk, stairs and cinema handlers set camera destinations. `leaveCinema` returns the visitor to the café entrance. |
| `room-client.mjs` | Visitor positions are shared for presence and display of nearby avatars. Each visitor controls their own camera. |

## First review with the user

- Start fresh. Check forward, back, sideways, diagonal walking and drag-to-look. Press Escape and switch tabs while holding a key, then check that walking resumes cleanly.
- Walk through the open café door, turn left, climb the physical stairs, cross the landing and come back down. Compare this with the direct stairs icon in both directions.
- Open cinema from the trail and from the café. Try both exit paths and check where the view lands.
- Walk around the pond and along the banks. Check that the camera follows slopes without clipping or jumping into the water.
- Ask the user which movement changes they want after trying those routes. Existing checks exercise the geometry and room API. Browser feel, framing and real shared media playback still need a live check.

Keep the current pastel world, calendar and weather controls, café details, and room features in scope when checking regressions. The attic has a white sheet, wool kambal, curtained window and lamp on a side table. Netflix and Prime Video watch-party integration is deferred. See `HOSTING.md` and `EDITING-AND-SHARING.md` for details.
