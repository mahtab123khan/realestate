# Paradise Real Estate — demo site

Static site (HTML/CSS/JS). No build step.

## Run locally
    npm install
    npm run dev

## Personalise for a prospect (2 minutes)
    npm run rebrand -- --name "Acme Homes" --email hi@acme.com --phone "+971 4 111 2222" --whatsapp 971501112222 --domain https://acme.onrender.com --demoBy "Your Agency"
Then replace `assets/paradise-icon.png` and `assets/paradise-logo-full.png` with the prospect's logo.
Demo pill text/link: `PARADISE.demo` at the top of `script.js`.

## Deploy on Render (free static site)
1. Push this folder to a GitHub repo.
2. Render → New → Static Site → pick the repo. Build command: leave empty (or `echo ok`). Publish directory: `.`
   (or use the included `render.yaml` as a Blueprint).
3. Share the `https://<name>.onrender.com` link.

## Going live for a real client
- Remove `<meta name="robots" content="noindex,nofollow">` from every page and change `robots.txt` to `Allow: /`.
- Set `PARADISE.demo.enabled = false` in `script.js`.
- Replace stock photos/videos, listing data, and add Privacy/Terms pages and the RERA/permit numbers.
