# 🐍 Retro Snake - Arcade Edition

A zero-dependency, retro CRT arcade web game built with vanilla HTML5 Canvas, CSS3, and native Web Audio synthesis.

![Game Preview](preview.png)

## 🕹 Features

- **Neon CRT Arcade Style**: Phosphor green glow, scanlines, and animated particle bursts.
- **Synthesized 8-Bit Audio**: Native Web Audio API sounds (eat, bonus arpeggio, game over buzz) with zero external sound files.
- **Bonus Golden Apple**: Appears periodically with a circular countdown ring.
- **Dual Controls**:
  - **Desktop**: Arrow keys or `WASD`, `Space` to pause, `R` to restart.
  - **Mobile / Touch**: Responsive on-screen virtual D-Pad and swipe gestures.
- **High Score Persistence**: Automatically saved to `localStorage`.
- **Zero Dependencies**: Pure static HTML/CSS/JS.

---

## 🚀 How to Run Locally

Using Python (built into Windows/macOS/Linux):

```bash
# In this directory:
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your web browser.

---

## 🌐 Instant Free Deployment

### Option 1: GitHub Pages (Recommended)
1. Initialize a git repository and commit:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Retro Snake"
   ```
2. Create a new repository on [GitHub](https://github.com/new).
3. Link and push your code:
   ```bash
   git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
   git branch -M main
   git push -u origin main
   ```
4. On GitHub, go to **Settings** > **Pages** > Select `main` branch > Click **Save**.
5. Your game will be live at `https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/`!

### Option 2: Netlify Drop (10 Seconds, No CLI)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop this entire project folder (`c:/temp/antigrav_demo`) onto the page.
3. You immediately get a live public URL.
