// Requires
const express = require("express");
const axios = require('axios');
let appInsights = require('applicationinsights');

// Instances and configuration
const app = express();
appInsights.setup(ikey)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(false)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI)
    .start();
let client = appInsights.defaultClient;

// fields
const port = process.env.PORT || 3000;
const ikey = process.env.InstrumentationKey || '80acad05-fdee-417d-9ea4-6611e32f2719';

// Middleware
app.use((req, res, next) => {
    let msg = req.method + " " + req.url;
    console.info(msg);
    client.trackTrace({message: msg});
    next();
});

// Routes
app.get("/", (req, res, next) => {
    res.send("API running at: /api/names, /api/error. /api/dependency")
});

app.get("/api/names", (req, res, next) => {
    res.json(["Tony", "Lisa", "Michael", "Ginger", "Food"]);
});

app.get("/api/error", (req, res, next) => {
    res.status(500).json({ error: "Error" });
});

app.get("/status", (req, res, next) => {
    try {
        /// Test DB connection
    } catch(error) {
        ///
        client.trackEvent({name: "Database_Connectivity_Failure"})
        res.status(500).json(error);
        return;
    }
    res.send("");
});

app.get("/api/dependency", async (req, res, next) => {
    try {
        let startTime = Date.now();
        let url = `http://localhost:${port}/api/names`;
        let result = await axios.get(url);
        let duration = Date.now() - startTime;
        console.info(result.data);
        client.trackDependency({ target: url, name: "self call", data: "", duration: duration, resultCode: 0, success: true, dependencyTypeName: "SELF_CALL" });
        res.json(result.data);
    } catch (error) {
        console.error(error);
        client.trackException({ exception: error });
    }
});

// Listen and wait
app.listen(port, () => {
    console.log("Server running on port " + port);
});
