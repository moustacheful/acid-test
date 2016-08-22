import SocketIO from 'socket.io';
import bluebird from 'bluebird';
import stocks from './lib/stock-service';
import { pub, sub } from './lib/redis';
import uuid from 'uuid';
import _ from 'lodash';
import { RequestError, StatusCodeError } from 'request-promise/errors';
import moment from 'moment';

var ticksWithoutData = 0;
const keyMap = {
	t:'symbol',
	c_fix:'change',
	cp_fix: 'changePercentage',
	l: 'current',
	lt_dts: 'date'
};

class StocksSocket {
	constructor(server){
		this.io = SocketIO(server)

		this.io.on('connection', async (socket) =>{
			socket.emit('message', 'hello user!')

			let data = {
				status: await pub.hgetallAsync('status'),
				history: await this.getHistory()
			}

			socket.emit('status', data.status);
			socket.emit('stocks:history', data.history)
		});

		stocks.on('error', (error) => {
			let message = 'Some error happened!';

			switch(error.constructor){
				case StatusCodeError:
					message = 'The service API returned an error.';
					break;
				case RequestError:
					message = `There was an internal problem with the data request: '${error.message}'`;
					break;
				default:
					message = error.message || error
			}

			this.updateStatus({
				health: 'error',
				error: message
			});
		})

		stocks.on('data', async (data) => {
			// If there are no items, there's something wrong! Notify the client
			if( ! data.length ) return this.updateStatus({
				error: 'No data in service.',
				health: 'error'
			});

			// Normalize data and pick only the necessary
			let items = _.map(data, (row) => {
				let result = _.pick(row, _.keys(keyMap))
				result = _.mapKeys(result, (val,key) => keyMap[key]);
				result.date = moment(result.date).startOf('minute').toISOString();
				return result
			});

			let currentDataTime = items[0].date;

			let lastDataForSymbols = await pub
				.multi( _.map(items, (item) => ['get',`stock:${item.symbol}:lastDataAt`]))
				.execAsync()
				

			// Only let through items whose time has changed.
			items = _.reject(items, (item,i) => item.date == lastDataForSymbols[i] )

			if( ! items.length ) {
				ticksWithoutData++;
				return this.updateStatus({
					isClosed: ticksWithoutData >= 4 ? true : false,
					lastDataTime: currentDataTime
				});
			}


			// We have changed items and we're good to go!
			ticksWithoutData = 0;
			this.updateStatus({
				isClosed: false,
				lastDataTime: currentDataTime
			});
			

			let multi = pub.multi();

			_.each(items, (item) => {
				let unixTime = new Date(item.date).getTime();
				let itemKey = uuid.v4();
				multi.set(`stock:${item.symbol}:lastDataAt`, item.date)
				multi.hmset(`stock:${itemKey}`,item);
				multi.zadd(`stock:${item.symbol}:latest`, unixTime, itemKey)
			});
			
			multi.exec()
			this.io.emit('stocks:data', items)
		})
	}

	updateStatus(status){
		let newStatus = {
			lastFetch: new Date().toISOString(),
			health: 'ok',
			error: '',
			...status
		};

		// Set the new status and immediately retrieve it (to send full status).
		pub.hmsetAsync('status',newStatus).then( ()=>{
			return pub.hgetallAsync('status')
		}).then( (status) =>
			this.io.emit('status',status)
		);
	}

	getHistory(){
		let commands = _.map( process.env.STOCK_SYMBOLS.split(','), (symbol) => 
			['zrange',`stock:${symbol}:latest`,-30,-1]
		);

		return pub.multi(commands).execAsync().then(function(results){
			let keys = _.flatten(results);
			return pub.multi(
				_.map(keys, (key) => ['hgetall', `stock:${key}`] )
			).execAsync()

		})
	}
}


function register(server, options, next){	
	try {
		new StocksSocket(server.listener);
	} catch (err){
		console.log(err)
	}
	console.log('SocketIO attached.');
	next();
}

register.attributes = {
	name: 'stock-socket'
}

export default { register }