#!/bin/sh

if [ "$NODE_ENV" = "development" ]; then
    echo "Starting in development mode with --watch flag"
    yarn build:watch &
    sleep 2
    exec node --env-file=.env --watch dist/index.js
else
    echo "Starting in production mode"
    yarn build
    exec node --env-file=.env dist/index.js
fi