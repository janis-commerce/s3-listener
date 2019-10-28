'use strict';

const S3Listener = require('./s3-listener');
const ServerlessHandler = require('./serverless/handler');

module.exports = {
	S3Listener,
	ServerlessHandler
};
