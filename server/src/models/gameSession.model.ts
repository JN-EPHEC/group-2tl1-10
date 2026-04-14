import { DataTypes } from 'sequelize';
import Database from '../config/database';
import User from './user.model';

const sequelize = Database.getInstance();

const GameSession = sequelize.define('GameSession', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    totalScore: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: {
        type: DataTypes.ENUM('IN_PROGRESS', 'FINISHED'),
        defaultValue: 'IN_PROGRESS'
    },
    userId: {
        type: DataTypes.INTEGER,
        references: { model: User, key: 'id' }
    }
}, { tableName: 'GameSession', timestamps: true });

export default GameSession;