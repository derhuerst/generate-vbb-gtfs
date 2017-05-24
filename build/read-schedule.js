'use strict'

const difference = require('lodash.difference')
const {formatDate} = require('./lib')

const day = 24 * 60 * 60 * 1000

const daysBetween = (beginning, end) => {
	const days = []
	for (let i = beginning; i <= end; i += day) days.push(i)
	return days
}

const isWeekday = (weekday) => (day) => new Date(day).getDay() === weekday

const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

const readSchedule = (sched, _, cb) => {
	const starts = sched.starts.sort()
	const beginning = starts[0]
	const end = starts[starts.length - 1]
	const allDays = daysBetween(beginning, end)

	const entry = {
		service_id: sched.id,
		start_date: formatDate(new Date(beginning * 1000)),
		end_date: formatDate(new Date(end * 1000)),
		exceptions: []
	}

	for (let weekday of weekdays) {
		const i = weekdays.indexOf(weekday)
		const days = allDays.filter(isWeekday(i))
		const runningOn = starts.filter(isWeekday(i))

		const isRunning = runningOn.length > (days.length - runningOn.length)
		if (isRunning) {
			entry[weekday] = '1'
			entry.exceptions = difference(days, runningOn).map((t) => [t, false])
		} else {
			entry[weekday] = '0'
			entry.exceptions = runningOn.map((t) => [t, true])
		}
	}

	cb(null, entry)
}
// todo: deduplicate generated data

module.exports = readSchedule
