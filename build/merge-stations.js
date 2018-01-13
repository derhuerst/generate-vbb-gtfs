'use strict'

const stations = require('vbb-stations/full.json')
const mapping = require('merged-vbb-stations')
const instructions = require('merged-vbb-stations/instructions.json')

const mergeStations = () => {
	const nrOfStationsBefore = Object.keys(stations).length
	const mergedStations = Object.assign({}, stations)

	for (let instruction of instructions) {
		if (instruction.op !== 'merge') {
			console.error('unsupported merge operation', op)
			continue
		}

		const {dest, stopName} = instruction
		const src = stations[instruction.src.id]
		console.info(src.id, src.name, 'as', stopName, 'into', dest.id, dest.name)

		let newDest = mergedStations[dest.id]
		if (!newDest) newDest = mergedStations[dest.id] = Object.assign({}, dest)

		for (let stop of src.stops) {
			stop.station = dest.id
			stop.name = stopName
		}
		newDest.stops = dest.stops.concat(src.stops)
		delete mergedStations[src.id]
	}

	const nrOfStationsAfter = Object.keys(mergedStations).length
	console.error('removed', nrOfStationsBefore - nrOfStationsAfter, 'stations')

	return Promise.resolve({
		stations: mergedStations,
		map: mapping
	})
}

module.exports = mergeStations
