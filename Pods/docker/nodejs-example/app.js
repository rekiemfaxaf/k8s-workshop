var express = require('express')
var app = express();
var port = process.env.PORT || 3000;
var ns = process.env.NS || "ONLY GOD KNOWS!";
var health_status = process.env.HEALTH_STATUS || 200;
var os = require("os");

app.get('/', (req, res) =>
 res.send('Kubernets Workshop from host <strong>' + os.hostname +'</strong> in namespace: <strong>' + ns + '</strong>.')
);

app.get('/health', (req, res) =>
 res.status(health_status).send('CODE: ' + health_status)
);



app.listen(port, () => console.log(`Example app listening on port ${port}!`))