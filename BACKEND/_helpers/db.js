const config = require('config.json');
const mysql = require('mysql2/promise');
const { Sequelize, DataTypes } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    const { host, port, user, password, database } = config.database;

    // Create DB if it doesn't exist
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

    // Connect to DB using Sequelize
    const sequelize = new Sequelize(database, user, password, {
        host,
        port,
        dialect: 'mysql',
        logging: false, // set to true for SQL logs
    });

    // Init models with sequelize + DataTypes
    db.Account = require('../_accounts/account.model')(sequelize, DataTypes);
    db.RefreshToken = require('../_accounts/refresh-token.model')(sequelize, DataTypes);

    // Define relationships
    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);

    // Sync all models
    await sequelize.sync({ alter: true });

    // Export sequelize instance if needed elsewhere
    db.sequelize = sequelize;
    db.Sequelize = Sequelize;

    console.log('✅ MySQL database initialized.');
}
