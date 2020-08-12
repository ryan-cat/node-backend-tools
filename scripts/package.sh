#!/bin/bash

rm -rf dist
yarn build
cd dist
find . -name '*.test.js' -delete
find . -name '*.test.d.ts' -delete
cd ..