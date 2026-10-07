const { Menu } = require('@eartharoid/dbf');
const { MessageFlags } = require('discord.js');

module.exports = class CreateMenu extends Menu {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'create',
		});
	}

	/**
	 * @param {*} id
	 * @param {import("discord.js").SelectMenuInteraction} interaction
	 */
	async run(id, interaction) {
		const target = interaction.values?.[0];
		if (!target) return;

		// Safely reset the menu without blocking ticket creation
		if (interaction.message && typeof interaction.message.edit === 'function' && !interaction.message.flags?.has?.(MessageFlags.Ephemeral)) {
			setTimeout(() => {
				interaction.message.edit({ components: interaction.message.components }).catch(() => {});
			}, 1000);
		}

		await this.client.tickets.create({
			...id,
			categoryId: target,
			interaction,
		});
	}
};
