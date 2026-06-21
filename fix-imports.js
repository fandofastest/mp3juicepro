const fs = require("fs");
const path = require("path");

const directories = ["apps", "packages"];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      let content = fs.readFileSync(fullPath, "utf-8");

      // Replace imports ending in .js with extensionless paths
      // e.g. import { x } from "./file.js" -> import { x } from "./file"
      const updated = content.replace(/(import\s+.*?\s+from\s+["'])(.*?)(\.js)(["'])/g, "$1$2$4");

      if (content !== updated) {
        fs.writeFileSync(fullPath, updated, "utf-8");
        console.log(`Updated imports in: ${fullPath}`);
      }
    }
  }
}

directories.forEach((dir) => {
  const fullPath = path.resolve(dir);
  if (fs.existsSync(fullPath)) {
    processDirectory(fullPath);
  }
});
console.log("Imports cleanup complete.");
