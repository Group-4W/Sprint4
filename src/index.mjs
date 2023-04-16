/* Import dependencies */
import express from "express";
import mysql from "mysql2/promise";
import DatabaseService from "./services/database.service.mjs";

/* Create express instance */
const app = express();
const port = 3000;

// Integrate Pug with Express
app.set("view engine", "pug");

// Serve assets from 'static' folder
app.use(express.static("static"));
app.use(express.static("images"));
app.use(express.static("fonts"));
app.use(express.urlencoded({ extended: true }));

const db = await DatabaseService.connect();
const { conn } = db;

/* Landing route */
app.get("/", (req, res) => {
  res.render("home");
});

// Gallery route
app.get("/gallery", (req, res) => {
  res.render("gallery");
});

// About route
app.get("/about", (req, res) => {
  res.render("about");
});

// world population route
app.get("/cities/population/:place", async (req, res) => {
  const placeName = req.params.place;
  const population = await db.getPopulation(placeName);
  if (placeName == "world") {
    res.render("worldpop", { population });
  }
});

app.get("/cities", async (req, res) => {
  const [rows, fields] = await db.getCities();
  /* Render cities.pug with data passed as plain object */
  return res.render("cities", { rows, fields });
});

app.get("/cities/:id", async (req, res) => {
  const cityId = req.params.id;
  const city = await db.getCity(cityId);
  return res.render("city", { city });
});

// Single country page
app.get("/single-country/:code", async function (req, res) {
  var countryCode = req.params.code;
  // Create a country class with the code passed
  const country = await db.getCountry(countryCode);
  return res.render("country", { country });
});

// Returns JSON array of cities
app.get("/api/cities", async (req, res) => {
  const [rows, fields] = await db.getCities();
  return res.send(rows);
});

// Returns JSON array of cities
app.get("/addcountry", async (req, res) => {
  return res.render('addcountry');
});

app.post("/add-country", async function (req, res) {
  // Get the submitted values
  var params = req.body;
  // Adding a try/catch block which will be useful later when we add to the database
  try {
    await db.addCountry(params).then(result => {
      // Just a little output for now
      res.send("data should be added");
    });
  } catch (err) {
    console.error(`Error while adding country `, err.message);
  }
});

// Run server!
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
