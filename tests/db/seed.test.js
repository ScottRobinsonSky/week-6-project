const request = require("supertest");
const { seed, seedShows, seedUsers, seedUsersShows } = require("../../src/db/seed");
const { Show, User } = require("../../src/models");
const { db } = require("../../src/db/db");
const showData = require("../../src/data/shows.json");
const userData = require("../../src/data/users.json");
const app = require("../../src/server.js");

describe("Testing seed.js", () => {
    beforeAll(async () => {
        await db.sync({force: true});
    });

    describe("Testing seedShows()", () => {
        beforeAll(async () => {
            await seedShows();
        });

        const tableName = Show.getTableName();

        test("shows table exists", async () => {
            const [results, _] = await db.query(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}';`);
            expect(results).toEqual([{name: tableName}]);
        });

        test("shows table has the correct content", async () => {
            const [results, _] = await db.query(`SELECT * FROM ${tableName};`);
            expect(results).toEqual(showData.map(s => expect.objectContaining(s)));
        });
    });

    describe("Testing seedUsers()", () => {
        beforeAll(async () => {
            await seedUsers();
        });

        const tableName = User.getTableName();

        test("users table exists", async () => {
            const [results, _] = await db.query(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}';`);
            expect(results).toEqual([{name: tableName}]);
        });

        test("users table has the correct content", async () => {
            const [results, _] = await db.query(`SELECT * FROM ${tableName};`);
            expect(results).toEqual(userData.map(u => expect.objectContaining(u)));
        });
    });

    describe("Testing seedUsersShows()", () => {
        beforeAll(async () => {
            await seedUsersShows();
        });

        const tableName = "user_shows";
        test("link table exists", async () => {
            const [results, _] = await db.query(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}';`);
            expect(results).toEqual([{name: tableName}]);
        });

        test("link table has the correct content", async () => {
            const [results, _] = await db.query(`SELECT * FROM ${tableName};`);
            expect(results).toEqual([
                {showId: 1, userId: 1},
                {showId: 2, userId: 1},
                {showId: 4, userId: 1},
                {showId: 10, userId: 1},
                {showId: 4, userId: 2},
                {showId: 8, userId: 2},
                {showId: 9, userId: 2},
                {showId: 11, userId: 2}
            ]);
        });
    });

    describe("Testing seed()", () => {
        beforeAll(async () => {
            await seed();
        });

        test("user, show and link table exists", async () => {
            const showsTable = Show.getTableName();
            const usersTable = User.getTableName();
            const linkTable = "user_shows";

            const [results, _] = await db.query(`SELECT name FROM sqlite_master WHERE type='table' AND name IN ('${showsTable}', '${usersTable}', '${linkTable}');`);
            expect(results).toEqual([{name: showsTable}, {name: usersTable}, {name: linkTable}]);
        });
    });
});