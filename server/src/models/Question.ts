import Database from '../config/database';
import { DataTypes } from 'sequelize';

const sequelize = Database.getInstance();

const Question = sequelize.define('Question', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    possibleAnswers: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false
    },
    correctAnswer: {
        type: DataTypes.ARRAY(DataTypes.BOOLEAN),
        allowNull: true
    }
}, { tableName: 'Question', timestamps: false });

export default Question;