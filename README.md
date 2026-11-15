# LiveReader

## Overview
- Simple feed reader add-ons for Firefox and Chrome, yet another "Live Bookmarks".
- Focuses to run through the headlines of news websites.

## What it does
- Latest entries list supplied by the RSS 1.0 / RSS 2.0 / Atom feeds.
- Importing/Exporting OPML.

## What it DOES NOT do
- Managing read/unread.
- Entry page viewer.

## Requirement
- Firefox 142 or later, for desktop (Manifest V2).
- Chrome / Chromium-based browsers (Manifest V3).

## Usage
1. Open Add-ons options.
2. Register RSS/Atom URLs you subscribe.
3. Open the popup from toolbar button.

## Development
Built with [WXT](https://wxt.dev/), Vue 3 and TypeScript.

1. Setup Node.js (see `.nvmrc`, >= 22.12) and run `npm ci`
2. Development
   - `npm run dev` — launch Firefox with the extension and hot reload
   - `npm run dev:chrome` — launch Chrome with the extension
3. Checks
   - `npm run check` — lint, type check and unit tests
   - `npm run lint:firefox` — validate the Firefox build with `web-ext lint`
4. Distribution
   - `npm run zip` — generates `.output/live-reader-<version>-firefox.zip`, `-chrome.zip` and `-sources.zip`

## License
[MIT](https://github.com/taqpan/live-reader/blob/master/LICENSE)

## Author
[taqpan](https://github.com/taqpan)
