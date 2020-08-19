const { join } = require('path');
const fs = require('fs-extra');

const info = require('../src/info.json');
const pkg = require('../package.json');

const { version, author = '', homepage = ' ', description = '' } = pkg;

const infoData = { ...info, version, author, homepage, summary: description };
const infoPath = join(__dirname, '../src/info.json');

fs.outputJSONSync(infoPath, infoData, { spaces: 2 });
