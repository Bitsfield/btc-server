
const dbConfig = require('../configs/database').mysql;
const Sequelize = require('sequelize');
const isTest = process.env.NODE_ENV === 'test';

let sequelize;
if (isTest) {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    operatorsAliases: false
  });
} else {
  sequelize = new Sequelize(dbConfig.dbase, dbConfig.user, dbConfig.pass, {
    host: dbConfig.host,
    dialect: 'mysql',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    operatorsAliases: false
  });
}

// load models
var models = [
  'Addy',
  'Req',
  'Tran',
  'Wallet'
];

models.forEach( function(model) {
  module.exports[model] = sequelize.import(__dirname + '/' + model);
});

// describe relationships
// (function(m) {
//   m.Addy.belongsTo(m.Wallet);
//   // m.Wallet.hasMany(m.Addy);
// })(module.exports);

// export connection
module.exports.sequelize = sequelize;

sequelize.sync().catch(err => {
  console.error('Database sync error:', err);
});
