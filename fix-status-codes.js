const fs = require("fs");
const path = require("path");

const apiDir = path.resolve("apps/api/src/app/api");

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith(".ts")) {
      let content = fs.readFileSync(fullPath, "utf-8");

      // Replace ", 21)" with ", 201)"
      const updated = content.replace(/,\s*21\)/g, ", 201)");

      if (content !== updated) {
        fs.writeFileSync(fullPath, updated, "utf-8");
        console.log(`Updated status code in: ${fullPath}`);
      }
    }
  }
}

if (fs.existsSync(apiDir)) {
  processDirectory(apiDir);
}
console.log("Status codes cleanup complete.");
