'use strict'

const trips = require('vbb-trips')
const pkg = require('./package.json')

const formatDate = (d) => {
	return [
		d.getFullYear(),
		d.getMonth() + 1,
		d.getDate()
	].join('')
}

const showError = (err) => {
	if (!err) return
	console.error(err)
	process.exit(1)
}

let min = Infinity, max = -Infinity

trips.schedules('all')
.on('error', showError)
.on('data', (schedule) => {
	const lastStopover = schedule.sequence[schedule.sequence.length - 1]
	const duration = lastStopover.arrival || lastStopover.departure || 0

	for (let start of schedule.starts) {
		if (start < min) min = start
		else if ((start + duration) > max) max = start + duration
	}
})
.on('end', () => {
	const first = new Date(min * 1000)
	const last = new Date(max * 1000)

	process.stdout.write(`\
feed_publisher_name,feed_publisher_url,feed_lang,feed_start_date,feed_end_date,feed_version
${pkg.repository},${pkg.homepage},de-DE,${formatDate(first)},${formatDate(last)},${formatDate(new Date())}
`)
})
