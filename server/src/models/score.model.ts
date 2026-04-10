import Database from '../config/database';
import { DataTypes } from 'sequelize';
// Importation de User pour lier le score
import User from './user.model'

const sequelize = Database.getInstance();

const Score = sequelize.define('Score', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    // On indique à quel utilisateur appartient ce score 
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User, // Fait référence à la table User
            key: 'id'
        }
    }
}, { tableName: 'Player', timestamps: true });

// Création des relations SEQUELIZE
User.hasMany(Score, { foreignKey: 'userId', as: 'scores' });
Score.belongsTo(User, { foreignKey: 'userId', as : 'user' });

export default Score;