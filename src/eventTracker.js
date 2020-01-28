function eventTracker(apply) {
    let events = [];
    const api = {
        flushEvents() {
            events = [];
        },
        pendingEvents() {
            return events;
        },
        applyWithRecord(event) {
            events.push(event);
            apply(event);
        }
    };
    return api;
}

module.exports = eventTracker;