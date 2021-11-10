// for local testing - since some things won't work when loaded as a file:///
// NOT necessary for deployment, everything on this site is meant to work served statically

const express = require("express");
const app = express();

/*app.use((req, res, next) => {
    res.header("Origin-Trial", "AqrwOvSBH2hmliPALZ/HkWse/R9FFgi+g7MJN/1mfJnXF3uF58Wx9x0qf3iowwOdKzcsR8tedA8LSEDxFaxqGQEAAABHeyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjgwIiwiZmVhdHVyZSI6IldlYkdQVSIsImV4cGlyeSI6MTY0MzE1NTE5OX0=");
    next();
});*/

app.use(express.static(__dirname));

app.listen(80, () => {console.log("Listening")});