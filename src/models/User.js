//import our db, Model, DataTypes
const { db, DataTypes } = require('../db/db');

//Creating a User child class from the Model parent class
const User = db.define("users", {
    username: DataTypes.STRING,
    password: DataTypes.STRING
}, {timestamps: false});

//exports
module.exports = { User };