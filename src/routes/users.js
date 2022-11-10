const { Router } = require("express");
const { validateUserId } = require("../middleware");
const { User } = require("../models");
const userRouter = Router();


userRouter.get("/", async (_, resp) => {
    resp.json(await User.findAll());
});

userRouter.get("/:id", validateUserId, async (req, resp) => {
    resp.json(req.user.toJSON());
});

userRouter.get("/:id/shows", validateUserId, async (req, resp) => {
    resp.json(await req.user.getShows());
});

module.exports = userRouter;