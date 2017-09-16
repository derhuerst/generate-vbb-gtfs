'use strict'

const trips = require('vbb-trips')
const pkg = require('../package.json')
const {formatDate, readTimeFrame} = require('./lib')

const buildFeedInfo = (file) => {
	return readTimeFrame()
	.then(({beginning, end}) => {
		process.stdout // todo
		.write(`\
feed_publisher_name,feed_publisher_url,feed_lang,feed_start_date,feed_end_date,feed_version
${pkg.repository},${pkg.homepage},de-DE,${formatDate(beginning)},${formatDate(end)},${formatDate(new Date())}
`)
	})
}

module.exports = buildFeedInfo
