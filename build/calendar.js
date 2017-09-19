'use strict'

const pump = require('pump')
const trips = require('vbb-trips')
const through = require('through2')
const omit = require('lodash.omit')
const csv = require('csv-write-stream')
const fs = require('fs')

const readSchedule = require('./read-schedule')

const buildCalendar = (file) => {
	return new Promise((yay, nay) => {
		pump(
			trips.schedules('all'),
			through.obj(readSchedule),
			through.obj((sched, _, cb) => {
				cb(null, omit(sched, ['exceptions']))
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

module.exports = buildCalendar
