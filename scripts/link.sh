#!/bin/bash

./scripts/package.sh
yarn unlink
cd build
yarn link 
cd ../example
yarn link node-api-tools
cd ..