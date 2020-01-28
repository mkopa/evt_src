const {LIMIT_ASSIGNED, CARD_WITHDRAWN, CARD_REPAID} = require("./eventTypes");

// favor delegation over inheritance
module.exports = now => {
    const card = id => {
        let limit;
        let used = 0;
        let events = []; // generic
        let {limitAssigned, cardWithdrawn, cardRepaid} = require("./eventsCreator")(now, id);
        const {applyWithRecord, ...tracker} = require("./eventTracker")(apply);

        // invariant
        function limitAlreadyAssigned() {
            return limit != null;
        }

        function notEnoughMoney(amount) {
            return amount > availableLimit();
        }

        function availableLimit() {
            return limit - used;
        }

        function apply(event) {
            if (event.type === LIMIT_ASSIGNED) {
                limit = event.amount;
            }
            if (event.type === CARD_WITHDRAWN) {
                used += event.amount;
            }
            if (event.type === CARD_REPAID) {
                used -= event.amount;
            }
        }


        return {
            ...tracker,
            assignLimit(amount) {
                if(limitAlreadyAssigned()) {
                    throw new Error('Cannot assign limit for the second time');
                }
                applyWithRecord(limitAssigned(amount));
            },
            availableLimit,
            withdraw(amount) {
                if(!limitAlreadyAssigned()) {
                    throw new Error('No limit assigned');
                }
                if (notEnoughMoney(amount)) {
                    throw new Error('Not enough money');
                }
                applyWithRecord(cardWithdrawn(amount));
            },
            repay(amount) {
                applyWithRecord(cardRepaid(amount));
            },
            apply,
            uuid() {
                return id;
            }
        };
    };
    const recreateFrom = (uuid, events) => {
        return events.reduce((card, event) => {
            card.apply(event);
            return card;
        }, card(uuid));
    };

    return {card, recreateFrom};
};


