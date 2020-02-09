#!/bin/sh
cd `dirname $0`
cd ../

rm -rf ./dist
mkdir ./dist

yarn run build

cp -ra ./build ./dist/chrome
cp ./src/manifest.chrome.json ./dist/chrome/manifest.json
cp -ra ./build ./dist/firefox
cp ./src/manifest.firefox.json ./dist/firefox/manifest.json
