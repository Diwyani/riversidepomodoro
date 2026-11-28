# Little Stream decisions and follow-up

| Decision | Current approach |
| --- | --- |
| Art and navigation | Keep the pastel woodland, four sky settings and first-person walk. Review one composed view at a time when refining art. |
| Café and attic | Use the glass café with a single door, white curtains and clickable stacked books. Keep a stairs shortcut as well as physical stairs. The loft layout centres on the bed, white sheet, rose kambal, rug and lamp. |
| Private and shared controls | Each visitor controls their own camera, local audio and timer. The room host controls shared sky, calendar, weather and playback. |
| Room transport and hosting | Run one Node process with server-sent events and HTTP updates. Room state currently lives in memory. |
| Video source | Use a shareable direct video file for projected watch parties. Test real playback on two browsers after deployment. |
| Netflix and Prime Video | Deferred. A possible later step is an external watch-party link from the room, with playback in the service’s own tab. |
| Further work | Decide after trying a shared visit whether you want durable rooms, finer avatar motion, mobile walking controls or a more detailed cinematic look. |


## Solo mode and deferred rooms — 28 November 2026

Shared rooms are paused: no room button, room initialization, or presence polling in the playable page. Retain the backend source for a later revisit. Current use is solo walking, reading/notes, study timer and local movie playback. Book notes use browser localStorage and are not shared. The credit is always top right; sound is opened from the dock. Pond fish and the fish/pond shortcut are removed.

Next room pass, when requested: selectable avatars; a separate Redis database; explore voice conversation with microphone permission and a suitable realtime transport; shared YouTube playback using the official embedded player; desktop-video sharing with explicit upload size/storage limits or a peer-to-peer option. No YouTube integration was shipped in this solo pass.
