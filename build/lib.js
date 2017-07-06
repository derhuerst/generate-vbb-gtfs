'use strict'

const trips = require('vbb-trips')

const formatDate = (d) => {
	return [
		d.getFullYear(),
		('0' + (d.getMonth() + 1)).slice(-2),
		('0' + d.getDate()).slice(-2)
	].join('')
}

const second = 1000
const minute = 60 * second
const hour = 60 * minute

const formatDuration = (ms) => {
	const res = []

	res.push(Math.floor(ms / hour))
	ms = ms % hour
	res.push(('0' + Math.floor(ms / minute)).slice(-2))
	ms = ms % minute
	res.push(('0' + Math.floor(ms / second)).slice(-2))

	return res.join(':')
}

const showError = (err) => {
	if (!err) return
	console.error(err)
	process.exit(1)
}

const readTimeFrame = () => {
	return new Promise((yay, nay) => {
		let min = Infinity, max = -Infinity

		trips.schedules('all')
		.once('error', nay)
		.on('data', (schedule) => {
			const lastStopover = schedule.sequence[schedule.sequence.length - 1]
			const duration = lastStopover.arrival || lastStopover.departure || 0

			for (let start of schedule.starts) {
				if (start < min) min = start
				else if ((start + duration) > max) max = start + duration
			}
		})
		.once('end', () => {
			const beginning = new Date(min * 1000)
			const end = new Date(max * 1000)

			yay({beginning, end})
		})
	})
}

module.exports = {formatDate, formatDuration, showError, readTimeFrame}
