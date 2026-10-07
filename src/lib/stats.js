/* eslint-disable no-underscore-dangle */

const { version } = require('../../package.json');
const { md5 } = require('./misc');
const {
	pools,
	quickPool,
} = require('./threads');

const { stats } = pools;

const getAverageRating = closedTickets => stats.queue(async w => await w.getAvgRating(closedTickets));

const getAverageTimes = closedTickets => stats.queue(async w => ({
	avgResolutionTime: await w.getAvgResolutionTime(closedTickets),
	avgResponseTime: await w.getAvgResponseTime(closedTickets),
}));

/**
 * Report stats to Houston
 * @param {import("../client")} client
 */
async function sendToHouston(client) {
	// Houston telemetry disabled for Aerix Tickets
	return;
};

module.exports = {
	getAverageRating,
	getAverageTimes,
	sendToHouston,
};
