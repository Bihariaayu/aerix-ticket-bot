const { MessageFlags } = require('discord.js');
const { canUserControl } = require('../../../services/permissionService');
const { getTicket, closeTicket } = require('../../../services/ticketService');

/**
 * Handle Close Confirmation
 * @param {import("discord.js").ButtonInteraction} interaction 
 */
async function handle(interaction) {
	const client = interaction.client;
	const ticket = await getTicket(client, interaction.channel.id);

	if (!ticket) {
		return await interaction.reply({
			content: 'This channel is not an active ticket.',
			flags: MessageFlags.Ephemeral,
		});
	}

	const allowed = await canUserControl(ticket, interaction.guild, interaction.user.id);
	if (!allowed) {
		return await interaction.reply({
			content: "You don't have permission to use this action.",
			flags: MessageFlags.Ephemeral,
		});
	}

	await interaction.update({
		content: 'Ticket closed.',
		components: [],
	});

	await closeTicket(client, interaction, ticket);
}

module.exports = { handle };
