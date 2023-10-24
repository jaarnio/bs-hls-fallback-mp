## Overview

This is a technical demo that sets a BrightSign player up to connect to an HLS audio livestream, and if the stream URL becomes unavailable, the player will fall back to a local cache of MP3 files. While in this local file mode, the player will also keep track of playback by sending API calls for each track played. The player will continue to monitor the stream URL and if it becomes available again, it will reconnect automatically.

## Limitations

This is currently built with very basic building blocks and is incomplete. In its current state, the basic "fallback" functionality is the primary feature.

Not yet considered:

- Storing and updating the local media files
- The local playback mode is sending outbound API calls to a test end point
- The local playback mode needs to cache its play tracking locally and re-sync when online again.
- How to package and provision to a player

## Install

Copy MP3 files to the "www" folder on the root of the SD card of the player. This is a manual process currently, as this tech demo doesn't cover building the local media asset library.

Open project in code editor and install packages: npm install

Edit the "proxy-server.js" file for the variable "livestreamUrl". Point this to an audio HLS stream URL of your choosing.

Webpack: npx webpack

Open HLS Music Server.bpfx Presentation in BrightAuthor:connected and link pathing for the Support Content / Node.js file "server-bundle.js". This should point to your "dist/server-bundle.js" file

Publish Presentation to a player.
