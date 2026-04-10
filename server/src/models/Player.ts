import Database from '../config/database';
import { DataTypes } from 'sequelize';

const sequelize = Database.getInstance();

const Player = sequelize.define('Player', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, { tableName: 'Player', timestamps: false });

export default Player;