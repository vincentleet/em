# Escape Room WhatsApp Web App

A frontend-only, offline-first web app that mimics a WhatsApp conversation for an escape room. Players chat with Jimmy, make a branching decision (call the police or escape with Jimmy), and experience an incoming call from Rotorua Police with speakerphone UI, pre-recorded audio, and a live call timer.

## Run locally

1. Place your call audio in `assets/audio/`: `phone-ring.mp3` (incoming call), `police-call.mp3` (active call), and `phone-end.mp3` (call ended).
2. Optional: Place a bubble sound effect in `assets/audio/bubble.mp3` for message send/receive feedback.
3. Open `index.html` in a browser, or serve the folder with a local server:
   ```bash
   npx serve . -p 8080
   # or: python3 -m http.server 8080
   ```
   Then open http://localhost:8080 (use a different port if 8080 is in use).
4. The app runs fully offline; no database or backend required.
5. **Admin**: Open `admin.html` (or tap "Admin" on the start screen) to edit messages. Changes are saved to the browser and apply when you refresh the app.

## Optional: Firebase event logging

When online, the app can log events (branch selected, call answered/declined) to Firebase Realtime Database:

1. Copy `firebase-config.sample.js` to `firebase-config.js`.
2. Add your Firebase config and ensure `firebase-config.js` is in `.gitignore`.
3. Load Firebase SDK and your config before the app scripts in `index.html`:
   ```html
   <script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-app-compat.js"></script>
   <script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-database-compat.js"></script>
   <script src="firebase-config.js"></script>
   ```
4. The logger will no-op when offline or when Firebase is not configured.
