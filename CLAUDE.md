# CLAUDE.md

日本語で回答してください
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run analyze` - Build with bundle analysis
- `npm run optimize-json` - Optimize operator JSON data
- `npm run optimize-json:pretty` - Optimize with pretty formatting

### Node.js Version
- Uses Volta for version management (Node.js 22.13.1)
- Supports npm, pnpm, and bun package managers

## Architecture

### Tech Stack
- **Next.js 15.2.4** with App Router architecture
- **TypeScript 5.7.2** throughout
- **Tailwind CSS + shadcn/ui** component system
- **SWR** for data fetching and caching
- **PWA** with comprehensive offline support
- **Google Cloud Vision API** for OCR functionality

### Core Structure
```
src/
├── app/           # Next.js App Router (pages, layouts, API routes)
├── components/    # React components (ui/ contains shadcn/ui)
├── contexts/      # React contexts (RecruitContext, HeaderContext)
├── hooks/         # Custom hooks (useFilterOperators, useScreenshotAnalysis)
├── lib/           # Utilities (google-vision, utils, recommendTags)
└── types/         # TypeScript definitions
```

### Key Architectural Patterns

**State Management:**
- `RecruitContext` manages operator data and recruitment state
- `HeaderContext` handles header-specific state
- Custom hooks encapsulate complex logic

**Data Flow:**
- Operator data loaded from `/public/json/ak-recruit.json` (143 operators)
- Complex filtering combinations handled in `useFilterOperators`
- OCR processing in `useScreenshotAnalysis` with Google Vision API

**Component System:**
- Uses shadcn/ui built on Radix UI primitives
- Configured via `components.json`
- Consistent styling with Tailwind CSS variables

### Core Features

**Recruitment Filtering:**
- Tag-based filtering with 1-6 tag combinations
- Position/type/rarity filtering
- Real-time result updates
- Complex probability calculations

**OCR Screenshot Analysis:**
- Google Cloud Vision API integration in `src/lib/google-vision.ts`
- Tag recognition with fuzzy matching
- API endpoint at `/api/parse-tags`

**PWA Implementation:**
- Configured in `next.config.mjs` with runtime caching
- Offline capability for core functionality
- App manifest at `/public/manifest.json`

## Development Notes

### Data Management
- Operator data in `public/json/ak-recruit.json` (full) and `.min.json` (minified)
- Use `npm run optimize-json` when updating operator data
- Images stored in `public/img/operators/`

### Japanese Language Support
- All UI text in Japanese
- Operator names and tags localized
- OCR optimized for Japanese text recognition

### Styling
- Tailwind with dark mode support via `next-themes`
- Custom CSS variables defined in `app/globals.css`
- Component variants handled through shadcn/ui system