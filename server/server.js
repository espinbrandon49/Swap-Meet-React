const express = require('express');
const sequelize = require('./config/connection');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Mount routes at /api
const routes = require('./routes');
app.use('/api', routes);

sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log("Server listening"));
});
