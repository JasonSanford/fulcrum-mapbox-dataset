## fulcrum-mapbox-dataset

## Installation

`npm install fulcrum-mapbox-dataset`

### Usage

```bash
fulcrum-mapbox-dataset FORM_ID FULCRUM_TOKEN MAPBOX_TOKEN [options]
```

### Arguments

* `FORM_ID` - **required** - A Fulcrum form id to push to a Mapbox Dataset
* `FULCRUM_TOKEN` - **required** - A Fulcrum API token for reading records in a form
* `MAPBOX_TOKEN` - **required** - A Mapbox API token for creating datasets and features

## Options

* `--dataset_name` - What to name your Mapbox dataset. Defaults to the Fulcrum form name
