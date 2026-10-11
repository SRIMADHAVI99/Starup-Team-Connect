# Startup Team Connect - Vanilla Frontend

A responsive, high-performance web client built with **pure HTML5, CSS3, and Vanilla JavaScript (ES modules)** bundled with Vite.

## Tech Stack
- **Structure**: Semantic HTML5 templates & dynamically mounted views
- **Styles**: Custom Vanilla CSS design system (blue-and-white theme, dark/light mode tokens)
- **Logic**: Vanilla ES Modules (`app.js`, `main.js`, modular page and component scripts)
- **API Communication**: Native browser `fetch()` API
- **Live Sync**: Dedicated 2-second auto-polling loop for real-time team collaboration

## Directory Structure
```
frontend/
├── index.html            # Main HTML entry point
├── package.json          # Vanilla scripts and Vite build dependencies
├── vite.config.js        # Standard Vite configuration
└── src/
    ├── main.js           # App bootstrapper
    ├── app.js            # Router, state management & API polling
    ├── config/           # API endpoints configuration
    ├── components/       # UI components (navbar, logo, modal, chatbot, cards)
    ├── pages/            # View controllers (dashboard, team, profile, etc.)
    └── styles/           # CSS design tokens, components, and layout styling
```

## Running the Frontend
```bash
npm install
npm run dev
```
Runs at `http://localhost:5173`.

## Production Build
```bash
npm run build
```
Creates production-optimized static assets in `dist/`.
