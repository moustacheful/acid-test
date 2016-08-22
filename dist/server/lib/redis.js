'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.sub = exports.pub = undefined;

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_bluebird2.default.promisifyAll(_redis2.default.RedisClient.prototype);
_bluebird2.default.promisifyAll(_redis2.default.Multi.prototype);

var pub = undefined;
var sub = undefined;

function init(redisUrl) {
	exports.pub = pub = _redis2.default.createClient(redisUrl);
	exports.sub = sub = _redis2.default.createClient(redisUrl);
	pub.on("error", function (err) {
		console.log("Redis error " + err, err.stack);
	});
}

exports.default = { pub: pub, sub: sub, init: init };
exports.pub = pub;
exports.sub = sub;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2ZXIvbGliL3JlZGlzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7Ozs7QUFFQSxtQkFBUyxZQUFULENBQXNCLGdCQUFNLFdBQU4sQ0FBa0IsU0FBeEM7QUFDQSxtQkFBUyxZQUFULENBQXNCLGdCQUFNLEtBQU4sQ0FBWSxTQUFsQzs7QUFFQSxJQUFJLE1BQU0sU0FBVjtBQUNBLElBQUksTUFBTSxTQUFWOztBQUVBLFNBQVMsSUFBVCxDQUFjLFFBQWQsRUFBdUI7QUFDdEIsU0FRUSxHQVJSLFNBQU0sZ0JBQU0sWUFBTixDQUFtQixRQUFuQixDQUFOO0FBQ0EsU0FPYSxHQVBiLFNBQU0sZ0JBQU0sWUFBTixDQUFtQixRQUFuQixDQUFOO0FBQ0EsS0FBSSxFQUFKLENBQU8sT0FBUCxFQUFnQixVQUFVLEdBQVYsRUFBZTtBQUM5QixVQUFRLEdBQVIsQ0FBWSxpQkFBaUIsR0FBN0IsRUFBa0MsSUFBSSxLQUF0QztBQUNBLEVBRkQ7QUFHQTs7a0JBRWMsRUFBRSxRQUFGLEVBQU8sUUFBUCxFQUFZLFVBQVosRTtRQUNOLEcsR0FBQSxHO1FBQUssRyxHQUFBLEciLCJmaWxlIjoicmVkaXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcmVkaXMgZnJvbSAncmVkaXMnO1xuaW1wb3J0IGJsdWViaXJkIGZyb20gJ2JsdWViaXJkJztcblxuYmx1ZWJpcmQucHJvbWlzaWZ5QWxsKHJlZGlzLlJlZGlzQ2xpZW50LnByb3RvdHlwZSk7XG5ibHVlYmlyZC5wcm9taXNpZnlBbGwocmVkaXMuTXVsdGkucHJvdG90eXBlKTtcblxudmFyIHB1YiA9IHVuZGVmaW5lZDtcbnZhciBzdWIgPSB1bmRlZmluZWQ7IFxuXG5mdW5jdGlvbiBpbml0KHJlZGlzVXJsKXtcblx0cHViID0gcmVkaXMuY3JlYXRlQ2xpZW50KHJlZGlzVXJsKTtcblx0c3ViID0gcmVkaXMuY3JlYXRlQ2xpZW50KHJlZGlzVXJsKTtcblx0cHViLm9uKFwiZXJyb3JcIiwgZnVuY3Rpb24gKGVycikge1xuXHRcdGNvbnNvbGUubG9nKFwiUmVkaXMgZXJyb3IgXCIgKyBlcnIsIGVyci5zdGFjayk7XG5cdH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCB7IHB1Yiwgc3ViLCBpbml0IH1cbmV4cG9ydCB7IHB1Yiwgc3ViIH0iXX0=