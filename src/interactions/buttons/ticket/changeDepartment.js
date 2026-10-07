const {
	ActionRowBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	MessageFlags,
} = require('discord.js');
const { canUserControl } = require('../../../services/permissionService');
const { getTicket } = require('../../../services/ticketService');

/**
 * Handle Change Department button interaction
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

	const categories = await client.prisma.category.findMany({
		where: { guildId: interaction.guild.id },
		orderBy: { id: 'asc' },
	});

	if (!categories || categories.length <= 1) {
		return await interaction.editReply({
			content: 'No alternative departments are currently configured for this server.',
		});
	}

	const selectMenu = new StringSelectMenuBuilder()
		.setCustomId('ticket_department_select')
		.setPlaceholder('Select a department to transfer this ticket...')
		.setMaxValues(1)
		.setMinValues(1);

	for (const cat of categories.slice(0, 25)) {
		const option = new StringSelectMenuOptionBuilder()
			.setLabel(cat.name.slice(0, 100))
			.setValue(String(cat.id))
			.setDefault(cat.id === ticket.categoryId);

		if (cat.description) {
			option.setDescription(cat.description.slice(0, 100));
		}

		selectMenu.addOptions(option);
	}

	const row = new ActionRowBuilder().addComponents(selectMenu);

	await interaction.editReply({
		content: 'Please select a new department for this ticket below:',
		components: [row],
	});
}

module.exports = { handle };
