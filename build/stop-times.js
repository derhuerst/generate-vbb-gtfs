'use strict'

const pump = require('pump')
const trips = require('vbb-trips')
const through = require('through2')
const csv = require('csv-write-stream')
const {formatDuration} = require('./lib')

const buildStopTimes = (file) => {
	return new Promise((yay, nay) => {
		pump(
			trips.schedules('all'),
			through.obj(function (schedule, _, cb) {
				for (let i = 0; i < schedule.sequence.length; i++) {
					const s = schedule.sequence[i]
					let {departure, arrival} = schedule.sequence[i]

					if (!('departure' in s) && !('arrival' in s)) {
						console.error(`Stopover ${i} of schedule ${schedule.id} has no arrival and no departure.`)
						continue
					}

					if (('departure' in s) && !('arrival' in s)) arrival = departure
					else if (('arrival' in s) && !('departure' in s)) departure = arrival

					this.push({
						trip_id: schedule.route.id,
						arrival_time: formatDuration(arrival * 1000),
						departure_time: formatDuration(departure * 1000),
						stop_id: schedule.route.stops && schedule.route.stops[i] || null,
						stop_sequence: i + 1,
						timepoint: 1
						// todo: stop_headsign, pickup_type, drop_off_type, shape_dist_traveled
					})
				}

				cb()
			}),
			csv(),
			process.stdout, // todo
			(err) => {
				if (err) nay(err)
				else yay()
			}
		)
	})
}

module.exports = buildStopTimes
