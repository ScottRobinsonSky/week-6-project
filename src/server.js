const express = require("express");
const seed = require("./db/seed");
const showRouter = require("./routes/shows");
const userRouter = require("./routes/users");

const app = express();
app.use(express.json());
app.use("/shows", showRouter);
app.use("/users", userRouter);


if (require.main === module) {
    app.listen(3000, async () => {
        await seed();
        console.log("Listening on port 3000");
    });
}