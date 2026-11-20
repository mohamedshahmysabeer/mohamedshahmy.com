# mohamedshahmy.com

Static site on Vercel. `vercel.json` turns on clean URLs (`/projects` serves `projects.html`),
redirects old addresses (`/Portfolio`, `/Fashionbags`, `/opalx`, `/alkhatt`, `/contact`) and sets
browser caching and security headers.

Pages: `index.html`, `projects.html`, `minicart.html`, `aicp.html`, `uiux.html`,
`graphicdesign.html`, `wowspiced.html`, `fashionbags.html`, `iagmedia.html`, `404.html`.

- `assets/site.css`, `assets/site.js`: shared styles and behaviour
- `assets/img/`: WebP images; `md/` = 800px phone versions, `sm/` = small versions for the work rows
- `assets/fonts/`: self-hosted Archivo and Bricolage Grotesque (SIL Open Font License)
- `assets/Mohamed-Shahmy-CV.pdf`: CV (also at `/cv` and `/resume`)
- `sitemap.xml`, `robots.txt`: for search engines

After deploying, submit `https://mohamedshahmy.com/sitemap.xml` in Google Search Console.
