# fme (fb-messenger-e2ee 0.1.8)

Lets the bot read and answer Messenger chats that are end-to-end encrypted (🔒).
The normal library (shayan-fca) can't see those chats.

- Source: https://github.com/HerokeyVN/FB-Messenger-E2EE (npm `fb-messenger-e2ee` 0.1.8)
- License: AGPL-3.0-or-later (see LICENSE). This bot's source is public, as the AGPL requires.
- Encryption: Signal's official library `@signalapp/libsignal-client`.

Only the built file `dist/index.cjs` and the `proto/` schemas are kept here.
One change from the original: the line that loaded `fca-unofficial` for logging in is replaced,
because the bot gives FME its own already logged-in `api` (no second login).

Used by `utils/e2ee.js`. Turn on/off: config.json -> `"e2ee": true / false`.
