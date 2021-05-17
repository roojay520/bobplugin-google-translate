import Bob from './bob';
import _lang from './lang';
import GoogleTranslate from './google-translate';
import { translateByRPC } from './google-translate-rpc';

var formatString = require('./libs/human-string');

export function supportLanguages(): Bob.supportLanguages {
  return [..._lang];
}

// https://ripperhe.gitee.io/bob/#/plugin/quickstart/translate
export function translate(query: Bob.TranslateQuery, completion: Bob.Completion) {
  const { text = '', detectFrom, detectTo } = query;
  const str = formatString(text);
  const params = { from: detectFrom, to: detectTo, tld: Bob.getOption('tld'), cache: Bob.getOption('cache') };
  let res;
  if (Bob.getOption('version') === 'rpc') {
    res = translateByRPC(str, params);
  } else {
    res = GoogleTranslate._translate(str, params);
  }

  res
    .then((result) => completion({ result }))
    .catch((error) => {
      Bob.$log.error(JSON.stringify(error));
      if (error?.type) return completion({ error });
      completion({ error: Bob.util.error('api', '插件出错', error) });
    });
}
