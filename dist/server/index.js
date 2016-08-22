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
_redis.pub.flushdb();

_stockService2.default.start();

if (process.env.NODE_ENV != 'production') _app2.default.register(_routes2.default);

_app2.default.register(_socket2.default);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUdBLGdCQUFNLElBQU4sQ0FBVyxRQUFRLEdBQVIsQ0FBWSxTQUF2QjtBQUNBLFdBQUksT0FBSjs7QUFFQSx1QkFBTyxLQUFQOztBQUVBLElBQUcsUUFBUSxHQUFSLENBQVksUUFBWixJQUF3QixZQUEzQixFQUNDLGNBQUksUUFBSjs7QUFFRCxjQUFJLFFBQUoiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJ2JhYmVsLXBvbHlmaWxsJ1xuXG5pbXBvcnQgYXBwIGZyb20gJy4vYXBwJ1xuaW1wb3J0IHN0b2NrU29ja2V0IGZyb20gJy4vc29ja2V0J1xuaW1wb3J0IHJvdXRlcyBmcm9tICcuL3JvdXRlcyc7XG5pbXBvcnQgc3RvY2tzIGZyb20gJy4vbGliL3N0b2NrLXNlcnZpY2UnO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCByZWRpcyBmcm9tICcuL2xpYi9yZWRpcyc7XG5pbXBvcnQgeyBwdWIgfSBmcm9tICcuL2xpYi9yZWRpcyc7XG5cbnJlZGlzLmluaXQocHJvY2Vzcy5lbnYuUkVESVNfVVJMKTtcbnB1Yi5mbHVzaGRiKClcblxuc3RvY2tzLnN0YXJ0KClcblxuaWYocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT0gJ3Byb2R1Y3Rpb24nKVxuXHRhcHAucmVnaXN0ZXIocm91dGVzKTtcblxuYXBwLnJlZ2lzdGVyKHN0b2NrU29ja2V0KTtcbiJdfQ==