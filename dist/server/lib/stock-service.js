'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _retry = require('async/retry');

var _retry2 = _interopRequireDefault(_retry);

var _forever = require('async/forever');

var _forever2 = _interopRequireDefault(_forever);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _errors = require('request-promise/errors');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _events = require('events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var StockService = function (_EventEmitter) {
	_inherits(StockService, _EventEmitter);

	function StockService(symbols) {
		_classCallCheck(this, StockService);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(StockService).call(this));

		_this.symbols = [];
		_this.addSymbols(symbols);
		_this.retryableGet = _this.retryableGet.bind(_this);
		return _this;
	}

	_createClass(StockService, [{
		key: 'setSymbols',
		value: function setSymbols(symbols) {
			this.symbols = _lodash2.default.uniq(symbols);
			this.requestUrl = 'http://finance.google.com/finance/info?client=ig&q=' + this.symbols.join(',');
			console.log('Now following:', this.symbols);
		}
	}, {
		key: 'removeSymbol',
		value: function removeSymbol(symbol) {
			var symbols = _lodash2.default.pull(this.symbols);
			this.setSymbols(symbols);
		}
	}, {
		key: 'addSymbols',
		value: function addSymbols(newSymbols) {
			if (!_lodash2.default.isArray(newSymbols)) {
				newSymbols = newSymbols.split(',');
			}
			this.setSymbols([].concat(_toConsumableArray(this.symbols), _toConsumableArray(newSymbols)));
		}
	}, {
		key: 'get',
		value: function get() {
			// Add a 10% failure rate chance
			if (Math.random() < .1) return _bluebird2.default.reject(new Error('How unfortunate! The API Request Failed'));

			return (0, _requestPromise2.default)(this.requestUrl).then(function (response) {
				return JSON.parse(response.replace('// ', ''));
			});
		}
	}, {
		key: 'retryableGet',
		value: function retryableGet(next) {
			var _this2 = this;

			(0, _retry2.default)({ times: 5, interval: 300 }, function (callback) {
				_this2.get().then(function (response) {
					return callback(null, response);
				}).catch(callback);
			}, function (err, response) {
				if (err) {
					console.log('Iteration failed: All retries rejected.', err.message);
					_this2.emit('error', err);
				} else {
					console.log('Iteration succeeded with data length:', response.length);
					_this2.emit('data', response);
				}

				// Continue anyway
				setTimeout(next, .25 * 60 * 1000);
			});
		}
	}, {
		key: 'start',
		value: function start() {
			(0, _forever2.default)(this.retryableGet);
		}
	}]);

	return StockService;
}(_events.EventEmitter);

exports.default = new StockService(process.env.STOCK_SYMBOLS);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2ZXIvbGliL3N0b2NrLXNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7Ozs7OztJQUVNLFk7OztBQUNMLHVCQUFZLE9BQVosRUFBb0I7QUFBQTs7QUFBQTs7QUFFbkIsUUFBSyxPQUFMLEdBQWUsRUFBZjtBQUNBLFFBQUssVUFBTCxDQUFnQixPQUFoQjtBQUNBLFFBQUssWUFBTCxHQUFvQixNQUFLLFlBQUwsQ0FBa0IsSUFBbEIsT0FBcEI7QUFKbUI7QUFLbkI7Ozs7NkJBRVUsTyxFQUFRO0FBQ2xCLFFBQUssT0FBTCxHQUFlLGlCQUFFLElBQUYsQ0FBTyxPQUFQLENBQWY7QUFDQSxRQUFLLFVBQUwsMkRBQXdFLEtBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsR0FBbEIsQ0FBeEU7QUFDQSxXQUFRLEdBQVIsQ0FBWSxnQkFBWixFQUE2QixLQUFLLE9BQWxDO0FBQ0E7OzsrQkFFWSxNLEVBQU87QUFDbkIsT0FBSSxVQUFVLGlCQUFFLElBQUYsQ0FBTyxLQUFLLE9BQVosQ0FBZDtBQUNBLFFBQUssVUFBTCxDQUFnQixPQUFoQjtBQUNBOzs7NkJBRVUsVSxFQUFXO0FBQ3JCLE9BQUcsQ0FBQyxpQkFBRSxPQUFGLENBQVUsVUFBVixDQUFKLEVBQTBCO0FBQ3pCLGlCQUFhLFdBQVcsS0FBWCxDQUFpQixHQUFqQixDQUFiO0FBQ0E7QUFDRCxRQUFLLFVBQUwsOEJBQXFCLEtBQUssT0FBMUIsc0JBQXVDLFVBQXZDO0FBQ0E7Ozt3QkFFSTtBQUNKO0FBQ0EsT0FBSSxLQUFLLE1BQUwsS0FBZ0IsRUFBcEIsRUFDQyxPQUFPLG1CQUFRLE1BQVIsQ0FBZSxJQUFJLEtBQUosQ0FBVSx5Q0FBVixDQUFmLENBQVA7O0FBRUQsVUFBTyw4QkFBUSxLQUFLLFVBQWIsRUFDTCxJQURLLENBQ0MsVUFBQyxRQUFEO0FBQUEsV0FBYyxLQUFLLEtBQUwsQ0FBVyxTQUFTLE9BQVQsQ0FBaUIsS0FBakIsRUFBdUIsRUFBdkIsQ0FBWCxDQUFkO0FBQUEsSUFERCxDQUFQO0FBRUE7OzsrQkFFWSxJLEVBQUs7QUFBQTs7QUFDakIsd0JBQU0sRUFBRSxPQUFPLENBQVQsRUFBWSxVQUFVLEdBQXRCLEVBQU4sRUFBbUMsVUFBQyxRQUFELEVBQWM7QUFDL0MsV0FBSyxHQUFMLEdBQ0UsSUFERixDQUNRLFVBQUMsUUFBRDtBQUFBLFlBQWMsU0FBUyxJQUFULEVBQWMsUUFBZCxDQUFkO0FBQUEsS0FEUixFQUVFLEtBRkYsQ0FFUSxRQUZSO0FBR0EsSUFKRixFQUlJLFVBQUMsR0FBRCxFQUFLLFFBQUwsRUFBa0I7QUFDcEIsUUFBRyxHQUFILEVBQU87QUFDTixhQUFRLEdBQVIsQ0FBWSx5Q0FBWixFQUF1RCxJQUFJLE9BQTNEO0FBQ0EsWUFBSyxJQUFMLENBQVUsT0FBVixFQUFtQixHQUFuQjtBQUNBLEtBSEQsTUFHSztBQUNKLGFBQVEsR0FBUixDQUFZLHVDQUFaLEVBQXFELFNBQVMsTUFBOUQ7QUFDQSxZQUFLLElBQUwsQ0FBVSxNQUFWLEVBQWtCLFFBQWxCO0FBQ0E7O0FBRUQ7QUFDQSxlQUFXLElBQVgsRUFBaUIsTUFBTSxFQUFOLEdBQVcsSUFBNUI7QUFDQSxJQWZGO0FBaUJBOzs7MEJBRU07QUFDTiwwQkFBUSxLQUFLLFlBQWI7QUFDQTs7Ozs7O2tCQUdhLElBQUksWUFBSixDQUFpQixRQUFRLEdBQVIsQ0FBWSxhQUE3QixDIiwiZmlsZSI6InN0b2NrLXNlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcmV0cnkgZnJvbSAnYXN5bmMvcmV0cnknO1xuaW1wb3J0IGZvcmV2ZXIgZnJvbSAnYXN5bmMvZm9yZXZlcic7XG5pbXBvcnQgcmVxdWVzdCBmcm9tICdyZXF1ZXN0LXByb21pc2UnO1xuaW1wb3J0IHsgUmVxdWVzdEVycm9yLCBTdGF0dXNDb2RlRXJyb3IgfSBmcm9tICdyZXF1ZXN0LXByb21pc2UvZXJyb3JzJ1xuaW1wb3J0IFByb21pc2UgZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cydcblxuY2xhc3MgU3RvY2tTZXJ2aWNlIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcblx0Y29uc3RydWN0b3Ioc3ltYm9scyl7XG5cdFx0c3VwZXIoKVxuXHRcdHRoaXMuc3ltYm9scyA9IFtdXG5cdFx0dGhpcy5hZGRTeW1ib2xzKHN5bWJvbHMpO1xuXHRcdHRoaXMucmV0cnlhYmxlR2V0ID0gdGhpcy5yZXRyeWFibGVHZXQuYmluZCh0aGlzKVxuXHR9XG5cdFxuXHRzZXRTeW1ib2xzKHN5bWJvbHMpe1xuXHRcdHRoaXMuc3ltYm9scyA9IF8udW5pcShzeW1ib2xzKVxuXHRcdHRoaXMucmVxdWVzdFVybCA9IGBodHRwOi8vZmluYW5jZS5nb29nbGUuY29tL2ZpbmFuY2UvaW5mbz9jbGllbnQ9aWcmcT0ke3RoaXMuc3ltYm9scy5qb2luKCcsJyl9YDtcblx0XHRjb25zb2xlLmxvZygnTm93IGZvbGxvd2luZzonLHRoaXMuc3ltYm9scyk7XG5cdH1cblxuXHRyZW1vdmVTeW1ib2woc3ltYm9sKXtcblx0XHRsZXQgc3ltYm9scyA9IF8ucHVsbCh0aGlzLnN5bWJvbHMpO1xuXHRcdHRoaXMuc2V0U3ltYm9scyhzeW1ib2xzKTtcblx0fVxuXHRcblx0YWRkU3ltYm9scyhuZXdTeW1ib2xzKXtcblx0XHRpZighXy5pc0FycmF5KG5ld1N5bWJvbHMpKXtcblx0XHRcdG5ld1N5bWJvbHMgPSBuZXdTeW1ib2xzLnNwbGl0KCcsJylcblx0XHR9XG5cdFx0dGhpcy5zZXRTeW1ib2xzKFsgLi4udGhpcy5zeW1ib2xzLCAgLi4ubmV3U3ltYm9scyBdKTtcblx0fVxuXG5cdGdldCgpe1xuXHRcdC8vIEFkZCBhIDEwJSBmYWlsdXJlIHJhdGUgY2hhbmNlXG5cdFx0aWYoIE1hdGgucmFuZG9tKCkgPCAuMSApXG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdIb3cgdW5mb3J0dW5hdGUhIFRoZSBBUEkgUmVxdWVzdCBGYWlsZWQnKSk7XG5cblx0XHRyZXR1cm4gcmVxdWVzdCh0aGlzLnJlcXVlc3RVcmwpXG5cdFx0XHQudGhlbiggKHJlc3BvbnNlKSA9PiBKU09OLnBhcnNlKHJlc3BvbnNlLnJlcGxhY2UoJy8vICcsJycpKSApXG5cdH1cblxuXHRyZXRyeWFibGVHZXQobmV4dCl7XG5cdFx0cmV0cnkoeyB0aW1lczogNSwgaW50ZXJ2YWw6IDMwMCB9LCAoY2FsbGJhY2spID0+IHtcblx0XHRcdFx0dGhpcy5nZXQoKVxuXHRcdFx0XHRcdC50aGVuKCAocmVzcG9uc2UpID0+IGNhbGxiYWNrKG51bGwscmVzcG9uc2UpIClcblx0XHRcdFx0XHQuY2F0Y2goY2FsbGJhY2spXG5cdFx0XHR9LCAoZXJyLHJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdGlmKGVycil7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coJ0l0ZXJhdGlvbiBmYWlsZWQ6IEFsbCByZXRyaWVzIHJlamVjdGVkLicsIGVyci5tZXNzYWdlKTtcblx0XHRcdFx0XHR0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcblx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coJ0l0ZXJhdGlvbiBzdWNjZWVkZWQgd2l0aCBkYXRhIGxlbmd0aDonLCByZXNwb25zZS5sZW5ndGgpO1xuXHRcdFx0XHRcdHRoaXMuZW1pdCgnZGF0YScsIHJlc3BvbnNlKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIENvbnRpbnVlIGFueXdheVxuXHRcdFx0XHRzZXRUaW1lb3V0KG5leHQsIC4yNSAqIDYwICogMTAwMCk7XG5cdFx0XHR9XG5cdFx0KTtcblx0fVxuXG5cdHN0YXJ0KCl7XG5cdFx0Zm9yZXZlcih0aGlzLnJldHJ5YWJsZUdldCk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IFN0b2NrU2VydmljZShwcm9jZXNzLmVudi5TVE9DS19TWU1CT0xTKTsiXX0=