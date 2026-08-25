# sheiksadi.dev

Personal portfolio site. Plain HTML/CSS/JS — no build step, no framework, no dependencies to install.

## Local preview

Just open `index.html` in a browser, or run a tiny local server:

```
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy on Cloudflare Pages

1. Push this folder to the GitHub repo you created.
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git** → select the repo.
3. Build settings:
   - **Framework preset:** None
   - **Build command:** (leave empty)
   - **Build output directory:** `/` (repo root)
4. Deploy. Cloudflare will give you a `*.pages.dev` URL first.
5. Go to the Pages project → **Custom domains** → add `sheiksadi.dev`. Since the domain is already on Cloudflare, DNS records are added automatically — no manual nameserver changes needed.
6. Every future `git push` to your main branch redeploys automatically.

## Updating content

- **Experience / projects / skills:** edit the relevant sections directly in `index.html`.
- **Résumé download:** replace `resume.pdf` with an updated export any time — the download link in the nav points to it by filename, so no HTML changes needed as long as the filename stays `resume.pdf`.
- **Colors / type:** all design tokens are declared at the top of `styles.css` under `:root`.
