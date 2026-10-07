const {
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	MessageFlags,
} = require('discord.js');
const { canUserControl } = require('../../../services/permissionService');
const { getTicket } = require('../../../services/ticketService');

/**
 * Handle Update Details button interaction
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

	const modal = new ModalBuilder()
		.setCustomId('ticket_update_details_modal')
		.setTitle('Update Ticket Details');

	if (ticket.questionAnswers && ticket.questionAnswers.length > 0) {
		const items = ticket.questionAnswers.slice(0, 5);
		for (const ans of items) {
			const label = (ans.question?.label || 'Intake Question').slice(0, 45);
			const val = ans.value || '';
			const input = new TextInputBuilder()
				.setCustomId(`q_${ans.questionId}`)
				.setLabel(label)
				.setStyle(TextInputStyle.Paragraph)
				.setMaxLength(1000)
				.setRequired(ans.question?.required ?? false);

			if (val) input.setValue(val.slice(0, 1000));
			modal.addComponents(new ActionRowBuilder().addComponents(input));
		}
	} else {
		const input = new TextInputBuilder()
			.setCustomId('ticket_topic')
			.setLabel('Ticket Message / Reason')
			.setStyle(TextInputStyle.Paragraph)
			.setPlaceholder('Enter updated details about your inquiry...')
			.setMaxLength(1000)
			.setRequired(true);

		if (ticket.topic) input.setValue(ticket.topic.slice(0, 1000));
		modal.addComponents(new ActionRowBuilder().addComponents(input));
	}

	await interaction.showModal(modal);
}

module.exports = { handle };
