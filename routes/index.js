'use strict';

const express = require('express');
const router = express.Router();
const Business = require('../lib/Business');
const log = require('../services/log');

/**
 * Get the total of available businesses.
 */
router.get('/total', (req, res) => {
    const model = new Business;

    model.getList()
        .then(data => {
            const unique = {};
            data.forEach(business => !unique[business.business_name] && (unique[business.business_name] = true));
            res.json({ total : Object.keys(unique).length });
        })
        .catch(error => res.status(500).json({error : error.message}));
});

/**
 * Get the oldest business.
 */
router.get('/oldest', (req, res) => {
    const model = new Business;

    model.getList()
        .then(data => {
            const oldest = data.reduce((prev, current, index) => {
                if((index === 0) || !current.location_start_date || (Date.parse(prev.location_start_date) < Date.parse(current.location_start_date)))
                    return prev;
                else
                    return current;
            });

            res.json(oldest);
        })
        .catch(error => res.status(500).json({error : error.message}));
});

/**
 * Get the business with most locations.
 */
router.get('/most-locations', (req, res) => {
    const model = new Business;

    model.getList()
        .then(data => {
            const agg = data.reduce((agg, business) => {
                if(!agg[business.business_name])
                    agg[business.business_name] = 0;

                agg[business.business_name]++;

                return agg;
            }, {});
            const theMost = Object.entries(agg).reduce((prev, current, index) => index === 0 ? prev : prev[1] > current[1] ? prev : current);

            res.json({business_name : theMost[0], locations_count : theMost[1]});
        })
        .catch(error => res.status(500).json({error : error.message}));
});

module.exports = router;
