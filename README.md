## fulcrum-mapbox-dataset

Import all records in a Fulcrum form into a Mapbox Dataset.

## Installation

~~`npm install fulcrum-mapbox-dataset`~~

**For now just do the following until this is npm-published**

```bash
git clone https://github.com/JasonSanford/fulcrum-mapbox-dataset.git
cd fulcrum-mapbox-dataset
npm install
```

### Usage

From a terminal window:

~~`fulcrum-mapbox-dataset`~~

**For now just do the following until this is npm-published**

```bash
./index.js
```

From there you'll be prompted for:

* a Fulcrum API token (unless you've got one at ~/.fulcrumrc)
* a Mapbox API token (unless you've got one at ~/.mapboxrc)
* which Fulcrum form you want to import - The API token above is used to get a list of forms for your account
* a Mapbox Dataset name (defaults to the Fulcrum form name)

Then, hopefully magic?
