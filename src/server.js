const express = require("express");
const seed = require("./db/seed");

const app = express();
app.use(express.json());

if (require.main === module) {
    app.listen(3000, async () => {
        await seed();
        console.log("Listening on port 3000");
    });
}