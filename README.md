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

## Syncing portfolio with LinkedIn, JSON, or Markdown

We have added a custom synchronization script `sync-portfolio.js` that helps you easily keep your personal portfolio page up to date. You can sync your experience, skills, and projects using either:
1. **A standard LinkedIn PDF export** (by clicking 'More' -> 'Save to PDF' on your LinkedIn profile, or using your standard `resume.pdf`).
2. **A simple JSON file** (`portfolio.json`).
3. **A clean Markdown file** (`portfolio.md`).

### Quick Start

1. Install dependencies (first time only):
   ```bash
   npm install
   ```

2. Run the sync script with your file of choice:
   - **Using a PDF (e.g. LinkedIn PDF or `resume.pdf`):**
     ```bash
     node sync-portfolio.js resume.pdf
     ```
   - **Using a JSON structure:**
     ```bash
     node sync-portfolio.js portfolio.json
     ```
   - **Using a Markdown structure:**
     ```bash
     node sync-portfolio.js portfolio.md
     ```

3. Open `index.html` to review the local changes.
4. Commit and push to trigger an automatic redeployment on Cloudflare Pages:
   ```bash
   git add index.html
   git commit -m "Update portfolio content"
   git push
   ```

### Input File Formats

#### 1. JSON (`portfolio.json`)
Allows precise control of your portfolio content. See `portfolio.json` for a complete example.
- **Experience fields:** `date`, `role`, `org`, `desc`
- **Project fields:** `title`, `metric`, `tags` (for filtering), `desc`, `tech` (technologies)
- **Skills fields:** `category`, `items`

#### 2. Markdown (`portfolio.md`)
Clean and human-editable. See `portfolio.md` for a complete example.
- Use `## Experience`, `## Projects`, `## Skills` headings.
- Experience items use bullet lists formatted as: `- **Date** | **Role** | **Organization**` followed by description text.
- Project items use bullet lists formatted as: `- **Project Title** | **Metric** | tags: tag1, tag2 | tech: tech1, tech2` followed by description text.
- Skill categories use `### Category` followed by comma-separated skill items.

#### 3. PDF (`resume.pdf` or LinkedIn export)
The script uses smart heuristics to extract sections from LinkedIn's standard export format or your resume.
- It will automatically update your **Experience** and **Skills** sections.
- If projects are not found in the PDF, **your existing portfolio projects will be safely preserved**.

