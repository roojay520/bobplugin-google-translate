import querystring from 'querystring';
import Bob from './bob';

interface QueryOption {
  timeout?: number;
  to?: Bob.Language;
  from?: Bob.Language;
  tld?: string;
  cache?: string;
}

/**
 * @description google 语种检测
 * @param {string} text 需要查询的文字
 * @param {object} [options={}]
 * @return {string} 识别的语言类型
 */
async function _detect(text: string, options: QueryOption = {}) {
  const { tld = 'cn', timeout = 10000 } = options;
  const query = {
    client: 'gtx',
    sl: 'auto',
    dj: '1',
    ie: 'UTF-8',
    oe: 'UTF-8',
  };
  const [err, res] = await Bob.util.asyncTo<Bob.HttpResponse>(
    Bob.$http.post({
      url: `https://translate.google.${tld}/translate_a/single?${querystring.stringify(query)}`,
      timeout,
      header: { 'User-Agent': Bob.util.userAgent },
      body: { q: text },
    }),
  );
  if (err) $log.error(err);
  let lang = res?.data?.src;
  if (lang === 'zh-CN') lang = 'zh-Hans';
  if (lang === 'zh-TW') lang = 'zh-Hant';
  return lang;
}

/**
 * @description google tts 发音
 * @param {string} text 需要查询的文字
 * @param {object} [options={}]
 * @return {string} tts 音频 url
 */
function _audio(text: string, options: QueryOption = {}) {
  const { from, tld = 'cn' } = options;
  const query = {
    client: 'gtx',
    tl: from,
    ie: 'UTF-8',
    q: text,
    ttsspeed: 1,
    total: 1,
    idx: 0,
    textlen: text.length,
    prev: 'input',
  };
  return `https://translate.google.${tld}/translate_tts?${querystring.stringify(query)}`;
}

var resultCache = new Bob.CacheResult();
// 接口请求频率过快导致错误, 隔三分钟再请求
var API_LIMIT_TIME: number = 1000 * 60 * 3;
var apiLimitErrorTime = 0;
/**
 * @description google 翻译
 * @param {string} text 需要翻译的文字内容
 * @param {object} [options={}]
 * @return {object} 一个符合 bob 识别的翻译结果对象
 */
async function _translate(text: string, options: QueryOption = {}) {
  if (apiLimitErrorTime + API_LIMIT_TIME > Date.now()) throw Bob.util.error('api', '请求频率过快, 请稍后再试');
  apiLimitErrorTime = 0;
  const { from = 'auto', to = 'auto', tld = 'cn', cache = 'enable', timeout = 10000 } = options;
  if (cache === 'enable') {
    const _cacheData = resultCache.get(text);
    if (_cacheData) return _cacheData;
  } else {
    resultCache.clear();
  }

  const lang = await _detect(text, options);
  const data = {
    client: 'gtx',
    sl: lang || from,
    tl: to,
    hl: to,
    dt: ['at', 'bd', 'ex', 'ld', 'md', 'qca', 'rw', 'rm', 'ss', 't'],
    ie: 'UTF-8',
    oe: 'UTF-8',
    otf: 1,
    ssel: 0,
    tsel: 0,
    kc: 7,
  };

  const [err, res] = await Bob.util.asyncTo<Bob.HttpResponse>(
    Bob.$http.post({
      url: `https://translate.google.${tld}/translate_a/single?${querystring.stringify(data)}`,
      timeout,
      header: {
        'User-Agent': Bob.util.userAgent,
      },
      body: { q: text },
    }),
  );
  if (res?.response.statusCode === 429) {
    apiLimitErrorTime = Date.now();
    throw Bob.util.error('api', '接口请求频率过快', err);
  }

  if (err) throw Bob.util.error('network', '接口网络错误', err);

  const resData = res?.data;
  $log.info(JSON.stringify(res));
  if (!Bob.util.isArray(resData)) throw Bob.util.error('api', '接口返回数据出错', res);

  const result: Bob.Result = { from, to, toParagraphs: [] };

  try {
    const [paragraphs, dict] = resData;
    if (Bob.util.isArrayAndLenGt(paragraphs, 1)) {
      let _paragraphs = '';
      let _fromParagraphs = '';
      paragraphs.slice(0, -1).forEach((_paragraph: string) => {
        if (!Bob.util.isArrayAndLenGt(_paragraph, 1)) return;
        const [targetStr, sourceStr] = _paragraph;
        if (Bob.util.isString(targetStr)) _paragraphs += targetStr;
        if (Bob.util.isString(sourceStr)) _fromParagraphs += sourceStr;
      });
      result.toParagraphs = _paragraphs.split('\n');
      result.fromParagraphs = _fromParagraphs.split('\n');
    }
    if (Bob.util.isArrayAndLenGt(dict, 0)) {
      result.toDict = { parts: [], phonetics: [] };
      const parts = dict
        .filter((item: Bob.PartObject) => Bob.util.isArrayAndLenGt(item, 0))
        .map(([part, means]: [string, string[]]) => Bob.util.isArrayAndLenGt(means, 0) && { part, means })
        .filter((item: Bob.PartObject) => !!item);
      if (Bob.util.isArrayAndLenGt(parts, 0)) result.toDict.parts = parts;
      const ttsUrl = _audio(text, { tld, from: lang || from });
      result.fromTTS = { type: 'url', value: ttsUrl };
      result.toDict.phonetics = [{ type: 'us', value: '发音', tts: { type: 'url', value: ttsUrl, raw: {} } }];
    }
  } catch (error) {
    throw Bob.util.error('api', '接口返回数据解析错误出错', error);
  }

  if (cache === 'enable') {
    resultCache.set(text, result);
  }
  // raw
  // result.raw = resData;
  return result;
}

export default {
  _translate,
  _detect,
  _audio,
};
