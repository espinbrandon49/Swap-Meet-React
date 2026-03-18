const express = require("express");
const path = require("path");
const fs = require("fs");
const sequelize = require("./config/connection");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount API first
const routes = require("./routes");
app.use("/api", routes);

// Serve React build whenever it exists
const clientBuildPath = path.join(__dirname, "../client/build");
const hasClientBuild = fs.existsSync(clientBuildPath);

if (hasClientBuild) {
  app.use(express.static(clientBuildPath));

  // SPA fallback for all non-API routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
});