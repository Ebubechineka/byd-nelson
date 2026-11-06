# BYD Nelson — Static Site (GitHub Pages Ready)

A fully self-contained copy of the BYD Nelson dealership website. No build step, no server, no dependencies. Every page, image, stylesheet and script is included.

---

## What's in here

| Path | What it is |
|---|---|
| `index.html` | Homepage — **must stay at the root** |
| `p-*.html` | 40+ content pages (about, finance, service, contact, etc.) |
| `atto-3/`, `sealion-7/`, `latest-news/` | Model and news sections |
| `vehicle-details/` | Individual vehicle listing pages |
| `wp-content/uploads/` | All images, videos and PDFs |
| `wp-content/plugins/`, `wp-content/themes/` | Elementor + theme CSS/JS |
| `.nojekyll` | Tells GitHub Pages to skip Jekyll processing |
| `README.md` | This file |

**Total: ~1,500 files, ~243 MB.**

---

## Deploy to GitHub Pages — step by step

### 1. Create the repository

1. Go to **https://github.com/new**
2. **Repository name:** `byd-nelson`
3. **Visibility:** **Public** ← required for free GitHub Pages
4. Do **not** tick "Add a README file"
5. Click **Create repository**

### 2. Upload the files

1. On the new empty repo page, click **"uploading an existing file"**
2. **Unzip the download first.** You should see `index.html`, `wp-content/`, `.nojekyll`, `README.md` sitting loose.
3. Select **everything inside the folder** and drag it into the browser
   - ⚠️ **Do NOT drag the outer folder itself.** That creates `byd-nelson/byd-nelson/index.html` and every page 404s.
4. Wait for all files to finish uploading (243 MB takes a few minutes)
5. Scroll down, click **Commit changes**

> **`.nojekyll` is hidden on macOS.** Press `Cmd + Shift + .` in Finder to reveal it before dragging. If you can't see it, that's fine — the site still works, but files starting with `_` may 404.

### 3. Turn on Pages

1. In the repo, click **Settings** (top bar)
2. In the left sidebar, click **Pages**
3. Under **Source**, choose **Deploy from a branch**
4. **Branch:** `main` — **Folder:** `/ (root)`
5. Click **Save**
6. Wait 1–3 minutes, then refresh the page

### 4. Your live URL

```
https://YOUR-USERNAME.github.io/byd-nelson/
```

Example: `https://ebubechineka.github.io/byd-nelson/`

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| **404 on every page** | Files uploaded inside a subfolder | Move `index.html` to the repo root |
| **404 on the homepage only** | File is named `Index.html` | Rename to lowercase `index.html` |
| **Site shows old version** | CDN cache | Wait 5 min, or hard-refresh (`Ctrl+Shift+R`) |
| **Images broken** | `wp-content/` didn't upload | Re-upload that folder |
| **Pages tab says "not published"** | Branch/folder wrong | Settings → Pages → `main` + `/ (root)` |
| **CSS missing** | `.nojekyll` absent and paths start with `_` | Add `.nojekyll` at root |

---

## Notes

- **No API keys or secrets** are in this package. It was scanned for tokens, AWS keys and API keys before packaging.
- **No references to the original hosting platform** remain — all links are relative.
- **Forms will not submit.** The contact and enquiry forms were connected to the original WordPress backend. To make them work, point them at a service like Formspree, Netlify Forms, or your own endpoint.
- **Vehicle data is static.** Listings won't update automatically; they're a snapshot.
- This is a **clone for demonstration/portfolio purposes.** The BYD name, logo and vehicle imagery belong to BYD and the original dealership.

---

## Content Admin

The site now has a browser-based admin panel at **`/admin/`** so the owner can manage cars and news without touching code.

| Path | What it is |
|---|---|
| `admin/login.html` | Password gate |
| `admin/index.html` | Dashboard — Cars & Prices, News |
| `admin/settings.html` | GitHub token setup |
| `admin/config.json` | The admin password (edit this to change it) |
| `admin/app.js` | Shared logic + GitHub publishing |
| `data/cars.json` | All vehicle data — the public pages read this |
| `data/news.json` | All news posts — the public pages read this |
| `inventory.html` | Public "In Stock" listing (reads `data/cars.json`) |
| `car.html?id=…` | Public vehicle detail page (reads `data/cars.json`) |

### Signing in

Open **`/admin/login.html`** and enter the password. The default is:

```
changeme123
```

**Change it before going live.** Edit `admin/config.json` and replace the value:

```json
{ "password": "your-new-password" }
```

### What you can do

- **Cars & Prices** — edit any price inline in the table, then press *Save price changes*. Add, edit or delete vehicles with the full form (name, model, year, price, mileage, transmission, fuel, body type, description, photo upload).
- **News** — add, edit or delete posts with a title, date, summary, body text and image.
- **Publish** — writes `data/cars.json` and `data/news.json` back to GitHub and commits them, so the live site updates in about a minute.

### How publishing works (important)

This is a **static site on GitHub Pages — there is no server**. Nothing is saved on a backend, because there isn't one. That means:

1. Your edits live **in your browser** while you work.
2. Pressing **Publish** sends the two data files to GitHub through the **GitHub API**, using a personal access token.
3. GitHub Pages then rebuilds and the live site shows the changes.

If you close the tab without publishing, your unsaved edits are lost. Always press **Publish** when you're done.

### Setting up the token (one time)

1. Go to **github.com/settings/tokens** → *Generate new token (classic)*
2. Name it `byd-nelson-admin`, tick the **`repo`** scope, set an expiry
3. Copy the `ghp_…` value
4. Open **`/admin/settings.html`**, paste it, press **Save token**, then **Test connection**

The token is stored **only in your browser's localStorage**. It is never written into the site's files and never sent anywhere except `api.github.com`. To remove it, press *Remove token* on the settings page.

### A note on the password

The login is a simple client-side gate — it keeps casual visitors out of the admin screens, but it is not real authentication. The actual protection is the GitHub token: without it, nobody can publish anything, no matter what they do in the admin panel.
