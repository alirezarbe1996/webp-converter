# WebP Converter

Convert and optimize images to WebP instantly — entirely in your browser. No uploads, no servers, no waiting.

![Next.js](https://img.shields.io/badge/Next.js_15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=flat-square&logo=framer)

---

## What it does

Drop any image — JPG, PNG, GIF, BMP, TIFF, WEBP, or AVIF — and get a converted WebP file back in seconds. Everything runs client-side using the Canvas API, so your images never leave your device.

- **Drag and drop** or click to upload (up to 25 MB)
- **Quality slider** from 1–100 (default 95) with live reconversion
- **Side-by-side preview** of original and converted output
- **Size comparison** — see exactly how many bytes you saved
- **One-click download** of the WebP file
- **Dark mode** — follows your OS preference automatically

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | Static export, zero server needed |
| Language | TypeScript (strict) | End-to-end type safety |
| Styling | Tailwind CSS v4 | CSS-first config, no JS config file |
| Animation | Framer Motion | Drag-zone pulse, result reveal transitions |
| Conversion | Canvas API + OffscreenCanvas | Native browser API, no WASM or server |
| Pre-processing | browser-image-compression | Prevents OOM on large files before canvas draw |
| Utilities | clsx + tailwind-merge | Conflict-free conditional class composition |

---

## Project structure

```
webp-converter/
├── app/
│   ├── layout.tsx          # Root layout, Inter font, metadata
│   ├── page.tsx            # Single route — mounts ConverterPage
│   └── globals.css         # Tailwind v4 import + @theme config
│
├── components/
│   ├── converter/
│   │   ├── ConverterPage.tsx     # State owner — coordinates all children
│   │   ├── UploadZone.tsx        # Drag-and-drop + click-to-upload
│   │   ├── ImagePreview.tsx      # Side-by-side original vs WebP
│   │   ├── QualitySlider.tsx     # Controlled range input
│   │   ├── ConversionStats.tsx   # Size savings display
│   │   └── DownloadButton.tsx    # Blob download trigger
│   │
│   └── ui/
│       ├── Card.tsx          # Glassmorphism container
│       ├── Badge.tsx         # Format/status pill labels
│       ├── Spinner.tsx       # Loading indicator
│       └── ErrorMessage.tsx  # Typed error banner
│
├── hooks/
│   ├── useImageConverter.ts  # Conversion state machine + URL lifecycle
│   └── (useImageFile embedded in useImageConverter.ts)
│
├── lib/
│   ├── convert.ts    # Canvas → WebP blob (pure async, no React)
│   ├── validate.ts   # MIME type + size guard
│   ├── format.ts     # formatBytes, calcSavingsPercent, makeDownloadName
│   └── cn.ts         # clsx + tailwind-merge helper
│
├── types/
│   └── converter.ts  # ErrorCode, AppState, ConversionResult, ImageFile
│
├── next.config.ts        # output: 'export' for static deploy
├── postcss.config.mjs    # @tailwindcss/postcss for v4
└── tsconfig.json
```

---

## Getting started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Install and run

```bash
# Clone the repo
git clone https://github.com/your-username/webp-converter.git
cd webp-converter

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
npm run build
```

Output goes to the `out/` directory as fully static HTML — no Node.js server required.

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import the repository at [vercel.com/new](https://vercel.com/new)
3. Vercel auto-detects Next.js — no configuration needed
4. Deploy

No environment variables are required. The build command is `next build` and the output directory is `out`.

### Any static host

The `out/` folder after `npm run build` can be dropped onto any static host — Netlify, Cloudflare Pages, GitHub Pages, or an S3 bucket.

---

## How conversion works

```
User selects file
       │
       ▼
  validate()          ← MIME type check + 25 MB cap
       │
       ▼
  loadImage()         ← File → Object URL → HTMLImageElement
       │
       ▼
  OffscreenCanvas     ← Falls back to HTMLCanvasElement on Safari
  .drawImage()        ← Preserves exact pixel dimensions
       │
       ▼
  .convertToBlob()    ← 'image/webp' + quality (0.01–1.00)
  / .toBlob()
       │
       ▼
  URL.createObjectURL ← Preview + download, revoked on reset
```

`OffscreenCanvas` is used where available (Chrome, Edge) so the draw happens off the main thread and the UI never freezes. Safari falls back to `HTMLCanvasElement` on the main thread, which still works fine for the supported file sizes.

---

## Browser support

| Browser | Status |
|---|---|
| Chrome / Edge 88+ | ✅ Full (OffscreenCanvas) |
| Firefox 79+ | ✅ Full |
| Safari 16+ | ✅ Works (HTMLCanvasElement fallback) |
| Safari < 16 | ⚠️ WebP output not guaranteed |

---

## Supported input formats

`JPG` `JPEG` `PNG` `GIF` `BMP` `TIFF` `WEBP` `AVIF`

Maximum file size: **25 MB**

---

## Privacy

Your images are processed entirely in your browser using the Canvas API. No image data is ever sent to a server, stored, or logged anywhere. Object URLs are revoked as soon as you reset or close the tab.

---

## License

MIT — do whatever you want with it.
