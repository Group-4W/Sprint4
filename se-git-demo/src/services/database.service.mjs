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
      //get list of countries in the world. For each country, sum the population of the cities in that country. For each country, substract their population with the sum of the population of the cities in that country.
      try {
        // Fetch cities from database
        const [data, fields] = await this.conn
          .execute(`SELECT c.Name, c.Population, SUM(ci.Population) as CityPopulation
        FROM country c
        JOIN city ci ON c.Code = ci.CountryCode
        GROUP BY c.Code`);
        return data;
      } catch (err) {
        // Handle error...
        console.error(err);
        return undefined;
      }
    } else if (place == "continent") {
      try {
        // Fetch cities from database
        const [dataPopulation, fieldsp] = await this.conn
          .execute(`SELECT continent AS Name, SUM(population) AS Population
        FROM country
        GROUP BY continent;`);
        const [dataCityPopulation, fieldscp] = await this.conn
          .execute(`SELECT c.Continent AS Name, SUM(ci.Population) AS CityPopulation
        FROM country c
        INNER JOIN city ci ON c.Code = ci.CountryCode
        GROUP BY c.Continent;`);
        const filteredDataPopulation = dataPopulation.filter(
          (population) => population.Population !== "0"
        );
        const data = filteredDataPopulation.map((population) => {
          const cityPopulation = dataCityPopulation.find(
            (city) => city.Name === population.Name
          );
          return {
            ...population,
            CityPopulation: cityPopulation.CityPopulation,
          };
        });
        return data;
      } catch (err) {
        // Handle error...
        console.error(err);
        return undefined;
      }
    } else if (place == "region") {
      try {
        // Fetch cities from database
        const [dataPopulation, fieldsp] = await this.conn
          .execute(`SELECT Region AS Name, SUM(Population) AS Population
          FROM country
          GROUP BY Region;
          `);
        const [dataCityPopulation, fieldscp] = await this.conn
          .execute(`SELECT c.Region AS Name, SUM(ci.Population) AS CityPopulation
          FROM country c
          INNER JOIN city ci ON c.Code = ci.CountryCode
          GROUP BY c.Region;
          `);
        const filteredDataPopulation = dataPopulation.filter(
          (population) => population.Population !== "0"
        );
        const data = filteredDataPopulation.map((population) => {
          const cityPopulation = dataCityPopulation.find(
            (city) => city.Name === population.Name
          );
          return {
            ...population,
            CityPopulation: cityPopulation.CityPopulation,
          };
        });
        return data;
      } catch (err) {
        // Handle error...
        console.error(err);
        return undefined;
      }
    }
    try {
      // Fetch cities from database
      const [data, fields] = await this.conn.execute(
        `SELECT * FROM city WHERE Name = "asdwinsksla"`
      );
      return data;
    } catch (err) {
      // Handle error...
      console.error(err);
      return undefined;
    }
  }

  async getPopulation(place) {
    if (place == "the world") {
      try {
        // Fetch cities from database
        const sum = await this.conn.execute(
          "SELECT SUM(Population) FROM country"
        );
        const total = sum[0][0]["SUM(Population)"];
        const ans = Number(total).toLocaleString();
        return ans;
      } catch (err) {
        // Handle error...
        console.error(err);
        return undefined;
      }
    }
    try {
      const [continents, fieldsc] = await this.conn.execute(
        "SELECT DISTINCT Continent FROM country"
      );
      if (continents.some((continent) => continent.Continent === place)) {
        const sum = await this.conn.execute(
          `SELECT SUM(Population)
          FROM country
          WHERE Continent = '${place}';
          `
        );
        const total = sum[0][0]["SUM(Population)"];
        const ans = Number(total).toLocaleString();
        return ans;
      }
      const [regions, fieldsr] = await this.conn.execute(
        "SELECT DISTINCT Region FROM country"
      );
      if (regions.some((region) => region.Region === place)) {
        const sum = await this.conn.execute(
          `SELECT SUM(Population)
          FROM country
          WHERE Region = '${place}';
          `
        );
        const total = sum[0][0]["SUM(Population)"];
        const ans = Number(total).toLocaleString();
        return ans;
      }
      const [countries, fieldsco] = await this.conn.execute(
        "SELECT DISTINCT Name FROM country"
      );
      if (countries.some((name) => name.Name === place)) {
        const sum = await this.conn.execute(
          `SELECT SUM(Population)
          FROM country
          WHERE Name = '${place}';
          `
        );
        const total = sum[0][0]["SUM(Population)"];
        const ans = Number(total).toLocaleString();
        return ans;
      }
      const [districts, fieldsd] = await this.conn.execute(
        "SELECT DISTINCT District FROM city"
      );
      if (districts.some((district) => district.District === place)) {
        const sum = await this.conn.execute(
          `SELECT SUM(Population)
          FROM city
          WHERE District = '${place}';
          `
        );
        const total = sum[0][0]["SUM(Population)"];
        const ans = Number(total).toLocaleString();
        return ans;
      }
      const sum = await this.conn.execute(
        `SELECT SUM(Population)
        FROM city
        WHERE Name = '${place}';
        `
      );
      const total = sum[0][0]["SUM(Population)"];
      const ans = Number(total).toLocaleString();
      return ans;
    } catch (err) {
      // Handle error...
      console.error(err);
      return undefined;
    }
  }

  async getLanguage() {
    try {
      // Fetch cities from database
      const data = await this.conn.execute(
        `SELECT Language AS LanguageName,
        SUM(Population * Percentage / 100) AS Speakers,
        ROUND(SUM(Population * Percentage) / (SELECT SUM(Population) FROM country), 1) AS Percent
      FROM countrylanguage
      JOIN country ON country.Code = countrylanguage.CountryCode
      WHERE Language IN ('Chinese', 'English', 'Hindi', 'Spanish', 'Arabic')
      GROUP BY Language
      ORDER BY Speakers DESC;`
      );
      return data;
    } catch (err) {
      // Handle error...
      console.error(err);
      return undefined;
    }
  }

  async getCountry(place) {
    try {
      const [rows, fields] = await this.conn.execute(
        `SELECT * FROM country WHERE Name = "${place}"`
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
    } catch (err) {
      // Handle error...
      console.error(err);
      return undefined;
    }
  }

  async getCity(place) {
    try {
      const [rows, fields] = await this.conn.execute(
        `SELECT city.Name, country.Name AS Country, city.District, city.Population 
        FROM city 
        JOIN country ON city.CountryCode = country.Code 
        WHERE city.Name = "${place}"`
      );
      // const { ID, Name, CountryCode, District, Population } = rows[0];
      // const city = new City(ID, Name, CountryCode, District, Population);
      return rows[0];
    } catch (err) {
      // Handle error...
      console.error(err);
      return undefined;
    }
  }

  async getPopulationReport(place) {
    //get list of countries in the world. For each country, sum the population of the cities in that country. For each country, substract their population with the sum of the population of the cities in that country.
    try {
      const [continents, fieldsc] = await this.conn.execute(
        "SELECT DISTINCT Continent FROM country"
      );
      if (continents.some((continent) => continent.Continent === place)) {
        // Fetch cities from database
        const [dataPopulation, fieldsp] = await this.conn
          .execute(`SELECT continent AS Name, SUM(population) AS Population
        FROM country
        WHERE Continent = "${place}"`);
        const [dataCityPopulation, fieldscp] = await this.conn
          .execute(`SELECT c.Continent AS Name, SUM(ci.Population) AS CityPopulation
        FROM country c
        INNER JOIN city ci ON c.Code = ci.CountryCode
        WHERE c.Continent = "${place}"`);
        const data = dataPopulation.map((population) => {
          const cityPopulation = dataCityPopulation.find(
            (city) => city.Name === population.Name
          );
          return {
            ...population,
            CityPopulation: cityPopulation.CityPopulation,
          };
        });
        return data;
      }

      const [regions, fieldsr] = await this.conn.execute(
        "SELECT DISTINCT Region FROM country"
      );
      if (regions.some((region) => region.Region === place)) {
        const [dataPopulation, fieldsp] = await this.conn
          .execute(`SELECT Region AS Name, SUM(population) AS Population
        FROM country
        WHERE Region = "${place}"`);
        const [dataCityPopulation, fieldscp] = await this.conn
          .execute(`SELECT c.Region AS Name, SUM(ci.Population) AS CityPopulation
        FROM country c
        INNER JOIN city ci ON c.Code = ci.CountryCode
        WHERE c.Region = "${place}"`);
        const data = dataPopulation.map((population) => {
          const cityPopulation = dataCityPopulation.find(
            (city) => city.Name === population.Name
          );
          return {
            ...population,
            CityPopulation: cityPopulation.CityPopulation,
          };
        });
        return data;
      }

      const [countries, fieldsco] = await this.conn.execute(
        "SELECT DISTINCT Name FROM country"
      );
      if (countries.some((name) => name.Name === place)) {
        const [dataPopulation, fieldsp] = await this.conn
          .execute(`SELECT Name AS Name, SUM(population) AS Population
        FROM country
        WHERE Name = "${place}"`);
        const [dataCityPopulation, fieldscp] = await this.conn
          .execute(`SELECT c.Name AS Name, SUM(ci.Population) AS CityPopulation
        FROM country c
        INNER JOIN city ci ON c.Code = ci.CountryCode
        WHERE c.Name = "${place}"`);
        const data = dataPopulation.map((population) => {
          const cityPopulation = dataCityPopulation.find(
            (city) => city.Name === population.Name
          );
          return {
            ...population,
            CityPopulation: cityPopulation.CityPopulation,
          };
        });
        return data;
      }
    } catch (err) {
      // Handle error...
      console.error(err);
      return undefined;
    }
    const [dataPopulation, fieldsp] = await this.conn
      .execute(`SELECT continent AS Name, SUM(population) AS Population
        FROM country
        WHERE Continent = "${place}"`);
    const [dataCityPopulation, fieldscp] = await this.conn
      .execute(`SELECT c.Continent AS Name, SUM(ci.Population) AS CityPopulation
        FROM country c
        INNER JOIN city ci ON c.Code = ci.CountryCode
        WHERE c.Continent = "${place}"`);
    const data = dataPopulation.map((population) => {
      const cityPopulation = dataCityPopulation.find(
        (city) => city.Name === population.Name
      );
      return {
        ...population,
        CityPopulation: cityPopulation.CityPopulation,
      };
    });
    return data;
  }

  async getEmails() {
    const data = await this.conn.execute(`SELECT * FROM user`);
    return data;
  }

  async deleteAccount(user) {
    const data = await this.conn.execute(`DELETE FROM user WHERE id = ${user}`);
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
