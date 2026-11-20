# Little Stream implementation handover

## Experience

Little Stream is a desktop first-person woodland walk and book café. The art direction uses powdery pastel pigment, warm and cool layers, and irregular shapes. Four sky settings cover dusk, half-moon night, darker full-moon night, and blue hour. Butterflies appear at blue hour and anatomical fireflies on both moonlit nights.

The trail crosses rolling terrain with stones, wind-driven grass, deodar-inspired and broadleaf trees, and persimmons. Mist veils the upper waterfall. It lands in a round pond of radius 4.85 world units, and the stream runs toward the beginning of the walk. Flow marks move toward increasing Z.

The enlarged café has wood framing and glass walls, one opening door, white curtains, books in uneven stacks, a coffee counter, pastries, a record player and a laptop desk. Clicking the shelf from nearby opens the chooser, and a book opens a paper card with a rustle. Take the stairs or use the stairs icon to reach the attic. The attic has one bed, a white sheet and rose wool kambal, an oversized pillow, a large rug, a side table with a mushroom lamp and white lace curtains.

The outdoor cinema uses a projector inside the café and an old white cloth outside by the fire. The film icon opens the night setup. Exiting returns to the café. Water, woodland ambience and music have independent mixer levels. The Pomodoro has 25-minute work and five-minute break phases.

The landscape follows the month in Asia/Kolkata, with spring, summer, monsoon, autumn and winter art presets. The calendar icon previews any month or returns to live India time. Weather can follow the season or be set to clear, mist, rain or snow. The room host shares both settings.

## Source ownership

| File | Responsibility |
| --- | --- |
| world.mjs | Geometry, textures, palette, movement and collisions, grass shader, insects, café, attic and outdoor cloth |
| viewer-shell.html | Canvas, camera, icon controls, audio, books, desk, calendar and frame loop |
| room-server.mjs | Node HTTP, invite rooms, host authority, presence, shared sky and projector, playback clock and static media range requests |
| room-client.mjs | Room UI, event stream, roster, avatars, clock correction and outdoor video texture |
| focus-timer.mjs | Deadline-based Pomodoro phase logic |
| build.py and export.py | Embed the source and PNGs and generate the browser page |

## Sharing now

Run `npm start` for the room server and see HOSTING.md for deployment. Visitors use an invite link and see a count, roster and nearby avatars while keeping their own camera. The host controls the shared sky and projector, including play, pause and seek. Each device streams the same direct video separately and synchronizes from the room's timestamp. Rooms are held in memory in one Node process.

A streaming service watch-party handoff is deferred. If revisited, treat the external watch-party URL as a separate room action. Netflix and Prime Video titles stay in their own service players.

## Verification and remaining checks

- Geometry and route tests cover terrain, water direction, palette, grass, insects, scene construction and props. Separate tests cover timer transitions.
- Local room integration testing covered invitations, join and leave, live presence, host permissions, playback messages, late joining, reconnection and HTTP media range requests.
- Actual video and audio playback across two browsers still needs checking with a real clip. Validate browser decoding, gesture to enable sound, seek correction and reconnection after deploying.
- Test the full walkthrough from a clean load, especially attic movement, lace and glass layering, and shader compilation. Native QA images and sketches are from earlier iterations.
- Mobile controls, complete furniture collision and durable room storage are future work. The host runs and deploys this build.
