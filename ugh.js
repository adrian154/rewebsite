// cors issues when testing the site locally...
const express = require("express");
express().use(express.static(".")).listen(80, () => console.log("listening"));