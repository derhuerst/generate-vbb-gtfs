'use strict'

const all = require('vbb-stations/full.json')
const pump = require('pump')
const trips = require('vbb-trips')
const through = require('through2')
const stations = require('vbb-stations/data.json')
const csv = require('csv-write-stream')

const stationOf = {}
for (let id in all) {
	stationOf[id] = id
	for (let stop of all[id].stops) stationOf[stop.id] = id
}

const showError = (err) => {
	if (!err) return
	console.error(err)
	process.exit(1)
}

const formatTime = (ms) => {
	return [
		Math.floor(ms / 1000 / 60 / 60),
		('' + Math.floor(ms / 1000 / 60)).slice(-2),
		('' + Math.floor(ms / 1000)).slice(-2)
	].join(':')
}

pump(
	trips.schedules('all'),
	through.obj(function (schedule, _, cb) {
		for (let i = 0; i < schedule.sequence.length; i++) {
			const s = schedule.sequence[i]
			let {departure, arrival} = schedule.sequence[i]

			if (('departure' in s) && !('arrival' in s)) arrival = departure
			else if (('arrival' in s) && !('departure' in s)) departure = arrival
			else if (!('departure' in s) && !('arrival' in s)) {
				console.error(`Stopover ${i} of schedule ${schedule.id} has no arrival and no departure.`)
				continue
			}

			this.push({
				trip_id: schedule.route.id,
				arrival_time: arrival ? formatTime(arrival * 1000) : '',
				departure_time: departure ? formatTime(departure * 1000) : '',
				stop_id: schedule.route.stops && schedule.route.stops[i] || null,
				stop_sequence: i + 1,
				timepoint: 1
				// todo: stop_headsign, pickup_type, drop_off_type, shape_dist_traveled
			})
		}

		cb()
	}),
	csv(),
	process.stdout,
	showError
)
