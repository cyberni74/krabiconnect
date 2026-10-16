#!/bin/sh
# usage: tools/run-ts.sh tools/foo.ts [args]  — bundle with esbuild and run in node
set -e
out="/tmp/rs-$(basename "$1" .ts).mjs"
npx esbuild "$1" --bundle --platform=node --format=esm --outfile="$out" --log-level=error --alias:@=./src
shift
node "$out" "$@"
