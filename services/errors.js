'use strict';

const log = require('./log');

/**
 * Handles signals received by the process, usually to exit the application.
 *
 * @param {String} signal Process signal.
 * @param {Boolean} exit Whether to exit the application or not.
 * @param {Error} error Error instance.
 */
function onExit(signal, exit, error)
{
	log('Process received the signal', signal);

    if(error)
		log(error.stack);

	if(exit)
		doExit();
}

/**
 * Exit the aplication.
 */
function doExit()
{
	log('Bye!');
	process.exit();
}

process.stdin.resume();

//do something when app is closing
process.on('SIGTERM', () => onExit('SIGTERM', true));

//catches ctrl+c event
process.on('SIGINT', () => onExit('SIGINT', true));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', () => onExit('SIGUSR1', true));
process.on('SIGUSR2', () => onExit('SIGUSR2', true));

//catches uncaught exceptions
process.on('uncaughtException', error => onExit('uncaughtException', true, error));
process.on('unhandledRejection', error => onExit('unhandledRejection', false, error));
