# Sudhan Raj M — 3D Developer Portfolio

An immersive, single-page developer portfolio built with **HTML5, CSS3, vanilla JavaScript, Three.js, GSAP and ScrollTrigger**. The hero centres a 360° rotating portrait of Sudhan Raj M, floating in front of an interactive laptop workstation with a live code screen, orbiting holographic rings, floating syntax symbols and particles. Everything is rendered locally — no build step, no framework and no external runtime dependencies.

---

## 1. What's inside

| Section | Highlights |
| --- | --- |
| **Hero** | Oversized gradient name signature behind the cut-out portrait, in the site's navy/cyan/violet palette; 360° rotating portrait (CSS 3D) with cursor-following light, soft shadow, hover-to-pause; interactive 3D laptop workstation, code screen, floating `{ }`, `</>`, `01` symbols, particles, mouse parallax, three CTAs |
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
| 3D scene tuning | `three-scene.js` → `initHero()` / `initAbout()` |

---

## 7. Features and behaviour

- **Loader** with progress, plus a 5-second safety net so it can never trap the page.
- **Scroll progress bar** and active-section navigation highlighting.
- **Custom cursor** with contextual labels on desktop fine-pointer devices only.
- **GSAP reveal animations** with `once: true` ScrollTriggers and an IntersectionObserver fallback.
- **3D tilt and spotlight** on skill cards, project previews and the code window.
- **Hero name signature**: the name is set as an oversized signature layered behind the portrait, filled with the same `--cyan` → `--blue` → `--violet` gradient used across the page. All of its rules are scoped to `.hero`, so every other section is untouched.
- **360° portrait**: a background-free cut-out of Sudhan rotates continuously around its vertical axis (28 s, CSS `rotateY` + `preserve-3d`). It has a mirrored, tinted back face, a cursor-following specular light, a soft ground shadow that narrows as it turns edge-on, a cyan light blade at the 90°/270° moments, and it pauses while hovered and resumes on leave. On tablets and phones it stacks above the headline and the desk composition is hidden.
- **Project filters** (All / Platforms / Systems) and **case-study modal** with focus trapping, Escape-to-close and focus restoration.
- **Contact form** validates name, email and message, then opens a pre-filled `mailto:` message. Nothing is sent to a third party.
- **Reduced motion**: all animation loops are skipped, content is revealed immediately, the custom cursor is disabled and Three.js renders a single static frame.
- **No WebGL**: `supportsWebGL()` adds `.no-webgl` and shows the pure-CSS laptop fallback.
- **No GSAP**: `.no-gsap` keeps all critical text visible.
- **No JavaScript**: a `<noscript>` rule hides the loader and reveals all content.

---

## 8. Testing checklist

Verified locally with Chrome DevTools Protocol at 390 × 844, 768 × 1024 and 1440 × 900:

- [x] No console errors, warnings or uncaught exceptions
- [x] No horizontal scrolling at any breakpoint
- [x] All internal anchors resolve to real sections
- [x] No broken images or missing assets
- [x] Hero entrance animation completes; name, roles, tagline, description, CTAs and meta are visible
- [x] 3D laptop renders its code screen (texture depth offsets and sRGB encoding fixed)
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
