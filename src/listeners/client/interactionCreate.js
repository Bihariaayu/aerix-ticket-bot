const { Listener } = require('@eartharoid/dbf');
const interactions = require('../../interactions');

module.exports = class InteractionCreateListener extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client,
			event: 'interactionCreate',
		});
	}

	async run(interaction) {
		try {
			await interactions.dispatch(interaction);
		} catch (error) {
			this.client.log.error('Interaction dispatch error:', error);
		}
	}
};
