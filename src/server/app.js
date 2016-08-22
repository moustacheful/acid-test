'use strict';

import Hapi from 'hapi';
import inert from 'inert';
import hoek from 'hoek';
import dotenv from 'dotenv';
import touch from 'touch';

// Load .env, if any.
dotenv.config({ silent: true });

// Initialize the server
const server = new Hapi.Server();
const port = process.env.NODE_ENV == 'production' ? '/tmp/nginx.socket' : process.env.PORT || 5000
server.connection({ port: port });

// Register plugins
server.register(inert);
server.register(hoek);

// Start the server
server.start( (err) => {
	if(err) throw err;
	console.log(`Server running at ${server.info.uri}`);
});

if(process.env.NODE_ENV == 'production')
	touch.sync('/tmp/app-initialized')

export default server;