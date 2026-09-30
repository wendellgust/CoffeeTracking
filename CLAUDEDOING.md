# CLAUDEDOING

- **Project**: Coffee & Water Tracker — web app (vanilla JS + Python stdlib server) that logs coffee/water intake, shows stats and charts, stores data in `data/data.json`.
- **Run**: `python3 server.py 8088` then open `http://localhost:8088` (port arg optional; also `PORT` env var).

## Changed
- `server.py`: static serving blocks hidden files (`.git`), `server.py`, and `startswith` path-prefix bypass (now `commonpath`); no-cache on assets; write failures return 500 instead of fake success; PUT/import validate body types; backup no longer overwrites good backup with corrupt data; `server_time` now real time; ids get random suffix (no same-ms collision).
- `script.js`: local-time timestamps for quick water add (was UTC); preferred-coffee rating average fixed; `escapeHTML` hardened + applied to all user fields in cards; import accepts coffees-only/waters-only files, validates, adds missing ids/dates, asks confirm, resets file input.
- Added `HOWTO_START.md`.

## Changing
- Nothing (review complete).

## Will Change
- Optional: `scripty.js` is dead code (not linked in `index.html`) — remove if unwanted.
- Optional: offline edits are overwritten by next 15 s poll (no offline queue).
