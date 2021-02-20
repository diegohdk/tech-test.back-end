'use strict';

const meld = require('meld');

/**
 * Methods to intercept from the router.
 *
 * @type {Array}
 */
const ROUTER_METHODS = [
    'all',
    'get',
    'post',
    'put',
    'head',
    'delete',
    'trace',
    'options',
    'connect',
    'patch'
];

/**
 * Uses AOP to add additional behavior to handle unexpected errors from the
 * given router.
 *
 * @param {express.router} router Router instance.
 */
function intercept(router)
{
    ROUTER_METHODS.forEach(method => meld.around(router, method, addWrapper));
}

/**
 * Adds a wrapper function to each route, to handle exceptions.
 *
 * @param {Object} jointPoint Joint point.
 */
function addWrapper(jointPoint)
{
    const originalHandler = jointPoint.args[1];
    const newHandler = (...args) => originalHandler(...args).catch(args[2]); // args is [req, res, next]
    jointPoint.args.splice(1, 1, newHandler);
    jointPoint.proceed();
}

module.exports = intercept;