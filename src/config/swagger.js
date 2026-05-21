const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const document = YAML.load(path.join(__dirname, '../../openapi.yaml'));

module.exports = {
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(document)
};
