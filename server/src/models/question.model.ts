import { DataTypes } from 'sequelize';
import Database from '../config/database';
import Category from './category.model';

const sequelize = Database.getInstance();

const Question = sequelize.define('Question', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    possibleAnswers: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false },
    correctAnswer: { type: DataTypes.STRING, allowNull: true },
    correctAnswers: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
    difficulty: { type: DataTypes.INTEGER, defaultValue: 1 },
    categoryId: {
        type: DataTypes.INTEGER,
        references: { model: Category, key: 'id' }
    }
}, { tableName: 'Question', timestamps: true });

export default Question;