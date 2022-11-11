const { Router } = require("express");
const { body, validationResult } = require('express-validator');
const { db } = require("../db/db");
const { validateShowGenre, validateShowId } = require("../middleware");
const { Show } = require("../models");
const showRouter = Router();


showRouter.get("/", async (_, resp) => {
    resp.json(await Show.findAll());
});

showRouter.get("/genres", async (_, resp) => {
    resp.json(Show.getAttributes().genre.values);
});

showRouter.get("/:showId", validateShowId, async (req, resp) => {
    resp.json(req.show.toJSON());
});

showRouter.patch(
    "/:showId",
    validateShowId,
    body("rating").custom(value => {
        if (value === undefined) return true;
        if (isNaN(+value) || !Number.isInteger(+value) || (value.hasOwnProperty("length") && value.length === 0)) {
            throw new Error("new rating must be an integer");
        }
        if (+value < 0 || +value > 10) throw new Error("new rating must be 0-10 (inclusive)");
        return true;
    }),
    body("status").custom(value => {
        if (value === undefined) return true;
        if (typeof(value) !== "string") throw new Error("new status must be a string");
        if (value.includes(" ")) throw new Error("new status must not contain spaces");
        if (value.length < 5 || value.length > 25) throw new Error("new status must be 5-25 characters (inclusive)");
        return true;
    }),
    async (req, resp) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            resp.status(400).json(errors.array());
            return;
        }
        const toUpdate = {};
        if (req.body.rating !== undefined) {
            toUpdate["rating"] = +req.body.rating;
        }
        if (req.body.status !== undefined) {
            toUpdate["status"] = req.body.status;
        }
        if (toUpdate.length !== 0) {
            await req.show.update(toUpdate);
        }
        resp.json(toUpdate);
    }
);

showRouter.get("/genres/:genre", validateShowGenre, async (req, resp) => {
    resp.json(await Show.findAll({
        where: {
            genre: db.where(db.fn('LOWER', db.col('genre')), req.params.genre.toLowerCase())
        }
    }));
});

module.exports = showRouter;