'use strict';

const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
require('../services/errors/interceptor')(router);

/**
 * Get the total of available businesses.
 */
router.get('/total', async (req, res) => {
    const model = new Business;
    const total = await model.getTotalUnique();
    res.json({ total });
});

/**
 * Get the oldest business.
 */
router.get('/oldest', async (req, res) => {
    const model = new Business;
    const oldest = await model.getOldestBusiness();
    res.json(oldest);
});

/**
 * Get the business with most locations.
 */
router.get('/most-locations', async (req, res) => {
    const model = new Business;
    const business = await model.getBusinessWithMostLocations();
    res.json(business);
});

module.exports = router;
