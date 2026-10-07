const { SlashCommand } = require('@eartharoid/dbf');
const {
	ApplicationCommandOptionType,
	PermissionsBitField,
	MessageFlags,
} = require('discord.js');
const ExtendedEmbedBuilder = require('../../lib/embed');
const { isStaff } = require('../../lib/users');

module.exports = class PrefixSlashCommand extends SlashCommand {
	constructor(client, options) {
		const name = 'prefix';
		super(client, {
			...options,
			description: 'Configure or view the bot command prefix',
			dmPermission: false,
			name,
			options: [
				{
					description: 'Set a custom command prefix for this server',
					name: 'set',
					options: [
						{
							description: 'The new command prefix (e.g. ! or t?)',
							name: 'prefix',
							required: true,
							type: ApplicationCommandOptionType.String,
						},
					],
					type: ApplicationCommandOptionType.Subcommand,
				},
				{
					description: 'View the current command prefix for this server',
					name: 'view',
					type: ApplicationCommandOptionType.Subcommand,
				},
				{
					description: 'Reset the command prefix back to default (t?)',
					name: 'reset',
					type: ApplicationCommandOptionType.Subcommand,
				},
			],
		});
	}

	/**
	 * @param {import("discord.js").ChatInputCommandInteraction} interaction
	 */
	async run(interaction) {
		/** @type {import("client")} */
		const client = this.client;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const subcommand = interaction.options.getSubcommand();
		const guildId = interaction.guild.id;

		const isAuthorized =
			interaction.member.permissions?.has(PermissionsBitField.Flags.ManageGuild) ||
			interaction.member.permissions?.has(PermissionsBitField.Flags.Administrator) ||
			(await isStaff(interaction.guild, interaction.user.id));

		if ((subcommand === 'set' || subcommand === 'reset') && !isAuthorized) {
			return await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder({ iconURL: interaction.guild.iconURL() })
						.setColor(0xdc2626)
						.setTitle('PERMISSION DENIED')
						.setDescription('Only server administrators and staff can modify the command prefix.'),
				],
			});
		}

		if (subcommand === 'set') {
			const newPrefix = interaction.options.getString('prefix', true).trim();

			if (!newPrefix || newPrefix.length > 10) {
				return await interaction.editReply({
					embeds: [
						new ExtendedEmbedBuilder({ iconURL: interaction.guild.iconURL() })
							.setColor(0xdc2626)
							.setTitle('INVALID PREFIX')
							.setDescription('The command prefix must be between 1 and 10 characters.'),
					],
				});
			}

			await client.prisma.guild.upsert({
				create: {
					id: guildId,
					prefix: newPrefix,
				},
				update: {
					prefix: newPrefix,
				},
				where: { id: guildId },
			});

			await client.keyv.set(`cache/guild-prefix:${guildId}`, newPrefix);

			const headerBox =
				'```prolog\n' +
				'┌── PREFIX CONFIGURATION ─────────────────────┐\n' +
				'│ STATUS: UPDATED                             │\n' +
				`│ ACTIVE PREFIX: ${newPrefix.padEnd(29, ' ')}│\n` +
				'└──────────────────────────────────────────────┘\n' +
				'```';

			return await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder({ iconURL: interaction.guild.iconURL() })
						.setColor(0x6d28d9)
						.setTitle('PREFIX UPDATED')
						.setDescription(`${headerBox}\nThe command prefix for this server has been set to \`${newPrefix}\`.\nExample commands: \`${newPrefix}help\`, \`${newPrefix}new\`, \`${newPrefix}close\``),
				],
			});
		}

		if (subcommand === 'reset') {
			const defaultPrefix = 't?';

			await client.prisma.guild.upsert({
				create: {
					id: guildId,
					prefix: defaultPrefix,
				},
				update: {
					prefix: defaultPrefix,
				},
				where: { id: guildId },
			});

			await client.keyv.set(`cache/guild-prefix:${guildId}`, defaultPrefix);

			const headerBox =
				'```prolog\n' +
				'┌── PREFIX CONFIGURATION ─────────────────────┐\n' +
				'│ STATUS: RESET TO DEFAULT                    │\n' +
				`│ ACTIVE PREFIX: ${defaultPrefix.padEnd(29, ' ')}│\n` +
				'└──────────────────────────────────────────────┘\n' +
				'```';

			return await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder({ iconURL: interaction.guild.iconURL() })
						.setColor(0x6d28d9)
						.setTitle('PREFIX RESET')
						.setDescription(`${headerBox}\nThe command prefix has been reset to default \`${defaultPrefix}\`.`),
				],
			});
		}

		// 'view'
		const guildData = await client.prisma.guild.findUnique({
			select: { prefix: true },
			where: { id: guildId },
		});

		const currentPrefix = guildData?.prefix || 't?';

		const headerBox =
			'```prolog\n' +
			'┌── PREFIX CONFIGURATION ─────────────────────┐\n' +
			'│ SERVER: CURRENT SETTING                     │\n' +
			`│ ACTIVE PREFIX: ${currentPrefix.padEnd(29, ' ')}│\n` +
			'└──────────────────────────────────────────────┘\n' +
			'```';

		return await interaction.editReply({
			embeds: [
				new ExtendedEmbedBuilder({ iconURL: interaction.guild.iconURL() })
					.setColor(0x6d28d9)
					.setTitle('CURRENT PREFIX')
					.setDescription(`${headerBox}\nThe active command prefix for this server is \`${currentPrefix}\`.\nTo change it, use \`/prefix set <prefix>\` or \`${currentPrefix}prefix set <prefix>\`.`),
			],
		});
	}
};
