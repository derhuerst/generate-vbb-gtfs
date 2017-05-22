'use strict'

const stations = require('vbb-stations/full.json')
const pump = require('pump')
const from = require('from2')
const through = require('through2')
const csv = require('csv-write-stream')

const showError = (err) => {
	if (!err) return
	console.error(err)
	process.exit(1)
}

const readStations = () => {
	const keys = (function* (obj) {
		for (let key in obj) yield key
	})(stations)

	return from({objectMode: true}, (size, cb) => {
		const {value: key} = keys.next()
		if (!key) cb(null, null)
		else cb(null, stations[key])
	})
}

pump(
	readStations(),
	through.obj(function (station, _, cb) {
		this.push({
			stop_id: station.id,
			// todo: stop_code
			stop_name: station.name,
			stop_lat: station.coordinates.latitude,
			stop_lon: station.coordinates.longitude,
			// todo: zone_id, zone_url
			location_type: 1,
			parent_station: '',
			stop_timezone: 'Europe/Berlin'
			// todo: wheelchair_boarding
		})

		for (let stop of station.stops) {
			this.push({
				stop_id: stop.id,
				// todo: stop_code
				stop_name: stop.name,
				stop_lat: stop.coordinates.latitude,
				stop_lon: stop.coordinates.longitude,
				// todo: zone_id, zone_url
				location_type: 0,
				parent_station: station.id,
				stop_timezone: 'Europe/Berlin'
				// Even if stop_timezone values are provided in stops.txt, the times in stop_times.txt should continue to be specified as time since midnight in the timezone specified by agency_timezone in agency.txt. This ensures that the time values in a trip always increase over the course of a trip, regardless of which timezones the trip crosses.
				// todo: wheelchair_boarding
			})
		}

		cb()
	}),
	csv(),
	process.stdout,
	showError
)
