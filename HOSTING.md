# Host Little Stream

Run the Node server from this folder. A current Node LTS release is enough. The room server has no npm dependencies. The browser loads the pinned Three.js build from jsDelivr.

```sh
npm start
```

The default address is http://127.0.0.1:8080. If another server is using that port, run `PORT=8081 npm start`. Python's static server can show the world, but the room controls need the Node server.

For your friends to connect, run the Node server on a public host with HTTPS. Set `HOST=0.0.0.0` and use the port supplied by the host. Serve the page, room API and media from the same origin. If you use a reverse proxy, enable streaming for `/api/rooms/*/events` and disable response buffering for that endpoint. Use one Node process for the first version. A room lives in the memory of that process, so restarting it clears rooms. An idle room expires after six hours.

## Invite someone

1. Click the two-person icon, enter your name and choose **Create room**.
2. Copy the invite link and send it to your friend. The link uses your site's public address after deployment.
3. Your friend opens the link, enters a name and joins. The toolbar count and roster report the connection. You can also see a small avatar when you are near them.
4. You both keep your own camera and local sound settings. The host sets the shared sky and projector. The calendar icon lets the host share a month and weather preset. Live calendar uses the month in India. Leaving the cinema view returns you to the café. The room keeps playing until the host pauses or closes the projector.

## Watch together

Put a video you can share into the `media` folder, such as `media/movie.mp4`, or provide a direct HTTPS video URL that permits cross-origin playback. For the bundled server, use simple filenames containing letters, numbers, hyphens or underscores. A browser-playable MP4 or WebM in 16:9 fits best on the cloth. A general webpage, a streaming service link, and a local file picker URL do not work as shared video sources.

1. In the room panel, set the source to `/media/movie.mp4`.
2. Open the projector, then choose **Watch from cinema**. This also enables playback on that device when a video source is set. Each friend needs to do this or choose **Enable playback** to allow browser audio.
3. The host can play, pause and seek for everyone. Someone joining late gets the current position when they enable playback. Each device streams the video directly. The room sends the video URL and timing state.
4. Try a short clip in two separate browser profiles before sharing the public link. Check sound on both devices, a seek, late join, and leaving.

Files placed under `media` are served by their URLs. The room link controls entry to the room, so use a video you are comfortable serving from this host.

## Streaming services

Netflix and Prime Video watch parties are deferred. An external watch-party link could send everyone from the café to a shared session in their service tab. The cloth projector currently uses the direct video sources described above.

## Source and checks

- `room-server.mjs` owns rooms, names, positions, sky, projector and the playback clock. Clients receive snapshots with server-sent events and send updates with HTTP requests.
- `room-client.mjs` handles the invite and guest list, smooths avatar positions, and applies the room clock to the video texture on the cloth.
- `world.mjs` contains the bed and lamp, waterfall mist, pond and downstream channel. `viewer-shell.html` contains the icons and panel.
- After source edits, run `python3 export.py` and reload. When changing server code, restart the Node process.
- `node check-room.mjs` tests the room API and range delivery locally. Scene and timer checks are in `npm test` after installing the project dependencies.


## Vercel deployment: riversidepomodoro.vercel.app

The public page stays on Vercel. `api/rooms.js` handles room actions and `lib/room-service.mjs` keeps shared room data in Upstash Redis, not Function memory. Browser clients exchange snapshots through short presence updates; this does not require long-lived WebSocket connections. Each room allows two people total and expires after six hours without updates. Local `npm start` still uses the existing Node server.

One-time account setup:

1. Open this Vercel project → Storage → connect an Upstash Redis database. Use a free plan if available; review any provider charges before accepting.
2. Ensure Production (and Preview if desired) has `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. The integration may use `KV_REST_API_URL` and `KV_REST_API_TOKEN`; both names are supported. Keep tokens in Vercel environment settings, never in source or chat.
3. Deploy this repository revision. `vercel.json` builds only `public/index.html`, intentional `media/` videos and the room function. No video assets are added by the room feature.
4. Visit `/api/rooms` on the deployed site. It must report `configured: true`, `capacity: 2`, and `transport: poll`. If configured is false, reconnect storage or add the two variables, then redeploy.
5. Open the site in two different browser profiles. Create a room in one, share its link with the other, and test calendar, movie URL, play/pause/seek and reconnect. A third profile must receive the two-person capacity error.

`node check-vercel-room.mjs` checks cross-instance synchronization and concurrent joins with an injected Redis-compatible test adapter. `node check-room.mjs` checks the original local server. Live cloud storage still requires the account setup above.

Video files selected through Choose video remain local to that browser. To watch the same video together, set a direct HTTPS video URL in the room panel. The room backend stores the URL and playback position, not the recording.

As of 28 November, shared rooms are paused. The deployed API returns 410 without contacting Redis unless `ROOMS_ENABLED=true`. Keep it disabled during solo mode. Existing room records expire through their own six-hour TTL; no other database keys are changed.
