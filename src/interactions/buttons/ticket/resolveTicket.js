const { MessageFlags } = require('discord.js');
const { canManageTicket } = require('../../../services/permissionService');
const { getTicket, getTicketState, resolveTicket } = require('../../../services/ticketService');

/**
 * Handle Resolve Ticket
 * @param {import("discord.js").ButtonInteraction} interaction 
 */
async function handle(interaction) {
	const client = interaction.client;
	await interaction.deferReply({ flags: MessageFlags.Ephemeral });

	const ticket = await getTicket(client, interaction.channel.id);

	if (!ticket) {
		return await interaction.editReply({
			content: 'This channel is not an active ticket.',
		});
	}

	const allowed = await canManageTicket(ticket, interaction.guild, interaction.user.id);
	if (!allowed) {
		return await interaction.editReply({
			content: "You don't have permission to use this action.",
		});
	}

	const stateObj = await getTicketState(client, ticket.id);
	if (stateObj.state === 'Resolved') {
		return await interaction.editReply({
			content: 'This ticket is already marked as resolved.',
		});
	}

	await resolveTicket(client, interaction, ticket);

	await interaction.editReply({
		content: 'Ticket marked as resolved.',
	});
}

module.exports = { handle };
