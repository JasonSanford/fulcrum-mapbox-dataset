const Fulcrum = require('fulcrum-app');
const Mapbox = require('mapbox');
const series = require('async/series');

const fulcrumCore = require('./core');

module.exports = class MapboxImporter {
  constructor(formId, fulcrumToken, mapboxToken, datasetName) {
    this.pageSize = 50;

    this.formId = formId;
    this.datasetName = datasetName;

    this.fulcrumClient = new Fulcrum({api_key: fulcrumToken});
    this.mapboxClient = new Mapbox(mapboxToken);

    this.getForm();
  }

  getForm() {
    this.fulcrumClient.forms.find(this.formId, function (error, resp) {
      if (error) return console.log(error);

      this.form = new fulcrumCore.Form(resp.form);

      if (!this.datasetName) {
        this.datasetName = this.form.name;
      }

      this.countRecords();
    }.bind(this));
  }

  countRecords() {
    this.fulcrumClient.records.search({form_id: this.form.id, per_page: 1, page: 1}, function (error, resp) {
      if (error) return console.log(error);

      this.recordCount = resp.total_count;
      this.pagesNeeded = Math.ceil(this.recordCount / this.pageSize);

      if (this.recordCount > 0) {
        this.createDataset();
        //this.fetchRecords();
      } else {
        return console.log('No records to import');
      }
    }.bind(this));
  }

  createDataset() {
    this.mapboxClient.createDataset({
      name: this.datasetName
    }, function (error, dataset) {
      if (error) return console.log(error);

      this.dataset = dataset;
      this.fetchRecords();
    }.bind(this));
  }

  fetchRecords() {
    const tasks = [];

    for (let i = 1; i <= this.pagesNeeded; i++) {
      tasks.push(
        function (callback) {
          console.log(`Fetching page ${i} of ${this.pagesNeeded}`);
          this.fulcrumClient.records.search({form_id: this.form.id, per_page: this.pageSize, page: i}, callback);
        }.bind(this)
      );
    }

    series(tasks, function (error, results) {
      if (error) return console.log(error);

      this.rawRecords = [];

      results.forEach(function (result) {
        this.rawRecords = this.rawRecords.concat(result.records);
      }.bind(this));

      this.processRecords();
    }.bind(this));
  }

  processRecords() {
    this.records = this.rawRecords.map(function (rawRecord) {
      return new fulcrumCore.Record(rawRecord, this.form);
    }.bind(this))

    this.pushRecords();
  }

  pushRecords() {
    const tasks = [];

    for (let i = 1; i <= this.records.length; i++) {
      tasks.push(
        function (callback) {
          console.log(`Pushing record ${i} of ${this.records.length}.`);
          this.mapboxClient.insertFeature(this.records[i].toGeoJSONFeature(), this.dataset.id, callback);
        }.bind(this)
      );
    }

    series(tasks, function (error, results) {
      if (error) return console.log(error);

      console.log(results);
    }.bind(this));
  }
}