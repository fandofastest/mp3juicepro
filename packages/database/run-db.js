const { seedDatabase } = require("./dist/seed.js");

const mongoUri = "mongodb://admin:Palang66@158.180.79.130:27017/mp3juicespro?authSource=admin";

console.log("Running seed command with URI:", mongoUri);

seedDatabase(mongoUri)
  .then(() => {
    console.log("Database seeded successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Database seeding failed:", err);
    process.exit(1);
  });
