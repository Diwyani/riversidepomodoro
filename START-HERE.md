# Little Stream — Three.js agent handover

Current editing guide: [Understanding Little Stream](Understanding%20Little%20Stream.docx) covers the scene as of 20 November 2026, the recent changes, editable search terms, build steps, and independent editing exercises. The earlier handover documents describe an older visual state.

Read HOSTING.md to start the room server and share the scene. See EDITING-AND-SHARING.md for source editing. HANDOVER.md maps the current implementation and DECISIONS.md records current choices and deferred work. How Little Stream Was Built.docx is the illustrated learning guide.

Run the current build with `npm start` inside this folder, then visit http://127.0.0.1:8080/. Internet is needed for Three.js 0.170.0 from jsDelivr. The included Node server provides the rooms and media routes.

- `world.mjs`: editable Three.js world, geometry, materials, lighting, flight, water, hut/cafe and collision.
- `viewer-shell.html`: editable UI, camera controls, audio and timer wiring. Contains build placeholders.
- `focus-timer.mjs`: independent 25/5 timer logic.
- `room-server.mjs` and `room-client.mjs`: rooms, invite links, presence and shared playback.
- `index.html`: runnable browser version with embedded textures/code.
- Five PNGs: painted material assets, editable in painting software.
- `references/`: user-supplied visual references, when available.
- `firefly-concept.png`: illustrated concept, not a game screenshot.
- `world-qa.png`, `bug-qa.png`: native geometry inspection renders; not final browser appearance.

After source or PNG edits: `python3 export.py`. This regenerates fragment.html and index.html. Do not edit generated files as the primary source.

Tests: `npm install`, then `npm test` for scene and timer. Run `node check-room.mjs` for the room integration checks. Regenerate brush textures with `npm run paint`. Python rebuild needs only its standard library. Node dependencies: three 0.170.0, @napi-rs/canvas 1.1.0.

Paste this to the next agent:

> Read START-HERE.md, HANDOVER.md and DECISIONS.md. Run the existing scene before editing. Preserve the user's peaceful blue-hour / orange-pink evening / dark-blue night direction and fuzzy painted references. First verify actual browser visuals, flowing water, cafe workspace, music and Pomodoro. Propose the next focused art improvement from that evidence. Do not rebuild the project from scratch or replace it with a generic forest.
