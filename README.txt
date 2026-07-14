HEALTH STACK PWA — DEPLOYMENT INSTRUCTIONS
==========================================

FILES IN THIS FOLDER:
- index.html       → The entire app (HTML + CSS + JS)
- manifest.webmanifest → PWA install metadata
- sw.js            → Service worker (offline support)
- icons/           → App icons (192px and 512px)
- Code.gs          → Google Apps Script backend (paste into Apps Script)

STEP 1 — Set up Google Sheet backend
1. Open your Google Sheet
2. Go to Extensions > Apps Script
3. Paste the contents of Code.gs, save
4. Deploy > New deployment > Web app
   - Execute as: Me
   - Who has access: Anyone
5. Copy the /exec URL

STEP 2A — Deploy via Netlify Drop (fastest, ~30 seconds)
1. Go to https://app.netlify.com/drop
2. Drag the entire health-stack-pwa folder onto the page
3. You get an HTTPS URL instantly

STEP 2B — Deploy via GitHub Pages
1. Create a new GitHub repository
2. Upload all files to the repo root
3. Settings > Pages > Deploy from branch: main, / (root)
4. Your URL: https://<username>.github.io/<repo>/

STEP 3 — Connect app to Google Sheet
1. Open the app on your phone
2. Go to Settings tab
3. Paste the /exec URL from Step 1
4. Tap "Save & test connection"
5. Add to Home Screen (iPhone: Share > Add to Home Screen)
