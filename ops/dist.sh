#!/bin/sh
cd `dirname $0`
cd ../

rm -rf ./dist
mkdir ./dist

yarn run build

cp -ra ./build ./dist/chrome
cp ./src/manifest.chrome.json ./dist/chrome/manifest.json
cd ./dist/chrome && \
    zip -r ../live-reader_chrome.zip ./* && \
    cd ../../

cp -ra ./build ./dist/firefox
cp ./src/manifest.firefox.json ./dist/firefox/manifest.json
cd ./dist/firefox && \
    zip -r ../live-reader_firefox.zip ./* && \
    cd ../../
