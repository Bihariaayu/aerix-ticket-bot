const { SlashCommand } = require('@eartharoid/dbf');
const { isStaff } = require('../../lib/users');
const ExtendedEmbedBuilder = require('../../lib/embed');
const { version } = require('../../../package.json');
const { MessageFlags } = require('discord.js');

module.exports = class ClaimSlashCommand extends SlashCommand {
	constructor(client, options) {
		const name = 'help';
		super(client, {
			...options,
			description: client.i18n.getMessage(null, `commands.slash.${name}.description`),
			descriptionLocalizations: client.i18n.getAllMessages(`commands.slash.${name}.description`),
			dmPermission: false,
			name,
			nameLocalizations: client.i18n.getAllMessages(`commands.slash.${name}.name`),
		});
	}

	/**
	 * @param {import("discord.js").ChatInputCommandInteraction} interaction
	 */
	async run(interaction) {
		/** @type {import("client")} */
		const client = this.client;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		const userId = interaction.user?.id || interaction.member?.id;
		const staff = await isStaff(interaction.guild, userId);
		const settings = (await client.prisma.guild.findUnique({ where: { id: interaction.guild.id } })) || {
			footer: 'AERIX TICKETS INFRASTRUCTURE · SECURE DISPATCH',
			locale: 'en-GB',
			prefix: 't?',
			primaryColour: '#6D28D9',
		};
		const getMessage = client.i18n.getLocale(settings.locale);
		const guildPrefix = settings.prefix || 't?';

		const ticketCommands = [
			`> </new:${client.application.commands.cache.find(c => c.name === 'new')?.id || 'new'}> — Open a ticket`,
			`> </close:${client.application.commands.cache.find(c => c.name === 'close')?.id || 'close'}> — Request closure`,
			`> </force-close:${client.application.commands.cache.find(c => c.name === 'force-close')?.id || 'force-close'}> — Force close (Staff)`,
			`> </claim:${client.application.commands.cache.find(c => c.name === 'claim')?.id || 'claim'}> — Claim ticket`,
			`> </release:${client.application.commands.cache.find(c => c.name === 'release')?.id || 'release'}> — Release claim`,
			`> </transfer:${client.application.commands.cache.find(c => c.name === 'transfer')?.id || 'transfer'}> — Transfer ticket`,
		].join('\n');

		const managementCommands = [
			`> </setup:${client.application.commands.cache.find(c => c.name === 'setup')?.id || 'setup'}> — Auto setup tickets & panel`,
			`> </panel:${client.application.commands.cache.find(c => c.name === 'panel')?.id || 'panel'}> — Send ticket panel`,
			`> </prefix:${client.application.commands.cache.find(c => c.name === 'prefix')?.id || 'prefix'}> — Set/view prefix`,
			`> </rename:${client.application.commands.cache.find(c => c.name === 'rename')?.id || 'rename'}> — Rename channel`,
			`> </topic:${client.application.commands.cache.find(c => c.name === 'topic')?.id || 'topic'}> — Update topic`,
			`> </add:${client.application.commands.cache.find(c => c.name === 'add')?.id || 'add'}> / </remove:${client.application.commands.cache.find(c => c.name === 'remove')?.id || 'remove'}> — Ticket members`,
			`> </priority:${client.application.commands.cache.find(c => c.name === 'priority')?.id || 'priority'}> — Set priority`,
			`> </tag:${client.application.commands.cache.find(c => c.name === 'tag')?.id || 'tag'}> — Send snippet`,
			`> </tickets:${client.application.commands.cache.find(c => c.name === 'tickets')?.id || 'tickets'}> — View tickets`,
			`> </transcript:${client.application.commands.cache.find(c => c.name === 'transcript')?.id || 'transcript'}> — Export transcript`,
		].join('\n');

		const prefixCommands = [
			`> \`${guildPrefix}setup\` / \`${guildPrefix}panel\` — Deploy ticket panel`,
			`> \`${guildPrefix}new\` — Open a ticket`,
			`> \`${guildPrefix}close [reason]\` — Request closure`,
			`> \`${guildPrefix}claim\` / \`${guildPrefix}release\` — Staff assignment`,
			`> \`${guildPrefix}prefix set <prefix>\` — Custom prefix`,
			`> \`${guildPrefix}rename <name>\` / \`${guildPrefix}topic <topic>\``,
			`> \`${guildPrefix}add <@user>\` / \`${guildPrefix}remove <@user>\``,
			`> \`${guildPrefix}tag <name>\` / \`${guildPrefix}tickets\``,
			`> \`${guildPrefix}transcript\` / \`${guildPrefix}force-close\``,
		].join('\n');

		const fields = [
			{
				name: 'TICKET COMMANDS',
				value: ticketCommands,
			},
			{
				name: 'MANAGEMENT COMMANDS',
				value: managementCommands,
			},
			{
				name: `TEXT PREFIX COMMANDS (${guildPrefix})`,
				value: prefixCommands,
			},
		];

		const headerBox =
			'```prolog\n' +
			'┌── SYSTEM DOCUMENTATION ─────────────────────┐\n' +
			'│ AERIX TICKETS PLATFORM                      │\n' +
			`│ ACTIVE PREFIX: ${guildPrefix.padEnd(29, ' ')}│\n` +
			'└──────────────────────────────────────────────┘\n' +
			'```';

		if (staff) {
			fields.push(
				{
					inline: true,
					name: 'SYSTEM PORTAL',
					value: `> [Configure Dashboard](${process.env.HTTP_EXTERNAL}/settings/${interaction.guild.id})`,
				},
				{
					inline: true,
					name: 'SETTINGS URL',
					value: `> \`${process.env.HTTP_EXTERNAL}/settings\``,
				},
			);
		}

		interaction.editReply({
			embeds: [
				new ExtendedEmbedBuilder({
					iconURL: interaction.guild.iconURL(),
					text: settings.footer || 'AERIX TICKETS INFRASTRUCTURE · SECURE DISPATCH',
				})
					.setColor(settings.primaryColour || '#6D28D9')
					.setTitle('AERIX TICKETS · COMMAND MANUAL')
					.setDescription(
						`${headerBox}\n` +
						`**Aerix Tickets v${version}** · *Enterprise Discord Support Suite*\n` +
						`Use \`/${client.application.commands.cache.find(c => c.name === 'new')?.name || 'new'}\` or \`${guildPrefix}new\` to create a ticket.`,
					)
					.setFields(fields),
			],
		});
	}
};
