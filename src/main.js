import GoogleTranslate from './google-translate';
import _lang from './lang';
import util from './util';

var startCase = require('./libs/lodash-startcase');

function supportLanguages() {
  return [..._lang];
}

// https://ripperhe.gitee.io/bob/#/plugin/quickstart/translate
/** query:  {
    "text": "good",
    "from": "auto",
    "to": "auto",
    "detectFrom": "en",
    "detectTo": "zh-Hans"
  }
*/

function translate(query, completion) {
  const { text = '', detectFrom, detectTo } = query;
  const str = startCase(text);
  const params = { from: detectFrom, to: detectTo, tld: $option.tld, cache: $option.cache };
  GoogleTranslate._translate(str, params)
    .then((result) => completion({ result }))
    .catch((error) => {
      $log.error(JSON.stringify(error));
      if (util.ServerErrorType.includes(error?.type)) return completion({ error });
      completion({ error: util.getError('api', '插件出错', error) });
    });
}

// 避免打包的时候被优化掉
var main = {
  supportLanguages,
  translate,
};

module.exports = main;
