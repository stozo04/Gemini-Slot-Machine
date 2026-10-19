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

The tested production build is on the `gh-pages` branch, and Pages currently publishes that branch at https://stozo04.github.io/Gemini-Slot-Machine/.

The included GitHub Actions workflow can build and deploy future pushes to `main` when the Pages publishing source is set to GitHub Actions. It uses read-only source access and narrowly scoped Pages deployment permissions. No workflow has permission to push repository branches.

The Vite base path and symbol URLs are relative so the game and logos work under the repository path. The example environment file contains no credentials; no deployment secrets are required.
