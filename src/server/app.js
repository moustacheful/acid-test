'use strict';

import Hapi from 'hapi';
import inert from 'inert';
import hoek from 'hoek';
import dotenv from 'dotenv';

// Load .env, if any.
dotenv.config({ silent: true });

// Initialize the server
const server = new Hapi.Server();
server.connection({ port: process.env.PORT || 5000 });

// Register plugins
server.register(inert);
server.register(hoek);

// Start the server
server.start( (err) => {
	if(err) throw err;
	console.log(`Server running at ${server.info.uri}`);
});

export default server;