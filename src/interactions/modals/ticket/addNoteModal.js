const { MessageFlags } = require('discord.js');
const { canManageTicket } = require('../../../services/permissionService');
const { getTicket, addInternalNote } = require('../../../services/ticketService');
const { logTicketEvent } = require('../../../lib/logging');

/**
 * Handle Add Note modal submission (Staff only)
 * @param {import("discord.js").ModalSubmitInteraction} interaction 
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

	const noteText = interaction.fields.getTextInputValue('staff_note')?.trim();
	if (!noteText) {
		return await interaction.editReply({
			content: 'Note cannot be empty.',
		});
	}

	await addInternalNote(client, ticket.id, interaction.user, noteText);

	await interaction.editReply({
		content: `Internal note recorded successfully for staff reference:\n> ${noteText.replace(/\n/g, '\n> ')}`,
	});

	logTicketEvent(client, {
		action: 'add_note',
		diff: { note: noteText },
		payload: { note: noteText },
		target: { id: ticket.id, name: interaction.channel.toString() },
		userId: interaction.user.id,
	});
}

module.exports = { handle };
