import { DataTypes, Model } from "sequelize";
import sequelize from '../config/database';
import { Question } from './question.model';

export class Setting extends Model {
    public id!: number;
    public rageQuit!: boolean;
    public secretButton!: boolean;
    public scoreMultiplier!: number;
    public winSound!: string;
    public firstWinSound!: string;
    public loseSound!: string;
    public firstLoseSound!: string; 
    public questionId!: number;
}

Setting.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    rageQuit: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    secretButton: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }, 
    scoreMultiplier: {
        type: DataTypes.FLOAT,
        defaultValue: 1.0,
    },
    winSound: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    firstWinSound: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    loseSound: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    firstLoseSound: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    questionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Question',
            key: 'id'
        },
        onDelete: 'CASCADE' // La suppression de la questions supprime aussi ces paramètres 
    }
}, {
    sequelize,
    tableName: 'Settings',
});

export default Setting;