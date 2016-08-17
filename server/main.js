'use strict';
var chalk = require('chalk');
// var db = require('./db');
var snippetNanny = require('./app/SnippetNanny');
var seedDatabase = require('./app/seedy');

// Create a node server instance! cOoL!
var server = require('http').createServer();

var createApplication = function () {
    var app = require('./app')(); // used to read require('./app')(db)
    server.on('request', app); // Attach the Express application.
    require('./io')(server);   // Attach socket.io.
};

var startServer = function () {

    var PORT = process.env.PORT || 1337;

    server.listen(PORT, function () {
        console.log(chalk.blue('Server started on port', chalk.magenta(PORT)));
    });

};

createApplication();
startServer();

// db.sync().then(createApplication).then(startServer).catch(function (err) {
//     console.error(chalk.red(err.stack));
// });
