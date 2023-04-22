/* Import dependencies */
import express from "express";
import mysql from "mysql2/promise";
import DatabaseService from "./services/database.service.mjs";
import bcrypt from "bcryptjs";
import session from "express-session";
import User from "./models/user.mjs";

/* Create express instance */
const app = express();
const port = 3000;

// Integrate Pug with Express
app.set("view engine", "pug");

// Serve assets from 'static' folder
app.use(express.static("static"));
app.use(express.urlencoded({ extended: true }));

const db = await DatabaseService.connect();
const { conn } = db;

// Set the sessions
app.use(
  session({
    secret: "verysecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

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

app.post("/cities", async function (req, res) {
  // Get the submitted values
  var params = req.body;
  const place = params.place;
  const N = params.N;
  const [rows, fields] = await db.getCities(place, N);
  res.render("cities", { rows, fields, place });
});

app.post("/capitals", async function (req, res) {
  // Get the submitted values
  var params = req.body;
  const place = params.place;
  const N = params.N;
  const [rows, fields] = await db.getCapitals(place, N);
  res.render("capitals", { rows, fields, place });
});

app.post("/city-population", async function (req, res) {
  // Get the submitted values
  var params = req.body;
  const place = params.place;
  const [rows, fields] = await db.getCityPopulation(place);
  res.render("city-population", { rows, fields, place });
});

// world population route
app.post("/population", async function (req, res) {
  const params = req.body;
  const population = await db.getPopulation(params.place);
  res.render("population", { population });
});

// Single country page
app.get("/country-report/:nameid", async function (req, res) {
  var countryCode = req.params.nameid;
  // Create a country class with the code passed
  const country = await db.getCountry(countryCode);
  return res.render("country-report", { country });
});

app.get("/city-report/:nameid", async (req, res) => {
  const cityId = req.params.nameid;
  const city = await db.getCity(cityId);
  return res.render("city-report", { city });
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

// Register
app.get("/register", function (req, res) {
  res.render("register");
});
// Login
app.get("/login", function (req, res) {
  res.render("login");
});

// Create a route for root - /
app.get("/account", async (req, res) => {
  console.log(req.session);
  const { auth, userId } = req.session;
  if (!auth) {
    return res.redirect("/login");
  }
  const sql = `SELECT id, email FROM user WHERE Users.id = ${userId}`;
  const [results, cols] = await db.runsql(sql);
  const user = results[0];
  res.render("account", { user });
});

app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const sql = `INSERT INTO user (email, password) VALUES ('${email}', '${hashed}')`;
    const [result, _] = await db.runsql(sql);
    const id = result.insertId;
    req.session.auth = true;
    req.session.userId = id;
    return res.redirect("/account");
  } catch (err) {
    console.error(err);
    return res.status(400).send(err.sqlMessage);
  }
});

// Check submitted email and password pair
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(401).send("Missing credentials");
  }

  const sql = `SELECT id, password FROM user WHERE email = '${email}'`;
  const [results, cols] = await db.runsql(sql);

  const user = results[0];

  if (!user) {
    return res.status(401).send("User does not exist");
  }

  const { id } = user;
  const hash = user?.password;
  const match = await bcrypt.compare(password, hash);

  if (!match) {
    return res.status(401).send("Invalid password");
  }

  req.session.auth = true;
  req.session.userId = id;

  return res.redirect("/account");
});

// Logout
app.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/login");
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
