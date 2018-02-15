module.exports = (sequelize, DataTypes) => {

	return sequelize.define('wallets', 
	{
		id 			: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		name 		: { type: DataTypes.STRING, allowNull: false },
		hd 			: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
		xpub 		: { type: DataTypes.TEXT, allowNull: false },
		xpriv		: { type: DataTypes.TEXT, allowNull: true },
		wif 		: { type: DataTypes.TEXT, allowNull: true },
		addresses	: { type: DataTypes.INTEGER, allowNull: false},
		remarks 	: { type: DataTypes.TEXT, allowNull: true },
	}, {
		paranoid: true,
		indexes: [ { name: 'wallets_tbl_indx', fields: ['name', {attribute:'wif', length:32}, {attribute:'xpub',length:32}, 'hd'] } ]
	});

}