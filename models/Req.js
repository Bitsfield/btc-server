module.exports = (sequelize, DataTypes) => {

	return sequelize.define('requests', 
	{
		id 			: 		{ type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		addy 		: 		{ type: DataTypes.STRING, allowNull: false },
		value 		: 		{ type: DataTypes.DOUBLE, allowNull: false },
		userId 		: 		{ type: DataTypes.STRING, allowNull: false },
		email 		: 		{ type: DataTypes.STRING, allowNull: false },
		status 		: 		{ type: DataTypes.STRING, allowNull: false},
		ip 			: 		{ type: DataTypes.STRING, allowNull: false },
		ref 		: 		{ type: DataTypes.STRING, allowNull: false },
		hash 		: 		{ type: DataTypes.TEXT, allowNull: true },
		remarks 	: 		{ type: DataTypes.TEXT, allowNull: true },
	},
	{
		paranoid: true,
		indexes: [ { name: 'requests_tbl_index', fields: ['addy', 'value', 'status', 'ref', 'email'] } ] 
	});
	
}