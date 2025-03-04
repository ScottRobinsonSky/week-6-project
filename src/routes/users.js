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

userRouter.delete("/:userId", validateUserId, async (req, resp) => {
    await req.user.destroy();
    resp.json(req.user);
});

userRouter.get("/:userId/shows", validateUserId, async (req, resp) => {
    resp.json(await req.user.getShows());
});

userRouter.patch("/:userId/shows/:showId", validateUserId, validateShowId, async (req, resp) => {
    await req.user.addShow(req.show);
    resp.json(req.show);
});

module.exports = userRouter;