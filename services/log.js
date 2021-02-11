'use strict';

/**
 * Adds a message to the log.
 *
 * @param  {...any} args List of arguments to log.
 */
function log(...args)
{
    console.log(`[${new Date().toISOString()}]`, ...args);
}

module.exports = log;