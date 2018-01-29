module.exports = (sequelize, DataTypes) => {

	return sequelize.define('trans', 
	{
		id 			: 		{ type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		addy 		: 		{ type: DataTypes.STRING, allowNull: false },
		value 		: 		{ type: DataTypes.DOUBLE(11, 8), allowNull: false },
		userId 		: 		{ type: DataTypes.STRING, allowNull: false },
		email 		: 		{ type: DataTypes.STRING, allowNull: false },
		status 		: 		{ type: DataTypes.STRING, allowNull: false},
		ip 			: 		{ type: DataTypes.STRING, allowNull: false },
		ref 		: 		{ type: DataTypes.STRING, allowNull: false },
		remarks 	: 		{ type: DataTypes.TEXT, allowNull: true },
	}, {
		paranoid: true,
		indexes: [ { fields: ['addy', 'value', 'status', 'ref', 'email'] } ] 
	});
	
}