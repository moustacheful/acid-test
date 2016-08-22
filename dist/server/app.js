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

var _touch = require('touch');

var _touch2 = _interopRequireDefault(_touch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Load .env, if any.
_dotenv2.default.config({ silent: true });

// Initialize the server
var server = new _hapi2.default.Server();
var port = process.env.NODE_ENV == 'production' ? '/tmp/nginx.socket' : process.env.PORT || 5000;
server.connection({ port: port });

// Register plugins
server.register(_inert2.default);
server.register(_hoek2.default);

// Start the server
server.start(function (err) {
	if (err) throw err;
	console.log('Server running at ' + server.info.uri);
});

if (process.env.NODE_ENV == 'production') _touch2.default.sync('/tmp/app-initialized');

exports.default = server;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQTtBQUNBLGlCQUFPLE1BQVAsQ0FBYyxFQUFFLFFBQVEsSUFBVixFQUFkOztBQUVBO0FBQ0EsSUFBTSxTQUFTLElBQUksZUFBSyxNQUFULEVBQWY7QUFDQSxJQUFNLE9BQU8sUUFBUSxHQUFSLENBQVksUUFBWixJQUF3QixZQUF4QixHQUF1QyxtQkFBdkMsR0FBNkQsUUFBUSxHQUFSLENBQVksSUFBWixJQUFvQixJQUE5RjtBQUNBLE9BQU8sVUFBUCxDQUFrQixFQUFFLE1BQU0sSUFBUixFQUFsQjs7QUFFQTtBQUNBLE9BQU8sUUFBUDtBQUNBLE9BQU8sUUFBUDs7QUFFQTtBQUNBLE9BQU8sS0FBUCxDQUFjLFVBQUMsR0FBRCxFQUFTO0FBQ3RCLEtBQUcsR0FBSCxFQUFRLE1BQU0sR0FBTjtBQUNSLFNBQVEsR0FBUix3QkFBaUMsT0FBTyxJQUFQLENBQVksR0FBN0M7QUFDQSxDQUhEOztBQUtBLElBQUcsUUFBUSxHQUFSLENBQVksUUFBWixJQUF3QixZQUEzQixFQUNDLGdCQUFNLElBQU4sQ0FBVyxzQkFBWDs7a0JBRWMsTSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBIYXBpIGZyb20gJ2hhcGknO1xuaW1wb3J0IGluZXJ0IGZyb20gJ2luZXJ0JztcbmltcG9ydCBob2VrIGZyb20gJ2hvZWsnO1xuaW1wb3J0IGRvdGVudiBmcm9tICdkb3RlbnYnO1xuaW1wb3J0IHRvdWNoIGZyb20gJ3RvdWNoJztcblxuLy8gTG9hZCAuZW52LCBpZiBhbnkuXG5kb3RlbnYuY29uZmlnKHsgc2lsZW50OiB0cnVlIH0pO1xuXG4vLyBJbml0aWFsaXplIHRoZSBzZXJ2ZXJcbmNvbnN0IHNlcnZlciA9IG5ldyBIYXBpLlNlcnZlcigpO1xuY29uc3QgcG9ydCA9IHByb2Nlc3MuZW52Lk5PREVfRU5WID09ICdwcm9kdWN0aW9uJyA/ICcvdG1wL25naW54LnNvY2tldCcgOiBwcm9jZXNzLmVudi5QT1JUIHx8IDUwMDBcbnNlcnZlci5jb25uZWN0aW9uKHsgcG9ydDogcG9ydCB9KTtcblxuLy8gUmVnaXN0ZXIgcGx1Z2luc1xuc2VydmVyLnJlZ2lzdGVyKGluZXJ0KTtcbnNlcnZlci5yZWdpc3Rlcihob2VrKTtcblxuLy8gU3RhcnQgdGhlIHNlcnZlclxuc2VydmVyLnN0YXJ0KCAoZXJyKSA9PiB7XG5cdGlmKGVycikgdGhyb3cgZXJyO1xuXHRjb25zb2xlLmxvZyhgU2VydmVyIHJ1bm5pbmcgYXQgJHtzZXJ2ZXIuaW5mby51cml9YCk7XG59KTtcblxuaWYocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT0gJ3Byb2R1Y3Rpb24nKVxuXHR0b3VjaC5zeW5jKCcvdG1wL2FwcC1pbml0aWFsaXplZCcpXG5cbmV4cG9ydCBkZWZhdWx0IHNlcnZlcjsiXX0=