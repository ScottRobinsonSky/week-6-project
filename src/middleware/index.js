const { Show, User } = require("../models");

async function validateShowGenre(req, resp, next) {
    const genres = Show.getAttributes().genre.values.map(genre => genre.toLowerCase());
    if (!genres.includes(req.params.genre.toLowerCase())) {
        resp.status(404).send("Genre Not Found");   
        return;
    }
    next();
}

async function validateShowId(req, resp, next) {
    const showId = req.params.showId;
    if (isNaN(+showId) || !Number.isInteger(+showId)) {
        resp.status(400).send("Show id must be a valid integer.");
        return;
    }
    req.show = await Show.findByPk(+showId);
    if (req.show === null) {
        resp.status(404).send("Show Not Found");
        return;
    }
    next();
}

async function validateUserId(req, resp, next) {
    const userId = req.params.userId;
    if (isNaN(+userId) || !Number.isInteger(+userId)) {
        resp.status(400).send("User id must be a valid integer.");
        return;
    }
    req.user = await User.findByPk(+userId);
    if (req.user === null) {
        resp.status(404).send("User Not Found");
        return;
    }
    next();
}

module.exports = { validateShowGenre, validateShowId, validateUserId };