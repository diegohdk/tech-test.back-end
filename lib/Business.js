'use strict';

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const log = require('../services/log');
const env = require('../.env');

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
        return path.resolve(process.cwd(), env.cacheDir, 'businesses.json');
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
        try
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
        catch(error)
        {
            log(error);
            throw new Error('Error while requesting data');
        }
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
}

module.exports = Business;