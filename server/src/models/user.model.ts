import Database from '../config/database'; // 1. On importe la classe (sans accolades, car c'est un export default)
import { DataTypes } from 'sequelize';

// 2. On récupère l'instance unique de Sequelize via votre méthode statique
const sequelize = Database.getInstance(); 

// 3. Et maintenant on peut utiliser .define() tranquillement !
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true // Pour que l'ID soit automatiquement géré par la BDD
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // Empêche 2 joueurs d'avoir le même email
    },
    pseudo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // Un surnom doit être unique !
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, { 
    tableName: 'User', 
    timestamps: true 
});

export default User;