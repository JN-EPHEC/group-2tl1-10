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
    // Pour le stockage de pseudo des joueurs sans compte
    playerName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: User, key: 'id' }
    }
}, { tableName: 'GameSession', timestamps: true });

export default GameSession;