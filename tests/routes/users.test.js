const fs = require('fs').promises;
const path = require('path');
const request = require("supertest");
const { db } = require("../../src/db/db");
const { seedShows, seedUsers } = require('../../src/db/seed');
const { Show, User } = require("../../src/models");
const app = require("../../src/server");

describe("Testing /users endpoint route", () => {
    beforeAll(async () => {
        await db.sync({force: true});
        await seedShows();
    });

    describe("GET /users/", () => {
        test("succeeds", async () => {
            const { statusCode } = await request(app).get("/users/");
            expect(statusCode).toBe(200);
        });

        test("responds with application/json", async () => {
            const { headers } = await request(app).get("/users/");
            expect(headers["content-type"]).toMatch("application/json");
        });

        test("responds with all users", async () => {
            await User.destroy({truncate: true}); // empty users table so it's only our data inside
            const users = await seedUsers();

            const { body } = await request(app).get("/users/");
            expect(body).toEqual(users);
        });
    });

    describe("GET /users/:id", () => {
        let users;
        beforeAll(async () => {
            await User.destroy({truncate: true}); // empty users table so it's only our data inside
            users = await seedUsers();
        });
        describe("with a known id", () => {
            test("succeeds", async () => {
                const { statusCode } = await request(app).get(`/users/${users[0].id}`);
                expect(statusCode).toBe(200);
            });

            test("responds with application/json", async () => {
                const { headers } = await request(app).get(`/users/${users[0].id}`);
                expect(headers["content-type"]).toMatch("application/json");
            });

            test("responds with the specified user", async () => {
                const { body } = await request(app).get(`/users/${users[0].id}`);
                expect(body).toEqual(users[0]);
            });
        });

        describe("with an unknown id", () => {
            test("fails with a 404 Not Found", async () => {
                const { statusCode } = await request(app).get("/users/0"); // 0 is never a valid id since they start at 1
                expect(statusCode).toBe(404);
            });

            test("responds with text/html", async () => {
                const { headers } = await request(app).get("/users/0");
                expect(headers["content-type"]).toMatch("text/html");
            });

            test("responds with 'User Not Found' message", async () => {
                const { text } = await request(app).get("/users/0");
                expect(text).toBe("User Not Found");
            });
        });

        describe("with an invalid id", () => {
            test("fails with a 400 Bad Request", async () => {
                const { statusCode } = await request(app).get("/users/foo");
                expect(statusCode).toBe(400);
            });

            test("responds with text/html", async () => {
                const { headers } = await request(app).get("/users/foo");
                expect(headers["content-type"]).toMatch("text/html");
            });

            test("responds with 'User id must be a valid integer' message", async () => {
                const { text } = await request(app).get("/users/foo");
                expect(text).toBe("User id must be a valid integer.");
            });
        });
    });
});
