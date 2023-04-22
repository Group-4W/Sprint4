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

  async runsql(sql) {
    return await this.conn.execute(sql);
  }

  async getCountry(countryCode) {
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

  async getCity(cityId) {
    const [rows, fields] = await this.conn.execute(
      `SELECT * FROM city WHERE id = ${cityId}`
    );
    const { ID, Name, CountryCode, District, Population } = rows[0];
    const city = new City(ID, Name, CountryCode, District, Population);
    return city;
  }

  async getCountries(place, N) {
    if (place == "the world") {
      const num = Number(N);
      if (!isNaN(N) && num > -1) {
        try {
          // Fetch cities from database
          const data = await this.conn.execute(
            `SELECT * FROM country ORDER BY Population DESC LIMIT ${num}`
          );
          return data;
        } catch (err) {
          // Handle error...
          console.error(err);
          return undefined;
        }
      }
      try {
        // Fetch cities from database
        const data = await this.conn.execute(
          `SELECT * FROM country ORDER BY Population DESC`
        );
        return data;
      } catch (err) {
        // Handle error...
        console.error(err);
        return undefined;
      }
    }
    const num = Number(N);
    if (!isNaN(N) && num > -1) {
      try {
        // Fetch cities from database
        const data = await this.conn.execute(
          `SELECT * FROM country WHERE Region = "${place}" OR Continent = "${place}" ORDER BY Population DESC LIMIT ${num}`
        );
        return data;
      } catch (err) {
        // Handle error...
        console.error(err);
        return undefined;
      }
    }
    try {
      // Fetch cities from database
      const data = await this.conn.execute(
        `SELECT * FROM country WHERE Region = "${place}" OR Continent = "${place}" ORDER BY Population DESC`
      );
      return data;
    } catch (err) {
      // Handle error...
      console.error(err);
      return undefined;
    }
  }

  async getCities(place, N) {
    if (place == "the world") {
      const num = Number(N);
      if (!isNaN(N) && num > -1) {
        try {
          // Fetch cities from database
          const data = await this.conn.execute(
            `SELECT * FROM city ORDER BY Population DESC LIMIT ${num}`
          );
          return data;
        } catch (err) {
          // Handle error...
          console.error(err);
          return undefined;
        }
      }
      try {
        // Fetch cities from database
        const data = await this.conn.execute(
          `SELECT * FROM city ORDER BY Population DESC`
        );
        return data;
      } catch (err) {
        // Handle error...
        console.error(err);
        return undefined;
      }
    }
    const num = Number(N);
    if (!isNaN(N) && num > -1) {
      try {
        // Fetch cities from database
        const data = await this.conn.execute(
          `SELECT * FROM city WHERE District = "${place}" OR CountryCode IN (SELECT Code FROM country WHERE Region = "${place}" OR Continent = "${place}" OR Name = "${place}") ORDER BY Population DESC LIMIT ${num}`
        );
        return data;
      } catch (err) {
        // Handle error...
        console.error(err);
        return undefined;
      }
    }
    try {
      // Fetch cities from database
      const data = await this.conn.execute(
        `SELECT * FROM city WHERE District = "${place}" OR CountryCode IN (SELECT Code FROM country WHERE Region = "${place}" OR Continent = "${place}" OR Name = "${place}") ORDER BY Population DESC`
      );

      return data;
    } catch (err) {
      // Handle error...
      console.error(err);
      return undefined;
    }
  }

  async getCapitals(place, N) {
    if (place == "the world") {
      const num = Number(N);
      if (!isNaN(N) && num > -1) {
        try {
          // Fetch cities from database
          const data = await this.conn.execute(
            `SELECT city.* FROM city JOIN country ON city.ID = country.Capital ORDER BY Population DESC LIMIT ${num}`
          );
          return data;
        } catch (err) {
          // Handle error...
          console.error(err);
          return undefined;
        }
      }
      try {
        // Fetch cities from database
        const data = await this.conn.execute(
          `SELECT city.* FROM city JOIN country ON city.ID = country.Capital ORDER BY Population DESC`
        );
        return data;
      } catch (err) {
        // Handle error...
        console.error(err);
        return undefined;
      }
    }
    const num = Number(N);
    if (!isNaN(N) && num > -1) {
      try {
        // Fetch cities from database
        const data = await this.conn.execute(
          `SELECT city.* FROM city JOIN country ON city.ID = country.Capital WHERE Region = "${place}" OR Continent = "${place}" ORDER BY Population DESC LIMIT ${num}`
        );
        return data;
      } catch (err) {
        // Handle error...
        console.error(err);
        return undefined;
      }
    }
    try {
      // Fetch cities from database
      const data = await this.conn.execute(
        `SELECT city.* FROM city JOIN country ON city.ID = country.Capital WHERE Region = "${place}" OR Continent = "${place}" ORDER BY Population DESC`
      );
      return data;
    } catch (err) {
      // Handle error...
      console.error(err);
      return undefined;
    }
  }

  async getCityPopulation(place) {
    if (place == "country") {
      try {
        // Fetch cities from database
        const data = await this.conn.execute(
          `SELECT * FROM city ORDER BY Population DESC`
        );
        return data;
      } catch (err) {
        // Handle error...
        console.error(err);
        return undefined;
      }
    } else if (place == "continent") {
      try {
        // Fetch cities from database
        const data = await this.conn.execute(
          `SELECT * FROM city ORDER BY Population DESC`
        );
        return data;
      } catch (err) {
        // Handle error...
        console.error(err);
        return undefined;
      }
    } else if (place == "region") {
      try {
        // Fetch cities from database
        const data = await this.conn.execute(
          `SELECT * FROM city ORDER BY Population DESC`
        );
        return data;
      } catch (err) {
        // Handle error...
        console.error(err);
        return undefined;
      }
    }
    try {
      // Fetch cities from database
      const data = await this.conn.execute(
        `SELECT * FROM city ORDER BY Population DESC`
      );
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
    console.log(countryParams.capital);
    console.log(countryParams.code);
    console.log(countryParams.name);
    const data = await this.conn.execute(
      `INSERT IGNORE INTO country (Code, Name, Continent, Region, SurfaceArea, IndepYear, Population, LifeExpectancy, GNP, GNPOld, LocalName, GovernmentForm, HeadOfState, Capital, Code2)
                 VALUES ('${countryParams.code}', '${countryParams.name}', '${countryParams.continent}', '${countryParams.region}', '${countryParams.surfacearea}', '${countryParams.indepyear}', '${countryParams.population}', '${countryParams.lifeexpectancy}', '${countryParams.gnp}', '${countryParams.gnpold}', '${countryParams.localname}', '${countryParams.governmentform}', '${countryParams.headofstate}', '${countryParams.capital}', '${countryParams.code2}')`
    );

    // Execute Query
    return countryParams;
  }

  async updateCountry(countryParams) {
    // create function to add country to database
    console.log(countryParams);
    return countryParams;
  }
}
