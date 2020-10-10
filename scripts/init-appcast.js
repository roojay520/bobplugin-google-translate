const path = require('path');
const fs = require('fs-extra');
const crypto = require('crypto');
const package = require('../package.json');
const plugInfo = require('../src/info.json');
const plugAppcast = require('../src/appcast.json');

const githubRelease = `https://github.fe.workers.dev/roojay520/bobplugin-google-translate/releases/download`;

module.exports = () => {
  const pkgName = 'google-translate';
  const pkgPath = path.resolve(__dirname, `../release/${pkgName}-v${plugInfo.version}.bobplugin`);
  const appcastPath = path.join(__dirname, '../src/appcast.json');

  const fileBuffer = fs.readFileSync(pkgPath);
  const sum = crypto.createHash('sha256');
  sum.update(fileBuffer);
  const hex = sum.digest('hex');

  const version = {
    version: package.version,
    desc: 'https://github.com/roojay520/bobplugin-google-translate/blob/master/CHANGELOG.md',
    sha256: hex,
    url: `${githubRelease}/v${package.version}/google-translate-v${package.version}.bobplugin`,
    minBobVersion: plugInfo.minBobVersion,
  };

  let versions = (plugAppcast && plugAppcast.versions) || [];
  if (!Array.isArray(versions)) versions = [];
  const index = versions.findIndex((v) => v.version === package.version);
  if (index === -1) {
    versions.splice(0, 0, version);
  } else {
    versions.splice(index, 1, version);
  }
  const appcastData = { identifier: plugInfo.identifier, versions };
  fs.outputJSONSync(appcastPath, appcastData, { spaces: 2 });
};
