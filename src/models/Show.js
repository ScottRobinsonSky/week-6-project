//import our db, Model, DataTypes
const { db, DataTypes } = require('../db/db');

//Creating a User child class from the Model parent class
const Show = db.define("shows", {
    title: DataTypes.STRING,
    genre: DataTypes.ENUM("Comedy", "Drama", "Horror", "Sitcom"),
    rating: DataTypes.INTEGER,
    status: DataTypes.STRING,
}, {timestamps: false});

//exports
module.exports = { Show };