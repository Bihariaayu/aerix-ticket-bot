const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { canUserControl } = require('../../../services/permissionService');
const { getTicket } = require('../../../services/ticketService');
const { IDS } = require('../../../utils/ticketButtons');

/**
 * Handle Close Ticket request
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

	const allowed = await canUserControl(ticket, interaction.guild, interaction.user.id);
	if (!allowed) {
		return await interaction.editReply({
			content: "You don't have permission to use this action.",
		});
	}

	const row = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId(IDS.CLOSE_CONFIRM)
			.setLabel('Confirm Close')
			.setStyle(ButtonStyle.Danger),
		new ButtonBuilder()
			.setCustomId(IDS.CANCEL)
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Secondary),
	);

	await interaction.editReply({
		content: 'Are you sure you want to close this ticket? This will end the support session.',
		components: [row],
	});
}

module.exports = { handle };
