import { Sequelize } from 'sequelize';

class Database {
  private static instance: Sequelize;

  private constructor() {}

  public static getInstance(): Sequelize {
    if (!Database.instance) {
      const connectionString = process.env.DATABASE_URL;

      if (!connectionString) {
        throw new Error("DANGER : La variable DATABASE_URL est manquante dans le .env!");
      }

      Database.instance = new Sequelize(connectionString, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        }
      });
    }
    return Database.instance;
  }
}

export default Database;