require("dotenv").config();
const { Sequelize } = require("sequelize");

let sequelize;

if (process.env.JAWSDB_URL) {
  sequelize = new Sequelize(process.env.JAWSDB_URL, {
    dialect: "mysql",
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    logging: false,
  });
} else if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "mysql",
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    logging: false,
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PW,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: "mysql",
      logging: false,
    }
  );
}

module.exports = sequelize;