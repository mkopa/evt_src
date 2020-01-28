module.exports = now => {
    const card = id => {
        let limit;
        let used = 0;
        let events = [];

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
            if (event.type === 'LIMIT_ASSIGNED') {
                limit = event.amount;
            }
            if (event.type === 'CARD_WITHDRAWN') {
                used += event.amount;
            }
            if (event.type === 'CARD_REPAID') {
                used -= event.amount;
            }
        }

        return {
            assignLimit(amount) {
                if(limitAlreadyAssigned()) {
                    throw new Error('Cannot assign limit for the second time');
                }
                const event = {type: 'LIMIT_ASSIGNED', amount, card_id: id, date: now().toJSON()};
                events.push(event);
                apply(event);
            },
            availableLimit,
            withdraw(amount) {
                if(!limitAlreadyAssigned()) {
                    throw new Error('No limit assigned');
                }
                if (notEnoughMoney(amount)) {
                    throw new Error('Not enough money');
                }
                events.push({type: 'CARD_WITHDRAWN', amount, card_id: id, date: now().toJSON()});
                used += amount;
            },
            repay(amount) {
                events.push({type: 'CARD_REPAID', amount, card_id: id, date: now().toJSON()});
                used -= amount;
            },
            pendingEvents() {
                return events;
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


