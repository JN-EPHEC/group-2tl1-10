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
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: []
    },
    correctAnswer: {
        type: DataTypes.STRING, // Stockage du texte de la bonne réponse (pas besoin d'un tableau)
        allowNull: true // Autorisation du null pour les question sans bonne réponse !
    }
}, { tableName: 'Question', timestamps: true });

export default Question;