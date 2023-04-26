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
app.get("/", async (req, res) => {
  console.log(req.session);
  const { auth, userId } = req.session;
  if (!auth) {
    return res.render("index");
  }
  const sql = `SELECT id, email FROM user WHERE user.id = ${userId}`;
  const [results, cols] = await db.runsql(sql);
  const result = results[0];
  const email = result.email;
  res.render("index-s");
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
  const rows = await db.getCityPopulation(place);
  res.render("city-population", { rows, place });
});

// world population route
app.post("/population", async function (req, res) {
  const params = req.body;
  const place = params.place;
  const population = await db.getPopulation(place);
  res.render("population", { population, place });
});

// world population route
app.post("/language", async function (req, res) {
  const [rows, fields] = await db.getLanguage();
  res.render("language", { rows, fields });
});

// Single country page
app.post("/country-report", async function (req, res) {
  var params = req.body;
  var place = params.place;
  // Create a country class with the code passed
  const country = await db.getCountry(place);
  return res.render("country-report", { country });
});

app.post("/city-report", async function (req, res) {
  var params = req.body;
  var place = params.place;
  // Create a country class with the code passed
  const city = await db.getCity(place);
  return res.render("city-report", { city });
});

app.post("/capital-report", async function (req, res) {
  var params = req.body;
  var place = params.place;
  // Create a country class with the code passed
  const city = await db.getCity(place);
  return res.render("capital-report", { city });
});

app.post("/population-report", async function (req, res) {
  var params = req.body;
  var place = params.place;
  // Create a country class with the code passed
  const [data, fields] = await db.getPopulationReport(place);
  const name = data.Name;
  const pop = data.Population;
  const citypop = data.CityPopulation;

  const citypopper = (citypop * 100) / pop;
  const noncitypop = pop - citypop;
  const noncitypopper = (noncitypop * 100) / pop;

  return res.render("population-report", {
    name,
    pop,
    citypop,
    citypopper,
    noncitypop,
    noncitypopper,
    place,
  });
});

// Register
app.post("/register", function (req, res) {
  res.render("register");
});
// Login
app.get("/login", async function (req, res) {
  const [rows, field] = await db.getEmails();
  console.log(rows);
  res.render("login");
});

// Create a route for root - /
app.get("/account", async (req, res) => {
  console.log(req.session);
  const { auth, userId } = req.session;
  if (!auth) {
    return res.redirect("/login");
  }
  const sql = `SELECT id, email FROM user WHERE user.id = ${userId}`;
  const [results, cols] = await db.runsql(sql);
  const result = results[0];
  const email = result.email;
  res.render("account", { email });
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
app.post("/logout", async function (req, res) {
  req.session.destroy();
  res.redirect("/login");
});

app.post("/delete", async function (req, res) {
  const { auth, userId } = req.session;
  const sql = `SELECT id, email FROM user WHERE user.id = ${userId}`;
  const [results, cols] = await db.runsql(sql);
  const user = results[0];
  const id = user.id;
  await db.deleteAccount(id);
  res.redirect("/login");
});

app.post("/add", async (req, res) => {
  return res.render("add");
});

app.post("/add-country", async function (req, res) {
  // Get the submitted values
  var params = req.body;
  // Adding a try/catch block which will be useful later when we add to the database
  try {
    await db.addCountry(params).then((result) => {
      // Just a little output for now

      res.send("Country was added");
    });
  } catch (err) {
    console.error(`Error while adding country `, err.message);
  }
});

app.post("/add-city", async function (req, res) {
  // Get the submitted values
  var params = req.body;
  // Adding a try/catch block which will be useful later when we add to the database
  try {
    await db.addCity(params).then((result) => {
      // Just a little output for now

      res.send("City was added");
    });
  } catch (err) {
    console.error(`Error while adding city `, err.message);
  }
});

app.post("/remove", async (req, res) => {
  return res.render("remove");
});

app.post("/remove-country", async function (req, res) {
  // Get the submitted values
  var params = req.body;
  // Adding a try/catch block which will be useful later when we add to the database
  try {
    await db.removeCountry(params).then((result) => {
      // Just a little output for now
      res.send("Country was removed");
    });
  } catch (err) {
    console.error(`Error while removing country `, err.message);
  }
});

app.post("/remove-city", async function (req, res) {
  // Get the submitted values
  var params = req.body;
  // Adding a try/catch block which will be useful later when we add to the database
  try {
    await db.removeCity(params).then((result) => {
      // Just a little output for now
      res.send("City was removed");
    });
  } catch (err) {
    console.error(`Error while removing city `, err.message);
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
