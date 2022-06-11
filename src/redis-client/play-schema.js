const { Entity, Schema } = require('redis-om');

class Play extends Entity {};

const playSchema = new Schema(Play, {
	userId: { type: 'string' },
	username: { type: 'string' },
	playId: { type: 'number', sortable: true },
	contract: { type: 'string' },
	ticker: { type: 'string' },
	strike: { type: 'number' },
	putOrCall: { type: 'string' },
	expiration: { type: 'string' },
	expirationDate: { type: 'date' },
	price: { type: 'number' },
	contracts: { type: 'number' },
	spot: { type: 'number' },
	openOrClose: { type: 'string' },
	messageLink: { type: 'string' }
});

module.exports = playSchema;