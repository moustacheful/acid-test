'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_bluebird2.default.promisifyAll(_redis2.default.RedisClient.prototype);
_bluebird2.default.promisifyAll(_redis2.default.Multi.prototype);

var pub = undefined;
var sub = undefined;

function init(redisUri) {
	pub = _redis2.default.createClient(redisUri);
	sub = _redis2.default.createClient(redisUri);
	pub.on("error", function (err) {
		console.log("Redis error " + err, err.stack);
	});
}

exports.default = { pub: pub, sub: sub, init: init };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2ZXIvbGliL3JlZGlzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7OztBQUVBLG1CQUFTLFlBQVQsQ0FBc0IsZ0JBQU0sV0FBTixDQUFrQixTQUF4QztBQUNBLG1CQUFTLFlBQVQsQ0FBc0IsZ0JBQU0sS0FBTixDQUFZLFNBQWxDOztBQUVBLElBQUksTUFBTSxTQUFWO0FBQ0EsSUFBSSxNQUFNLFNBQVY7O0FBRUEsU0FBUyxJQUFULENBQWMsUUFBZCxFQUF1QjtBQUN0QixPQUFNLGdCQUFNLFlBQU4sQ0FBbUIsUUFBbkIsQ0FBTjtBQUNBLE9BQU0sZ0JBQU0sWUFBTixDQUFtQixRQUFuQixDQUFOO0FBQ0EsS0FBSSxFQUFKLENBQU8sT0FBUCxFQUFnQixVQUFVLEdBQVYsRUFBZTtBQUM5QixVQUFRLEdBQVIsQ0FBWSxpQkFBaUIsR0FBN0IsRUFBa0MsSUFBSSxLQUF0QztBQUNBLEVBRkQ7QUFHQTs7a0JBRWMsRUFBRSxRQUFGLEVBQU8sUUFBUCxFQUFZLFVBQVosRSIsImZpbGUiOiJyZWRpcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCByZWRpcyBmcm9tICdyZWRpcyc7XG5pbXBvcnQgYmx1ZWJpcmQgZnJvbSAnYmx1ZWJpcmQnO1xuXG5ibHVlYmlyZC5wcm9taXNpZnlBbGwocmVkaXMuUmVkaXNDbGllbnQucHJvdG90eXBlKTtcbmJsdWViaXJkLnByb21pc2lmeUFsbChyZWRpcy5NdWx0aS5wcm90b3R5cGUpO1xuXG52YXIgcHViID0gdW5kZWZpbmVkO1xudmFyIHN1YiA9IHVuZGVmaW5lZDsgXG5cbmZ1bmN0aW9uIGluaXQocmVkaXNVcmkpe1xuXHRwdWIgPSByZWRpcy5jcmVhdGVDbGllbnQocmVkaXNVcmkpO1xuXHRzdWIgPSByZWRpcy5jcmVhdGVDbGllbnQocmVkaXNVcmkpO1xuXHRwdWIub24oXCJlcnJvclwiLCBmdW5jdGlvbiAoZXJyKSB7XG5cdFx0Y29uc29sZS5sb2coXCJSZWRpcyBlcnJvciBcIiArIGVyciwgZXJyLnN0YWNrKTtcblx0fSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHsgcHViLCBzdWIsIGluaXQgfSJdfQ==