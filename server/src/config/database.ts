import { Sequelize } from 'sequelize';

class Database {
  private static instance: Sequelize;

  private constructor() {}

  public static getInstance(): Sequelize {
    if (!Database.instance) {
      
      // MODE PRODUCTION (VPS / Supabase) avec SSL
      if (process.env.DATABASE_URL) {
        Database.instance = new Sequelize(process.env.DATABASE_URL, {
            dialect: "postgres",
            dialectOptions: {
              ssl: { require: true, rejectUnauthorized: false },
            },
            logging: false,
        });
      } 
      // MODE LOCALHOST (Postgres la machine) sans SSL
      else {
        // On demande à Sequelize d'aller lire directement dans le fichier .env
        Database.instance = new Sequelize({
            username: process.env.DB_USER as string,
            password: process.env.DB_PASSWORD as string,
            database: process.env.DB_NAME as string,
            host: process.env.DB_HOST as string,
            port: Number(process.env.DB_PORT || 5432),
            dialect: "postgres",
            logging: false, // Peut être mis à "console.log pour voir les requêtes SQL"
        });
      }
    }
    
    return Database.instance;
  }
}

export default Database;