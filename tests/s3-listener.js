'use strict';

const assert = require('assert');

const { S3Listener } = require('../lib');

describe('S3 Listener Test', () => {

	it('Should init the test of class', () => {
		const s3Listener = new S3Listener();
		assert.ok(s3Listener instanceof S3Listener);
	});
});
