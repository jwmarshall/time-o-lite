# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React TypeScript application built with Vite - a specialized timer application for film development in darkroom photography. The app features agitation alerts, persistent settings, and a vintage UI theme.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

## Code Architecture

### Core Structure
- **src/App.tsx**: Main application component managing timer state and audio feedback
- **src/main.tsx**: Application entry point with React StrictMode
- **src/components/**: React components (CircularTimer, Controls)
- **src/hooks/**: Custom React hooks (useTimer, useLocalStorage)

### Key Components
- **CircularTimer** (src/components/CircularTimer.tsx): SVG-based circular timer display with visual progress
- **Controls** (src/components/Controls.tsx): Timer controls and settings interface

### Custom Hooks
- **useTimer** (src/hooks/useTimer.ts): Core timer logic with agitation intervals and state management
- **useLocalStorage** (src/hooks/useLocalStorage.ts): Persistent storage for user settings

### Technology Stack
- **React 18.3.1** with TypeScript for UI
- **Vite 5.4.2** for build tooling and development
- **Tailwind CSS 3.4.1** with custom vintage photography theme
- **Lucide React** for icons
- **Web Audio API** for timer alerts
- **Wake Lock API** for preventing screen sleep

### Application Features
- Film development timer with customizable duration
- Agitation alerts at configurable intervals with customizable duration
- Audio feedback with different sounds for agitation start, end, and completion
- Wake Lock API to prevent screen sleep during timing (mobile-friendly)
- Persistent settings using localStorage
- Vintage darkroom-inspired UI with gold and dark theme

### Configuration Files
- **vite.config.ts**: Vite build configuration
- **tailwind.config.js**: Custom Tailwind theme with vintage colors
- **tsconfig.json/tsconfig.app.json**: TypeScript configuration
- **eslint.config.js**: ESLint rules for code quality

## Testing

No testing framework is currently configured. Tests would need to be set up if required.

## Development Notes

- State management uses React hooks with localStorage persistence
- Audio alerts use Web Audio API for cross-browser compatibility
- Wake Lock API automatically prevents screen sleep when timer is running
- All styling uses Tailwind CSS with custom theme variables
- Components follow React functional component patterns with TypeScript