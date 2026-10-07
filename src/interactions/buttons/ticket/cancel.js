/**
 * Handle Cancel button
 * @param {import("discord.js").ButtonInteraction} interaction 
 */
async function handle(interaction) {
	await interaction.update({
		content: 'Action cancelled.',
		components: [],
	});
}

module.exports = { handle };
