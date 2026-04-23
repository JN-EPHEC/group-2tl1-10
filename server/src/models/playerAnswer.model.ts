import { DataTypes } from 'sequelize';
import Database from '../config/database';
import GameSession from './gameSession.model';
import Question from './question.model';

const sequelize = Database.getInstance();

const PlayerAnswer = sequelize.define('PlayerAnswer', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    providedAnswer : { type: DataTypes.STRING, allowNull: true },
    isCorrect: { type: DataTypes.BOOLEAN, allowNull: false },
    timeSpent: { type: DataTypes.INTEGER, allowNull: true }, // en secondes
    gameSessionId: {
        type: DataTypes.INTEGER,
        references: { model: GameSession, key: 'id' }
    },
    questionId: {
        type: DataTypes.INTEGER,
        references: { model: Question, key: 'id' }
    }
}, { tableName: 'PlayerAnswer', timestamps: false });

export default PlayerAnswer;