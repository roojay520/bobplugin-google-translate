const path = require('path');
const AdmZip = require('adm-zip');
const plugInfo = require('../src/info.json');

const pkg = path.resolve(__dirname, `../release/${plugInfo.name}-v${plugInfo.version}.bobplugin`);

const zip = new AdmZip();
zip.addLocalFolder(path.resolve(__dirname, `../dist/${plugInfo.name}.bobplugin`));
zip.writeZip(pkg);
