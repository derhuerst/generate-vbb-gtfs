'use strict'

const pump = require('pump')
const trips = require('vbb-trips')
const through = require('through2')
const omit = require('lodash.omit')
const csv = require('csv-write-stream')
const {showError} = require('./lib')
const readSchedule = require('./read-schedule')

pump(
	trips.schedules('all'),
	through.obj(readSchedule),
	through.obj((sched, _, cb) => {
		cb(null, omit(sched, ['exceptions']))
	}),
	csv(),
	process.stdout,
	showError
)
