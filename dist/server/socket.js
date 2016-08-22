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

var ticksWithoutData = 0;
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

							if (items.length) {
								_context2.next = 11;
								break;
							}

							ticksWithoutData++;
							return _context2.abrupt('return', _this.updateStatus({
								isClosed: ticksWithoutData >= 4 ? true : false,
								lastDataTime: currentDataTime
							}));

						case 11:

							// We have changed items and we're good to go!
							ticksWithoutData = 0;
							_this.updateStatus({
								isClosed: false,
								lastDataTime: currentDataTime
							});

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

						case 17:
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvc29ja2V0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0FBRUEsSUFBSSxtQkFBbUIsQ0FBdkI7QUFDQSxJQUFNLFNBQVM7QUFDZCxJQUFFLFFBRFk7QUFFZCxRQUFNLFFBRlE7QUFHZCxTQUFRLGtCQUhNO0FBSWQsSUFBRyxTQUpXO0FBS2QsU0FBUTtBQUxNLENBQWY7O0lBUU0sWTtBQUNMLHVCQUFZLE1BQVosRUFBbUI7QUFBQTs7QUFBQTs7QUFDbEIsT0FBSyxFQUFMLEdBQVUsc0JBQVMsTUFBVCxDQUFWOztBQUVBLE9BQUssRUFBTCxDQUFRLEVBQVIsQ0FBVyxZQUFYLEVBQXlCLGlCQUFPLE1BQVA7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ3hCLGNBQU8sSUFBUCxDQUFZLFNBQVosRUFBdUIsYUFBdkI7O0FBRHdCO0FBQUEsdUNBSVQsV0FBSSxZQUFKLENBQWlCLFFBQWpCLENBSlM7O0FBQUE7QUFBQTtBQUFBO0FBQUEsdUNBS1IsTUFBSyxVQUFMLEVBTFE7O0FBQUE7QUFBQTtBQUdwQixXQUhvQjtBQUl2QixjQUp1QjtBQUt2QixlQUx1QjtBQUFBOzs7QUFReEIsY0FBTyxJQUFQLENBQVksUUFBWixFQUFzQixLQUFLLE1BQTNCO0FBQ0EsY0FBTyxJQUFQLENBQVksZ0JBQVosRUFBOEIsS0FBSyxPQUFuQzs7QUFUd0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FBekI7O0FBWUEseUJBQU8sRUFBUCxDQUFVLE9BQVYsRUFBbUIsVUFBQyxLQUFELEVBQVc7QUFDN0IsT0FBSSxVQUFVLHNCQUFkOztBQUVBLFdBQU8sTUFBTSxXQUFiO0FBQ0M7QUFDQyxlQUFVLG9DQUFWO0FBQ0E7QUFDRDtBQUNDLDJFQUFtRSxNQUFNLE9BQXpFO0FBQ0E7QUFDRDtBQUNDLGVBQVUs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Ijoic29ja2V0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNvY2tldElPIGZyb20gJ3NvY2tldC5pbyc7XG5pbXBvcnQgYmx1ZWJpcmQgZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0IHN0b2NrcyBmcm9tICcuL2xpYi9zdG9jay1zZXJ2aWNlJztcbmltcG9ydCB7IHB1Yiwgc3ViIH0gZnJvbSAnLi9saWIvcmVkaXMnO1xuaW1wb3J0IHV1aWQgZnJvbSAndXVpZCc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgUmVxdWVzdEVycm9yLCBTdGF0dXNDb2RlRXJyb3IgfSBmcm9tICdyZXF1ZXN0LXByb21pc2UvZXJyb3JzJztcbmltcG9ydCBtb21lbnQgZnJvbSAnbW9tZW50JztcblxudmFyIHRpY2tzV2l0aG91dERhdGEgPSAwO1xuY29uc3Qga2V5TWFwID0ge1xuXHR0OidzeW1ib2wnLFxuXHRjX2ZpeDonY2hhbmdlJyxcblx0Y3BfZml4OiAnY2hhbmdlUGVyY2VudGFnZScsXG5cdGw6ICdjdXJyZW50Jyxcblx0bHRfZHRzOiAnZGF0ZSdcbn07XG5cbmNsYXNzIFN0b2Nrc1NvY2tldCB7XG5cdGNvbnN0cnVjdG9yKHNlcnZlcil7XG5cdFx0dGhpcy5pbyA9IFNvY2tldElPKHNlcnZlcilcblxuXHRcdHRoaXMuaW8ub24oJ2Nvbm5lY3Rpb24nLCBhc3luYyAoc29ja2V0KSA9Pntcblx0XHRcdHNvY2tldC5lbWl0KCdtZXNzYWdlJywgJ2hlbGxvIHVzZXIhJylcblxuXHRcdFx0bGV0IGRhdGEgPSB7XG5cdFx0XHRcdHN0YXR1czogYXdhaXQgcHViLmhnZXRhbGxBc3luYygnc3RhdHVzJyksXG5cdFx0XHRcdGhpc3Rvcnk6IGF3YWl0IHRoaXMuZ2V0SGlzdG9yeSgpXG5cdFx0XHR9XG5cblx0XHRcdHNvY2tldC5lbWl0KCdzdGF0dXMnLCBkYXRhLnN0YXR1cyk7XG5cdFx0XHRzb2NrZXQuZW1pdCgnc3RvY2tzOmhpc3RvcnknLCBkYXRhLmhpc3RvcnkpXG5cdFx0fSk7XG5cblx0XHRzdG9ja3Mub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG5cdFx0XHRsZXQgbWVzc2FnZSA9ICdTb21lIGVycm9yIGhhcHBlbmVkISc7XG5cblx0XHRcdHN3aXRjaChlcnJvci5jb25zdHJ1Y3Rvcil7XG5cdFx0XHRcdGNhc2UgU3RhdHVzQ29kZUVycm9yOlxuXHRcdFx0XHRcdG1lc3NhZ2UgPSAnVGhlIHNlcnZpY2UgQVBJIHJldHVybmVkIGFuIGVycm9yLic7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgUmVxdWVzdEVycm9yOlxuXHRcdFx0XHRcdG1lc3NhZ2UgPSBgVGhlcmUgd2FzIGFuIGludGVybmFsIHByb2JsZW0gd2l0aCB0aGUgZGF0YSByZXF1ZXN0OiAnJHtlcnJvci5tZXNzYWdlfSdgO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlIHx8IGVycm9yXG5cdFx0XHR9XG5cblx0XHRcdHRoaXMudXBkYXRlU3RhdHVzKHtcblx0XHRcdFx0aGVhbHRoOiAnZXJyb3InLFxuXHRcdFx0XHRlcnJvcjogbWVzc2FnZVxuXHRcdFx0fSk7XG5cdFx0fSlcblxuXHRcdHN0b2Nrcy5vbignZGF0YScsIGFzeW5jIChkYXRhKSA9PiB7XG5cdFx0XHQvLyBJZiB0aGVyZSBhcmUgbm8gaXRlbXMsIHRoZXJlJ3Mgc29tZXRoaW5nIHdyb25nISBOb3RpZnkgdGhlIGNsaWVudFxuXHRcdFx0aWYoICEgZGF0YS5sZW5ndGggKSByZXR1cm4gdGhpcy51cGRhdGVTdGF0dXMoe1xuXHRcdFx0XHRlcnJvcjogJ05vIGRhdGEgaW4gc2VydmljZS4nLFxuXHRcdFx0XHRoZWFsdGg6ICdlcnJvcidcblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBOb3JtYWxpemUgZGF0YSBhbmQgcGljayBvbmx5IHRoZSBuZWNlc3Nhcnlcblx0XHRcdGxldCBpdGVtcyA9IF8ubWFwKGRhdGEsIChyb3cpID0+IHtcblx0XHRcdFx0bGV0IHJlc3VsdCA9IF8ucGljayhyb3csIF8ua2V5cyhrZXlNYXApKVxuXHRcdFx0XHRyZXN1bHQgPSBfLm1hcEtleXMocmVzdWx0LCAodmFsLGtleSkgPT4ga2V5TWFwW2tleV0pO1xuXHRcdFx0XHRyZXN1bHQuZGF0ZSA9IG1vbWVudChyZXN1bHQuZGF0ZSkuc3RhcnRPZignbWludXRlJykudG9JU09TdHJpbmcoKTtcblx0XHRcdFx0cmV0dXJuIHJlc3VsdFxuXHRcdFx0fSk7XG5cblx0XHRcdGxldCBjdXJyZW50RGF0YVRpbWUgPSBpdGVtc1swXS5kYXRlO1xuXG5cdFx0XHRsZXQgbGFzdERhdGFGb3JTeW1ib2xzID0gYXdhaXQgcHViXG5cdFx0XHRcdC5tdWx0aSggXy5tYXAoaXRlbXMsIChpdGVtKSA9PiBbJ2dldCcsYHN0b2NrOiR7aXRlbS5zeW1ib2x9Omxhc3REYXRhQXRgXSkpXG5cdFx0XHRcdC5leGVjQXN5bmMoKVxuXHRcdFx0XHRcblxuXHRcdFx0Ly8gT25seSBsZXQgdGhyb3VnaCBpdGVtcyB3aG9zZSB0aW1lIGhhcyBjaGFuZ2VkLlxuXHRcdFx0aXRlbXMgPSBfLnJlamVjdChpdGVtcywgKGl0ZW0saSkgPT4gaXRlbS5kYXRlID09IGxhc3REYXRhRm9yU3ltYm9sc1tpXSApXG5cblx0XHRcdGlmKCAhIGl0ZW1zLmxlbmd0aCApIHtcblx0XHRcdFx0dGlja3NXaXRob3V0RGF0YSsrO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy51cGRhdGVTdGF0dXMoe1xuXHRcdFx0XHRcdGlzQ2xvc2VkOiB0aWNrc1dpdGhvdXREYXRhID49IDQgPyB0cnVlIDogZmFsc2UsXG5cdFx0XHRcdFx0bGFzdERhdGFUaW1lOiBjdXJyZW50RGF0YVRpbWVcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblxuXHRcdFx0Ly8gV2UgaGF2ZSBjaGFuZ2VkIGl0ZW1zIGFuZCB3ZSdyZSBnb29kIHRvIGdvIVxuXHRcdFx0dGlja3NXaXRob3V0RGF0YSA9IDA7XG5cdFx0XHR0aGlzLnVwZGF0ZVN0YXR1cyh7XG5cdFx0XHRcdGlzQ2xvc2VkOiBmYWxzZSxcblx0XHRcdFx0bGFzdERhdGFUaW1lOiBjdXJyZW50RGF0YVRpbWVcblx0XHRcdH0pO1xuXHRcdFx0XG5cblx0XHRcdGxldCBtdWx0aSA9IHB1Yi5tdWx0aSgpO1xuXG5cdFx0XHRfLmVhY2goaXRlbXMsIChpdGVtKSA9PiB7XG5cdFx0XHRcdGxldCB1bml4VGltZSA9IG5ldyBEYXRlKGl0ZW0uZGF0ZSkuZ2V0VGltZSgpO1xuXHRcdFx0XHRsZXQgaXRlbUtleSA9IHV1aWQudjQoKTtcblx0XHRcdFx0bXVsdGkuc2V0KGBzdG9jazoke2l0ZW0uc3ltYm9sfTpsYXN0RGF0YUF0YCwgaXRlbS5kYXRlKVxuXHRcdFx0XHRtdWx0aS5obXNldChgc3RvY2s6JHtpdGVtS2V5fWAsaXRlbSk7XG5cdFx0XHRcdG11bHRpLnphZGQoYHN0b2NrOiR7aXRlbS5zeW1ib2x9OmxhdGVzdGAsIHVuaXhUaW1lLCBpdGVtS2V5KVxuXHRcdFx0fSk7XG5cdFx0XHRcblx0XHRcdG11bHRpLmV4ZWMoKVxuXHRcdFx0dGhpcy5pby5lbWl0KCdzdG9ja3M6ZGF0YScsIGl0ZW1zKVxuXHRcdH0pXG5cdH1cblxuXHR1cGRhdGVTdGF0dXMoc3RhdHVzKXtcblx0XHRsZXQgbmV3U3RhdHVzID0ge1xuXHRcdFx0bGFzdEZldGNoOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG5cdFx0XHRoZWFsdGg6ICdvaycsXG5cdFx0XHRlcnJvcjogJycsXG5cdFx0XHQuLi5zdGF0dXNcblx0XHR9O1xuXG5cdFx0Ly8gU2V0IHRoZSBuZXcgc3RhdHVzIGFuZCBpbW1lZGlhdGVseSByZXRyaWV2ZSBpdCAodG8gc2VuZCBmdWxsIHN0YXR1cykuXG5cdFx0cHViLmhtc2V0QXN5bmMoJ3N0YXR1cycsbmV3U3RhdHVzKS50aGVuKCAoKT0+e1xuXHRcdFx0cmV0dXJuIHB1Yi5oZ2V0YWxsQXN5bmMoJ3N0YXR1cycpXG5cdFx0fSkudGhlbiggKHN0YXR1cykgPT5cblx0XHRcdHRoaXMuaW8uZW1pdCgnc3RhdHVzJyxzdGF0dXMpXG5cdFx0KTtcblx0fVxuXG5cdGdldEhpc3RvcnkoKXtcblx0XHRsZXQgY29tbWFuZHMgPSBfLm1hcCggcHJvY2Vzcy5lbnYuU1RPQ0tfU1lNQk9MUy5zcGxpdCgnLCcpLCAoc3ltYm9sKSA9PiBcblx0XHRcdFsnenJhbmdlJyxgc3RvY2s6JHtzeW1ib2x9OmxhdGVzdGAsLTMwLC0xXVxuXHRcdCk7XG5cblx0XHRyZXR1cm4gcHViLm11bHRpKGNvbW1hbmRzKS5leGVjQXN5bmMoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpe1xuXHRcdFx0bGV0IGtleXMgPSBfLmZsYXR0ZW4ocmVzdWx0cyk7XG5cdFx0XHRyZXR1cm4gcHViLm11bHRpKFxuXHRcdFx0XHRfLm1hcChrZXlzLCAoa2V5KSA9PiBbJ2hnZXRhbGwnLCBgc3RvY2s6JHtrZXl9YF0gKVxuXHRcdFx0KS5leGVjQXN5bmMoKVxuXG5cdFx0fSlcblx0fVxufVxuXG5cbmZ1bmN0aW9uIHJlZ2lzdGVyKHNlcnZlciwgb3B0aW9ucywgbmV4dCl7XHRcblx0dHJ5IHtcblx0XHRuZXcgU3RvY2tzU29ja2V0KHNlcnZlci5saXN0ZW5lcik7XG5cdH0gY2F0Y2ggKGVycil7XG5cdFx0Y29uc29sZS5sb2coZXJyKVxuXHR9XG5cdGNvbnNvbGUubG9nKCdTb2NrZXRJTyBhdHRhY2hlZC4nKTtcblx0bmV4dCgpO1xufVxuXG5yZWdpc3Rlci5hdHRyaWJ1dGVzID0ge1xuXHRuYW1lOiAnc3RvY2stc29ja2V0J1xufVxuXG5leHBvcnQgZGVmYXVsdCB7IHJlZ2lzdGVyIH0iXX0=