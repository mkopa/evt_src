(async function main() {
    const app = await require('./app')();

    app.listen(3000, function () {
        console.log("Listening on port ", 3000);
    });
})();