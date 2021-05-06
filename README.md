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

- However, to achieve a 100% there are custom events that can be leveraged

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
