require('dotenv').config();
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
const { URL } = require('url');

module.exports = db = {};

initialize();

async function initialize() {
    // Determine if running locally or in production
    const isLocal = process.env.NODE_ENV !== 'production' && process.env.MYSQL_PUBLIC_URL;

    let host, port, user, password, database;

    if (isLocal) {
        // Parse the MYSQL_PUBLIC_URL
        const dbUrl = new URL(process.env.MYSQL_PUBLIC_URL);
        host = dbUrl.hostname;
        port = dbUrl.port;
        user = dbUrl.username;
        password = dbUrl.password;
        database = dbUrl.pathname.replace('/', '');
        console.log('🧪 Using MYSQL_PUBLIC_URL for local dev');
    } else {
        // Use internal Railway variables
        host = process.env.MYSQLHOST;
        port = process.env.MYSQLPORT || 3306;
        user = process.env.MYSQLUSER;
        password = process.env.MYSQLPASSWORD;
        database = process.env.MYSQLDATABASE;
        console.log('🚀 Using internal Railway MySQL connection');
    }

    // Test raw MySQL connection
    try {
        const connection = await mysql.createConnection({ host, port, user, password });
        await connection.end();
        console.log('✅ Raw MySQL connection successful');
    } catch (err) {
        console.error('❌ Raw MySQL connection failed:', err.message);
    }

    // Set up Sequelize
    const sequelize = new Sequelize(database, user, password, {
        host,
        port,
        dialect: 'mysql',
        logging: false,
    });

    try {
        await sequelize.authenticate();
        console.log('✅ Sequelize connected to MySQL');
    } catch (err) {
        console.error('❌ Sequelize connection failed:', err.message);
    }

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
