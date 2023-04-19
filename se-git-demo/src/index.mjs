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
  res.render("index");
});

app.post("/countries", async function (req, res) {
  // Get the submitted values
  var params = req.body;
  const place = params.place;
  const N = params.N;
  const [rows, fields] = await db.getCountries(place, N);
  res.render("countries", { rows, fields, place });
});

app.get("/cities", async (req, res) => {
  const [rows, fields] = await db.getCities();
  /* Render cities.pug with data passed as plain object */
  return res.render("cities", { rows, fields });
});

// Returns JSON array of cities
app.get("/api/cities", async (req, res) => {
  const [rows, fields] = await db.getCities();
  console.log(fields);
  return res.send(rows);
});

// world population route
app.post("/population", async function (req, res) {
  const params = req.body;
  const population = await db.getPopulation(params.place);
  res.render("population", { population });
});

app.get("/city-report/:nameid", async (req, res) => {
  const cityId = req.params.nameid;
  const city = await db.getCity(cityId);
  return res.render("city-report", { city });
});

// Single country page
app.get("/country-report/:nameid", async function (req, res) {
  var countryCode = req.params.nameid;
  // Create a country class with the code passed
  const country = await db.getCountry(countryCode);
  return res.render("country-report", { country });
});

/* Landing route */
app.get("/signin", (req, res) => {
  res.render("signin");
});

app.get("/addcountry", async (req, res) => {
  return res.render("addcountry");
});

app.post("/add-country", async function (req, res) {
  // Get the submitted values
  var params = req.body;
  // Adding a try/catch block which will be useful later when we add to the database
  try {
    await db.addCountry(params).then((result) => {
      // Just a little output for now
      res.send("data should be added");
    });
  } catch (err) {
    console.error(`Error while adding country `, err.message);
  }
});

app.get("/update-country", async (req, res) => {
  return res.render("updatecountry");
});

app.post("/update-country", async function (req, res) {
  // Get the submitted values
  var params = req.body;
  // Adding a try/catch block which will be useful later when we add to the database
  try {
    await db.updateCountry(params).then((result) => {
      // Just a little output for now
      res.send("data should be added");
    });
  } catch (err) {
    console.error(`Error while adding country `, err.message);
  }
});

// About route
app.get("/about", (req, res) => {
  res.render("about");
});

// Run server!
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
