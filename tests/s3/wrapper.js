'use strict';

const assert = require('assert');

const { S3Client } = require('@aws-sdk/client-s3');

const wrapperPath = require.resolve('../../lib/s3/wrapper');

describe('S3 Wrapper Client Test', () => {

	let originalEnv;
	let originalCache;

	const requireWrapper = () => {
		delete require.cache[wrapperPath];
		// eslint-disable-next-line global-require, import/no-dynamic-require
		return require(wrapperPath);
	};

	beforeEach(() => {
		originalEnv = {
			IS_OFFLINE: process.env.IS_OFFLINE,
			S3_LOCAL_ENDPOINT: process.env.S3_LOCAL_ENDPOINT,
			AWS_REGION: process.env.AWS_REGION
		};
		originalCache = require.cache[wrapperPath];
		delete process.env.IS_OFFLINE;
		delete process.env.S3_LOCAL_ENDPOINT;
		delete process.env.AWS_REGION;
	});

	afterEach(() => {
		Object.entries(originalEnv).forEach(([name, value]) => {
			if(value === undefined)
				delete process.env[name];
			else
				process.env[name] = value;
		});

		if(originalCache)
			require.cache[wrapperPath] = originalCache;
		else
			delete require.cache[wrapperPath];
	});

	it('Should use the local config when running offline with a local endpoint', async () => {

		process.env.IS_OFFLINE = 'true';
		process.env.S3_LOCAL_ENDPOINT = 'http://localhost:4569';

		const client = requireWrapper();

		assert.ok(client instanceof S3Client);
		assert.strictEqual(client.config.forcePathStyle, true);

		const endpoint = await client.config.endpoint();
		assert.strictEqual(endpoint.protocol, 'http:');
		assert.strictEqual(endpoint.hostname, 'localhost');
		assert.strictEqual(endpoint.port, 4569);
		assert.strictEqual(endpoint.path, '/');

		const credentials = await client.config.credentials();
		assert.strictEqual(credentials.accessKeyId, 'S3RVER');
		assert.strictEqual(credentials.secretAccessKey, 'S3RVER');
	});

	it('Should use us-east-1 as default region in local mode when AWS_REGION is not set', async () => {

		process.env.IS_OFFLINE = 'true';
		process.env.S3_LOCAL_ENDPOINT = 'http://localhost:4569';

		const client = requireWrapper();

		assert.strictEqual(await client.config.region(), 'us-east-1');
	});

	it('Should use AWS_REGION in local mode when it is set', async () => {

		process.env.IS_OFFLINE = 'true';
		process.env.S3_LOCAL_ENDPOINT = 'http://localhost:4569';
		process.env.AWS_REGION = 'sa-east-1';

		const client = requireWrapper();

		assert.strictEqual(await client.config.region(), 'sa-east-1');
	});

	it('Should use the default client when not running offline', async () => {

		const client = requireWrapper();

		assert.ok(client instanceof S3Client);
		assert.ok(!client.config.forcePathStyle);
		assert.strictEqual(client.config.endpoint, undefined);
	});

	it('Should use the default client when offline without a local endpoint', async () => {

		process.env.IS_OFFLINE = 'true';

		const client = requireWrapper();

		assert.ok(!client.config.forcePathStyle);
		assert.strictEqual(client.config.endpoint, undefined);
	});
});
