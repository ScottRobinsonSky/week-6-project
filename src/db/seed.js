//import dependencies
const path = require('path') //helps us find our file easily
const fs = require('fs').promises //helps us get access to promises when dealing with seeding data into our database

//import our database [x]
//import the model that we are trying to import our data into [x]
const {db} = require('./db')
const { Show, User } = require('../models')

async function getJSONFromFile(filepath) {
    const buffer = await fs.readFile(filepath);
    return JSON.parse(String(buffer));
}

async function seedShows() {
    const showData = await getJSONFromFile(path.join(__dirname, '../data/shows.json'));
    return (await Show.bulkCreate(showData)).map(s => s.toJSON());
}

async function seedUsers() {
    const userData = await getJSONFromFile(path.join(__dirname, '../data/users.json'));
    return (await User.bulkCreate(userData)).map(u => u.toJSON());
}

//write our seed function -> take our json file, create rows with our data into it
const seed = async () => {
    await db.sync({ force: true }); // clear out database + tables

    await seedShows();
    await seedUsers();

    console.log("Shows and User database info populated!")
}

// export seed functions
module.exports = { seed, seedShows, seedUsers };
