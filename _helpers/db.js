require('dotenv').config();
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
const { URL } = require('url');

module.exports = db = {};

initialize();

async function initialize() {
    const dbUrl = new URL(process.env.MYSQL_PUBLIC_URL);
    const host = dbUrl.hostname;
    const port = dbUrl.port;
    const user = dbUrl.username;
    const password = dbUrl.password;
    const database = dbUrl.pathname.replace('/', '');

    // Connect just to test (optional)
    const connection = await mysql.createConnection({ host, port, user, password });
    // 🔴 REMOVE OR COMMENT THIS LINE:
    // await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();

    const sequelize = new Sequelize(database, user, password, {
        host,
        port,
        dialect: 'mysql',
        logging: false,
    });

    try {
        await sequelize.authenticate();
        console.log('✅ Connected to MySQL');
    } catch (err) {
        console.error('❌ MySQL connection failed:', err.message);
    }

    db.Account = require('../accounts/account.model')(sequelize);
    db.RefreshToken = require('../accounts/refresh-token.model')(sequelize);
    db.Preferences = require('../models/preferences.model')(sequelize);
    db.ActivityLog = require('../models/activitylog.model')(sequelize);

    db.Account.hasMany(db.RefreshToken, { foreignKey: 'AccountId', onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account, { foreignKey: 'AccountId' });

    db.ActivityLog.belongsTo(db.Account, { foreignKey: 'AccountId' });
    db.Preferences.belongsTo(db.Account, { foreignKey: 'AccountId' });

    await sequelize.sync({ alter: true });
}
