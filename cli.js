#!/usr/bin/env node
'use strict'

const mri = require('mri')
const pSeries = require('p-series')

const pkg = require('./package.json')
const mergeStations = require('./build/merge-stations')
const buildCalendar = require('./build/calendar')
const buildCalendarDates = require('./build/calendar-dates')
const buildFeedInfo = require('./build/feed-info')
const buildRoutes = require('./build/routes')
const buildStopTimes = require('./build/stop-times')
const buildStops = require('./build/stops')
const buildTrips = require('./build/trips')

const argv = mri(process.argv.slice(2), {
	boolean: [
		'help', 'h',
		'version', 'v'
	]
})

if (argv.help || argv.h) {
	process.stdout.write(`
Usage:
    generate-vbb-gtfs
Examples:
    generate-vbb-gtfs
\n`)
	process.exit(0)
}

if (argv.version || argv.v) {
	process.stdout.write(`generate-vbb-gtfs v${pkg.version}\n`)
	process.exit(0)
}

const showError = (err) => {
	console.error(err)
	process.exit(1)
}

mergeStations()
.then(({stations, map}) => {
	return pSeries([
		() => buildCalendar('calendar.txt'),
		() => buildCalendarDates('calendar-dates.txt'),
		() => buildFeedInfo('feed-info.txt'),
		() => buildRoutes('routes.txt'),
		() => buildStopTimes('stop-times.txt'),
		() => buildStops('stops.txt', stations),
		() => buildTrips('trips.txt', stations, map)
	])
})
.catch(showError)
