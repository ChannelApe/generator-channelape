import path from 'path';
import test from 'ava';
import pify from 'pify';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import utils from './app/utils';

let generator;

test.beforeEach(async () => {
	await pify(helpers.testDirectory)(path.join(__dirname, 'temp'));
	generator = helpers.createGenerator('channelape:app', ['../app'], '--org=channelape', {skipInstall: true});
});

test.serial('Given channelape org and no CLI and no github username when generating module then expect no CLI and expect channelape org', async () => {
	helpers.mockPrompt(generator, {
		moduleName: 'test',
		website: 'test.com',
		cli: false
	});

	await pify(generator.run.bind(generator))();

	assert.file([
		'.git',
		'index.js',
		'package.json',
		'README.md',
		'test.js'
	]);

	assert.noFile('cli.js');
	assert.fileContent('package.json', '"repository": "channelape/test"');
});

test.serial('CLI option', async () => {
	helpers.mockPrompt(generator, {
		moduleName: 'test',
		website: 'test.com',
		cli: true
	});

	await pify(generator.run.bind(generator))();

	assert.file('cli.js');
	assert.fileContent('package.json', /"bin":/);
	assert.fileContent('package.json', /"bin": "cli.js"/);
	assert.fileContent('package.json', /"meow"/);
	assert.fileContent('package.json', '"repository": "channelape/test"');
});

test.serial('nyc option', async () => {
	helpers.mockPrompt(generator, {
		moduleName: 'test',
		githubUsername: 'test',
		website: 'test.com',
		cli: false,
		nyc: true,
		codecov: false
	});

	await pify(generator.run.bind(generator))();

	assert.noFile('cli.js');
	assert.fileContent('.gitignore', /\.nyc_output/);
	assert.fileContent('.gitignore', /coverage/);
	assert.fileContent('package.json', '"repository": "channelape/test"');
	assert.fileContent('package.json', /"license": "UNLICENSED",/);
	assert.fileContent('package.json', /"private": true/);
	assert.fileContent('package.json', /"xo && nyc ava"/);
	assert.fileContent('package.json', /"nyc": "/);
	assert.noFileContent('package.json', /"codecov":/);
	assert.noFileContent('package.json', /"lcov"/);
});

test.serial('codecov option', async () => {
	helpers.mockPrompt(generator, {
		moduleName: 'test',
		githubUsername: 'test',
		website: 'test.com',
		cli: false,
		nyc: true,
		codecov: true
	});

	await pify(generator.run.bind(generator))();

	assert.noFile('cli.js');
	assert.fileContent('.gitignore', /\.nyc_output/);
	assert.fileContent('.gitignore', /coverage/);
	assert.fileContent('package.json', '"repository": "channelape/test"');
	assert.fileContent('package.json', /"license": "UNLICENSED",/);
	assert.fileContent('package.json', /"private": true/);
	assert.fileContent('package.json', /"xo && nyc ava"/);
	assert.fileContent('package.json', /"nyc": "/);
	assert.fileContent('package.json', /"codecov":/);
	assert.fileContent('package.json', /"lcov"/);
});

test('parse scoped package names', t => {
	t.is(utils.slugifyPackageName('author/thing'), 'author-thing', 'slugify non-scoped packages');
	t.is(utils.slugifyPackageName('@author/thing'), '@author/thing', 'accept scoped packages');
	t.is(utils.slugifyPackageName('@author/hi/there'), 'author-hi-there', 'fall back to regular slugify if invalid scoped name');
});

test.serial('prompts for description', async () => {
	helpers.mockPrompt(generator, {
		moduleName: 'test',
		moduleDescription: 'foo',
		githubUsername: 'test',
		website: 'test.com',
		cli: false,
		nyc: true,
		codecov: true
	});

	await pify(generator.run.bind(generator))();

	assert.fileContent('package.json', /"description": "foo",/);
	assert.fileContent('package.json', '"repository": "channelape/test"');
	assert.fileContent('README.md', /> foo/);
});

test.serial('defaults to superb description', async () => {
	helpers.mockPrompt(generator, {
		moduleName: 'test',
		githubUsername: 'test',
		website: 'test.com',
		cli: false,
		nyc: true,
		codecov: true
	});

	await pify(generator.run.bind(generator))();

	assert.fileContent('package.json', /"description": "My .+ module",/);
	assert.fileContent('package.json', '"repository": "channelape/test"');
	assert.fileContent('README.md', /> My .+ module/);
});
