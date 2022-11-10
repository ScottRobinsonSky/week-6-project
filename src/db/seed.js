//import dependencies
const path = require('path'); //helps us find our file easily
const fs = require('fs').promises; //helps us get access to promises when dealing with seeding data into our database

//import our database [x]
//import the model that we are trying to import our data into [x]
const {db} = require('./db');
const { Show, User } = require('../models');

async function getJSONFromFile(filepath) {
    const buffer = await fs.readFile(filepath);
    return JSON.parse(String(buffer));
}

async function seedShows() {
    const showData = await getJSONFromFile(path.join(__dirname, '../data/shows.json'));
    return await Show.bulkCreate(showData);
}

async function seedUsers() {
    const userData = await getJSONFromFile(path.join(__dirname, '../data/users.json'));
    return await User.bulkCreate(userData);
}

async function seedUsersShows() {
    let users = await User.findAll();
    if (users.length === 0) {
        users = await seedUsers();
    }

    let shows = await Show.findAll();
    if (shows.length === 0) {
        shows = await seedShows();
    }

    await users[0].addShows([shows[0].id, shows[1].id, shows[3].id, shows[9].id]);
    await users[1].addShows([shows[3].id, shows[7].id, shows[8].id, shows[10].id]);
}

//write our seed function -> take our json file, create rows with our data into it
const seed = async () => {
    await db.sync({ force: true }); // clear out database + tables

    await seedShows();
    await seedUsers();
    await seedUsersShows();

    console.log("Shows and User database info populated!");
}

// export seed functions
module.exports = { seed, seedShows, seedUsers, seedUsersShows };