'use strict'

const pump = require('pump')
const lines = require('vbb-lines')
const through = require('through2')
const csv = require('csv-write-stream')

const {fileWriteStream} = require('./lib')

// todo: https://developers.google.com/transit/gtfs/reference/extended-route-types
const typesByProduct = {
	regional: 2,
	suburban: 2,
	subway: 1,
	bus: 3,
	tram: 0,
	ferry: 4
}

const buildRoutes = (file) => {
	return new Promise((yay, nay) => {
		pump(
			lines('all'),
			through.obj((line, _, cb) => {
				if ('number' !== typeof typesByProduct[line.product]) {
					console.error('unsupported product', line.product, 'line', line.id)
				}
				cb(null, {
					route_id: line.id,
					agency_id: line.operator.id || line.operator,
					route_short_name: line.name,
					route_long_name: null, // todo
					route_type: typesByProduct[line.product]
					// todo: route_color, route_text_color
				})
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

module.exports = buildRoutes
