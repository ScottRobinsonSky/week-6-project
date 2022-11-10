const { Show } = require('./Show');
const { User } = require('./User');

Show.belongsToMany(User, {through: "user_shows", timestamps: false});
User.belongsToMany(Show, {through: "user_shows", timestamps: false});

module.exports = {Show, User};