import path from 'path';
import test from 'ava';
import pify from 'pify';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import utils from './app/utils';

let generator;

test.beforeEach(async () => {
	await pify(helpers.testDirectory)(path.join(__dirname, 'temp'));
	generator = helpers.createGenerator('channelape:app', ['../app'], null, {skipInstall: true});
});

test.serial('Given module name When generating module Then expect correct files with default description', async () => {
	helpers.mockPrompt(generator, {
		moduleName: 'test'
	});

	await pify(generator.run.bind(generator))();

	assert.file([
		'.git',
		'.gitignore',
		'index.js',
		'package.json',
		'README.md',
		'test.js'
	]);

	assert.fileContent('package.json', '"name": "test",');
	assert.fileContent('package.json', '"description": "Web Application that accepts webhooks from ChannelApe.",');
	assert.fileContent('package.json', '"license": "UNLICENSED",');
	assert.fileContent('package.json', '"private": true,');
	assert.fileContent('package.json', '"nyc": "');
	assert.fileContent('package.json', '"lcov"');
	assert.noFileContent('package.json', '"repository":');
	assert.noFileContent('package.json', '"author": "channelape"');

	assert.fileContent('README.md', '# test');
	assert.fileContent('README.md', 'Web Application that accepts webhooks from ChannelApe.');
});

test.serial('Given module name And module description When generating module Then expect correct files with custom description', async () => {
	helpers.mockPrompt(generator, {
		moduleName: 'test',
		moduleDescription: 'Sends orders to supplier'
	});

	await pify(generator.run.bind(generator))();

	assert.fileContent('package.json', '"name": "test",');
	assert.fileContent('package.json', '"Sends orders to supplier",');
	assert.fileContent('package.json', '"license": "UNLICENSED",');
	assert.fileContent('package.json', '"private": true,');
	assert.fileContent('package.json', '"nyc": "');
	assert.fileContent('package.json', '"lcov"');
	assert.noFileContent('package.json', '"repository":');
	assert.noFileContent('package.json', '"author": "channelape"');

	assert.fileContent('README.md', '# test');
	assert.fileContent('README.md', 'Sends orders to supplier');
});

test('parse scoped package names', t => {
	t.is(utils.slugifyPackageName('author/thing'), 'author-thing', 'slugify non-scoped packages');
	t.is(utils.slugifyPackageName('@author/thing'), '@author/thing', 'accept scoped packages');
	t.is(utils.slugifyPackageName('@author/hi/there'), 'author-hi-there', 'fall back to regular slugify if invalid scoped name');
});
