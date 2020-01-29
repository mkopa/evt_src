const express = require('express');
const now  = function() { return new Date(); };
const {card, recreateFrom} = require('./card')(now);
const ClientError = require('./clientError');

function withErrorHandling(fn) {
    return async function(req, res) {
        try {
            await fn(req.body);
            res.status(204).send();
        } catch (e) {
            if (e instanceof ClientError) {
                res.status(400).json({error: e.message});
            }
            console.log(e);
            res.status(500).send();
        }
    };
}

module.exports = async function() {
    const app = express();

    app.close = function() {
        return es.close();
    };

    const initStore = require('./es');
    const es = await initStore();
    const repository = require('./cardRepository')(recreateFrom, es);

    function withPersistence(fn) {
        return async (body) => {
            const c = await repository.load(body.uuid);
            fn(c, body);
            await repository.save(c);
        };
    }
    function handle(command) {
        return withErrorHandling(withPersistence(command));
    }

    app.use(express.json());

    app.post('/limit', handle((c, body) => {
        c.assignLimit(body.amount);
    }));
    app.post('/withdrawal', handle((c, body) => {
        c.withdraw(body.amount);
    }));
    app.post('/repayment', handle((c, body) => {
        c.repay(body.amount);
    }));
    app.get('/limit/:uuid', async function (req, res) {
        const c = await repository.load(req.params.uuid);
        res.json({uuid: c.uuid(), limit: c.availableLimit()});
    });

    return app;
};


