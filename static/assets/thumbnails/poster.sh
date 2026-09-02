#!/bin/bash

for video in *.mp4 *.mov *.mkv *.webm; do
    [ -e "$video" ] || continue

    name="${video%.*}"

    ffmpeg -y -ss 0 -i "$video" -frames:v 1 -q:v 2 "posters/${name}.jpg"

    echo "Poster créé : ${name}.jpg"
done
