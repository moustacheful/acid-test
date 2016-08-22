'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _stockService = require('./lib/stock-service');

var _stockService2 = _interopRequireDefault(_stockService);

var _redis = require('./lib/redis');

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _errors = require('request-promise/errors');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var keyMap = {
	t: 'symbol',
	c_fix: 'change',
	cp_fix: 'changePercentage',
	l: 'current',
	lt_dts: 'date'
};

var StocksSocket = function () {
	function StocksSocket(server) {
		var _this = this;

		_classCallCheck(this, StocksSocket);

		this.io = (0, _socket2.default)(server);

		this.io.on('connection', function _callee(socket) {
			var data;
			return regeneratorRuntime.async(function _callee$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
							socket.emit('message', 'hello user!');

							_context.next = 3;
							return regeneratorRuntime.awrap(_redis.pub.hgetallAsync('status'));

						case 3:
							_context.t0 = _context.sent;
							_context.next = 6;
							return regeneratorRuntime.awrap(_this.getHistory());

						case 6:
							_context.t1 = _context.sent;
							data = {
								status: _context.t0,
								history: _context.t1
							};


							socket.emit('status', data.status);
							socket.emit('stocks:history', data.history);

						case 10:
						case 'end':
							return _context.stop();
					}
				}
			}, null, _this);
		});

		_stockService2.default.on('error', function (error) {
			var message = 'Some error happened!';

			switch (error.constructor) {
				case _errors.StatusCodeError:
					message = 'The service API returned an error.';
					break;
				case _errors.RequestError:
					message = 'There was an internal problem with the data request: \'' + error.message + '\'';
					break;
				default:
					message = error.message || error;
			}

			_this.updateStatus({
				health: 'error',
				error: message
			});
		});

		_stockService2.default.on('data', function _callee2(data) {
			var items, currentDataTime, lastDataForSymbols, multi;
			return regeneratorRuntime.async(function _callee2$(_context2) {
				while (1) {
					switch (_context2.prev = _context2.next) {
						case 0:
							if (data.length) {
								_context2.next = 2;
								break;
							}

							return _context2.abrupt('return', _this.updateStatus({
								error: 'No data in service.',
								health: 'error'
							}));

						case 2:

							// Normalize data and pick only the necessary
							items = _lodash2.default.map(data, function (row) {
								var result = _lodash2.default.pick(row, _lodash2.default.keys(keyMap));
								result = _lodash2.default.mapKeys(result, function (val, key) {
									return keyMap[key];
								});
								result.date = (0, _moment2.default)(result.date).startOf('minute').toISOString();
								return result;
							});
							currentDataTime = items[0].date;
							_context2.next = 6;
							return regeneratorRuntime.awrap(_redis.pub.multi(_lodash2.default.map(items, function (item) {
								return ['get', 'stock:' + item.symbol + ':lastDataAt'];
							})).execAsync());

						case 6:
							lastDataForSymbols = _context2.sent;


							// Only let through items whose time has changed.
							items = _lodash2.default.reject(items, function (item, i) {
								return item.date == lastDataForSymbols[i];
							});

							/*
       // Check the last time the data was changed
       let lastDataTime = await pub.hgetAsync('status','lastDataTime');
       if( moment(currentDataTime).diff(lastDataTime,'minutes') > 5 ){
       	return this.updateStatus({
       		isClosed: true
       	})
       	
       }
       */

							_this.updateStatus({
								isClosed: false,
								lastDataTime: currentDataTime
							});

							if (items.length) {
								_context2.next = 11;
								break;
							}

							return _context2.abrupt('return');

						case 11:
							multi = _redis.pub.multi();


							_lodash2.default.each(items, function (item) {
								var unixTime = new Date(item.date).getTime();
								var itemKey = _uuid2.default.v4();
								multi.set('stock:' + item.symbol + ':lastDataAt', item.date);
								multi.hmset('stock:' + itemKey, item);
								multi.zadd('stock:' + item.symbol + ':latest', unixTime, itemKey);
							});

							multi.exec();
							_this.io.emit('stocks:data', items);

						case 15:
						case 'end':
							return _context2.stop();
					}
				}
			}, null, _this);
		});
	}

	_createClass(StocksSocket, [{
		key: 'updateStatus',
		value: function updateStatus(status) {
			var _this2 = this;

			var newStatus = _extends({
				lastFetch: new Date().toISOString(),
				health: 'ok',
				error: ''
			}, status);

			// Set the new status and immediately retrieve it (to send full status).
			_redis.pub.hmsetAsync('status', newStatus).then(function () {
				return _redis.pub.hgetallAsync('status');
			}).then(function (status) {
				return _this2.io.emit('status', status);
			});
		}
	}, {
		key: 'getHistory',
		value: function getHistory() {
			var commands = _lodash2.default.map(process.env.STOCK_SYMBOLS.split(','), function (symbol) {
				return ['zrange', 'stock:' + symbol + ':latest', -30, -1];
			});

			return _redis.pub.multi(commands).execAsync().then(function (results) {
				var keys = _lodash2.default.flatten(results);
				return _redis.pub.multi(_lodash2.default.map(keys, function (key) {
					return ['hgetall', 'stock:' + key];
				})).execAsync();
			});
		}
	}]);

	return StocksSocket;
}();

function register(server, options, next) {
	try {
		new StocksSocket(server.listener);
	} catch (err) {
		console.log(err);
	}
	console.log('SocketIO attached.');
	next();
}

register.attributes = {
	name: 'stock-socket'
};

exports.default = { register: register };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvc29ja2V0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0FBRUEsSUFBTSxTQUFTO0FBQ2QsSUFBRSxRQURZO0FBRWQsUUFBTSxRQUZRO0FBR2QsU0FBUSxrQkFITTtBQUlkLElBQUcsU0FKVztBQUtkLFNBQVE7QUFMTSxDQUFmOztJQVFNLFk7QUFDTCx1QkFBWSxNQUFaLEVBQW1CO0FBQUE7O0FBQUE7O0FBQ2xCLE9BQUssRUFBTCxHQUFVLHNCQUFTLE1BQVQsQ0FBVjs7QUFFQSxPQUFLLEVBQUwsQ0FBUSxFQUFSLENBQVcsWUFBWCxFQUF5QixpQkFBTyxNQUFQO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUN4QixjQUFPLElBQVAsQ0FBWSxTQUFaLEVBQXVCLGFBQXZCOztBQUR3QjtBQUFBLHVDQUlULFdBQUksWUFBSixDQUFpQixRQUFqQixDQUpTOztBQUFBO0FBQUE7QUFBQTtBQUFBLHVDQUtSLE1BQUssVUFBTCxFQUxROztBQUFBO0FBQUE7QUFHcEIsV0FIb0I7QUFJdkIsY0FKdUI7QUFLdkIsZUFMdUI7QUFBQTs7O0FBUXhCLGNBQU8sSUFBUCxDQUFZLFFBQVosRUFBc0IsS0FBSyxNQUEzQjtBQUNBLGNBQU8sSUFBUCxDQUFZLGdCQUFaLEVBQThCLEtBQUssT0FBbkM7O0FBVHdCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEdBQXpCOztBQVlBLHlCQUFPLEVBQVAsQ0FBVSxPQUFWLEVBQW1CLFVBQUMsS0FBRCxFQUFXO0FBQzdCLE9BQUksVUFBVSxzQkFBZDs7QUFFQSxXQUFPLE1BQU0sV0FBYjtBQUNDO0FBQ0MsZUFBVSxvQ0FBVjtBQUNBO0FBQ0Q7QUFDQywyRUFBbUUsTUFBTSxPQUF6RTtBQUNBO0FBQ0Q7QUFDQyxlQUFVLE1BQU0sT0FBTixJQUFpQixLQUEzQjtB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TUFBdEIsQ0FEUTtBQUFBLElBRlQ7QUFLQTs7OytCQUVXO0FBQ1gsT0FBSSxXQUFXLGlCQUFFLEdBQUYsQ0FBTyxRQUFRLEdBQVIsQ0FBWSxhQUFaLENBQTBCLEtBQTFCLENBQWdDLEdBQWhDLENBQVAsRUFBNkMsVUFBQyxNQUFEO0FBQUEsV0FDM0QsQ0FBQyxRQUFELGFBQW1CLE1BQW5CLGNBQW1DLENBQUMsRUFBcEMsRUFBdUMsQ0FBQyxDQUF4QyxDQUQyRDtBQUFBLElBQTdDLENBQWY7O0FBSUEsVUFBTyxXQUFJLEtBQUosQ0FBVSxRQUFWLEVBQW9CLFNBQXBCLEdBQWdDLElBQWhDLENBQXFDLFVBQVMsT0FBVCxFQUFpQjtBQUM1RCxRQUFJLE9BQU8saUJBQUUsT0FBRixDQUFVLE9BQVYsQ0FBWDtBQUNBLFdBQU8sV0FBSSxLQUFKLENBQ04saUJBQUUsR0FBRixDQUFNLElBQU4sRUFBWSxVQUFDLEdBQUQ7QUFBQSxZQUFTLENBQUMsU0FBRCxhQUFxQixHQUFyQixDQUFUO0FBQUEsS0FBWixDQURNLEVBRUwsU0FGSyxFQUFQO0FBSUEsSUFOTSxDQUFQO0FBT0E7Ozs7OztBQUlGLFNBQVMsUUFBVCxDQUFrQixNQUFsQixFQUEwQixPQUExQixFQUFtQyxJQUFuQyxFQUF3QztBQUN2QyxLQUFJO0FBQ0gsTUFBSSxZQUFKLENBQWlCLE9BQU8sUUFBeEI7QUFDQSxFQUZELENBRUUsT0FBTyxHQUFQLEVBQVc7QUFDWixVQUFRLEdBQVIsQ0FBWSxHQUFaO0FBQ0E7QUFDRCxTQUFRLEdBQVIsQ0FBWSxvQkFBWjtBQUNBO0FBQ0E7O0FBRUQsU0FBUyxVQUFULEdBQXNCO0FBQ3JCLE9BQU07QUFEZSxDQUF0Qjs7a0JBSWUsRUFBRSxrQkFBRixFIiwiZmlsZSI6InNvY2tldC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTb2NrZXRJTyBmcm9tICdzb2NrZXQuaW8nO1xuaW1wb3J0IGJsdWViaXJkIGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCBzdG9ja3MgZnJvbSAnLi9saWIvc3RvY2stc2VydmljZSc7XG5pbXBvcnQgeyBwdWIsIHN1YiB9IGZyb20gJy4vbGliL3JlZGlzJztcbmltcG9ydCB1dWlkIGZyb20gJ3V1aWQnO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IFJlcXVlc3RFcnJvciwgU3RhdHVzQ29kZUVycm9yIH0gZnJvbSAncmVxdWVzdC1wcm9taXNlL2Vycm9ycyc7XG5pbXBvcnQgbW9tZW50IGZyb20gJ21vbWVudCc7XG5cbmNvbnN0IGtleU1hcCA9IHtcblx0dDonc3ltYm9sJyxcblx0Y19maXg6J2NoYW5nZScsXG5cdGNwX2ZpeDogJ2NoYW5nZVBlcmNlbnRhZ2UnLFxuXHRsOiAnY3VycmVudCcsXG5cdGx0X2R0czogJ2RhdGUnXG59O1xuXG5jbGFzcyBTdG9ja3NTb2NrZXQge1xuXHRjb25zdHJ1Y3RvcihzZXJ2ZXIpe1xuXHRcdHRoaXMuaW8gPSBTb2NrZXRJTyhzZXJ2ZXIpXG5cblx0XHR0aGlzLmlvLm9uKCdjb25uZWN0aW9uJywgYXN5bmMgKHNvY2tldCkgPT57XG5cdFx0XHRzb2NrZXQuZW1pdCgnbWVzc2FnZScsICdoZWxsbyB1c2VyIScpXG5cblx0XHRcdGxldCBkYXRhID0ge1xuXHRcdFx0XHRzdGF0dXM6IGF3YWl0IHB1Yi5oZ2V0YWxsQXN5bmMoJ3N0YXR1cycpLFxuXHRcdFx0XHRoaXN0b3J5OiBhd2FpdCB0aGlzLmdldEhpc3RvcnkoKVxuXHRcdFx0fVxuXG5cdFx0XHRzb2NrZXQuZW1pdCgnc3RhdHVzJywgZGF0YS5zdGF0dXMpO1xuXHRcdFx0c29ja2V0LmVtaXQoJ3N0b2NrczpoaXN0b3J5JywgZGF0YS5oaXN0b3J5KVxuXHRcdH0pO1xuXG5cdFx0c3RvY2tzLm9uKCdlcnJvcicsIChlcnJvcikgPT4ge1xuXHRcdFx0bGV0IG1lc3NhZ2UgPSAnU29tZSBlcnJvciBoYXBwZW5lZCEnO1xuXG5cdFx0XHRzd2l0Y2goZXJyb3IuY29uc3RydWN0b3Ipe1xuXHRcdFx0XHRjYXNlIFN0YXR1c0NvZGVFcnJvcjpcblx0XHRcdFx0XHRtZXNzYWdlID0gJ1RoZSBzZXJ2aWNlIEFQSSByZXR1cm5lZCBhbiBlcnJvci4nO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFJlcXVlc3RFcnJvcjpcblx0XHRcdFx0XHRtZXNzYWdlID0gYFRoZXJlIHdhcyBhbiBpbnRlcm5hbCBwcm9ibGVtIHdpdGggdGhlIGRhdGEgcmVxdWVzdDogJyR7ZXJyb3IubWVzc2FnZX0nYDtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRtZXNzYWdlID0gZXJyb3IubWVzc2FnZSB8fCBlcnJvclxuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnVwZGF0ZVN0YXR1cyh7XG5cdFx0XHRcdGhlYWx0aDogJ2Vycm9yJyxcblx0XHRcdFx0ZXJyb3I6IG1lc3NhZ2Vcblx0XHRcdH0pO1xuXHRcdH0pXG5cblx0XHRzdG9ja3Mub24oJ2RhdGEnLCBhc3luYyAoZGF0YSkgPT4ge1xuXHRcdFx0Ly8gSWYgdGhlcmUgYXJlIG5vIGl0ZW1zLCB0aGVyZSdzIHNvbWV0aGluZyB3cm9uZyEgTm90aWZ5IHRoZSBjbGllbnRcblx0XHRcdGlmKCAhIGRhdGEubGVuZ3RoICkgcmV0dXJuIHRoaXMudXBkYXRlU3RhdHVzKHtcblx0XHRcdFx0ZXJyb3I6ICdObyBkYXRhIGluIHNlcnZpY2UuJyxcblx0XHRcdFx0aGVhbHRoOiAnZXJyb3InXG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gTm9ybWFsaXplIGRhdGEgYW5kIHBpY2sgb25seSB0aGUgbmVjZXNzYXJ5XG5cdFx0XHRsZXQgaXRlbXMgPSBfLm1hcChkYXRhLCAocm93KSA9PiB7XG5cdFx0XHRcdGxldCByZXN1bHQgPSBfLnBpY2socm93LCBfLmtleXMoa2V5TWFwKSlcblx0XHRcdFx0cmVzdWx0ID0gXy5tYXBLZXlzKHJlc3VsdCwgKHZhbCxrZXkpID0+IGtleU1hcFtrZXldKTtcblx0XHRcdFx0cmVzdWx0LmRhdGUgPSBtb21lbnQocmVzdWx0LmRhdGUpLnN0YXJ0T2YoJ21pbnV0ZScpLnRvSVNPU3RyaW5nKCk7XG5cdFx0XHRcdHJldHVybiByZXN1bHRcblx0XHRcdH0pO1xuXG5cdFx0XHRsZXQgY3VycmVudERhdGFUaW1lID0gaXRlbXNbMF0uZGF0ZTtcblxuXHRcdFx0bGV0IGxhc3REYXRhRm9yU3ltYm9scyA9IGF3YWl0IHB1YlxuXHRcdFx0XHQubXVsdGkoIF8ubWFwKGl0ZW1zLCAoaXRlbSkgPT4gWydnZXQnLGBzdG9jazoke2l0ZW0uc3ltYm9sfTpsYXN0RGF0YUF0YF0pKVxuXHRcdFx0XHQuZXhlY0FzeW5jKClcblx0XHRcdFx0XG5cblx0XHRcdC8vIE9ubHkgbGV0IHRocm91Z2ggaXRlbXMgd2hvc2UgdGltZSBoYXMgY2hhbmdlZC5cblx0XHRcdGl0ZW1zID0gXy5yZWplY3QoaXRlbXMsIChpdGVtLGkpID0+IGl0ZW0uZGF0ZSA9PSBsYXN0RGF0YUZvclN5bWJvbHNbaV0gKVxuXG5cdFx0XHQvKlxuXHRcdFx0Ly8gQ2hlY2sgdGhlIGxhc3QgdGltZSB0aGUgZGF0YSB3YXMgY2hhbmdlZFxuXHRcdFx0bGV0IGxhc3REYXRhVGltZSA9IGF3YWl0IHB1Yi5oZ2V0QXN5bmMoJ3N0YXR1cycsJ2xhc3REYXRhVGltZScpO1xuXHRcdFx0aWYoIG1vbWVudChjdXJyZW50RGF0YVRpbWUpLmRpZmYobGFzdERhdGFUaW1lLCdtaW51dGVzJykgPiA1ICl7XG5cdFx0XHRcdHJldHVybiB0aGlzLnVwZGF0ZVN0YXR1cyh7XG5cdFx0XHRcdFx0aXNDbG9zZWQ6IHRydWVcblx0XHRcdFx0fSlcblx0XHRcdFx0XG5cdFx0XHR9XG5cdFx0XHQqL1xuXG5cdFx0XHR0aGlzLnVwZGF0ZVN0YXR1cyh7XG5cdFx0XHRcdGlzQ2xvc2VkOiBmYWxzZSxcblx0XHRcdFx0bGFzdERhdGFUaW1lOiBjdXJyZW50RGF0YVRpbWVcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiggISBpdGVtcy5sZW5ndGgpIHJldHVybjtcblxuXHRcdFx0bGV0IG11bHRpID0gcHViLm11bHRpKCk7XG5cblx0XHRcdF8uZWFjaChpdGVtcywgKGl0ZW0pID0+IHtcblx0XHRcdFx0bGV0IHVuaXhUaW1lID0gbmV3IERhdGUoaXRlbS5kYXRlKS5nZXRUaW1lKCk7XG5cdFx0XHRcdGxldCBpdGVtS2V5ID0gdXVpZC52NCgpO1xuXHRcdFx0XHRtdWx0aS5zZXQoYHN0b2NrOiR7aXRlbS5zeW1ib2x9Omxhc3REYXRhQXRgLCBpdGVtLmRhdGUpXG5cdFx0XHRcdG11bHRpLmhtc2V0KGBzdG9jazoke2l0ZW1LZXl9YCxpdGVtKTtcblx0XHRcdFx0bXVsdGkuemFkZChgc3RvY2s6JHtpdGVtLnN5bWJvbH06bGF0ZXN0YCwgdW5peFRpbWUsIGl0ZW1LZXkpXG5cdFx0XHR9KTtcblx0XHRcdFxuXHRcdFx0bXVsdGkuZXhlYygpXG5cdFx0XHR0aGlzLmlvLmVtaXQoJ3N0b2NrczpkYXRhJywgaXRlbXMpXG5cdFx0fSlcblx0fVxuXG5cdHVwZGF0ZVN0YXR1cyhzdGF0dXMpe1xuXHRcdGxldCBuZXdTdGF0dXMgPSB7XG5cdFx0XHRsYXN0RmV0Y2g6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcblx0XHRcdGhlYWx0aDogJ29rJyxcblx0XHRcdGVycm9yOiAnJyxcblx0XHRcdC4uLnN0YXR1c1xuXHRcdH07XG5cblx0XHQvLyBTZXQgdGhlIG5ldyBzdGF0dXMgYW5kIGltbWVkaWF0ZWx5IHJldHJpZXZlIGl0ICh0byBzZW5kIGZ1bGwgc3RhdHVzKS5cblx0XHRwdWIuaG1zZXRBc3luYygnc3RhdHVzJyxuZXdTdGF0dXMpLnRoZW4oICgpPT57XG5cdFx0XHRyZXR1cm4gcHViLmhnZXRhbGxBc3luYygnc3RhdHVzJylcblx0XHR9KS50aGVuKCAoc3RhdHVzKSA9PlxuXHRcdFx0dGhpcy5pby5lbWl0KCdzdGF0dXMnLHN0YXR1cylcblx0XHQpO1xuXHR9XG5cblx0Z2V0SGlzdG9yeSgpe1xuXHRcdGxldCBjb21tYW5kcyA9IF8ubWFwKCBwcm9jZXNzLmVudi5TVE9DS19TWU1CT0xTLnNwbGl0KCcsJyksIChzeW1ib2wpID0+IFxuXHRcdFx0Wyd6cmFuZ2UnLGBzdG9jazoke3N5bWJvbH06bGF0ZXN0YCwtMzAsLTFdXG5cdFx0KTtcblxuXHRcdHJldHVybiBwdWIubXVsdGkoY29tbWFuZHMpLmV4ZWNBc3luYygpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cyl7XG5cdFx0XHRsZXQga2V5cyA9IF8uZmxhdHRlbihyZXN1bHRzKTtcblx0XHRcdHJldHVybiBwdWIubXVsdGkoXG5cdFx0XHRcdF8ubWFwKGtleXMsIChrZXkpID0+IFsnaGdldGFsbCcsIGBzdG9jazoke2tleX1gXSApXG5cdFx0XHQpLmV4ZWNBc3luYygpXG5cblx0XHR9KVxuXHR9XG59XG5cblxuZnVuY3Rpb24gcmVnaXN0ZXIoc2VydmVyLCBvcHRpb25zLCBuZXh0KXtcdFxuXHR0cnkge1xuXHRcdG5ldyBTdG9ja3NTb2NrZXQoc2VydmVyLmxpc3RlbmVyKTtcblx0fSBjYXRjaCAoZXJyKXtcblx0XHRjb25zb2xlLmxvZyhlcnIpXG5cdH1cblx0Y29uc29sZS5sb2coJ1NvY2tldElPIGF0dGFjaGVkLicpO1xuXHRuZXh0KCk7XG59XG5cbnJlZ2lzdGVyLmF0dHJpYnV0ZXMgPSB7XG5cdG5hbWU6ICdzdG9jay1zb2NrZXQnXG59XG5cbmV4cG9ydCBkZWZhdWx0IHsgcmVnaXN0ZXIgfSJdfQ==