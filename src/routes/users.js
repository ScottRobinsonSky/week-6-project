const { Router } = require("express");
const { validateShowId, validateUserId } = require("../middleware");
const { User } = require("../models");
const userRouter = Router();


userRouter.get("/", async (_, resp) => {
    resp.json(await User.findAll());
});

userRouter.get("/:userId", validateUserId, async (req, resp) => {
    resp.json(req.user.toJSON());
});

userRouter.get("/:userId/shows", validateUserId, async (req, resp) => {
    resp.json(await req.user.getShows());
});

userRouter.patch("/:userId/shows/:showId", validateUserId, validateShowId, async (req, resp) => {
    await req.user.addShow(req.show);
    resp.sendStatus(200);
});

module.exports = userRouter;