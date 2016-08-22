'use strict';

require('babel-polyfill');

var _app = require('./app');

var _app2 = _interopRequireDefault(_app);

var _socket = require('./socket');

var _socket2 = _interopRequireDefault(_socket);

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

var _stockService = require('./lib/stock-service');

var _stockService2 = _interopRequireDefault(_stockService);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _redis = require('./lib/redis');

var _redis2 = _interopRequireDefault(_redis);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_redis2.default.init(process.env.REDIS_URL);

_stockService2.default.start();
_app2.default.register(_routes2.default);
_app2.default.register(_socket2.default);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLGdCQUFNLElBQU4sQ0FBVyxRQUFRLEdBQVIsQ0FBWSxTQUF2Qjs7QUFFQSx1QkFBTyxLQUFQO0FBQ0EsY0FBSSxRQUFKO0FBQ0EsY0FBSSxRQUFKIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICdiYWJlbC1wb2x5ZmlsbCdcblxuaW1wb3J0IGFwcCBmcm9tICcuL2FwcCdcbmltcG9ydCBzdG9ja1NvY2tldCBmcm9tICcuL3NvY2tldCdcbmltcG9ydCByb3V0ZXMgZnJvbSAnLi9yb3V0ZXMnO1xuaW1wb3J0IHN0b2NrcyBmcm9tICcuL2xpYi9zdG9jay1zZXJ2aWNlJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgcmVkaXMgZnJvbSAnLi9saWIvcmVkaXMnO1xuXG5yZWRpcy5pbml0KHByb2Nlc3MuZW52LlJFRElTX1VSTCk7XG5cbnN0b2Nrcy5zdGFydCgpXG5hcHAucmVnaXN0ZXIocm91dGVzKTtcbmFwcC5yZWdpc3RlcihzdG9ja1NvY2tldCk7XG4iXX0=