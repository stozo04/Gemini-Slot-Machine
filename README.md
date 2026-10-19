# Gemini Slot Machine

[Play the game](https://stozo04.github.io/Gemini-Slot-Machine/)

A browser-based 3D slot machine using fictional credits. No real-money transactions or API keys are needed to play.

## Local development

```sh
npm ci
npm run dev
```

Open http://localhost:3000.

```sh
npm run build
npm run preview
```

## GitHub Pages

Every push to `main` runs the production build and deploys `dist` through GitHub Actions. The public URL is https://stozo04.github.io/Gemini-Slot-Machine/.

The Vite base path and symbol URLs are relative so the game and logos work under the repository path. The example environment file contains no credentials; no deployment secrets are required.
