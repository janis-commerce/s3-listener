'use strict';

const { S3Client } = require('@aws-sdk/client-s3');

const { IS_OFFLINE, S3_LOCAL_ENDPOINT, AWS_REGION } = process.env;

const localConfig = {
	forcePathStyle: true,
	region: AWS_REGION || 'us-east-1',
	endpoint: S3_LOCAL_ENDPOINT,
	credentials: {
		accessKeyId: 'S3RVER',
		secretAccessKey: 'S3RVER'
	}
};

module.exports = IS_OFFLINE && S3_LOCAL_ENDPOINT ? new S3Client(localConfig) : new S3Client();
