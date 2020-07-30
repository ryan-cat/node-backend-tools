#!/bin/bash

rm -rf build
rm -rf dist
yarn build
mkdir -p build
cp -r ./dist/* ./build
cp package.json ./build/package.json
rm -rf dist