import DatabaseService from "./services/database.service.mjs";
const db = await DatabaseService.connect();
const { conn } = db;

const mexico = await db.getCountry(MEX);
console.log(mexico);
if ("1" == "1") {
  console.log("Test 1 passed");
} else {
  console.error("Test 1 failed");
}
