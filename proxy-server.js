const express = require("express");
const http = require("http");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const WebSocket = require("ws");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const port = 3000;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Define the offline music folder
const musicFolder = "/storage/sd/www/";

// Define the livestream URL
const livestreamUrl = "http://192.168.1.154:8080/stream";

// Proxy for the livestream
const livestreamProxy = createProxyMiddleware("/stream", {
  target: livestreamUrl,
  changeOrigin: true,
  pathRewrite: {
    [`^/stream`]: "",
  },
});

// Broadcast a message to all connected clients
const broadcastMessage = (message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

const checkStreamAvailability = async () => {
  try {
    const response = await axios.head(livestreamUrl);
    // This just checks for a 200 response. May need better checks for health of stream?
    const isStreamAvailable = response.status === 200;
    broadcastMessage(JSON.stringify({ isStreamAvailable }));
  } catch (error) {
    broadcastMessage(JSON.stringify({ isStreamAvailable: false }));
  }
};

// Set up an interval to periodically check the stream availability and broadcast status
const checkInterval = 10000; // 10 seconds
setInterval(checkStreamAvailability, checkInterval);

// Route for the livestream
app.use("/stream", (req, res) => {
  // Check if the livestream URL is valid or not
  livestreamProxy(req, res, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send("Livestream is not valid");
    }
  });
});

// Route for getting list of music files
app.get("/music", (req, res) => {
  fs.readdir(musicFolder, (err, files) => {
    if (err) {
      res.status(500).send("Error");
    }
    res.status(200).send(JSON.stringify(files));
    res.end();
  });
});

// Route for serving static media files
app.use("/music", express.static(musicFolder));

// Route for the default page
app.get("/", (req, res) => {
  res.sendFile("/storage/sd/htmlWidgets/index.html");
});

// Start the express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Start the websocket server
server.listen(3001, () => {
  console.log("Websocket server is listening on port 3001");
});
