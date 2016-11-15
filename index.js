#! /usr/local/bin/node

const MapboxImporter = require('./mapbox_importer')

const argv = require('minimist')(process.argv.slice(2));

if (argv._.length !== 3) {
  return console.log('Invalid arguments. Arguments are FORM_ID FULCRUM_TOKEN MAPBOX_TOKEN [options]');
}

const formId = argv._[0];
const fulcrumToken = argv._[1];
const mapboxToken = argv._[2];

let datasetName = (argv.dataset_name || null);

new MapboxImporter(formId, fulcrumToken, mapboxToken, datasetName);
