# YUXIN GONG · Portfolio

An illustrated portfolio: four quiet rooms, four tables, moving images and small stories.

Permanent website link: https://1562577099-pixel.github.io/?v=8. This fixed address always serves the current portfolio. Other homepage version parameters are normalized to it while preserving room anchors. Asset cache versions are independent of this permanent link.

Scroll down to travel sideways through the four rooms. The gallery uses native scrolling, a damped spring and layered parallax; the profile and contact follow naturally below. Room controls and keyboard navigation offer direct access. Reduced-motion preferences use a vertical layout.

Room transitions follow scroll input directly with a short, nearly critically damped finish. Idle alignment waits 90 ms, then lands in about 170–255 ms instead of adding a second browser-controlled smooth scroll. Desktop visitors can drag a blank area sideways and release with momentum; new input interrupts the landing immediately. Crossing into another room no longer restarts a staggered entrance.

Each of the twelve objects has an interaction effect, including a camera flash, a turning globe, a rotating record, sound waves, paper motion and a projector beam. Original table illustrations are preserved; small SVG animation layers add motion on hover, focus or touch. The profile photograph keeps its complete original aspect ratio. Supplied paper/plaster textures are multiplied into room colours, with attribution in Credits.

The website lives in `dist/`. The `Publish portfolio` GitHub Actions workflow deploys this directory to GitHub Pages on pushes to `main`.

To preview locally: `python -m http.server 4173 --directory dist`.

Run `npm run check` to validate media and asset references, all twelve animated entries, and spring convergence. Browser checks covered 320×568, 390×844, 768×1024, 844×390 and 1440×960, including room navigation, video previews and the uncropped portrait.

Works, portrait, and portfolio content © Yuxin Gong. Third-party font and texture notices are in the website's Credits page and accompanying license files. No general reuse license is granted for portfolio works.
