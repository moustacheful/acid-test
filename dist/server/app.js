'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _hapi = require('hapi');

var _hapi2 = _interopRequireDefault(_hapi);

var _inert = require('inert');

var _inert2 = _interopRequireDefault(_inert);

var _hoek = require('hoek');

var _hoek2 = _interopRequireDefault(_hoek);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Load .env, if any.
_dotenv2.default.config({ silent: true });

// Initialize the server
var server = new _hapi2.default.Server();
server.connection({ port: process.env.PORT || 5000 });

// Register plugins
server.register(_inert2.default);
server.register(_hoek2.default);

// Start the server
server.start(function (err) {
	if (err) throw err;
	console.log('Server running at ' + server.info.uri);
});

exports.default = server;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUE7QUFDQSxpQkFBTyxNQUFQLENBQWMsRUFBRSxRQUFRLElBQVYsRUFBZDs7QUFFQTtBQUNBLElBQU0sU0FBUyxJQUFJLGVBQUssTUFBVCxFQUFmO0FBQ0EsT0FBTyxVQUFQLENBQWtCLEVBQUUsTUFBTSxRQUFRLEdBQVIsQ0FBWSxJQUFaLElBQW9CLElBQTVCLEVBQWxCOztBQUVBO0FBQ0EsT0FBTyxRQUFQO0FBQ0EsT0FBTyxRQUFQOztBQUVBO0FBQ0EsT0FBTyxLQUFQLENBQWMsVUFBQyxHQUFELEVBQVM7QUFDdEIsS0FBRyxHQUFILEVBQVEsTUFBTSxHQUFOO0FBQ1IsU0FBUSxHQUFSLHdCQUFpQyxPQUFPLElBQVAsQ0FBWSxHQUE3QztBQUNBLENBSEQ7O2tCQUtlLE0iLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgSGFwaSBmcm9tICdoYXBpJztcbmltcG9ydCBpbmVydCBmcm9tICdpbmVydCc7XG5pbXBvcnQgaG9layBmcm9tICdob2VrJztcbmltcG9ydCBkb3RlbnYgZnJvbSAnZG90ZW52JztcblxuLy8gTG9hZCAuZW52LCBpZiBhbnkuXG5kb3RlbnYuY29uZmlnKHsgc2lsZW50OiB0cnVlIH0pO1xuXG4vLyBJbml0aWFsaXplIHRoZSBzZXJ2ZXJcbmNvbnN0IHNlcnZlciA9IG5ldyBIYXBpLlNlcnZlcigpO1xuc2VydmVyLmNvbm5lY3Rpb24oeyBwb3J0OiBwcm9jZXNzLmVudi5QT1JUIHx8IDUwMDAgfSk7XG5cbi8vIFJlZ2lzdGVyIHBsdWdpbnNcbnNlcnZlci5yZWdpc3RlcihpbmVydCk7XG5zZXJ2ZXIucmVnaXN0ZXIoaG9layk7XG5cbi8vIFN0YXJ0IHRoZSBzZXJ2ZXJcbnNlcnZlci5zdGFydCggKGVycikgPT4ge1xuXHRpZihlcnIpIHRocm93IGVycjtcblx0Y29uc29sZS5sb2coYFNlcnZlciBydW5uaW5nIGF0ICR7c2VydmVyLmluZm8udXJpfWApO1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0IHNlcnZlcjsiXX0=