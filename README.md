# Sudhan Raj M — 3D Developer Portfolio

An immersive, single-page developer portfolio built with **HTML5, CSS3, vanilla JavaScript, Three.js, GSAP and ScrollTrigger**. The homepage opens on an editorial, Lando Norris-inspired hero rebuilt in the site's dark palette: a near-black canvas, oversized Anton typography, a cyan-to-blue accent plate (`linear-gradient(100deg, #1d7fff, #22d3ee)`), animated curved lines and a 360° rotating portrait of Sudhan Raj M standing in front of a cyan/blue arch. Everything is rendered locally - no build step, no framework and no external runtime dependencies.

---

## 1. What's inside

| Section | Highlights |
| --- | --- |
| **Hero** | Editorial dark hero sharing the site palette (`--bg` `#040711`, `--text`, `--muted`, `--cyan`, `--blue`): oversized Anton name split over two lines, a cyan-to-blue accent plate behind `RAJ M`, abstract animated curved-line field, 360° rotating cut-out portrait standing in front of a cyan/blue arch, a layered ghost wordmark that threads behind and in front of the portrait, vertical social rail, a ticker band matched to the tech marquee, and GSAP masked line reveal + ScrollTrigger parallax |
| **About** | Lazy-loaded 3D icosahedron profile object, tilt/spotlight card, factual intro and quick facts |
| **Skills** | Frontend, Backend, Database and Programming cards with hover tilt and brand chips |
| **Work** | Four projects with interactive 3D CSS previews, category filters and accessible case-study modals |
| **Coding** | LeetCode + GitHub profile links, syntax-highlighted code window, honest "no invented stats" note |
| **Journey** | Education, hackathon and cricket awards, technical symposium, NSS/NCC and certifications timeline |
| **Contact** | Email + copy-to-clipboard, social cards, validated form that opens a pre-filled email, futuristic orb |

### Projects included

1. **RentMate** — rental payments, receipts, maintenance requests, owner communication.  
   Live: <https://rentmate-pee5.onrender.com>
2. **Smart Examination Hall Seating Management** — automatic seating, Excel uploads, hall capacity, anti-cheating constraints, roll-number search, invigilator reports.
3. **Smart Library Management System** — unique QR per book copy, issue/return, student/librarian roles, fine calculation, QR tracking.
4. **AI-Based Blood Bank Management System** — availability tracking, hospital requests, nearby emergency donor discovery, QR donor info.

> GitHub buttons are intentionally shown only for the profile and the one public live project — no fake repository links are used.

---

## 2. File structure

```
portfolio/
├── index.html                          # All markup, content, SEO metadata, SVG sprite
├── style.css                           # Design system, layout, animations, responsive rules
├── script.js                           # Loader, nav, cursor, tilt, filters, modal, form, GSAP
├── three-scene.js                      # Hero workstation + About object (Three.js r128)
├── assets/
│   ├── my-photo.png                    # Cut-out portrait (transparent PNG) used by the 360° hero
│   ├── favicon.svg
│   ├── resume/
│   │   ├── Sudhan_Raj_M_Resume.pdf     # Single-page A4 resume (Download Resume target)
│   │   └── Sudhan_Raj_M_Resume.html    # Printable source of the PDF
│   └── vendor/
│       ├── three.min.js                # Three.js r128 (local, no CDN)
│       ├── gsap.min.js                 # GSAP 3.12.5
│       └── ScrollTrigger.min.js        # GSAP ScrollTrigger
└── README.md
```

No bundler, package manager or build command is required. Open the folder and it runs.

---

## 3. Run it locally in VS Code

### Option A — VS Code Live Server (recommended)

1. Install [Visual Studio Code](https://code.visualstudio.com/).
2. Install the **Live Server** extension (Ritwick Dey).
3. Open the project folder:
   `File → Open Folder… → C:\Users\ADMIN\portfolio`
4. Right-click `index.html` → **Open with Live Server**.
5. The site opens at `http://127.0.0.1:5500`.

### Option B — built-in Python server

```powershell
cd C:\Users\ADMIN\portfolio
python -m http.server 4173
```

Then open <http://localhost:4173>.

### Option C — Node

```powershell
cd C:\Users\ADMIN\portfolio
npx serve .
```

> Use a local server rather than double-clicking `index.html`. The PDF download and relative asset paths behave correctly over `http://`, and it matches production hosting.

---

## 4. Deploy to GitHub Pages

1. Create a new repository on GitHub, e.g. `portfolio`.
2. In the project folder:

   ```powershell
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/SUDHANRAJ1648/portfolio.git
   git push -u origin main
   ```

3. In the repository: **Settings → Pages**.
4. Under **Build and deployment**:
   - **Source:** Deploy from a branch
   - **Branch:** `main`
   - **Folder:** `/ (root)`
5. Save and wait for the deployment notice.
6. Your site will be live at:
   `https://SUDHANRAJ1648.github.io/portfolio/`

All asset paths are relative, so GitHub Pages project sites work without changes.

---

## 5. Deploy to Vercel

### From the dashboard

1. Push the project to GitHub (see above).
2. Go to <https://vercel.com/new> and import the repository.
3. Configure the project:
   - **Framework Preset:** Other
   - **Build Command:** *(leave empty)*
   - **Output Directory:** `.` *(or leave empty)*
   - **Install Command:** *(leave empty)*
4. Click **Deploy**. Each push to `main` redeploys automatically.

### From the CLI

```powershell
npm i -g vercel
cd C:\Users\ADMIN\portfolio
vercel
vercel --prod
```

Because the site is fully static, Vercel serves `index.html` directly with no configuration file needed.

---

## 6. Editing content

| What to change | Where |
| --- | --- |
| Name, hero copy, CTAs | `index.html` → `<section id="home">` |
| About text and quick facts | `index.html` → `<section id="about">` |
| Skills | `index.html` → `<section id="skills">` |
| Projects, features, stacks, live URLs | `index.html` → `<section id="work">`; modal copy in `script.js` → `projects` object |
| Coding profile links | `index.html` → `<section id="coding">` |
| Education, awards, certifications | `index.html` → `<section id="journey">` |
| Email address | Search `sudhanraj1648@gmail.com` in `index.html`, `script.js` and the resume files |
| Social links | `index.html` header, contact and footer; update the JSON-LD `sameAs` block too |
| Resume PDF | Replace `assets/resume/Sudhan_Raj_M_Resume.pdf` (keep the same filename) |
| Hero portrait | Replace `assets/my-photo.png` (transparent PNG, portrait ratio ≈ 880 × 1142). Keep the filename so the HTML does not change |
| Portrait size / speed / tilt | `style.css` → `.hero__portrait` (`--ph`), `@keyframes portraitSpin` (duration) and `script.js` → the `360° portrait` block |
| Colours, spacing, fonts | `style.css` → `:root` custom properties |
| 3D scene tuning | `three-scene.js` → `initAbout()` (the homepage hero is intentionally type-led and skips `initHero()`) |

---

## 7. Features and behaviour

- **Loader** with progress, plus a 5-second safety net so it can never trap the page.
- **Scroll progress bar** and active-section navigation highlighting.
- **Custom cursor** with contextual labels on desktop fine-pointer devices only.
- **GSAP reveal animations** with `once: true` ScrollTriggers and an IntersectionObserver fallback.
- **3D tilt and spotlight** on skill cards, project previews and the code window.
- **Editorial hero**: the Lando-inspired layout rebuilt in the site's dark theme and scoped to `.hero--nori`. Colours come straight from the `:root` tokens (`--bg`, `--text`, `--muted`, `--cyan`, `--blue`, `--line`) plus `--ink-on-accent` for text on accent fills, so the hero is the same continuous `#040711` surface as the rest of the page - no light/dark seam at the top, at the ticker or at the hero-to-marquee boundary. The name is set in Anton at up to 330 px, split into two masked lines that slide up on load, with the cyan-to-blue plate behind `RAJ M`. An SVG field of curved lines drifts with the pointer and parallaxes on scroll. The fixed header, nav links, CTA and custom cursor keep their normal dark styling the whole way down (the old light-mode inversion was removed), and every section background is a transparent edge-fading gradient over `body`, so About, Skills, Work, Coding, Journey and Contact flow together with no visible bands.
- **Depth weave**: the hero paints an oversized Anton ghost of `SUDHAN RAJ M` twice from the same box. A faint back copy (z-index 1) sits behind the portrait, so the photo swallows `HAN`; a second copy with a lit hairline and a tight dark contour (z-index 4) renders only `RAJ M` in front of the shirt and arch. The result reads as one line threading through the photo. The layer is decorative (`aria-hidden`, no pointer events, excluded from print), keeps the dark palette, paints below the headline and CTAs, and is hidden below 1181 px where the hero stacks and has no shared plane.
- **360° portrait**: a background-free cut-out of Sudhan rotates continuously around its vertical axis (28 s, CSS `rotateY` + `preserve-3d`) in front of a cyan/blue arch. It has a mirrored, cyan-tinted back face, a cursor-following specular light, layered drop shadows, a cyan light blade at the 90°/270° moments, pointer tilt, and it pauses while hovered and resumes on leave. On tablets and phones it stacks below the headline.
- **Project filters** (All / Platforms / Systems) and **case-study modal** with focus trapping, Escape-to-close and focus restoration.
- **Contact form** validates name, email and message, then opens a pre-filled `mailto:` message. Nothing is sent to a third party.
- **Reduced motion**: all animation loops are skipped, the name lines, ticker and dashed curve animation stop, content is revealed immediately, the custom cursor is disabled and Three.js renders a single static frame.
- **No WebGL**: `supportsWebGL()` adds `.no-webgl`; the homepage hero is pure CSS/SVG and needs no WebGL at all, while the About object falls back to a static state.
- **No GSAP**: `.no-gsap` keeps all critical text visible.
- **No JavaScript**: a `<noscript>` rule hides the loader and reveals all content.

---

## 8. Testing checklist

Verified locally with Chrome DevTools Protocol at 390 × 844, 768 × 1024 and 1440 × 900:

- [x] No console errors, warnings or uncaught exceptions
- [x] No horizontal scrolling at any breakpoint
- [x] All internal anchors resolve to real sections
- [x] No broken images or missing assets
- [x] Hero entrance animation completes; name lines, tagline, CTAs, meta, portrait and social rail are visible
- [x] About 3D profile object initialises and renders while the hero stays CSS/SVG only
- [x] Portrait rotates continuously, pauses on hover and resumes on leave
- [x] Portrait tilt follows the pointer and the specular light tracks the cursor
- [x] Portrait cut-out keeps the original face pixels (background/edge only, no generative edits)
- [x] Project filters show the correct 2 of 4 cards per category
- [x] Case-study modal opens, populates (title, 4–6 highlights, stack, actions) and closes with Escape
- [x] Contact form blocks empty/invalid submissions and reports field-level errors
- [x] Mobile menu opens, locks scroll, moves focus and closes with Escape
- [x] Download Resume returns the generated PDF
- [x] `prefers-reduced-motion: reduce` disables motion and reveals all content
- [x] WebGL-disabled fallback displays the CSS laptop and keeps all text visible

### Manual checks worth repeating after edits

1. Open the site on a real phone and a laptop.
2. Tab through the page — the focus ring should always be visible.
3. Click **View My Projects**, both contact CTAs and the live RentMate link.
4. Submit the contact form with an invalid email, then a valid one.
5. Toggle "Reduce motion" in your OS accessibility settings and reload.

---

## 9. Browser support

- Chrome / Edge / Firefox / Safari — current versions
- WebGL 1 fallback is built in; older devices get the static CSS laptop
- `100svh` is used for mobile viewport height with a `min-height` fallback

---

## 10. Credits

- [Three.js](https://threejs.org/) r128 — MIT
- [GSAP](https://greensock.com/gsap/) 3.12.5 + ScrollTrigger — standard "no charge" license
- Fonts: Space Grotesk and JetBrains Mono via Google Fonts, plus Anton for the hero name layers

All content, project descriptions and claims belong to Sudhan Raj M.
