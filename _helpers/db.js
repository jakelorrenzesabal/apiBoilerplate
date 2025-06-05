const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
require('dotenv').config();

module.exports = db = {};

initialize();
async function initialize() {
    // Load credentials from environment variables
    const host = process.env.MYSQLHOST;
    const port = process.env.MYSQLPORT || 3306;
    const user = process.env.MYSQLUSER;
    const password = process.env.MYSQLPASSWORD;
    const database = process.env.MYSQLDATABASE;

    // Create DB if not exists (optional, remove if managed externally)
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();

    // Connect with Sequelize
    const sequelize = new Sequelize(database, user, password, {
        host,
        dialect: 'mysql',
        logging: false,
    });

    // Initialize models
    db.Preferences = require('../models/preferences.model')(sequelize);  
    db.Account = require('../accounts/account.model')(sequelize);
    db.RefreshToken = require('../accounts/refresh-token.model')(sequelize);
    db.ActivityLog = require('../models/activitylog.model')(sequelize);

    // Define associations
    db.Account.hasMany(db.RefreshToken, { foreignKey: 'AccountId', onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account, { foreignKey: 'AccountId' });

    db.ActivityLog.belongsTo(db.Account, { foreignKey: 'AccountId' });
    db.Preferences.belongsTo(db.Account, { foreignKey: 'AccountId' });

    // Sync models
    await sequelize.sync({ alter: true });
}
