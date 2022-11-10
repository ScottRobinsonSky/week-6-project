const { Show, User } = require("../models");

async function validateShowGenre(req, resp, next) {
    if (req.params.genre === undefined) {
        resp.status(400).send("Genre is a missing required argument");
        return;
    }
    const genres = Show.getAttributes().genre.values.map(genre => genre.toLowerCase());
    if (!genres.includes(req.params.genre.toLowerCase())) {
        resp.status(404).send("Genre Not Found");   
        return;
    }
    next();
}

async function validateShowId(req, resp, next) {
    if (isNaN(+req.params.id)) {
        resp.status(400).send("Show id must be a valid integer.");
        return;
    }
    req.show = await Show.findByPk(+req.params.id);
    if (req.show === null) {
        resp.status(404).send("Show Not Found");
        return;
    }
    next();
}

async function validateUserId(req, resp, next) {
    if (isNaN(+req.params.id)) {
        resp.status(400).send("User id must be a valid integer.");
        return;
    }
    req.user = await User.findByPk(+req.params.id);
    if (req.user === null) {
        resp.status(404).send("User Not Found");
        return;
    }
    next();
}


module.exports = { validateShowGenre, validateShowId, validateUserId };