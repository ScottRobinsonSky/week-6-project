const request = require("supertest");
const { db } = require("../../src/db/db");
const { seedShows } = require('../../src/db/seed');
const { Show } = require("../../src/models");
const app = require("../../src/server");

describe("Testing /shows endpoint route", () => {
    let rawShows, shows;
    beforeAll(async () => {
        await db.sync({force: true});
        rawShows = await seedShows();
        shows = rawShows.map(s => s.toJSON());
    });

    describe("GET /shows/", () => {
        beforeAll(async () => {
            resp = await request(app).get("/shows/");
        });

        test("succeeds", async () => {
            expect(resp.statusCode).toBe(200);
        });

        test("responds with application/json", async () => {
            expect(resp.headers["content-type"]).toMatch("application/json");
        });

        test("responds with all shows", async () => {
            expect(resp.body).toEqual(shows);
        });
    });

    describe("GET /shows/:id", () => {
        describe("with a known id", () => {
            beforeAll(async () => {
                resp = await request(app).get(`/shows/${shows[0].id}`);
            });

            test("succeeds", async () => {
                expect(resp.statusCode).toBe(200);
            });

            test("responds with application/json", async () => {
                expect(resp.headers["content-type"]).toMatch("application/json");
            });

            test("responds with the specified show", async () => {
                expect(resp.body).toEqual(shows[0]);
            });
        });

        describe("with an unknown id", () => {
            beforeAll(async () => {
                resp = await request(app).get("/shows/0");
            });

            test("fails with a 404 Not Found", async () => {
                expect(resp.statusCode).toBe(404);
            });

            test("responds with text/html", async () => {
                expect(resp.headers["content-type"]).toMatch("text/html");
            });

            test("responds with 'Show Not Found' message", async () => {
                expect(resp.text).toBe("Show Not Found");
            });
        });

        describe("with an invalid id", () => {
            beforeAll(async () => {
                resp = await request(app).get("/shows/foo");
            });

            test("fails with a 400 Bad Request", async () => {
                expect(resp.statusCode).toBe(400);
            });

            test("responds with text/html", async () => {
                expect(resp.headers["content-type"]).toMatch("text/html");
            });

            test("responds with 'Show id must be a valid integer' message", async () => {
                expect(resp.text).toBe("Show id must be a valid integer.");
            });
        });
    });

    describe("GET /shows/genres", () => {
        beforeAll(async () => {
            resp = await request(app).get("/shows/genres");
        });

        test("succeeds", async () => {
            expect(resp.statusCode).toBe(200);
        });

        test("responds with application/json", async () => {
            expect(resp.headers["content-type"]).toMatch("application/json");
        });

        test("responds with all show genres", async () => {
            const actualGenres = Show.getAttributes().genre.values;
            expect(resp.body).toEqual(actualGenres);
        });
    });

    describe("GET /shows/genres/:genre", () => {
        describe("with a valid genre", () => {
            const genres = Show.getAttributes().genre.values;

            describe("same casing", () => {
                beforeAll(async () => {
                    genre = genres[0];
                    resp = await request(app).get(`/shows/genres/${genre}`);
                })

                test("succeeds", async () => {
                    expect(resp.statusCode).toBe(200);
                });

                test("responds with application/json", async () => {
                    expect(resp.headers["content-type"]).toMatch("application/json");
                });

                test("responds with all shows matching the genre", async () => {
                    const matchingShows = shows.filter(s => s.genre === genre);
                    expect(resp.body).toEqual(matchingShows.map(s => expect.objectContaining(s)));
                });
            });

            describe("different casing", () => {
                beforeAll(async () => {
                    genre = genres[0].toUpperCase();
                    resp = await request(app).get(`/shows/genres/${genre}`);
                });

                test("succeeds", async () => {
                    expect(resp.statusCode).toBe(200);
                });

                test("responds with application/json", async () => {
                    expect(resp.headers["content-type"]).toMatch("application/json");
                });

                test("responds with all shows matching the genre", async () => {
                    const matchingShows = shows.filter(s => s.genre.toLowerCase() === genre.toLowerCase());
                    expect(resp.body).toEqual(matchingShows.map(s => expect.objectContaining(s)));
                });
            });
        });

        describe("with an invalid genre", () => {
            beforeAll(async () => {
                resp = await request(app).get("/shows/genres/foo");
            });

            test("fails with a 404 Not Found", async () => {
                expect(resp.statusCode).toBe(404);
            });

            test("responds with text/html", async () => {
                expect(resp.headers["content-type"]).toMatch("text/html");
            });

            test("responds with 'Genre Not Found' message", async () => {
                expect(resp.text).toBe("Genre Not Found");
            });
        });
    });
});