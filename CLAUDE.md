# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **ScanningGUI** application built with Nuxt 4, Vue 3, and TypeScript. The project is in its initial setup phase with minimal scaffolding.

## Development Commands

### Setup
```bash
npm install
```

### Development
```bash
npm run dev
# Starts development server at http://localhost:3000
```

### Build
```bash
npm run build
# Builds for production
```

### Preview Production Build
```bash
npm run preview
# Locally preview the production build
```

### Generate Static Site
```bash
npm run generate
# Generates static site (if using SSG)
```

## Architecture

### Framework & Configuration
- **Nuxt 4** (latest version 4.1.3) with Vue 3.5.22
- Devtools enabled in development
- Compatibility date set to 2025-07-15
- TypeScript configuration uses Nuxt's generated tsconfig references

### Project Structure
- `app/app.vue` - Root application component (entry point)
- `nuxt.config.ts` - Nuxt configuration
- `public/` - Static assets (favicon.ico, robots.txt)
- `.nuxt/` - Auto-generated Nuxt files (gitignored)
- `.specify/` - Project planning and specification workflows (templates, scripts, memory)

### Key Details
- The project uses ES modules (`"type": "module"` in package.json)
- TypeScript is configured via Nuxt's auto-generated `.nuxt/tsconfig.*.json` files
- Currently displays the NuxtWelcome component (default starter page)

## Notes
- This is a fresh Nuxt 4 minimal starter with no additional pages, components, or custom functionality yet
- When adding new features, follow Nuxt 4's conventions for file-based routing, auto-imports, and composables
