const { MessageFlags } = require('discord.js');
const { canManageTicket } = require('../../../services/permissionService');
const { getTicket, deleteTicket } = require('../../../services/ticketService');

/**
 * Handle Delete Confirmation (Staff only)
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

	const allowed = await canManageTicket(ticket, interaction.guild, interaction.user.id);
	if (!allowed) {
		return await interaction.reply({
			content: "You don't have permission to use this action.",
			flags: MessageFlags.Ephemeral,
		});
	}

	await interaction.update({
		content: 'Deleting ticket channel permanently...',
		components: [],
	});

	await deleteTicket(client, interaction, ticket);
}

module.exports = { handle };
