import redis from 'redis';
import bluebird from 'bluebird';

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

var pub = undefined;
var sub = undefined; 

function init(redisUrl){
	pub = redis.createClient(redisUrl);
	sub = redis.createClient(redisUrl);
	pub.on("error", function (err) {
		console.log("Redis error " + err, err.stack);
	});
}

export default { pub, sub, init }
export { pub, sub }