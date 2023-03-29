import DatabaseService from "./services/database.service.mjs";
const db = await DatabaseService.connect();

describe("getCountry of mexico", () => {
  it("should return a 98881000", async () => {
    // call asyncFunction and test the result
    const result = await db.getCountry("MEX");
    expect(result.population).toEqual(98881000);
  });
  it("should return Mexico", async () => {
    // call asyncFunction and test the result
    const result = await db.getCountry("MEX");
    expect(result.name).toEqual("Mexico");
  });
});

describe("getCity", () => {
  it("should return Kabul", async () => {
    // call asyncFunction and test the result
    const result = await db.getCity(1);
    expect(result.name).toEqual("Kabul");
  });
  it("should return Buenos Aires", async () => {
    // call asyncFunction and test the result
    const result = await db.getCity(69);
    expect(result.name).toEqual("Buenos Aires");
  });
});

describe("getPopulation", () => {
  it("should return the world population a big number like 6billion", async () => {
    // call asyncFunction and test the result
    const result = await db.getPopulation("world");
    expect(result).toEqual("6,078,749,450");
  });
});
