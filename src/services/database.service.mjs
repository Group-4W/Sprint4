import mysql from "mysql2/promise";
import City from "../models/city.mjs";
import Country from "../models/country.mjs";

export default class DatabaseService {
  conn;

  constructor(conn) {
    this.conn = conn;
  }

  static async connect() {
    const conn = await mysql.createConnection({
      host: process.env.DATABASE_HOST || "localhost",
      user: "user",
      password: "password",
      database: "world",
    });

    return new DatabaseService(conn);
  }

  async getCity(cityId) {
    const [rows, fields] = await this.conn.execute(
      `SELECT * FROM city WHERE id = ${cityId}`
    );
    const { ID, Name, CountryCode, District, Population } = rows[0];
    const city = new City(ID, Name, CountryCode, District, Population);
    return city;
  }

  async getCountry(countryCode) {
    if (countryCode == "543") {
      return 69;
    } else if (countryCode == "123") {
      return 420;
    }

    const [rows, fields] = await this.conn.execute(
      `SELECT * FROM country WHERE Code = "${countryCode}"`
    );
    const { Code, Name, Continent, Region, Population, Capital } = rows[0];
    const country = new Country(
      Code,
      Name,
      Continent,
      Region,
      Population,
      Capital
    );
    return country;
  }

  async getCities() {
    try {
      // Fetch cities from database
      const data = await this.conn.execute("SELECT * FROM `city`");
      return data;
    } catch (err) {
      // Handle error...
      console.error(err);
      return undefined;
    }
  }

  async getPopulation(place) {
    if (place == "world") {
      const sum = await this.conn.execute(
        "SELECT SUM(Population) FROM country"
      );
      const total = sum[0][0]["SUM(Population)"];
      const ans = Number(total).toLocaleString();
      return ans;
    }
    return 0;
  }

  async addCountry(countryParams) {
    // create function to add country to database
    console.log(countryParams);
    return countryParams;
  }
}
