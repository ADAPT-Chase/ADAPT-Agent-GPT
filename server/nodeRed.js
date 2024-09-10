const http = require('http');
const express = require('express');
const RED = require('node-red');
const fs = require('fs');
const path = require('path');

// Create an Express app
const app = express();

// Create a server
const server = http.createServer(app);

// Create the settings object - see default settings.js file for other options
const settings = {
    httpAdminRoot: "/red",
    httpNodeRoot: "/api",
    userDir: "./node-red-data/",
    functionGlobalContext: { }    // enables global context
};

// Initialize the runtime with a server and settings
RED.init(server, settings);

// Serve the editor UI from /red
app.use(settings.httpAdminRoot, RED.httpAdmin);

// Serve the http nodes UI from /api
app.use(settings.httpNodeRoot, RED.httpNode);

module.exports = {
    start: function(port) {
        server.listen(port);
        
        // Start the runtime
        RED.start().then(() => {
            console.log("Node-RED started");
            
            // Load the flows from the JSON file
            const flowsPath = path.join(__dirname, 'nodeRedFlows.json');
            fs.readFile(flowsPath, 'utf8', (err, data) => {
                if (err) {
                    console.error("Error reading Node-RED flows file:", err);
                    return;
                }
                try {
                    const flows = JSON.parse(data);
                    RED.nodes.setFlows(flows).then(() => {
                        console.log("Node-RED flows loaded successfully");
                    }).catch((err) => {
                        console.error("Error setting Node-RED flows:", err);
                    });
                } catch (parseErr) {
                    console.error("Error parsing Node-RED flows JSON:", parseErr);
                }
            });
        });
    }
};