'use strict'

const pump = require('pump')
const trips = require('vbb-trips')
const through = require('through2')
const csv = require('csv-write-stream')
const {showError} = require('./lib')
const readSchedule = require('./read-schedule')

pump(
	trips.schedules('all'),
	through.obj(readSchedule),
	through.obj(function (sched, _, cb) {
		for (let weekday in sched.exceptions) {
			for (let [time, running] of sched.exceptions[weekday]) {
				this.push({
					service_id: sched.id,
					date: formatDate(time),
					exception_type: running ? '1' : '2'
				})
			}
		}
		cb()
	}),
	csv(),
	process.stdout,
	showError
)