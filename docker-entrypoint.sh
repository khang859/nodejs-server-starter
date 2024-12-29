#!/bin/sh

if [ "$NODE_ENV" = "development" ]; then
    echo "Starting in development mode with --watch flag"
    yarn watch &
    sleep 2
    exec node --watch dist/index.js
else
    echo "Starting in production mode"
    yarn build
    exec node dist/index.js
fi