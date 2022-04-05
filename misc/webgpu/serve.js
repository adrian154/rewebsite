// origin-trial doesn't work with file:/// protocol
const express = require("express");
const app = express();
app.use(express.static(__dirname));
app.listen(80, () => console.log("Now listening!"));