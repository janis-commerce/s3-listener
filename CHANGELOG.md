# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2026-11-11
### Changed
- Migrated from AWS SDK v2 (`aws-sdk`) to AWS SDK v3 (`@aws-sdk/client-s3`), so S3 file reading now works on Node.js 26 (https://janiscommerce.atlassian.net/browse/ATR-2755)

### Removed
- Support for Node.js versions lower than 20 (https://janiscommerce.atlassian.net/browse/ATR-2755)

## [1.2.0] - 2026-07-13
### Added
- `ServerlessHandler.handle()` now uses the AWS Lambda context to set the `AWS_LAMBDA_REQUEST_ID` env var with the `awsRequestId` on every invocation

## [1.1.1] - 2024-06-19
### Fixed
- Calling `Log.start()` when `handle()` is called to ensure end Trace Layer Extension

## [1.1.0] - 2022-12-21
### Added
- After each execution will emit the event `janiscommerce.ended` using `@janiscommerce/events`
- Github Actions for build, coverage and publish flows

### Changed
- Refactor for package tests
- Updated dependencies

## [1.0.0] - 2019-10-29
### Added
- S3 listener package
- complete README
- Code coverage
- Tests