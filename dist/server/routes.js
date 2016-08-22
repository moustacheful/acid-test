'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
function register(server, options, next) {
	console.log('Routes attached.');

	server.route([{
		method: 'GET',
		path: '/bundle.js',
		handler: function handler(req, reply) {
			return reply.file('./dist/client/bundle.js');
		}
	}, {
		method: 'GET',
		path: '/',
		handler: function handler(req, reply) {
			reply.file('./views/index.html');
		}
	}]);
}
register.attributes = {
	name: 'stock-routes'
};
exports.default = { register: register };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvcm91dGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsU0FBUyxRQUFULENBQWtCLE1BQWxCLEVBQXlCLE9BQXpCLEVBQWlDLElBQWpDLEVBQXNDO0FBQ3JDLFNBQVEsR0FBUixDQUFZLGtCQUFaOztBQUVBLFFBQU8sS0FBUCxDQUFhLENBQUM7QUFDYixVQUFRLEtBREs7QUFFYixRQUFNLFlBRk87QUFHYixXQUFTLGlCQUFDLEdBQUQsRUFBSyxLQUFMO0FBQUEsVUFBZSxNQUFNLElBQU4sQ0FBVyx5QkFBWCxDQUFmO0FBQUE7QUFISSxFQUFELEVBSVg7QUFDRCxVQUFRLEtBRFA7QUFFRCxRQUFNLEdBRkw7QUFHRCxXQUFTLGlCQUFDLEdBQUQsRUFBSyxLQUFMLEVBQWM7QUFDdEIsU0FBTSxJQUFOLENBQVcsb0JBQVg7QUFDQTtBQUxBLEVBSlcsQ0FBYjtBQVlBO0FBQ0QsU0FBUyxVQUFULEdBQXNCO0FBQ3JCLE9BQU07QUFEZSxDQUF0QjtrQkFHZSxFQUFFLGtCQUFGLEUiLCJmaWxlIjoicm91dGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gcmVnaXN0ZXIoc2VydmVyLG9wdGlvbnMsbmV4dCl7XG5cdGNvbnNvbGUubG9nKCdSb3V0ZXMgYXR0YWNoZWQuJylcblx0XG5cdHNlcnZlci5yb3V0ZShbe1xuXHRcdG1ldGhvZDogJ0dFVCcsXG5cdFx0cGF0aDogJy9idW5kbGUuanMnLFxuXHRcdGhhbmRsZXI6IChyZXEscmVwbHkpID0+IHJlcGx5LmZpbGUoJy4vZGlzdC9jbGllbnQvYnVuZGxlLmpzJylcblx0fSx7XG5cdFx0bWV0aG9kOiAnR0VUJyxcblx0XHRwYXRoOiAnLycsXG5cdFx0aGFuZGxlcjogKHJlcSxyZXBseSkgPT57XG5cdFx0XHRyZXBseS5maWxlKCcuL3ZpZXdzL2luZGV4Lmh0bWwnKVxuXHRcdH0gXG5cdH1cblx0XSk7XG59XG5yZWdpc3Rlci5hdHRyaWJ1dGVzID0ge1xuXHRuYW1lOiAnc3RvY2stcm91dGVzJ1xufVxuZXhwb3J0IGRlZmF1bHQgeyByZWdpc3RlciB9Il19