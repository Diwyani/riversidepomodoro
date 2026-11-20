# Editing and sharing Little Stream

## How the pieces fit together

`world.mjs` builds the shapes, materials and lights. `viewer-shell.html` controls the camera, icons, keyboard, audio and video. `focus-timer.mjs` tracks work and break intervals. Each frame, the viewer reads input, moves the camera, advances the world, then asks Three.js to draw the scene. Run `python3 export.py` from this folder after changing source, then reload the local page. The generated `index.html` contains the code and painted textures. Three.js loads separately.

```text
Source code and painted textures → export.py → index.html → browser
Keyboard or icon → camera or scene state → Three.js → canvas
```

| What you want to change | Search for | What to edit |
| --- | --- | --- |
| Move the whole bed | `const bedX` in world.mjs | Change `bedX` or `bedZ`. The frame, mattress, sheet, kambal and pillow are children of the bed group, so they travel together. |
| Make the pillow bigger | `oversized pillow` | In `pillow.scale.set(x,y,z)`, X changes width, Y changes height and Z changes depth. |
| Dye or reshape the kambal | `rose wool kambal` | Change `color:0xaa6571` for a new solid color. The plane dimensions set its size. The vertex loop adds folds and drapes its edges. |
| Widen the rug | `large rug under the bed` | In the `box` call, the first dimensions are width, height and depth. Change the border positions along with the rug. |
| Redesign the mushroom lamp | `window mushroom lamp` | Each pair in the cap profile is radius and height. Three.js spins that profile into the shade. Edit the profile for a new silhouette. Change the point light color or intensity to change the glow on the room. |
| Move the lamp beside a different window | `nightstand.position.set` | Move the whole stand and lamp together. Adjust the window opening separately. |
| Resize the pond | `pondRadius` | This radius feeds the pond mesh, bank stones, terrain cut and movement boundary. Walk the approach afterward to check the path clearance. |
| Change where the water goes | `riverAt`, `streamStartZ` and `streamEndZ` | The river centerline controls the channel. Flow marks travel toward increasing Z, which leads toward the entrance. |
| Soften the head of the waterfall | `veilTexture` | The soft sprite layers hide the source. Tune their height, spread and opacity. The lower cascade has its own foam and mist. |

For a bigger room redesign, sketch the floor plan first. Mark the stairs, camera arrival, bed footprint, window and clear walking space. Block those out with plain boxes, walk through once, then add fabrics and lights. X and Z locate furniture on the floor and Y moves it up. The attic's furniture positions are relative to the café group. Its stairs, landing and camera height use shared dimensions, so check both directions after changing the floor.

Try adjusting a single value and rebuilding. For example, change `bedX=.48` to `bedX=.30` and see the whole bed move. Keep the rug and side table in view and check that the stair landing still feels clear.

## The seasonal calendar

Little Stream uses the month in Asia/Kolkata. Its art presets are spring in March–April, summer in May–June, monsoon in July–September, autumn in October–November, and winter in December–February. This is the scene's calendar, with each preset designed for a distinct mood.

Search for `monthSeasons` to move a month to a different season and `seasonPalettes` to edit leaf and grass colors, fog, wind and snow patches. The month and the sky icon are independent, so a winter morning and a winter full moon use the same terrain. The calendar icon lets you preview a month or return to live India time. Choose clear, mist, rain or snow to override the season’s usual weather. A solo page checks the live calendar once a minute. In a shared room, the server includes the season in each snapshot, so friends in different time zones see the same landscape.

## Sharing the room

The current build includes a room server, an invite link, a guest roster, small avatars and a shared playback clock. See HOSTING.md for setup and the steps for watching together. Each visitor controls their own camera, audio and timer. The host controls the shared sky, projector and movie position.

The browser sends updates with HTTP requests and receives room snapshots through server-sent events. The server stores the video URL, play or pause state, playback position and the time it last changed. Each browser streams that video directly and uses the shared clock to correct its playback position.

- [Three.js fundamentals](https://threejs.org/manual/pages/fundamentals.html)
- [MDN media playback position](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/currentTime)
