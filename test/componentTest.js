const test = require("tape");
const httpClient = require("supertest");
const uuidv4 = require('uuid/v4');

test("Component test", async function(t) {
    const app = await require('../src/app')();
    const request = httpClient(app);

    const id = uuidv4();

    try {
        await request
            .post("/limit")
            .send({
                "uuid": id,
                "amount": 1000
            })
            .set("Content-Type", "application/json")
            .expect(204);

        await request
            .post("/withdrawal")
            .send({
                "uuid": id,
                "amount": 200
            })
            .set("Content-Type", "application/json")
            .expect(204);

        await request
            .post("/repayment")
            .send({
                "uuid": id,
                "amount": 100
            })
            .set("Content-Type", "application/json")
            .expect(204);

        await request
            .get(`/limit/${id}`)
            .expect(200, {"uuid": id, "limit": 900});

        await request
            .post("/withdrawal")
            .send({
                "uuid": id,
                "amount": 901
            })
            .set("Content-Type", "application/json")
            .expect(400, {"error": "Not enough money"});
    } catch(e) {
        t.error(e);
    } finally {
        await app.close();
        t.end();
    }
});