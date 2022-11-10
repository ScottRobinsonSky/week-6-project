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
        test("succeeds", async () => {
            const { statusCode } = await request(app).get("/shows/");
            expect(statusCode).toBe(200);
        });

        test("responds with application/json", async () => {
            const { headers } = await request(app).get("/shows/");
            expect(headers["content-type"]).toMatch("application/json");
        });

        test("responds with all shows", async () => {
            const { body } = await request(app).get("/shows/");
            expect(body).toEqual(shows);
        });
    });

    describe("GET /shows/:id", () => {
        describe("with a known id", () => {
            test("succeeds", async () => {
                const { statusCode } = await request(app).get(`/shows/${shows[0].id}`);
                expect(statusCode).toBe(200);
            });

            test("responds with application/json", async () => {
                const { headers } = await request(app).get(`/shows/${shows[0].id}`);
                expect(headers["content-type"]).toMatch("application/json");
            });

            test("responds with the specified show", async () => {
                const { body } = await request(app).get(`/shows/${shows[0].id}`);
                expect(body).toEqual(shows[0]);
            });
        });

        describe("with an unknown id", () => {
            test("fails with a 404 Not Found", async () => {
                const { statusCode } = await request(app).get("/shows/0"); // 0 is never a valid id since they start at 1
                expect(statusCode).toBe(404);
            });

            test("responds with text/html", async () => {
                const { headers } = await request(app).get("/shows/0");
                expect(headers["content-type"]).toMatch("text/html");
            });

            test("responds with 'Show Not Found' message", async () => {
                const { text } = await request(app).get("/shows/0");
                expect(text).toBe("Show Not Found");
            });
        });

        describe("with an invalid id", () => {
            test("fails with a 400 Bad Request", async () => {
                const { statusCode } = await request(app).get("/shows/foo");
                expect(statusCode).toBe(400);
            });

            test("responds with text/html", async () => {
                const { headers } = await request(app).get("/shows/foo");
                expect(headers["content-type"]).toMatch("text/html");
            });

            test("responds with 'Show id must be a valid integer' message", async () => {
                const { text } = await request(app).get("/shows/foo");
                expect(text).toBe("Show id must be a valid integer.");
            });
        });
    });

    describe("GET /shows/genres", () => {
        test("succeeds", async () => {
            const { statusCode } = await request(app).get("/shows/genres");
            expect(statusCode).toBe(200);
        });

        test("responds with application/json", async () => {
            const { headers } = await request(app).get("/shows/genres");
            expect(headers["content-type"]).toMatch("application/json");
        });

        test("responds with all show genres", async () => {
            const actualGenres = Show.getAttributes().genre.values;

            const { body } = await request(app).get("/shows/genres");
            expect(body).toEqual(actualGenres);
        });
    });

    describe("GET /shows/genres/:genre", () => {
        describe("with a valid genre", () => {
            const genres = Show.getAttributes().genre.values;
            describe("same casing", () => {
                const genre = genres[0]
                test("succeeds", async () => {
                    const { statusCode } = await request(app).get(`/shows/genres/${genre}`);
                    expect(statusCode).toBe(200);
                });

                test("responds with application/json", async () => {
                    const { headers } = await request(app).get(`/shows/genres/${genre}`);
                    expect(headers["content-type"]).toMatch("application/json");
                });

                test("responds with all shows matching the genre", async () => {
                    const matchingShows = shows.filter(s => s.genre === genre);

                    const { body } = await request(app).get(`/shows/genres/${genre}`);
                    expect(body).toEqual(matchingShows.map(s => expect.objectContaining(s)));
                });
            });

            describe("different casing", () => {
                const genre = genres[0].toUpperCase();
                test("succeeds", async () => {
                    const { statusCode } = await request(app).get(`/shows/genres/${genre}`);
                    expect(statusCode).toBe(200);
                });

                test("responds with application/json", async () => {
                    const { headers } = await request(app).get(`/shows/genres/${genre}`);
                    expect(headers["content-type"]).toMatch("application/json");
                });

                test("responds with all shows matching the genre", async () => {
                    const matchingShows = shows.filter(s => s.genre.toLowerCase() === genre.toLowerCase());

                    const { body } = await request(app).get(`/shows/genres/${genre}`);
                    expect(body).toEqual(matchingShows.map(s => expect.objectContaining(s)));
                });
            });
        });

        describe("with an invalid genre", () => {
            test("fails with a 404 Not Found", async () => {
                const { statusCode } = await request(app).get("/shows/genres/foo");
                expect(statusCode).toBe(404);
            });

            test("responds with text/html", async () => {
                const { headers } = await request(app).get("/shows/genres/foo");
                expect(headers["content-type"]).toMatch("text/html");
            });

            test("responds with 'Genre Not Found' message", async () => {
                const { text } = await request(app).get("/shows/genres/foo");
                expect(text).toBe("Genre Not Found");
            });
        });
    });
});