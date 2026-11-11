'use strict';

const { GetObjectCommand } = require('@aws-sdk/client-s3');

const S3Wrapper = require('./wrapper');

exports.get = async params => {

	const response = await S3Wrapper.send(new GetObjectCommand(params));

	const body = await response.Body.transformToByteArray();

	return { ...response, Body: Buffer.from(body) };
};
