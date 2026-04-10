import Database from '../config/database';
import { DataTypes } from 'sequelize';

const sequelize = Database.getInstance();

const Question = sequelize.define('Question', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true // Obligatoire pour la création de nouvelles questions
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    possibleAnswers: {
        type: DataTypes.JSON, // * Pour SQLITE, mais on utilise Postgre a voir pour modifier
        allowNull: false,
        defaultValue: []
    },
    correctAnswer: {
        type: DataTypes.STRING, // Stockage du texte e la bonne réponse (pas besoin d'un tableau)
        allowNull: true
    }
}, { tableName: 'Question', timestamps: true });

export default Question;