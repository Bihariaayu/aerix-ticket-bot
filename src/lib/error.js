const { getSUID } = require('./logging');
const {
	EmbedBuilder,
	codeBlock,
} = require('discord.js');

/**
 *
 * @param {Object} event
 * @param {import("discord.js").Interaction<"cached">} event.interaction
 * @param {Error} event.error
 * @returns
 */
module.exports.handleInteractionError = async event => {
	const {
		interaction,
		error,
	} = event;
	const { client } = interaction;

	const ref = getSUID();

	if (interaction.isAnySelectMenu()) {
		client.log.error.menus(`[${ref}] "${event.menu?.id || 'menu'}" menu execution error:`, error);
	} else if (interaction.isButton()) {
		client.log.error.buttons(`[${ref}] "${event.button?.id || 'button'}" button execution error:`, error);
	} else if (interaction.isModalSubmit()) {
		client.log.error.modals(`[${ref}] "${event.modal?.id || 'modal'}" modal execution error:`, error);
	} else if (interaction.isCommand()) {
		client.log.error.commands(`[${ref}] "${event.command?.name || 'command'}" command execution error:`, error);
	} else {
		client.log.error(`[${ref}] Interaction execution error:`, error);
	}


	let locale = null;
	if (interaction.guild) {
		locale = (await client.prisma.guild.findUnique({
			select: { locale: true },
			where: { id: interaction.guild.id },
		})).locale;
	}
	const getMessage = client.i18n.getLocale(locale);

	const data = {
		components: [],
		embeds: [],
	};

	if (error.code === 10011 || (error.code === 'Invalid Type' && /Role/.test(error.message))) {
		data.embeds.push(
			new EmbedBuilder()
				.setColor('Orange')
				.setTitle(getMessage('misc.role_error.title'))
				.setDescription(getMessage('misc.role_error.description'))
				.addFields([
					{
						name: getMessage('misc.role_error.fields.for_admins.name'),
						value: getMessage('misc.role_error.fields.for_admins.value', { url: '#' }),
					},
				]),
		);
	} else if (/Missing (Access|Permissions)/.test(error.message)) {
		data.embeds.push(
			new EmbedBuilder()
				.setColor('Orange')
				.setTitle(getMessage('misc.permissions_error.title'))
				.setDescription(getMessage('misc.permissions_error.description'))
				.addFields([
					{
						name: getMessage('misc.permissions_error.fields.for_admins.name'),
						value: getMessage('misc.permissions_error.fields.for_admins.value', { url: '#' }),
					},
				]),
		);
	} else {
		data.embeds.push(
			new EmbedBuilder()
				.setColor('Orange')
				.setTitle(getMessage('misc.error.title'))
				.setDescription(getMessage('misc.error.description'))
				.addFields([
					{
						name: getMessage('misc.error.fields.identifier'),
						value: codeBlock(ref),
					},
				]),
		);
	}



	if (interaction.deferred || interaction.replied) {
		return interaction.editReply(data).catch(() => {});
	}
	return interaction.reply(data).catch(() => interaction.editReply(data).catch(() => {}));
};
