# Serial Killer Hatch – Escape Room Phone App

A web app that mimics a serial killer's phone for an escape room. Players browse voice notes, maps, plans, and passwords. The UI presents a clean, meticulous facade with dried-blood red accents. Some documents can be password-protected as puzzles.

## Run the app

Use any static server or open `index.html` directly:

```bash
npx serve . -p 8080
# or: python3 -m http.server 8080
```

On a phone, connect to the same network and open `http://<computer-ip>:8080` (or copy the project onto the phone and open `index.html` in a browser if using local files).

## Admin – Editing content (no coding)

1. Open `admin.html` (or click "Admin" in the main app).
2. **Categories**: Add, edit, or delete. Each has ID, Name, Icon (emoji).
3. **Documents**: Add, edit, or delete. For each document:
   - **Voice note**: Enter filename (e.g. `audio/mynote.mp3`). Put the MP3 file in the `audio/` folder.
   - **Map**: Enter filename (e.g. `images/map.png`). Put the image in the `images/` folder.
   - **Note / Password list**: Enter the text content directly.
   - **Locked**: Check to require a password. Players must find the code elsewhere in the room.
4. **Save**: Stores edits in the browser. Reload the main app to see changes on that device.
5. **Export**: Downloads `content.json`. Replace the file in this folder to update content on all devices (e.g. after a phone restart).
6. **Import**: Load a previously exported `content.json`.
7. **Reset**: Clear saved edits and use the default `content.json`.

### Adding a voice note

1. Record and save as MP3.
2. Copy the file into the `audio/` folder.
3. In Admin, add a document, choose "Voice note", enter the filename (e.g. `mynote.mp3` or `audio/mynote.mp3`).

### Adding a map

1. Save your image as PNG or JPG.
2. Copy into the `images/` folder.
3. In Admin, add a document, choose "Map", enter the filename (e.g. `map.png` or `images/warehouse.png`).

## Managing content manually

Admin saves to the browser only. To update the `content.json` file that ships with the app (so changes survive restarts or work on other devices):

1. Edit in Admin and click **Save**.
2. Click **Export** to download `content.json`.
3. Replace the `content.json` file in this project folder with the downloaded file.
4. Copy updated `content.json` (and any new `audio/` or `images/` files) to your deployment location.

## Old Android compatibility

The app uses ES5 JavaScript and Flexbox for compatibility with older Android devices. Test on your target phone before the room.

## File structure

```
serialkiller-hatch/
├── index.html       # Main app
├── admin.html       # Admin editor
├── content.json     # Content (categories + documents)
├── audio/           # Voice note MP3s
├── images/          # Maps and photos
├── css/
└── js/
```
