const request = require("supertest");
const { db } = require("../../src/db/db");
const { seedShows, seedUsers } = require('../../src/db/seed');
const app = require("../../src/server");

describe("Testing /users endpoint route", () => {
    let rawShows, shows, rawUsers, users;
    beforeAll(async () => {
        await db.sync({force: true});
        rawShows = await seedShows();
        shows = rawShows.map(s => s.toJSON());
        
        rawUsers = await seedUsers();
        users = rawUsers.map(u => u.toJSON());
    });

    describe("GET /users/", () => {
        beforeAll(async () => {
            resp = await request(app).get("/users/");
        });

        test("succeeds", async () => {
            expect(resp.statusCode).toBe(200);
        });

        test("responds with application/json", async () => {
            expect(resp.headers["content-type"]).toMatch("application/json");
        });

        test("responds with all users", async () => {
            expect(resp.body).toEqual(users);
        });
    });

    describe("GET /users/:id", () => {
        describe("with a known id", () => {
            beforeAll(async () => {
                resp = await request(app).get(`/users/${users[0].id}`);
            });

            test("succeeds", async () => {
                expect(resp.statusCode).toBe(200);
            });

            test("responds with application/json", async () => {
                expect(resp.headers["content-type"]).toMatch("application/json");
            });

            test("responds with the specified user", async () => {
                expect(resp.body).toEqual(users[0]);
            });
        });

        describe("with an unknown id", () => {
            beforeAll(async () => {
                resp = await request(app).get("/users/0");
            });

            test("fails with a 404 Not Found", async () => {
                expect(resp.statusCode).toBe(404);
            });

            test("responds with text/html", async () => {
                expect(resp.headers["content-type"]).toMatch("text/html");
            });

            test("responds with 'User Not Found' message", async () => {
                expect(resp.text).toBe("User Not Found");
            });
        });

        describe("with an invalid id", () => {
            beforeAll(async () => {
                resp = await request(app).get("/users/foo");
            });

            test("fails with a 400 Bad Request", async () => {
                expect(resp.statusCode).toBe(400);
            });

            test("responds with text/html", async () => {
                expect(resp.headers["content-type"]).toMatch("text/html");
            });

            test("responds with 'User id must be a valid integer' message", async () => {
                expect(resp.text).toBe("User id must be a valid integer.");
            });
        });
    });

    describe("GET /users/:id/shows", () => {
        describe("with a known id", () => {
            beforeAll(async () => {
                await rawUsers[0].addShows([rawShows[0], rawShows[2]]);
                resp = await request(app).get(`/users/${users[0].id}/shows`);
            });

            test("succeeds", async () => {
                expect(resp.statusCode).toBe(200);
            });

            test("responds with application/json", async () => {
                expect(resp.headers["content-type"]).toMatch("application/json");
            });

            test("responds with the specified user's shows", async () => {
                expect(resp.body).toEqual([expect.objectContaining(shows[0]), expect.objectContaining(shows[2])]);
            });
        });

        describe("with an unknown id", () => {
            beforeAll(async () => {
                resp = await request(app).get("/users/0/shows");
            });

            test("fails with a 404 Not Found", async () => {
                expect(resp.statusCode).toBe(404);
            });

            test("responds with text/html", async () => {
                expect(resp.headers["content-type"]).toMatch("text/html");
            });

            test("responds with 'User Not Found' message", async () => {
                expect(resp.text).toBe("User Not Found");
            });
        });

        describe("with an invalid id", () => {
            beforeAll(async () => {
                resp = await request(app).get("/users/foo/shows");
            });

            test("fails with a 400 Bad Request", async () => {
                expect(resp.statusCode).toBe(400);
            });

            test("responds with text/html", async () => {
                expect(resp.headers["content-type"]).toMatch("text/html");
            });

            test("responds with 'User id must be a valid integer' message", async () => {
                expect(resp.text).toBe("User id must be a valid integer.");
            });
        });
    });

    describe("PATCH /users/:userId/shows/:showId", () => {
        describe("with valid parameters", () => {
            beforeAll(async () => {
                resp = await request(app).patch(`/users/${users[0].id}/shows/${shows[0].id}`);
            });

            afterEach(async () => {
                // Undo any changes made by the test
                await db.sync({force: true});
                await seedShows();
                await seedUsers();
            });    

            test("succeeds", () => {
                expect(resp.statusCode).toBe(200);
            });

            test("responds with application/json", () => {
                expect(resp.headers["content-type"]).toMatch("application/json");
            });

            test("responds with the show added to user", () => {
                expect(resp.body).toEqual(shows[0]);
            });
        });

        describe("with valid userId but unknown/invalid showId", () => {
            describe("unknown showId", () => {
                beforeAll(async () => {
                    resp = await request(app).patch(`/users/${users[0].id}/shows/0`);
                });

                test("fails with 404 Not Found", () => {
                    expect(resp.statusCode).toBe(404);
                });

                test("responds with text/html", () => {
                    expect(resp.headers["content-type"]).toMatch("text/html");
                });

                test("responds with 'Show Not Found' message", () => {
                    expect(resp.text).toBe("Show Not Found");
                });
            });

            describe("invalid showId", () => {
                beforeAll(async () => {
                    resp = await request(app).patch(`/users/${users[0].id}/shows/foo`);
                });

                test("fails with 400 Bad Request", () => {
                    expect(resp.statusCode).toBe(400);
                });

                test("responds with text/html", () => {
                    expect(resp.headers["content-type"]).toMatch("text/html");
                });

                test("responds with 'Show id must be a valid integer' message", () => {
                    expect(resp.text).toBe("Show id must be a valid integer.");
                });
            });
        });

        describe("with unknown/invalid userId but valid showId", () => {
            describe("unknown userId", () => {
                beforeAll(async () => {
                    resp = await request(app).patch(`/users/0/shows/${shows[0].id}`);
                });

                test("fails with 404 Not Found", () => {
                    expect(resp.statusCode).toBe(404);
                });

                test("responds with text/html", () => {
                    expect(resp.headers["content-type"]).toMatch("text/html");
                });

                test("responds with 'User Not Found' message", () => {
                    expect(resp.text).toBe("User Not Found");
                });
            });

            describe("invalid userId", () => {
                beforeAll(async () => {
                    resp = await request(app).patch(`/users/foo/shows/${shows[9].id}`);
                });

                test("fails with 400 Bad Request", () => {
                    expect(resp.statusCode).toBe(400);
                });

                test("responds with text/html", () => {
                    expect(resp.headers["content-type"]).toMatch("text/html");
                });

                test("responds with 'User id must be a valid integer' message", () => {
                    expect(resp.text).toBe("User id must be a valid integer.");
                });
            });
        });
    });
});