'use strict'

const pump = require('pump')
const trips = require('vbb-trips')
const through = require('through2')
const omit = require('lodash.omit')
const csv = require('csv-write-stream')

const readSchedule = require('./read-schedule')
const {fileWriteStream} = require('./lib')

const buildCalendar = (file) => {
	return new Promise((yay, nay) => {
		pump(
			trips.schedules('all'),
			through.obj(readSchedule),
			through.obj((sched, _, cb) => {
				cb(null, omit(sched, ['exceptions']))
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

module.exports = buildCalendar
