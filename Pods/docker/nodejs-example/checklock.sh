#!/bin/bash

if [ -f "/shared/key.lock" ]
then
    exec node /app/app.js
else
    echo "Key not found!"
    exit 1
fi