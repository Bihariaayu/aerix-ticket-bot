const { MessageFlags } = require('discord.js');
const { canUserControl } = require('../../../services/permissionService');
const { getTicket, refreshTicketMessage } = require('../../../services/ticketService');
const { logTicketEvent } = require('../../../lib/logging');

/**
 * Handle Update Details modal submission
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

	const allowed = await canUserControl(ticket, interaction.guild, interaction.user.id);
	if (!allowed) {
		return await interaction.editReply({
			content: "You don't have permission to use this action.",
		});
	}

	let updatedAnswers = false;

	if (ticket.questionAnswers && ticket.questionAnswers.length > 0) {
		for (const ans of ticket.questionAnswers) {
			try {
				const val = interaction.fields.getTextInputValue(`q_${ans.questionId}`);
				if (val !== undefined && val !== null) {
					await client.prisma.questionAnswer.update({
						data: { value: val.trim() },
						where: { id: ans.id },
					});
					updatedAnswers = true;
				}
			} catch (_) {}
		}
	}

	try {
		const newTopic = interaction.fields.getTextInputValue('ticket_topic');
		if (newTopic !== undefined && newTopic !== null) {
			await client.prisma.ticket.update({
				data: { topic: newTopic.trim() },
				where: { id: ticket.id },
			});
			updatedAnswers = true;
		}
	} catch (_) {}

	const refreshedTicket = await getTicket(client, ticket.id);
	await refreshTicketMessage(client, interaction.channel, refreshedTicket);

	await interaction.editReply({
		content: 'Your ticket details have been updated.',
	});

	logTicketEvent(client, {
		action: 'update_details',
		diff: { details: 'Intake answers updated' },
		target: { id: ticket.id, name: interaction.channel.toString() },
		userId: interaction.user.id,
	});
}

module.exports = { handle };
