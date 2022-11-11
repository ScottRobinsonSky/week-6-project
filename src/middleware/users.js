const { User } = require("../models");

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

module.exports = { validateUserId };