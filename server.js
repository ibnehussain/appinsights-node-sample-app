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
const ikey = process.env.InstrumentationKey;

// Middleware
app.use((req, res, next) => {
    console.info(req.method + " " + req.url);
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
    // try {
    //     /// Test DB connection
    // } catch {
    //     ///
    //     client.trackEvent({name: "Database Failure"})
    // }
    client.trackEvent({name: "Database Failure"})
    client.flush();
    res.status(500).send("");
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
