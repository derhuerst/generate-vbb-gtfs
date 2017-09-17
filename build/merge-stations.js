'use strict'

const keyMap = require('key-map')
const stations = require('vbb-stations/full.json')
const analyze = require('merge-vbb-stations')

const mergeStations = () => {
	const mapping = keyMap(Object.keys(stations))
	const nrOfStationsBefore = Object.keys(stations).length

	for (let id1 in stations) {
		const s1 = stations[id1]
		for (let id2 in stations) {
			if (id1 === id2) continue
			const s2 = stations[id2]

			const res = analyze(s1, s2)
			if (!res) continue
			const {op, src, dest, useStationName} = res
			if (op !== analyze.MERGE) {
				console.error('unsupported merge operation: ' + op)
				continue
			}

			const name = useStationName ? dest.name : src.name
			console.info(src.id, src.name, 'as', name, 'into', dest.id, dest.name)

			for (let stop of src.stops) {
				stop.station = dest.id
				if (useStationName) stop.name = dest.name
			}
			dest.stops = dest.stops.concat(src.stops)
			mapping.map(src.id, dest.id)
			delete stations[src.id]
		}
	}

	const nrOfStationsAfter = Object.keys(stations).length
	console.error('removed', nrOfStationsBefore - nrOfStationsAfter, 'stations')

	return Promise.resolve({stations, map: mapping.toObject()})
}

module.exports = mergeStations
