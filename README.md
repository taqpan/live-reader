# LiveReader

## Overview
- Simple feed reader add-ons for Firefox, yet another "Live Bookmarks".
- Focuses to run through the headlines of news websites.

## What it does
- Latest entries list supplied by the RSS/Atom feeds.
- Importing/Exporting OPML.

## What it DOES NOT do
- Managing read/unread.
- Entry page viewer.

## Requirement
- Firefox 54 or later, for desktop.

## Usage
1. Open Add-ons options.
2. Register RSS/Atom URLs you subscribe.
3. Open the popup from toolbar button.

## How to build
1. Setup nodejs(>=10.13.x) and yarn(>=1.12.x)
2. ```$ yarn install --pure-lockfile```
3. ```$ yarn run dist```
4. Generated "dist" directory is the add-ons.

## License
[MIT](https://github.com/taqpan/live-reader/blob/master/LICENSE)

## Author
[taqpan](https://github.com/taqpan)
