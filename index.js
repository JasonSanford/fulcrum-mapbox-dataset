#! /usr/local/bin/node

const fs = require('fs');
const path = require('path');
const Fulcrum = require('fulcrum-app');
const Mapbox = require('mapbox');

const fulcrumCore = require('./core');
const MapboxImporter = require('./mapbox_importer');
const inquirer = require('inquirer');

const argv = require('minimist')(process.argv.slice(2));

class App {
  constructor() {
    this.ensureFulcrumApiToken();
  }

  ensureFulcrumApiToken() {
    let token;

    try {
      token = fs.readFileSync(path.join(process.env.HOME, '.fulcrumrc'), {encoding: 'ascii'}).trim();
    } catch (ex) {
      console.warn('~/.fulcrumrc does not exist');
    }

    if (!token) {
      inquirer
        .prompt([
          {
            type: 'input',
            name: 'fulcrumApiToken',
            message: 'Enter Fulcrum API token:',
            validate: function (token) {
              return token.trim().length > 0 ? true : 'Invalid API token';
            }
          }
        ])
        .then(function (answers) {
          this.setFulcrumApiToken(answers.fulcrumApiToken);
        }.bind(this));
    } else {
      this.setFulcrumApiToken(token);
    }
  }

  setFulcrumApiToken (token) {
    this.fulcrumApiToken = token;
    this.fulcrumClient = new Fulcrum({api_key: this.fulcrumApiToken});

    this.validateFulcrumApiToken();
  }

  validateFulcrumApiToken () {
    this.fulcrumClient.forms.search({}, function (error, resp) {
      if (error) {
        console.log('Invalid Fulcrum API token');
      } else {
        this.formsById = {};
        this.forms = resp.forms.map(function (form) {
          const coreForm = new fulcrumCore.Form(form);
          this.formsById[coreForm.id] = coreForm;
          return coreForm;
        }.bind(this));

        this.promptForm();
      }
    }.bind(this));
  }

  promptForm () {
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'formId',
          message: 'Choose a form to import to Mapbox:',
          choices: this.forms.map(
            function (form) {
              return {
                name: form.name,
                value: form.id
              };
            }
          )
        }
      ])
      .then(this.onGotFormId.bind(this));
  }

  onGotFormId (answers) {
    this.form = this.formsById[answers.formId];

    delete this.forms;
    delete this.formsById;

    this.ensureMapboxApiToken();
  }

  ensureMapboxApiToken() {
    let token;

    try {
      token = fs.readFileSync(path.join(process.env.HOME, '.mapboxrc'), {encoding: 'ascii'}).trim();
    } catch (ex) {
      console.warn('~/.mapboxrc does not exist');
    }

    if (!token) {
      inquirer
        .prompt([
          {
            type: 'input',
            name: 'mapboxApiToken',
            message: 'Enter Mapbox API token:',
            validate: function (token) {
              return token.trim().length > 0 ? true : 'Invalid Mapbox API token';
            }
          }
        ])
        .then(function (answers) {
          this.setMapboxApiToken(answers.mapboxApiToken);
        }.bind(this));
    } else {
      this.setMapboxApiToken(token);
    }
  }

  setMapboxApiToken(token) {
    this.mapboxClient = new Mapbox(token);

    this.promptDatasetName()
  }

  promptDatasetName() {
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'datasetName',
          default: this.form.name,
          message: 'Enter Mapbox Dataset name:',
          validate: function (name) {
            return name.trim().length > 0 ? true : 'Invalid Mapbox Dataset name';
          }
        }
      ])
      .then(function (answers) {
        new MapboxImporter(this.form, this.fulcrumClient, this.mapboxClient, answers.datasetName);
      }.bind(this));
  }
}

new App();
