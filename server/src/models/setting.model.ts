import { DataTypes } from 'sequelize';
import Database from '../config/database'; 
import Question from './question.model';

const sequelize = Database.getInstance();

const Setting = sequelize.define('Setting', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    rageQuit: { type: DataTypes.BOOLEAN, defaultValue: false },
    secretButton: { type: DataTypes.BOOLEAN, defaultValue: false },
    jumpingButtons: { type: DataTypes.BOOLEAN, defaultValue: false },
    enableSounds: { type: DataTypes.BOOLEAN, defaultValue: false },
    scoreMultiplier: { type: DataTypes.FLOAT, defaultValue: 1.0 },
    winSound: { type: DataTypes.STRING, allowNull: true },
    firstWinSound: { type: DataTypes.STRING, allowNull: true },
    loseSound: { type: DataTypes.STRING, allowNull: true },
    firstLoseSound: { type: DataTypes.STRING, allowNull: true },
    questionId: {
        type: DataTypes.INTEGER,
        references: { model: Question, key: 'id' },
        onDelete: 'CASCADE'
    },
    timeLimit: {
        type: DataTypes.INTEGER,
        defaultValue: 15,
        allowNull: false
    },
    jumpingButtons: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }
}, { tableName: 'Setting', timestamps: true });

export default Setting;