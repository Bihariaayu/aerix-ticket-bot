const {
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	MessageFlags,
} = require('discord.js');
const { canManageTicket } = require('../../../services/permissionService');
const { getTicket } = require('../../../services/ticketService');

/**
 * Handle Add Note button interaction (Staff only)
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

	const modal = new ModalBuilder()
		.setCustomId('ticket_add_note_modal')
		.setTitle('Add Internal Note');

	const noteInput = new TextInputBuilder()
		.setCustomId('staff_note')
		.setLabel('Internal Staff Note')
		.setStyle(TextInputStyle.Paragraph)
		.setPlaceholder('Enter confidential staff notes, diagnosis, or customer context...')
		.setMaxLength(1000)
		.setRequired(true);

	modal.addComponents(new ActionRowBuilder().addComponents(noteInput));

	await interaction.showModal(modal);
}

module.exports = { handle };
