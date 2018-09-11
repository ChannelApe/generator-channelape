import path from 'path';
import sinon from 'sinon';
import test from 'ava';
import pify from 'pify';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import utils from './generators/utils';

const Generator = require('yeoman-generator');

let generator;
let spawnCommandSyncStub;

test.beforeEach(async () => {
  await pify(helpers.testDirectory)(path.join(__dirname, 'temp'));
  generator = helpers.createGenerator('channelape:app', ['../generators/app'], null, {skipInstall: true});
});

test.serial('Given module name When generating module Then expect correct files with default description', async () => {
  helpers.mockPrompt(generator, {
    moduleName: 'test'
  });

  await pify(generator.run.bind(generator))();

  assert.file([
    '.git',
    '.gitignore',
    'package.json',
    'README.md',
    'test/channelape/orders/controller/OrdersController.spec.ts',
    'tslint.json',
    'tsconfig.json',
    'stryker.conf.js',
    'sonar-project.properties',
    '.env',
    '.env.example',
    'src/index.ts',
    '.vscode/launch.json'
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
  assert.fileContent('package.json', '"prepublishOnly": "npm run compile",');
  assert.fileContent('package.json', '"start": "node dist/index.js",');
  assert.fileContent('package.json', '"compile": "tsc && tsc -p test/tsconfig.json",');
  assert.fileContent('package.json', '"lint": "tslint -p tsconfig.json && tslint -p test/tsconfig.json",');
  assert.fileContent('package.json', '"unit-test": "mocha --opts ./test/mocha.opts",');
  assert.fileContent('package.json',
    '"watch-unit-test": "mocha --recursive --compilers ts:ts-node/register --watch test/**/*.spec.*",');
  assert.fileContent('package.json', '"pretest": "npm run compile && npm run lint",');
  assert.fileContent('package.json', '"test": "npm run unit-test",');
  assert.fileContent('package.json', '"posttest": "npm run mutate && npm run cover",');
  assert.fileContent('package.json', '"mutate": "stryker run",');
  assert.fileContent('package.json', '"cover": "nyc npm run unit-test"');

  assert.fileContent('README.md', '# test');
  assert.fileContent('README.md', 'Sends orders to supplier');
});

test.serial('Given channelape and open flag When generating module Then expect .npmrc file', async () => {
  spawnCommandSyncStub = sinon.stub(Generator.prototype, 'spawnCommandSync')
    .withArgs('code');
  generator = helpers.createGenerator('channelape:app', ['../generators/app'], null,
    {skipInstall: true, channelape: true, open: true});
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
  assert.fileContent('package.json', '"author": "ChannelApe"');
  assert.fileContent('package.json', '"prepublishOnly": "npm run compile",');
  assert.fileContent('package.json', '"start": "node dist/index.js",');
  assert.fileContent('package.json', '"compile": "tsc && tsc -p test/tsconfig.json",');
  assert.fileContent('package.json', '"lint": "tslint -p tsconfig.json && tslint -p test/tsconfig.json",');
  assert.fileContent('package.json', '"unit-test": "mocha --opts ./test/mocha.opts",');
  assert.fileContent('package.json',
    '"watch-unit-test": "mocha --recursive --compilers ts:ts-node/register --watch test/**/*.spec.*",');
  assert.fileContent('package.json', '"pretest": "npm run compile && npm run lint",');
  assert.fileContent('package.json', '"test": "npm run unit-test",');
  assert.fileContent('package.json', '"posttest": "npm run mutate && npm run cover",');
  assert.fileContent('package.json', '"mutate": "stryker run",');
  assert.fileContent('package.json', '"cover": "nyc npm run unit-test"');
  assert.fileContent('.npmrc', '@channelape-inc:registry=https://registry.npmjs.org/');

  assert.fileContent('README.md', '# test');
  assert.fileContent('README.md', 'Sends orders to supplier');

  if (!spawnCommandSyncStub.calledOnce) {
    throw new Error('spawn command should have been called to open vscode');
  }

  Generator.prototype.spawnCommandSync.restore();
});

test('parse scoped package names', t => {
  t.is(utils.slugifyPackageName('author/thing'), 'author-thing', 'slugify non-scoped packages');
  t.is(utils.slugifyPackageName('@author/thing'), '@author/thing', 'accept scoped packages');
  t.is(utils.slugifyPackageName('@author/hi/there'),
    'author-hi-there', 'fall back to regular slugify if invalid scoped name');
});
