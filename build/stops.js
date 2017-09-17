'use strict'

const pump = require('pump')
const from = require('from2')
const through = require('through2')
const csv = require('csv-write-stream')

const {fileWriteStream} = require('./lib')

const oneStationAtATime = (stations) => {
	const keys = (function* (obj) {
		for (let key in obj) yield key
	})(stations)

	return from({objectMode: true}, (size, cb) => {
		const {value: key} = keys.next()
		if (!key) cb(null, null)
		else cb(null, stations[key])
	})
}

const buildStops = (file, stations) => {
	return new Promise((yay, nay) => {
		pump(
			oneStationAtATime(stations),
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
					// Even if stop_timezone values are provided in stops.txt, the times in stop_times.txt should continue to be specified as time since midnight in the timezone specified by agency_timezone in agency.txt. This ensures that the time values in a trip always increase over the course of a trip, regardless of which timezones the trip crosses.
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
						parent_station: station.id
						// todo: wheelchair_boarding
					})
				}

				cb()
			}),
			csv(),
			fileWriteStream(file),
			(err) => {
				if (err) nay(err)
				else yay()
			}
		)
	})
}

module.exports = buildStops
