#!/bin/sh
# icon.png から拡張機能用のアイコンを生成する（ImageMagick 7 が必要）
cd "$(dirname "$0")" || exit 1

DEST_DIR="../../public/icon"

for size in 16 32 48 96 128; do
    magick icon.png -resize "${size}x${size}" "$DEST_DIR/$size.png"
done
