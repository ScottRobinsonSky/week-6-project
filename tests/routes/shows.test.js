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

        test("succeeds", () => {
            expect(resp.statusCode).toBe(200);
        });

        test("responds with application/json", () => {
            expect(resp.headers["content-type"]).toMatch("application/json");
        });

        test("responds with all shows", () => {
            expect(resp.body).toEqual(shows);
        });
    });

    describe("GET /shows/:id", () => {
        describe("with a known id", () => {
            beforeAll(async () => {
                resp = await request(app).get(`/shows/${shows[0].id}`);
            });

            test("succeeds", () => {
                expect(resp.statusCode).toBe(200);
            });

            test("responds with application/json", () => {
                expect(resp.headers["content-type"]).toMatch("application/json");
            });

            test("responds with the specified show", () => {
                expect(resp.body).toEqual(shows[0]);
            });
        });

        describe("with an unknown id", () => {
            beforeAll(async () => {
                resp = await request(app).get("/shows/0");
            });

            test("fails with a 404 Not Found", () => {
                expect(resp.statusCode).toBe(404);
            });

            test("responds with text/html", () => {
                expect(resp.headers["content-type"]).toMatch("text/html");
            });

            test("responds with 'Show Not Found' message", () => {
                expect(resp.text).toBe("Show Not Found");
            });
        });

        describe("with an invalid id", () => {
            beforeAll(async () => {
                resp = await request(app).get("/shows/foo");
            });

            test("fails with a 400 Bad Request", () => {
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

    describe("DELETE /shows/:showId", () => {
        describe("with valid showId", () => {
            beforeAll(async () => {
                resp = await request(app).delete(`/shows/${shows[0].id}`);
            });

            afterAll(async () => {
                // Undo any changes made by the test
                await db.sync({force: true});
                await seedShows();
            });

            test("suceeds", () => {
                expect(resp.statusCode).toBe(200);
            });

            test("responds with application/json", () => {
                expect(resp.headers["content-type"]).toMatch("application/json");
            });

            test("responds with the deleted show", () => {
                expect(resp.body).toEqual(shows[0]);
            });
        });

        describe("with unknown/invalid showId", () => {
            describe("unknown id", () => {
                beforeAll(async () => {
                    resp = await request(app).delete("/shows/0");
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

            describe("invalid id", () => {
                beforeAll(async () => {
                    resp = await request(app).delete("/shows/foo");
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
    });

    describe("PATCH /shows/:showId", () => {
        describe("with valid showId", () => {
            describe("updating nothing", () => {
                beforeAll(async () => {
                    resp = await request(app).patch(`/shows/${shows[0].id}`).send({});
                });

                test("succeeds", () => {
                    expect(resp.statusCode).toBe(200);
                });

                test("responds with application/json", () => {
                    expect(resp.headers["content-type"]).toMatch("application/json");
                });

                test("responds with empty body", () => {
                    expect(resp.body).toEqual({});
                });
            });

            describe("updating just rating", () => {
                describe("valid rating", () => {
                    beforeAll(async () => {
                        newRating = shows[0].rating !== 8 ? 8 : 9
                        resp = await request(app)
                            .patch(`/shows/${shows[0].id}`)
                            .send({rating: newRating});
                    });

                    afterAll(async () => {
                        // Undo any changes made by the test
                        await db.sync({force: true});
                        await seedShows();
                    });

                    test("succeeds", () => {
                        expect(resp.statusCode).toBe(200);
                    });

                    test("responds with application/json", () => {
                        expect(resp.headers["content-type"]).toMatch("application/json");
                    });

                    test("responds with the updated rating", () => {
                        expect(resp.body).toEqual({rating: newRating});
                    });
                });

                describe("invalid rating", () => {
                    describe("non-integer rating", () => {
                        beforeAll(async () => {
                            resp = await request(app)
                                .patch(`/shows/${shows[0].id}`)
                                .send({rating: "foo"});
                        });

                        test("fails with 400 Bad Request", () => {
                            expect(resp.statusCode).toBe(400);
                        });

                        test("responds with application/json", () => {
                            expect(resp.headers["content-type"]).toMatch("application/js");
                        });

                        test("responds with 'new rating must be an integer' message", () => {
                            expect(resp.body).toEqual([expect.objectContaining({msg: "new rating must be an integer"})]);
                        });
                    });

                    describe("rating below 0", () => {
                        beforeAll(async () => {
                            resp = await request(app)
                                .patch(`/shows/${shows[0].id}`)
                                .send({rating: -1});
                        });

                        test("fails with 400 Bad Request", () => {
                            expect(resp.statusCode).toBe(400);
                        });

                        test("responds with application/json", () => {
                            expect(resp.headers["content-type"]).toMatch("application/json");
                        });

                        test("responds with 'new rating must be 0-10 (inclusive)' message", () => {
                            expect(resp.body).toEqual([expect.objectContaining({msg: "new rating must be 0-10 (inclusive)"})]);
                        });
                    });

                    describe("rating above 10", () => {
                        beforeAll(async () => {
                            resp = await request(app)
                                .patch(`/shows/${shows[0].id}`)
                                .send({rating: 11});
                        });

                        test("fails with 400 Bad Request", () => {
                            expect(resp.statusCode).toBe(400);
                        });

                        test("responds with application/json", () => {
                            expect(resp.headers["content-type"]).toMatch("application/json");
                        });

                        test("responds with 'new rating must be 0-10 (inclusive)' message", () => {
                            expect(resp.body).toEqual([expect.objectContaining({msg: "new rating must be 0-10 (inclusive)"})]);
                        });
                    });
                });
            });

            describe("updating just status", () => {
                describe("valid status", () => {
                    beforeAll(async () => {
                        newStatus = shows[0].status === "on-going" ? "cancelled" : "on-going";
                        resp = await request(app)
                            .patch(`/shows/${shows[0].id}`)
                            .send({status: newStatus});
                    });

                    afterAll(async () => {
                        // Undo any changes made by the test
                        await db.sync({force: true});
                        await seedShows();
                    });

                    test("succeeds", () => {
                        expect(resp.status).toBe(200);
                    });

                    test("responds with application/json", () => {
                        expect(resp.headers["content-type"]).toMatch("application/json");
                    });

                    test("responds with the updated status", () => {
                        expect(resp.body).toEqual({status: newStatus});
                    });
                });

                describe("invalid status", () => {
                    describe("not a string", () => {
                        beforeAll(async () => {
                            resp = await request(app)
                                .patch(`/shows/${shows[0].id}`)
                                .send({status: 123});
                        });

                        test("fails with 400 Bad Request", () => {
                            expect(resp.statusCode).toBe(400);
                        });

                        test("responds with application/json", () => {
                            expect(resp.headers["content-type"]).toMatch("application/json");
                        });

                        test("responds with 'new status must be a string' message", () => {
                            expect(resp.body).toEqual([expect.objectContaining({msg: "new status must be a string"})]);
                        });
                    });

                    describe("contains spaces", () => {
                        beforeAll(async () => {
                            resp = await request(app)
                                .patch(`/shows/${shows[0].id}`)
                                .send({status: "hello world"});
                        });

                        test("fails with 400 Bad Request", () => {
                            expect(resp.statusCode).toBe(400);
                        });

                        test("responds with application/json", () => {
                            expect(resp.headers["content-type"]).toMatch("application/json");
                        });

                        test("responds with 'new status must not contain spaces' message", () => {
                            expect(resp.body).toEqual([expect.objectContaining({msg: "new status must not contain spaces"})]);
                        });
                    });

                    describe("too short", () => {
                        beforeAll(async () => {
                            resp = await request(app)
                                .patch(`/shows/${shows[0].id}`)
                                .send({status: "hi"});
                        });

                        test("fails with 400 Bad Request", () => {
                            expect(resp.statusCode).toBe(400);
                        });

                        test("responds with application/json", () => {
                            expect(resp.headers["content-type"]).toMatch("application/json");
                        });

                        test("responds with 'new status must be 5-25 characters (inclusive)' message", () => {
                            expect(resp.body).toEqual([expect.objectContaining({msg: "new status must be 5-25 characters (inclusive)"})]);
                        });
                    });

                    describe("too long", () => {
                        beforeAll(async () => {
                            resp = await request(app)
                                .patch(`/shows/${shows[0].id}`)
                                .send({status: "abcdefghijklmnopqrstuvwyxyz"});
                        });

                        test("fails with 400 Bad Request", () => {
                            expect(resp.statusCode).toBe(400);
                        });

                        test("responds with application/json", () => {
                            expect(resp.headers["content-type"]).toMatch("application/json");
                        });

                        test("responds with 'new status must be 5-25 characters (inclusive)' message", () => {
                            expect(resp.body).toEqual([expect.objectContaining({msg: "new status must be 5-25 characters (inclusive)"})]);
                        });
                    });
                });
            });

            describe("update rating and status", () => {
                describe("valid parameters", () => {
                    beforeAll(async () => {
                        const newRating = shows[0].rating !== 8 ? 8 : 9;
                        const newStatus = shows[0].status === "on-going" ? "cancelled" : "on-going";
                        resp = await request(app)
                            .patch(`/shows/${shows[0].id}`)
                            .send({rating: newRating, status: newStatus});
                    });

                    test("succeeds", () => {
                        expect(resp.statusCode).toBe(200);
                    });

                    test("responds with application/json", () => {
                        expect(resp.headers["content-type"]).toMatch("application/json");
                    });

                    test("responds with updated rating and status", () => {
                        expect(resp.body).toEqual({rating: newRating, status: newStatus});
                    });
                });
            });
        });

        describe("with unknown/invalid showId", () => {
            describe("with unknown showId", () => {
                beforeAll(async () => {
                    resp = await request(app).patch("/shows/0");
                });

                test("fails with 404 Not Found", () => {
                    expect(resp.statusCode).toBe(404);
                });

                test("responds with text/hmtl", () => {
                    expect(resp.headers["content-type"]).toMatch("text/html");
                });

                test("responds with 'Show Not Found' message", () => {
                    expect(resp.text).toBe("Show Not Found");
                });
            });

            describe("with invalid showId", () => {
                beforeAll(async () => {
                    resp = await request(app).patch("/shows/foo");
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
    });

    describe("GET /shows/genres", () => {
        beforeAll(async () => {
            resp = await request(app).get("/shows/genres");
        });

        test("succeeds", () => {
            expect(resp.statusCode).toBe(200);
        });

        test("responds with application/json", () => {
            expect(resp.headers["content-type"]).toMatch("application/json");
        });

        test("responds with all show genres", () => {
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

                test("succeeds", () => {
                    expect(resp.statusCode).toBe(200);
                });

                test("responds with application/json", () => {
                    expect(resp.headers["content-type"]).toMatch("application/json");
                });

                test("responds with all shows matching the genre", () => {
                    const matchingShows = shows.filter(s => s.genre === genre);
                    expect(resp.body).toEqual(matchingShows.map(s => expect.objectContaining(s)));
                });
            });

            describe("different casing", () => {
                beforeAll(async () => {
                    genre = genres[0].toUpperCase();
                    resp = await request(app).get(`/shows/genres/${genre}`);
                });

                test("succeeds", () => {
                    expect(resp.statusCode).toBe(200);
                });

                test("responds with application/json", () => {
                    expect(resp.headers["content-type"]).toMatch("application/json");
                });

                test("responds with all shows matching the genre", () => {
                    const matchingShows = shows.filter(s => s.genre.toLowerCase() === genre.toLowerCase());
                    expect(resp.body).toEqual(matchingShows.map(s => expect.objectContaining(s)));
                });
            });
        });

        describe("with an invalid genre", () => {
            beforeAll(async () => {
                resp = await request(app).get("/shows/genres/foo");
            });

            test("fails with a 404 Not Found", () => {
                expect(resp.statusCode).toBe(404);
            });

            test("responds with text/html", () => {
                expect(resp.headers["content-type"]).toMatch("text/html");
            });

            test("responds with 'Genre Not Found' message", () => {
                expect(resp.text).toBe("Genre Not Found");
            });
        });
    });
});