import { DataTypes } from 'sequelize';
import Database from '../config/database';

const sequelize = Database.getInstance();

const Category = sequelize.define('Category', { 
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.STRING, allowNull: true },
    userId: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'Category', timestamps: false });

export default Category;