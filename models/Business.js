'use strict';

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const log = require('../services/log');

/**
 * This class implements a model to query informations about active businesses
 * from a remote API or a local cache.
 */
class Business
{
    /**
     * Remote API endpoint.
     */
    get API_ENDPOINT()
    {
        return 'https://data.lacity.org/resource/6rrh-rzua.json';
    }

    /**
     * Cache file path.
     */
    get CACHE_PATH()
    {
        return path.resolve(process.cwd(), process.env.CACHE_DIR, 'businesses.json');
    }

    /**
     * Checks whether the data is already cached.
     *
     * @returns {Promise<Boolean>} Returns a promise that will be resolved to a
     * boolean indicating the presence of the cache file.
     */
    async isCached()
    {
        try
        {
            await fs.stat(this.CACHE_PATH);
            return true;
        }
        catch(error)
        {
            log('Cache does not exist', this.CACHE_PATH);
            return false;
        }
    }

    /**
     * Returns the businesses list.
     *
     * The list is returned from the local cache file if available. Otherwise,
     * it is fetched from the remote API and then cached.
     *
     * @returns {Promise<Array>} Returns a promise that will be resolved to an
     * array of objects.
     */
    async getList()
    {
        let list = null;

        if(await this.isCached())
        {
            list = await this.getFromCache();
        }
        else
        {
            list = await this.getFromApi();
            this.cacheList(list);
        }

        return list;
    }

    /**
     * Returns the businesses list from the remote API.
     *
     * @returns {Promise<Array>} Returns a promise that will be resolved to an
     * array of objects.
     */
    async getFromApi()
    {
        const response = await axios.get(this.API_ENDPOINT);

        return response.data;
    }

    /**
     * Returns the businesses list from the local cache.
     *
     * @returns {Promise<Array>} Returns a promise that will be resolved to an
     * array of objects.
     */
    async getFromCache()
    {
        const list = await fs.readFile(this.CACHE_PATH, 'utf8');

        return JSON.parse(list);
    }

    /**
     * Caches the businesses list.
     *
     * If the file already exists, it will be replaced.
     *
     * @returns {Promise} Returns a promise that will be resolved after the file
     * is written.
     */
    async cacheList(list)
    {
        log('Caching list', this.CACHE_PATH);
        return await fs.writeFile(this.CACHE_PATH, JSON.stringify(list));
    }

    /**
     * Get the total number of unique businesses.
     *
     * @returns {Promise<Number>} Returns a promise that will be resolved to the
     * number of unique businesses.
     */
    async getTotalUnique()
    {
        const list = await this.getList();
        const unique = {};

        list.forEach(business => {
            if (!unique[business.business_name]) {
                unique[business.business_name] = true;
            }
        });

        return Object.keys(unique).length;
    }

    /**
     * Get the oldest business.
     *
     * @returns {Promise<Object>} Returns a promise that will be resolved to the
     * oldest business.
     */
    async getOldestBusiness()
    {
        const list = await this.getList();
        const oldest = list.reduce((prev, current, index) => {
            const isFirst = index === 0;
            const noStartDate = !current.location_start_date;
            const isNewest = Date.parse(prev.location_start_date) < Date.parse(current.location_start_date);

            if (isFirst || noStartDate || isNewest) {
                return prev;
            } else {
                return current;
            }
        });

        return oldest;
    }

    /**
     * Get the business with most locations.
     *
     * @returns {Promise<Object>} Returns a promise that will be resolved to the
     * business with most locations.
     */
    async getBusinessWithMostLocations()
    {
        const list = await this.getList();
        const agg = list.reduce((agg, business) => {
            if (!agg[business.business_name]) {
                agg[business.business_name] = 0;
            }

            agg[business.business_name]++;

            return agg;
        }, {});
        const theMost = Object.entries(agg).reduce((prev, current, index) => index === 0 ? prev : prev[1] > current[1] ? prev : current);

        return {
            business_name : theMost[0],
            locations_count : theMost[1]
        };
    }
}

module.exports = Business;