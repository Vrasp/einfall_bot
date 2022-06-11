const { Client } = require('redis-om');
const { createClient } = require('redis');

const playSchema = require('./play-schema');

const url = process.env.REDIS_URL;

class RedisOMClient {
	constructor() {
		this.setup();
	}

	async setup() {
		this.connection = createClient({ url });

		await this.connection.connect();

		this.client = await new Client().use(this.connection);

		this.playRepository = this.client.fetchRepository(playSchema);
		await this.playRepository.createIndex();
	}
}

module.exports = new RedisOMClient();