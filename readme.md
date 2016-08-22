# Acid-test

### Installation
Create a `.env` file at the project root (or copy `.envexample` and edit as needed).

```bash
$ npm i && npm start
```

### Development
Sets up watches for `babel` and `webpack`, automatically restarts the server with `pm2`.

Install `pm2` globally.

```bash
$ npm i -g pm2 webpack #Only if you need!
```

Then install the rest of the packages normally. Run the dev watch and start the server.

```bash
$ npm i
$ npm run dev
$ pm2 start process.json #Will start as a daemon
$ pm2 logs #If you need to see the logs
$ pm2 monit #For resource usage
```
