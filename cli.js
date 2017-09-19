#!/usr/bin/env node
'use strict'

const mri = require('mri')
const path = require('path')
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
Options:
	--dir  -d  Directory to create the files in. Default: $CWD
Examples:
    generate-vbb-gtfs -d path/to/dest
\n`)
	process.exit(0)
}

if (argv.version || argv.v) {
	process.stdout.write(`generate-vbb-gtfs v${pkg.version}\n`)
	process.exit(0)
}

const dir = argv.dir || argv.d
const dest = dir ? path.join('.', dir) : '.'

const showError = (err) => {
	console.error(err)
	process.exit(1)
}

mergeStations()
.then(({stations, map}) => {
	return pSeries([
		() => buildCalendar(path.join(dest, 'calendar.txt')),
		() => buildCalendarDates(path.join(dest, 'calendar-dates.txt')),
		() => buildFeedInfo(path.join(dest, 'feed-info.txt')),
		() => buildRoutes(path.join(dest, 'routes.txt')),
		() => buildStopTimes(path.join(dest, 'stop-times.txt')),
		() => buildStops(path.join(dest, 'stops.txt'), stations),
		() => buildTrips(path.join(dest, 'trips.txt'), stations, map)
	])
})
.catch(showError)
