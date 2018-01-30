module.exports = (sequelize, DataTypes) => {

	return sequelize.define('addys', 
	{
		id 			: 		{ type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		walletId 	: 		{ type: DataTypes.INTEGER, allowNull: false, field: 'wallet_id' },
		indx  		: 		{ type: DataTypes.INTEGER, allowNull: false },
		path 		: 		{ type: DataTypes.STRING, allowNull: false },
		addy 		: 		{ type: DataTypes.STRING, allowNull: false },
		hardened 	: 		{ type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
		spent 		: 		{ type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
		active		: 		{ type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
		balance 	: 		{ type: DataTypes.DOUBLE, allowNull: true },
		prevAddy 	: 		{ type: DataTypes.STRING, allowNull: true, field: 'prev_addy'  },
		nextAddy 	: 		{ type: DataTypes.STRING, allowNull: true, field: 'next_addy'  },
		spentOn 	: 		{ type: DataTypes.DATE, allowNull: true, field: 'spent_on' },
		purpose 	: 		{ type: DataTypes.STRING, allowNull: true, defaultValue: "OUT" },
		remarks 	: 		{ type: DataTypes.TEXT, allowNull: true },
	}, {
			paranoid: true, 
			indexes: [ { fields: [ 'addy', 'wallet_id', 'active', 'spent', 'prev_addy', 'next_addy', 'purpose' ] } ]
	});

};
