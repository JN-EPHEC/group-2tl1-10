require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,      
    password: process.env.DB_PASSWORD,  
    database: process.env.DB_NAME || "postgres",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 6543,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "postgres",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 6543,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};