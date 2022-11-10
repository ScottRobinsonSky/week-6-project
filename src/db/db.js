// imports
const { Sequelize, DataTypes } = require('sequelize');
const path = require("path");

//create an instance of the database call it db
const db = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.NODE_ENV === "test" ? ":memory:" : path.join(__dirname, '/movie_watchlist.sqlite'),
    logging: false
});

//export
module.exports = { db, DataTypes };