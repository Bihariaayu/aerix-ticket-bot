/* eslint-disable no-console */
const { colours } = require('leeks.js');
const figlet = require('figlet');

module.exports = version => {
	console.log('\n');
	figlet
		.textSync('Aerix', { font: 'Slant' })
		.split('\n')
		.forEach(line => console.log(colours.magenta(line)));
	figlet
		.textSync('Tickets', { font: 'Slant' })
		.split('\n')
		.forEach(line => console.log(colours.magentaBright(line)));
	console.log(colours.gray(' ┌─────────────────────────────────────────────────────────────┐'));
	console.log(colours.magentaBright(` │ AERIX TICKETS INFRASTRUCTURE · v${(version || '1.0.0').padEnd(26)} │`));
	console.log(colours.gray(' │ Premium Discord Ticket Automation Engine                    │'));
	console.log(colours.gray(' └─────────────────────────────────────────────────────────────┘\n'));
};
