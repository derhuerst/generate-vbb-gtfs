'use strict'

const all = require('vbb-stations/full.json')
const pump = require('pump')
const trips = require('vbb-trips')
const through = require('through2')
const stations = require('vbb-stations/data.json')
const csv = require('csv-write-stream')
const {showError} = require('./lib')

const stationOf = {}
for (let id in all) {
	stationOf[id] = id
	for (let stop of all[id].stops) stationOf[stop.id] = id
}

pump(
	trips.schedules('all'),
	through.obj((schedule, _, cb) => {
		const stops = schedule.route.stops
		const lastStation = stations[stationOf[stops[stops.length - 1]]]
		cb(null, {
			route_id: schedule.route.line.id || schedule.route.line,
			service_id: schedule.id,
			trip_id: schedule.route.id,
			trip_headsign: '→ ' + lastStation.name
			// todo: trip_short_name, direction_id, shape_id
			// todo: wheelchair_accessible, bikes_allowed
		})
	}),
	csv(),
	process.stdout,
	showError
)
