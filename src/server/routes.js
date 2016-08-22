function register(server,options,next){
	console.log('Routes attached.')
	
	server.route([{
		method: 'GET',
		path: '/bundle.js',
		handler: (req,reply) => reply.file('./dist/client/bundle.js')
	},{
		method: 'GET',
		path: '/',
		handler: (req,reply) =>{
			reply.file('./views/index.html')
		} 
	}
	]);
}
register.attributes = {
	name: 'stock-routes'
}
export default { register }