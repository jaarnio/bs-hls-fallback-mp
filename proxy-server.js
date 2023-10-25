const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
const { createProxyMiddleware } = require("http-proxy-middleware");

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

// Send UDP Message to Ba:con front end
async function sendUDPMessage(message) {
  try {
    let data = new FormData();
    let config = { headers: { "Content-Type": "multipart/form-data" } };
    data.append("key", message);
    const response = await axios.post("http://localhost:8008/SendUDP", data, config);
    console.log("Response from server:", response.data);
  } catch (error) {
    console.error("Error sending POST request:", error);
  }
}

const checkStreamAvailability = async () => {
  try {
    const response = await axios.head(livestreamUrl);
    // This just checks for a 200 response. May need better checks for health of stream?
    const isStreamAvailable = response.status === 200;
    broadcastMessage(JSON.stringify({ isStreamAvailable }));
    sendUDPMessage("online");
  } catch (error) {
    broadcastMessage(JSON.stringify({ isStreamAvailable: false }));
    sendUDPMessage("offline");
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

// Start the express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
