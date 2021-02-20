#!/usr/bin/env node

'use strict';

require('dotenv').config();
require('./services/errors');

const fs = require('fs');
const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const log = require('./services/log');

const app = express();
const port = process.env.PORT;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors({
	origin : new RegExp(process.env.CORS_ORIGIN),
	methods : ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
}));

// disable response cache
app.set('etag', false);
app.use((req, res, next) => {
	res.setHeader('Cache-control', 'no-store');
	next();
});

// default route
app.use('/', require('./routes/index'));

// default error handler
app.use((err, req, res, next) => {
	var msg = '';
	var errMsg = err.stack;
	const uri = `${req.method} ${req.protocol}://${req.headers.host}${req.url}`;

	switch(err.status)
	{
		case 404:
			msg = 'The resource you are looking for does not exist';
			errMsg = null;
			break;
		case 500:
			msg = 'Sorry, we could not process your request';
			break;
		default:
			msg = 'Ops! Something went wrong here';
			break;
	}

	if(errMsg)
		log(uri, errMsg);

	res.status(err.status || 500).json({error : msg});
});

app.on('error', error => {
	if(error.syscall !== 'listen')
		throw error;

	var bind = typeof port === 'string'
		? 'Pipe ' + port
		: 'Port ' + port;

	// handle specific listen errors with friendly messages
	switch(error.code)
	{
		case 'EACCES':
			log(bind + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			log(bind + ' is already in use');
			process.exit(1);
			break;
		default:
			throw error;
	}
});

try
{
    fs.statSync(process.env.CACHE_DIR);
}
catch(error)
{
    if(error.code === 'ENOENT')
    {
        fs.mkdirSync(process.env.CACHE_DIR);
    }
    else
    {
        log(error.code);
        process.exit(1);
    }
}

app.set('port', port);
app.listen(port, () => log(`HTTP server listening on port ${port}`));
