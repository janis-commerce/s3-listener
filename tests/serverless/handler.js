/* eslint-disable max-classes-per-file */

'use strict';

const assert = require('assert');

const sinon = require('sinon');

const Events = require('@janiscommerce/events');
const Log = require('@janiscommerce/log');

const { ServerlessHandler, S3Listener } = require('../../lib');

describe('Serverless Handler Test', () => {

	class ValidListener extends S3Listener {
		async process() {
			this.setProps({ ...this });
		}

		setProps(props) {
			this._props = props;
		}
	}

	const validEvent = {
		Records: [
			{
				s3: {
					s3SchemaVersion: '1.0',
					configurationId: 'testConfigId',
					bucket: {
						name: 'janis-events-service-local',
						ownerIdentity: { principalId: '25DF414140DB20' },
						arn: 'arn:aws:s3: : :janis-events-service-local'
					},
					object: {
						key: 'subscribers/test.json',
						sequencer: '16E051CDD44',
						size: 84,
						eTag: 'f5edbddec6fc3d3a7fabe0e4c14d474b'
					}
				}
			}
		]
	};

	beforeEach(() => {
		sinon.stub(Log, 'start');
		sinon.stub(Events, 'emit');
		sinon.stub(ValidListener.prototype, 'setProps');
	});

	afterEach(() => {
		sinon.restore();
	});

	context('When event is invalid', () => {

		afterEach(() => {
			sinon.assert.notCalled(Log.start);
			sinon.assert.notCalled(Events.emit);
		});

		const invalidEventError = {
			name: 'ServerlessHandlerError',
			code: 1,
			message: 'Event cannot be empty and must be an object'
		};

		const invalidRecordsError = {
			name: 'ServerlessHandlerError',
			code: 2,
			message: 'Event Records cannot be empty and must be an array'
		};

		const invalidS3RecordsError = {
			name: 'ServerlessHandlerError',
			code: 3,
			message: 'Cannot get the S3 event from Records'
		};

		it('Should throw an error when s3 event not received', async () => {
			await assert.rejects(ServerlessHandler.handle(ValidListener), invalidEventError);
		});

		it('Should throw an error when s3 event is an empty string', async () => {
			await assert.rejects(ServerlessHandler.handle(ValidListener, ''), invalidEventError);
		});

		it('Should throw an error when s3 event is an empty object', async () => {
			await assert.rejects(ServerlessHandler.handle(ValidListener, {}), invalidEventError);
		});

		it('Should throw an error when event Records are empty string', async () => {
			await assert.rejects(ServerlessHandler.handle(ValidListener, { Records: '' }), invalidRecordsError);
		});

		it('Should throw an error when event Records are empty array', async () => {
			await assert.rejects(ServerlessHandler.handle(ValidListener, { Records: [] }), invalidRecordsError);
		});

		[
			{},
			{ s3: {} },
			{ s3: { bucket: {} } },
			{ s3: { object: {} } }
		].forEach(Record => {
			it('Should throw an error when s3 records does not have a valid s3 object or is invalid', async () => {
				await assert.rejects(ServerlessHandler.handle(ValidListener, { Records: [Record] }), invalidS3RecordsError);
			});
		});

	});

	context('When listener is invalid', () => {

		afterEach(() => {
			sinon.assert.notCalled(Log.start);
			sinon.assert.notCalled(Events.emit);
		});

		it('Should throw an error when process method was not found', async () => {

			class NoProcessListener extends S3Listener {}

			await assert.rejects(ServerlessHandler.handle(NoProcessListener, validEvent), {
				name: 'ServerlessHandlerError',
				code: 4,
				message: 'Process method is required and must be a function'
			});
		});
	});

	context('When event and listener are valid', () => {

		afterEach(() => {
			sinon.assert.calledOnceWithExactly(Log.start);
			sinon.assert.calledOnceWithExactly(Events.emit, 'janiscommerce.ended');
		});

		it('Should process the event and set the properties to listener', async () => {

			await assert.doesNotReject(ServerlessHandler.handle(ValidListener, validEvent));

			sinon.assert.calledOnceWithExactly(ValidListener.prototype.setProps, {
				_event: {
					bucketName: 'janis-events-service-local',
					fileExtention: 'json',
					fileKey: 'subscribers/test.json',
					filePrefix: 'subscribers',
					fileTag: 'f5edbddec6fc3d3a7fabe0e4c14d474b',
					filename: 'test',
					filesize: 84
				}
			});
		});


		it('Should throw an error when process throws an error', async () => {

			const errorMessage = 'This is an error originated on listener process method';

			class ErrorListener extends S3Listener {

				async process() {
					throw new Error(errorMessage);
				}
			}

			await assert.rejects(ServerlessHandler.handle(ErrorListener, validEvent), {
				name: 'ServerlessHandlerError',
				code: 5,
				message: errorMessage,
				previousError: new Error(errorMessage)
			});
		});
	});
});
