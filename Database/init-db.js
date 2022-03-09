"use strict";

require('dotenv').config();
const fs = require("fs");           // fs module grants file system access
const db = require("../Models/db"); // We need our db connection

// Now read the schema.sql file into a string
const schemaString = fs.readFileSync(__dirname + "/schema.sql", "utf-8");

// Now just run the sql file
db.exec(schemaString);