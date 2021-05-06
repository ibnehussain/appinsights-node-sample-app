# Sample Node/Express App with Azure Application Insights

## Reference Document

- https://docs.microsoft.com/en-us/azure/azure-monitor/app/nodejs

## Out of the box

- Out of the box the Application Insights SDK is very capable.
- It can automatically track many events without having to write additional code.

```
appInsights.setup("<instrumentation_key>")
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
```

## Extensibility

- However, to achieve a 100% advantage of the SDK, there are many custom methods that can be leveraged.

```
client.trackEvent({name: "my custom event", properties: {customProperty: "custom property value"}});
client.trackException({exception: new Error("handled exceptions can be logged with this method")});
client.trackMetric({name: "custom metric", value: 3});
client.trackTrace({message: "trace message"});
client.trackDependency({target:"http://dbname", name:"select customers proc", data:"SELECT * FROM Customers", duration:231, resultCode:0, success: true, dependencyTypeName: "ZSQL"});
client.trackRequest({name:"GET /customers", url:"http://myserver/customers", duration:309, resultCode:200, success:true});
```

### Example - Check database connectivity in a liveliness probe

```
app.get("/status", (req, res, next) => {
    try {
         /// Test DB connection
    } catch(error) {    
         client.trackEvent({name: "Database Connectivity Failure"})
         res.status(500).send({error: error});
    }
    res.send("");    
});
```` 

## Sample App

```
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


// fields
const port = process.env.PORT || 3000;
const ikey = process.env.InstrumentationKey;
let client = appInsights.defaultClient;

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
```
