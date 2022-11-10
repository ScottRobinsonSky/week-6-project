const { Router } = require("express");
const { db } = require("../db/db");
const { validateShowGenre, validateShowId } = require("../middleware");
const { Show } = require("../models");
const showRouter = Router();


showRouter.get("/", async (req, resp) => {
    resp.json(await Show.findAll());
});

showRouter.get("/:id", validateShowId, async (req, resp) => {
    resp.json(req.show.toJSON());
});

showRouter.get("/genre/:genre", validateShowGenre, async (req, resp) => {
    // where: {
    //    asset_name: sequelize.where(sequelize.fn('LOWER', sequelize.col('asset_name')), 'LIKE', '%' + lookupValue + '%')
    //}
    resp.json(await Show.findAll({
        where: {
            genre: db.where(db.fn('LOWER', db.col('genre')), req.params.genre.toLowerCase())
        }
    }));
});

module.exports = showRouter;