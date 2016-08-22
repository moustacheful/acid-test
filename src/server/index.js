import 'babel-polyfill'

import app from './app'
import stockSocket from './socket'
import routes from './routes';
import stocks from './lib/stock-service';
import _ from 'lodash';

import redis from './lib/redis';
redis.init(process.env.REDIS_URI);

stocks.start()
app.register(routes);
app.register(stockSocket);
