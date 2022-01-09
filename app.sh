#!/bin/sh
echo "Start Link: $1";
py utils/main.py "$1"
npm start