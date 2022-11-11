const { Show } = require("../models");

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

module.exports = { validateShowGenre, validateShowId };