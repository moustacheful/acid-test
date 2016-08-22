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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var keyMap = {
	t: 'symbol',
	c_fix: 'change',
	cp_fix: 'changePercentage',
	l_cur: 'current',
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
							socket.emit('stocks:data', data.history);

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
			var items, currentDataTime, lastDataTime, multi;
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
								return _lodash2.default.mapKeys(result, function (val, key) {
									return keyMap[key];
								});
							});

							// Check the last time the data was changed

							currentDataTime = items[0].date;
							_context2.next = 6;
							return regeneratorRuntime.awrap(_redis.pub.hgetAsync('status', 'lastDataTime'));

						case 6:
							lastDataTime = _context2.sent;

							if (!(lastDataTime == currentDataTime)) {
								_context2.next = 9;
								break;
							}

							return _context2.abrupt('return', _this.updateStatus({
								isClosed: true
							}));

						case 9:
							multi = _redis.pub.multi();


							_lodash2.default.each(items, function (item) {
								var unixTime = new Date(item.date).getTime();
								var itemKey = _uuid2.default.v4();
								multi.hmset('stock:' + itemKey, item);
								multi.zadd('stock:' + item.symbol + ':latest', unixTime, itemKey);
							});

							multi.execAsync();

							_this.io.emit('stocks:data', items);
							_this.updateStatus({
								isClosed: false,
								lastDataTime: items[0].date
							});

						case 14:
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
				return ['zrange', 'stock:' + symbol + ':latest', 0, 10];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvc29ja2V0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUdBLElBQU0sU0FBUztBQUNkLElBQUUsUUFEWTtBQUVkLFFBQU0sUUFGUTtBQUdkLFNBQVEsa0JBSE07QUFJZCxRQUFPLFNBSk87QUFLZCxTQUFRO0FBTE0sQ0FBZjs7SUFRTSxZO0FBQ0wsdUJBQVksTUFBWixFQUFtQjtBQUFBOztBQUFBOztBQUNsQixPQUFLLEVBQUwsR0FBVSxzQkFBUyxNQUFULENBQVY7O0FBRUEsT0FBSyxFQUFMLENBQVEsRUFBUixDQUFXLFlBQVgsRUFBeUIsaUJBQU8sTUFBUDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDeEIsY0FBTyxJQUFQLENBQVksU0FBWixFQUF1QixhQUF2Qjs7QUFEd0I7QUFBQSx1Q0FJVCxXQUFJLFlBQUosQ0FBaUIsUUFBakIsQ0FKUzs7QUFBQTtBQUFBO0FBQUE7QUFBQSx1Q0FLUixNQUFLLFVBQUwsRUFMUTs7QUFBQTtBQUFBO0FBR3BCLFdBSG9CO0FBSXZCLGNBSnVCO0FBS3ZCLGVBTHVCO0FBQUE7OztBQVF4QixjQUFPLElBQVAsQ0FBWSxRQUFaLEVBQXNCLEtBQUssTUFBM0I7QUFDQSxjQUFPLElBQVAsQ0FBWSxhQUFaLEVBQTJCLEtBQUssT0FBaEM7O0FBVHdCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEdBQXpCOztBQVlBLHlCQUFPLEVBQVAsQ0FBVSxPQUFWLEVBQW1CLFVBQUMsS0FBRCxFQUFXO0FBQzdCLE9BQUksVUFBVSxzQkFBZDs7QUFFQSxXQUFPLE1BQU0sV0FBYjtBQUNDO0FBQ0MsZUFBVSxvQ0FBVjtBQUNBO0FBQ0Q7QUFDQywyRUFBbUUsTUFBTSxPQUF6RTtBQUNBO0FBQ0Q7QUFDQyxlQUFVLE1BQU0sT0FBTixJQUFpQixLQUEzQjtBQVJGOztBQVdBLFNBQUssWUFBTCxDQUFrQjtBQUNqQixZQUFRLE9BRFM7QUFFakIsV0FBTztBQUZVLElBQWxCO0FBSUEsR0FsQkQ7O0FBb0JBLHlCQUFPLEVBQVAsQ0FBVSxNQUFWLEVBQWtCLGtCQUFPLElBQVA7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsV0FHWCxLQUFLLE1BSE07QUFBQTtBQUFBO0FBQUE7O0FBQUEseUNBR1UsTUFBSyxZQUFMLENBQWtCO0FBQzVDLGVBQU8scUJBRHFDO0FBRTVDLGdCQUFRO0FBRm9DLFFBQWxCLENBSFY7O0FBQUE7O0FBUWpCO0FBQ0ksWUFUYSxHQVNMLGlCQUFFLEdBQUYsQ0FBTSxJQUFOLEVBQVksVUFBQyxHQUFELEVBQVM7QUFDaEMsWUFBSSxTQUFTLGlCQUFFLElBQUYsQ0FBTyxHQUFQLEVBQVksaUJBQUUsSUFBRixDQUFPLE1BQVAsQ0FBWixDQUFiO0FBQ0EsZUFBTyxpQkFBRSxPQUFGLENBQVUsTUFBVixFQUFrQixVQUFDLEdBQUQsRUFBSyxHQUFMO0FBQUEsZ0JBQWEsT0FBTyxHQUFQLENBQWI7QUFBQSxTQUFsQixDQUFQO0FBQ0EsUUFIVyxDQVRLOztBQWNqQjs7QUFDSSxzQkFmYSxHQWVLLE1BQU0sQ0FBTixFQUFTLElBZmQ7QUFBQTtBQUFBLHVDQWdCUSxXQUFJLFNBQUosQ0FBYyxRQUFkLEVBQXVCLGNBQXZCLENBaEJSOztBQUFBO0FBZ0JiLG1CQWhCYTs7QUFBQSxhQWtCYixnQkFBZ0IsZUFsQkg7QUFBQTtBQUFBO0FBQUE7O0FBQUEseUNBa0I0QixNQUFLLFlBQUwsQ0FBa0I7QUFDOUQsa0JBQVU7QUFEb0QsUUFBbEIsQ0FsQjVCOztBQUFBO0FBc0JiLFlBdEJhLEdBc0JMLFdBQUksS0FBSixFQXRCSzs7O0FBd0JqQix3QkFBRSxJQUFGLENBQU8sS0FBUCxFQUFjLFVBQUMsSUFBRCxFQUFVO0FBQ3ZCLFlBQUksV0FBVyxJQUFJLElBQUosQ0FBUyxLQUFLLElBQWQsRUFBb0IsT0FBcEIsRUFBZjtBQUNBLFlBQUksVUFBVSxlQUFLLEVBQUwsRUFBZDtBQUNBLGNBQU0sS0FBTixZQUFxQixPQUFyQixFQUErQixJQUEvQjtBQUNBLGNBQU0sSUFBTixZQUFvQixLQUFLLE1BQXpCLGNBQTBDLFFBQTFDLEVBQW9ELE9BQXBEO0FBQ0EsUUFMRDs7QUFPQSxhQUFNLFNBQU47O0FBRUEsYUFBSyxFQUFMLENBQVEsSUFBUixDQUFhLGFBQWIsRUFBNEIsS0FBNUI7QUFDQSxhQUFLLFlBQUwsQ0FBa0I7QUFDakIsa0JBQVUsS0FETztBQUVqQixzQkFBYyxNQUFNLENBQU4sRUFBUztBQUZOLFFBQWxCOztBQWxDaUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FBbEI7QUF1Q0E7Ozs7K0JBRVksTSxFQUFPO0FBQUE7O0FBQ25CLE9BQUk7QUFDSCxlQUFXLElBQUksSUFBSixHQUFXLFdBQVgsRUFEUjtBQUVILFlBQVEsSUFGTDtBQUdILFdBQU87QUFISixNQUlBLE1BSkEsQ0FBSjs7QUFPQTtBQUNBLGNBQUksVUFBSixDQUFlLFFBQWYsRUFBd0IsU0FBeEIsRUFBbUMsSUFBbkMsQ0FBeUMsWUFBSTtBQUM1QyxXQUFPLFdBQUksWUFBSixDQUFpQixRQUFqQixDQUFQO0FBQ0EsSUFGRCxFQUVHLElBRkgsQ0FFUyxVQUFDLE1BQUQ7QUFBQSxXQUNSLE9BQUssRUFBTCxDQUFRLElBQVIsQ0FBYSxRQUFiLEVBQXNCLE1BQXRCLENBRFE7QUFBQSxJQUZUO0FBS0E7OzsrQkFFVztBQUNYLE9BQUksV0FBVyxpQkFBRSxHQUFGLENBQU8sUUFBUSxHQUFSLENBQVksYUFBWixDQUEwQixLQUExQixDQUFnQyxHQUFoQyxDQUFQLEVBQTZDLFVBQUMsTUFBRDtBQUFBLFdBQzNELENBQUMsUUFBRCxhQUFtQixNQUFuQixjQUFtQyxDQUFuQyxFQUFxQyxFQUFyQyxDQUQyRDtBQUFBLElBQTdDLENBQWY7O0FBSUEsVUFBTyxXQUFJLEtBQUosQ0FBVSxRQUFWLEVBQW9CLFNBQXBCLEdBQWdDLElBQWhDLENBQXFDLFVBQVMsT0FBVCxFQUFpQjtBQUM1RCxRQUFJLE9BQU8saUJBQUUsT0FBRixDQUFVLE9BQVYsQ0FBWDtBQUNBLFdBQU8sV0FBSSxLQUFKLENBQ04saUJBQUUsR0FBRixDQUFNLElBQU4sRUFBWSxVQUFDLEdBQUQ7QUFBQSxZQUFTLENBQUMsU0FBRCxhQUFxQixHQUFyQixDQUFUO0FBQUEsS0FBWixDQURNLEVBRUwsU0FGSyxFQUFQO0FBSUEsSUFOTSxDQUFQO0FBT0E7Ozs7OztBQUlGLFNBQVMsUUFBVCxDQUFrQixNQUFsQixFQUEwQixPQUExQixFQUFtQyxJQUFuQyxFQUF3QztBQUN2QyxLQUFJO0FBQ0gsTUFBSSxZQUFKLENBQWlCLE9BQU8sUUFBeEI7QUFDQSxFQUZELENBRUUsT0FBTyxHQUFQLEVBQVc7QUFDWixVQUFRLEdBQVIsQ0FBWSxHQUFaO0FBQ0E7QUFDRCxTQUFRLEdBQVIsQ0FBWSxvQkFBWjtBQUNBO0FBQ0E7O0FBRUQsU0FBUyxVQUFULEdBQXNCO0FBQ3JCLE9BQU07QUFEZSxDQUF0Qjs7a0JBSWUsRUFBRSxrQkFBRixFIiwiZmlsZSI6InNvY2tldC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTb2NrZXRJTyBmcm9tICdzb2NrZXQuaW8nO1xuaW1wb3J0IGJsdWViaXJkIGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCBzdG9ja3MgZnJvbSAnLi9saWIvc3RvY2stc2VydmljZSc7XG5pbXBvcnQgeyBwdWIsIHN1YiB9IGZyb20gJy4vbGliL3JlZGlzJztcbmltcG9ydCB1dWlkIGZyb20gJ3V1aWQnO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJ1xuaW1wb3J0IHsgUmVxdWVzdEVycm9yLCBTdGF0dXNDb2RlRXJyb3IgfSBmcm9tICdyZXF1ZXN0LXByb21pc2UvZXJyb3JzJztcblxuXG5jb25zdCBrZXlNYXAgPSB7XG5cdHQ6J3N5bWJvbCcsXG5cdGNfZml4OidjaGFuZ2UnLFxuXHRjcF9maXg6ICdjaGFuZ2VQZXJjZW50YWdlJyxcblx0bF9jdXI6ICdjdXJyZW50Jyxcblx0bHRfZHRzOiAnZGF0ZSdcbn07XG5cbmNsYXNzIFN0b2Nrc1NvY2tldCB7XG5cdGNvbnN0cnVjdG9yKHNlcnZlcil7XG5cdFx0dGhpcy5pbyA9IFNvY2tldElPKHNlcnZlcilcblxuXHRcdHRoaXMuaW8ub24oJ2Nvbm5lY3Rpb24nLCBhc3luYyAoc29ja2V0KSA9Pntcblx0XHRcdHNvY2tldC5lbWl0KCdtZXNzYWdlJywgJ2hlbGxvIHVzZXIhJylcblxuXHRcdFx0bGV0IGRhdGEgPSB7XG5cdFx0XHRcdHN0YXR1czogYXdhaXQgcHViLmhnZXRhbGxBc3luYygnc3RhdHVzJyksXG5cdFx0XHRcdGhpc3Rvcnk6IGF3YWl0IHRoaXMuZ2V0SGlzdG9yeSgpXG5cdFx0XHR9XG5cblx0XHRcdHNvY2tldC5lbWl0KCdzdGF0dXMnLCBkYXRhLnN0YXR1cyk7XG5cdFx0XHRzb2NrZXQuZW1pdCgnc3RvY2tzOmRhdGEnLCBkYXRhLmhpc3RvcnkpXG5cdFx0fSk7XG5cblx0XHRzdG9ja3Mub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG5cdFx0XHRsZXQgbWVzc2FnZSA9ICdTb21lIGVycm9yIGhhcHBlbmVkISc7XG5cblx0XHRcdHN3aXRjaChlcnJvci5jb25zdHJ1Y3Rvcil7XG5cdFx0XHRcdGNhc2UgU3RhdHVzQ29kZUVycm9yOlxuXHRcdFx0XHRcdG1lc3NhZ2UgPSAnVGhlIHNlcnZpY2UgQVBJIHJldHVybmVkIGFuIGVycm9yLic7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgUmVxdWVzdEVycm9yOlxuXHRcdFx0XHRcdG1lc3NhZ2UgPSBgVGhlcmUgd2FzIGFuIGludGVybmFsIHByb2JsZW0gd2l0aCB0aGUgZGF0YSByZXF1ZXN0OiAnJHtlcnJvci5tZXNzYWdlfSdgO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlIHx8IGVycm9yXG5cdFx0XHR9XG5cblx0XHRcdHRoaXMudXBkYXRlU3RhdHVzKHtcblx0XHRcdFx0aGVhbHRoOiAnZXJyb3InLFxuXHRcdFx0XHRlcnJvcjogbWVzc2FnZVxuXHRcdFx0fSk7XG5cdFx0fSlcblxuXHRcdHN0b2Nrcy5vbignZGF0YScsIGFzeW5jIChkYXRhKSA9PiB7XG5cblx0XHRcdC8vIElmIHRoZXJlIGFyZSBubyBpdGVtcywgdGhlcmUncyBzb21ldGhpbmcgd3JvbmchIE5vdGlmeSB0aGUgY2xpZW50XG5cdFx0XHRpZiggISBkYXRhLmxlbmd0aCApIHJldHVybiB0aGlzLnVwZGF0ZVN0YXR1cyh7XG5cdFx0XHRcdGVycm9yOiAnTm8gZGF0YSBpbiBzZXJ2aWNlLicsXG5cdFx0XHRcdGhlYWx0aDogJ2Vycm9yJ1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vIE5vcm1hbGl6ZSBkYXRhIGFuZCBwaWNrIG9ubHkgdGhlIG5lY2Vzc2FyeVxuXHRcdFx0bGV0IGl0ZW1zID0gXy5tYXAoZGF0YSwgKHJvdykgPT4ge1xuXHRcdFx0XHRsZXQgcmVzdWx0ID0gXy5waWNrKHJvdywgXy5rZXlzKGtleU1hcCkpXG5cdFx0XHRcdHJldHVybiBfLm1hcEtleXMocmVzdWx0LCAodmFsLGtleSkgPT4ga2V5TWFwW2tleV0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vIENoZWNrIHRoZSBsYXN0IHRpbWUgdGhlIGRhdGEgd2FzIGNoYW5nZWRcblx0XHRcdGxldCBjdXJyZW50RGF0YVRpbWUgPSBpdGVtc1swXS5kYXRlO1xuXHRcdFx0bGV0IGxhc3REYXRhVGltZSA9IGF3YWl0IHB1Yi5oZ2V0QXN5bmMoJ3N0YXR1cycsJ2xhc3REYXRhVGltZScpO1xuXHRcdFx0XG5cdFx0XHRpZiggbGFzdERhdGFUaW1lID09IGN1cnJlbnREYXRhVGltZSApIHJldHVybiB0aGlzLnVwZGF0ZVN0YXR1cyh7XG5cdFx0XHRcdGlzQ2xvc2VkOiB0cnVlXG5cdFx0XHR9KVxuXHRcdFx0XG5cdFx0XHRsZXQgbXVsdGkgPSBwdWIubXVsdGkoKTtcblxuXHRcdFx0Xy5lYWNoKGl0ZW1zLCAoaXRlbSkgPT4ge1xuXHRcdFx0XHRsZXQgdW5peFRpbWUgPSBuZXcgRGF0ZShpdGVtLmRhdGUpLmdldFRpbWUoKTtcblx0XHRcdFx0bGV0IGl0ZW1LZXkgPSB1dWlkLnY0KCk7XG5cdFx0XHRcdG11bHRpLmhtc2V0KGBzdG9jazoke2l0ZW1LZXl9YCxpdGVtKTtcblx0XHRcdFx0bXVsdGkuemFkZChgc3RvY2s6JHtpdGVtLnN5bWJvbH06bGF0ZXN0YCwgdW5peFRpbWUsIGl0ZW1LZXkpXG5cdFx0XHR9KTtcblx0XHRcdFxuXHRcdFx0bXVsdGkuZXhlY0FzeW5jKClcblxuXHRcdFx0dGhpcy5pby5lbWl0KCdzdG9ja3M6ZGF0YScsIGl0ZW1zKVxuXHRcdFx0dGhpcy51cGRhdGVTdGF0dXMoe1xuXHRcdFx0XHRpc0Nsb3NlZDogZmFsc2UsXG5cdFx0XHRcdGxhc3REYXRhVGltZTogaXRlbXNbMF0uZGF0ZVxuXHRcdFx0fSk7XG5cdFx0fSlcblx0fVxuXG5cdHVwZGF0ZVN0YXR1cyhzdGF0dXMpe1xuXHRcdGxldCBuZXdTdGF0dXMgPSB7XG5cdFx0XHRsYXN0RmV0Y2g6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcblx0XHRcdGhlYWx0aDogJ29rJyxcblx0XHRcdGVycm9yOiAnJyxcblx0XHRcdC4uLnN0YXR1c1xuXHRcdH07XG5cblx0XHQvLyBTZXQgdGhlIG5ldyBzdGF0dXMgYW5kIGltbWVkaWF0ZWx5IHJldHJpZXZlIGl0ICh0byBzZW5kIGZ1bGwgc3RhdHVzKS5cblx0XHRwdWIuaG1zZXRBc3luYygnc3RhdHVzJyxuZXdTdGF0dXMpLnRoZW4oICgpPT57XG5cdFx0XHRyZXR1cm4gcHViLmhnZXRhbGxBc3luYygnc3RhdHVzJylcblx0XHR9KS50aGVuKCAoc3RhdHVzKSA9PlxuXHRcdFx0dGhpcy5pby5lbWl0KCdzdGF0dXMnLHN0YXR1cylcblx0XHQpO1xuXHR9XG5cblx0Z2V0SGlzdG9yeSgpe1xuXHRcdGxldCBjb21tYW5kcyA9IF8ubWFwKCBwcm9jZXNzLmVudi5TVE9DS19TWU1CT0xTLnNwbGl0KCcsJyksIChzeW1ib2wpID0+IFxuXHRcdFx0Wyd6cmFuZ2UnLGBzdG9jazoke3N5bWJvbH06bGF0ZXN0YCwwLDEwXVxuXHRcdCk7XG5cblx0XHRyZXR1cm4gcHViLm11bHRpKGNvbW1hbmRzKS5leGVjQXN5bmMoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpe1xuXHRcdFx0bGV0IGtleXMgPSBfLmZsYXR0ZW4ocmVzdWx0cyk7XG5cdFx0XHRyZXR1cm4gcHViLm11bHRpKFxuXHRcdFx0XHRfLm1hcChrZXlzLCAoa2V5KSA9PiBbJ2hnZXRhbGwnLCBgc3RvY2s6JHtrZXl9YF0gKVxuXHRcdFx0KS5leGVjQXN5bmMoKVxuXG5cdFx0fSlcblx0fVxufVxuXG5cbmZ1bmN0aW9uIHJlZ2lzdGVyKHNlcnZlciwgb3B0aW9ucywgbmV4dCl7XHRcblx0dHJ5IHtcblx0XHRuZXcgU3RvY2tzU29ja2V0KHNlcnZlci5saXN0ZW5lcik7XG5cdH0gY2F0Y2ggKGVycil7XG5cdFx0Y29uc29sZS5sb2coZXJyKVxuXHR9XG5cdGNvbnNvbGUubG9nKCdTb2NrZXRJTyBhdHRhY2hlZC4nKTtcblx0bmV4dCgpO1xufVxuXG5yZWdpc3Rlci5hdHRyaWJ1dGVzID0ge1xuXHRuYW1lOiAnc3RvY2stc29ja2V0J1xufVxuXG5leHBvcnQgZGVmYXVsdCB7IHJlZ2lzdGVyIH0iXX0=