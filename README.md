# Active Businesses - Back-end app

This is the back-end app of the tech test for the ae.studio.

It's a very simple Express.js application, that queries a remote API to fetch
data about active businesses.

It has three routes:

- `GET /total` - returns the number of unique businesses
- `GET /oldest` - returns the oldest business
- `GET /most-locations` - returns the business with most locations

Only the first page of data from the remote API is used. No pagination was
implemented.

However, as the page is a bit large (1000 records) it takes some seconds for the
API to respond, and this causes the front-end to be slow. To bypass this
limitation, a cache mecanism was implemented.

When the app receives a request, it first checks whether it has the data cached.
If it has, the data is read, processed and then returned to the front-end.
But if the data is not cached, the app will query the remote API, and as soon
the data is available, it will be saved on a file at the `cache` directory (the
location can be changed in the `.env.json` file). After that, the data is
processed and returned to the front-end. Like this, the first request will still
be slow, but all subsequent requests will be as fast as a blink ;)

All the code is well formatted, documented and easy to understand.

The main stack used here is:

- Node.js (any version, but I used 11.15.0)
- Express.js 4.16.1
- axios 0.21.1
- cors 2.8.5

## Configuration

Copy or rename the file `env.sample` to `.env.json`. No need to edit it.

The app runs on the port 3000 by default. But you can change it by editing the
`.env.json` file. Just remember to also change the port in the front-end app.

## Install dependencies

```
npm install
```

### Start the application

```
npm run start
```

### Testing

No unit tests wrote.
