import Bob from './bob';
import _lang from './lang';
import GoogleTranslate from './google-translate';

var humanizeString = require('./libs/human-string');

export function supportLanguages(): Bob.supportLanguages {
  return [..._lang];
}

// https://ripperhe.gitee.io/bob/#/plugin/quickstart/translate
export function translate(query: Bob.TranslateQuery, completion: Bob.Completion) {
  const { text = '', detectFrom, detectTo } = query;
  const str = humanizeString(text);
  const params = { from: detectFrom, to: detectTo, tld: Bob.getOption('tld'), cache: Bob.getOption('cache') };
  GoogleTranslate._translate(str, params)
    .then((result) => completion({ result }))
    .catch((error) => {
      Bob.$log.error(JSON.stringify(error));
      if (error?.type) return completion({ error });
      completion({ error: Bob.util.error('api', '插件出错', error) });
    });
}
