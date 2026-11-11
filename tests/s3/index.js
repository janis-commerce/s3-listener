'use strict';

const assert = require('assert');

const sandbox = require('sinon').createSandbox();

const { GetObjectCommand } = require('@aws-sdk/client-s3');

const S3Wrapper = require('../../lib/s3/wrapper');

const S3 = require('../../lib/s3');

const s3Params = {
	Bucket: 'test-bucket',
	Key: 'test.json'
};

describe('S3 Wrapper Test', () => {

	beforeEach(() => {
		this.send = sandbox.stub(S3Wrapper, 'send');
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('Should throw an error when S3 get object return an error', async () => {
		const message = 'Cannot get any object with the provided key';
		this.send.rejects(new Error(message));

		await assert.rejects(S3.get(s3Params), {
			name: 'Error',
			message
		});
	});

	it('Should return the S3 data object with the Body as a Buffer', async () => {

		const data = JSON.stringify({ test: 'this is some testing body' });

		this.send.resolves({
			ContentType: 'application/json',
			Body: { transformToByteArray: async () => new Uint8Array(Buffer.from(data)) }
		});

		const { Body, ContentType } = await S3.get(s3Params);

		assert.ok(Buffer.isBuffer(Body));
		assert.deepStrictEqual(Body.toString('utf8'), data);
		assert.deepStrictEqual(ContentType, 'application/json');

		sandbox.assert.calledOnce(this.send);

		const [command] = this.send.firstCall.args;
		assert.ok(command instanceof GetObjectCommand);
		assert.deepStrictEqual(command.input, s3Params);
	});
});
