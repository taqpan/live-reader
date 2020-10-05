#!/bin/sh
cd `dirname $0`

DEST_DIR="../../src/assets"

convert icon.png -resize 48x48 $DEST_DIR/icon.png
convert icon.png -resize 16x16 $DEST_DIR/icon-16.png
convert icon.png -resize 32x32 $DEST_DIR/icon-32.png
convert icon.png -resize 48x48 $DEST_DIR/icon-48.png
convert icon.png -resize 96x96 $DEST_DIR/icon-96.png
convert icon.png -resize 128x128 $DEST_DIR/icon-128.png
convert icon.png -resize 256x256 $DEST_DIR/icon-256.png
