'use strict'

const pump = require('pump')
const trips = require('vbb-trips')
const through = require('through2')
const csv = require('csv-write-stream')
const fs = require('fs')

const buildTrips = (file, stations, stationsMap) => {
	const stationOf = {}
	for (let id in stations) {
		stationOf[id] = id
		for (let stop of stations[id].stops) stationOf[stop.id] = id
	}

	return new Promise((yay, nay) => {
		pump(
			trips.schedules('all'),
			through.obj((schedule, _, cb) => {
				const lastStopId = schedule.route.stops[schedule.route.stops.length - 1]
				const lastStationId = stationsMap[stationOf[lastStopId]]
				const lastStation = stations[lastStationId]

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
			fs.createWriteStream(file),
			(err) => {
				if (err) nay(err)
				else yay()
			}
		)
	})
}

module.exports = buildTrips
