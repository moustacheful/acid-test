import retry from 'async/retry';
import forever from 'async/forever';
import request from 'request-promise';
import { RequestError, StatusCodeError } from 'request-promise/errors'
import Promise from 'bluebird';
import _ from 'lodash';
import { EventEmitter } from 'events'

class StockService extends EventEmitter {
	constructor(symbols){
		super()
		this.symbols = []
		this.addSymbols(symbols);
		this.retryableGet = this.retryableGet.bind(this)
	}
	
	setSymbols(symbols){
		this.symbols = _.uniq(symbols)
		this.requestUrl = `http://finance.google.com/finance/info?client=ig&q=${this.symbols.join(',')}`;
		console.log('Now following:',this.symbols);
	}

	removeSymbol(symbol){
		let symbols = _.pull(this.symbols);
		this.setSymbols(symbols);
	}
	
	addSymbols(newSymbols){
		if(!_.isArray(newSymbols)){
			newSymbols = newSymbols.split(',')
		}
		this.setSymbols([ ...this.symbols,  ...newSymbols ]);
	}

	get(){
		// Add a 10% failure rate chance
		if( Math.random() < .1 )
			return Promise.reject(new Error('How unfortunate! The API Request Failed'));

		return request(this.requestUrl)
			.then( (response) => JSON.parse(response.replace('// ','')) )
	}

	retryableGet(next){
		retry({ times: 5, interval: 300 }, (callback) => {
				this.get()
					.then( (response) => callback(null,response) )
					.catch(callback)
			}, (err,response) => {
				if(err){
					console.log('Iteration failed: All retries rejected.', err.message);
					this.emit('error', err);
				}else{
					console.log('Iteration succeeded with data length:', response.length);
					this.emit('data', response);
				}

				// Continue anyway
				setTimeout(next, .25 * 60 * 1000);
			}
		);
	}

	start(){
		forever(this.retryableGet);
	}
}

export default new StockService(process.env.STOCK_SYMBOLS);