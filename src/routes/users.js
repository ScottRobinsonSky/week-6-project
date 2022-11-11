const { Router } = require("express");
const { validateUserId } = require("../middleware");
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

module.exports = userRouter;