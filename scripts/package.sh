#!/bin/bash

rm -rf build
rm -rf dist
yarn build
mkdir -p build
cp -r ./dist/* ./build
cd build
find . -name '*.test.js' -delete
find . -name '*.test.d.ts' -delete
cd ..
rm -rf dist