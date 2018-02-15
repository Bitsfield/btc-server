module.exports = (sequelize, DataTypes) => {

	return sequelize.define('transactions', 
	{
		id 			: 		{ type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		addys 		: 		{ type: DataTypes.TEXT, allowNull: false },
		value 		: 		{ type: DataTypes.DOUBLE, allowNull: false },
		hash 		: 		{ type: DataTypes.TEXT, allowNull: false },
		hex 		: 		{ type: DataTypes.TEXT, allowNull: false },
		status 		: 		{ type: DataTypes.STRING, allowNull: false},
	}, {
		paranoid: true,
		indexes: [ { name: 'transactions_tbl_index', fields: [{attribute:'hash', length:32}] } ] 
	});
	
}