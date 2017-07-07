'use strict'

const keyMap = require('key-map')
const stations = require('vbb-stations/full.json')
const analyze = require('merge-vbb-stations')
const fs = require('fs')
const path = require('path')

const mapping = keyMap(Object.keys(stations))
const nrOfStationsBefore = Object.keys(stations).length

for (let id1 in stations) {
	const s1 = stations[id1]
	for (let id2 in stations) {
		if (id1 === id2) continue
		const s2 = stations[id2]

		const res = analyze(s1, s2)
		if (!res) continue

		if (res[0] === analyze.MERGE) {
			console.info('merging', s1.id, s1.name, 'into', s2.id, s2.name)

			for (let stop of s1.stops) stop.station = s2.id
			s2.stops = s2.stops.concat(s1.stops)
			mapping.map(s1.id, s2.id)
			delete stations[s1.id]
		} else if (res[0] === analyze.MERGE_AS_STOP) {
			const src = res[1]
			const dest = res[2]
			console.info('adding', src.id, src.name, 'stops to', dest.id, dest.name)

			// todo: what is the difference to MERGE?
			for (let stop of src.stops) stop.station = dest.id
			dest.stops = dest.stops.concat(src.stops)
			mapping.map(src.id, dest.id)
			delete stations[src.id]
		} else console.error('unsupported merge operation: ' + res[0])
	}
}

const nrOfStationsAfter = Object.keys(stations).length
console.error('removed', nrOfStationsBefore - nrOfStationsAfter, 'stations')

const write = (file, data) => {
	return fs.writeFileSync(path.join(__dirname, file), JSON.stringify(data))
}

write('stations.json', stations)
write('stations.map.json', mapping.toObject())
