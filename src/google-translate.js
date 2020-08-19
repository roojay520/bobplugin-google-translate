/**
 * https://github.com/vitalets/google-translate-token/blob/master/index.js
 */
import querystring from 'querystring';
import CacheStore from './cache';
import CacheResult from './cache-result';
import util from './util';

/* eslint-disable */
// BEGIN

function sM(a) {
  var b;
  if (null !== yr) b = yr;
  else {
    b = wr(String.fromCharCode(84));
    var c = wr(String.fromCharCode(75));
    b = [b(), b()];
    b[1] = c();
    b = (yr = window[b.join(c())] || '') || '';
  }
  var d = wr(String.fromCharCode(116)),
    c = wr(String.fromCharCode(107)),
    d = [d(), d()];
  d[1] = c();
  c = '&' + d.join('') + '=';
  d = b.split('.');
  b = Number(d[0]) || 0;
  for (var e = [], f = 0, g = 0; g < a.length; g++) {
    var l = a.charCodeAt(g);
    128 > l
      ? (e[f++] = l)
      : (2048 > l
          ? (e[f++] = (l >> 6) | 192)
          : (55296 == (l & 64512) && g + 1 < a.length && 56320 == (a.charCodeAt(g + 1) & 64512)
              ? ((l = 65536 + ((l & 1023) << 10) + (a.charCodeAt(++g) & 1023)),
                (e[f++] = (l >> 18) | 240),
                (e[f++] = ((l >> 12) & 63) | 128))
              : (e[f++] = (l >> 12) | 224),
            (e[f++] = ((l >> 6) & 63) | 128)),
        (e[f++] = (l & 63) | 128));
  }
  a = b;
  for (f = 0; f < e.length; f++) (a += e[f]), (a = xr(a, '+-a^+6'));
  a = xr(a, '+-3^+b+-f');
  a ^= Number(d[1]) || 0;
  0 > a && (a = (a & 2147483647) + 2147483648);
  a %= 1e6;
  return c + (a.toString() + '.' + (a ^ b));
}

var yr = null;
var wr = function (a) {
    return function () {
      return a;
    };
  },
  xr = function (a, b) {
    for (var c = 0; c < b.length - 2; c += 3) {
      var d = b.charAt(c + 2),
        d = 'a' <= d ? d.charCodeAt(0) - 87 : Number(d),
        d = '+' == b.charAt(c + 1) ? a >>> d : a << d;
      a = '+' == b.charAt(c) ? (a + d) & 4294967295 : a ^ d;
    }
    return a;
  };

// END
/* eslint-enable */

var config = new CacheStore('google-translate-api');

var window = {
  TKK: `${config.get('TKK')}` || '0',
};

async function updateTKK(opts) {
  var now = Math.floor(Date.now() / 3600000);
  if (Number(window.TKK.split('.')[0]) === now) {
    return;
  }
  const { tld = 'cn', timeout = 10000 } = opts;

  const [err, res] = await util.asyncTo(
    $http.get({
      url: `https://translate.google.${tld}`,
      timeout,
      headers: {
        'User-Agent': util.userAgent,
      },
    }),
  );
  if (err) throw util.getError('network', '秘钥接口网络错误', err);
  if (!res || res.error) throw util.getError('api', '秘钥返回数据出错', res);

  var code = res.data.match(/tkk:\s?'(.+?)'/i);
  if (code) {
    window.TKK = code[1];
    config.set('TKK', window.TKK);
    return;
  }
  throw util.getError('api', '秘钥获取失败', res);
}

async function getToken(text, opts) {
  await updateTKK(opts);
  var tk = sM(text);
  tk = tk.replace('&tk=', '');
  return { name: 'tk', value: tk };
}

/**
 * @description google 语种检测
 * @param {string} text 需要查询的文字
 * @param {object} [options={}]
 * @return {string} 识别的语言类型
 */
async function _detect(text, options = {}) {
  const { tld = 'cn', timeout = 10000 } = options;
  const query = {
    client: 'gtx',
    sl: 'auto',
    dj: '1',
    ie: 'UTF-8',
    oe: 'UTF-8',
  };
  const [err, res] = await util.asyncTo(
    $http.post({
      url: `https://translate.google.${tld}/translate_a/single?${querystring.stringify(query)}`,
      timeout,
      headers: {
        'User-Agent': util.userAgent,
      },
      body: { q: text },
    }),
  );
  if (err) $log.error(err);
  return res?.data?.src;
}

/**
 * @description google tts 发音
 * @param {string} text 需要查询的文字
 * @param {object} [options={}]
 * @return {string} tts 音频 url
 */
function _audio(text, options = {}) {
  const { from, tld = 'cn', tk } = options;
  const query = {
    client: 'gtx',
    tl: from,
    ie: 'UTF-8',
    q: text,
    ttsspeed: 1,
    total: 1,
    idx: 0,
    textlen: text.length,
    tk,
    prev: 'input',
  };
  return `https://translate.google.${tld}/translate_tts?${querystring.stringify(query)}`;
}

var resultCache = new CacheResult();
// 接口请求频率过快导致错误, 隔三分钟再请求
var API_LIMIT_TIME = 1000 * 60 * 3;
var apiLimitErrorTime = 0;
/**
 * @description google 翻译
 * @param {string} text 需要翻译的文字内容
 * @param {object} [options={}]
 * @return {object} 一个符合 bob 识别的翻译结果对象
 */
async function _translate(text, options = {}) {
  if (apiLimitErrorTime + API_LIMIT_TIME > Date.now()) throw util.getError('api', '请求频率过快, 请稍后再试');
  apiLimitErrorTime = 0;
  const { from = 'auto', to = 'auto', tld = 'cn', cache = true, timeout = 10000 } = options;
  if (cache) {
    const _cacheData = resultCache.get(text);
    if (_cacheData) return _cacheData;
  }

  const lang = await _detect(text, options);
  const token = await getToken(text, { tld });
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
    [token.name]: token.value,
  };

  const [err, res] = await util.asyncTo(
    $http.post({
      url: `https://translate.google.${tld}/translate_a/single?${querystring.stringify(data)}`,
      timeout,
      headers: {
        'User-Agent': util.userAgent,
      },
      body: { q: text },
    }),
  );
  if (res?.response.statusCode === 429) {
    apiLimitErrorTime = Date.now();
    throw util.getError('api', '接口请求频率过快', err);
  }

  if (err) throw util.getError('network', '接口网络错误', err);

  const resData = res.data;
  $log.info(JSON.stringify(res));
  if (!util.isArray(resData)) throw util.getError('api', '接口返回数据出错', res);

  const result = {
    from: from === 'zh-CN' ? 'zh-Hans' : from, // string 由翻译接口提供的源语种，可以与查询时的 from 不同。查看 语种列表。
    to: to === 'zh-TW' ? 'zh-Hant' : to, // string 由翻译接口提供的目标语种，可以与查询时的 to 不同。查看 语种列表。
    fromParagraphs: [], // array 原文分段拆分过后的 string 数组，可不传。
    toParagraphs: [], // array 译文分段拆分过后的 string 数组，必传。
    // toDict: null, // object 词典结果，见 to dict object。可不传。
    // fromTTS: null, // tts result 原文的语音合成数据，如果没有，可不传。
    // toTTS: null, // tts result 译文的语音合成数据，如果没有，可不传。
    // raw: null, // any 如果插件内部调用了某翻译接口，可将接口原始数据传回，方便定位问题，可不传。
  };

  try {
    const [paragraph, dict] = resData;
    if (util.isArrayAndLenGt(paragraph, 1)) {
      if (util.isArrayAndLenGt(paragraph[0], 1)) {
        const [targetStr, sourceStr] = paragraph[0];
        if (util.isString(targetStr)) result.toParagraphs.push(targetStr);
        if (util.isString(sourceStr)) result.fromParagraphs.push(sourceStr);
      }
    }
    if (util.isArrayAndLenGt(dict, 0)) {
      result.toDict = { parts: [], phonetics: [] };
      const parts = dict
        .filter((item) => util.isArrayAndLenGt(item, 0))
        .map(([part, means]) => util.isArrayAndLenGt(means, 0) && { part, means })
        .filter((item) => !!item);
      if (util.isArrayAndLenGt(parts, 0)) result.toDict.parts = parts;
      const ttsUrl = _audio(text, { tld, from: lang || from, tk: token.value });
      result.fromTTS = { type: 'url', value: ttsUrl };
      result.toDict.phonetics = [{ type: 'us', value: '发音', tts: { type: 'url', value: ttsUrl, raw: {} } }];
    }
  } catch (error) {
    throw util.getError('api', '接口返回数据解析错误出错', error);
  }

  if (cache) {
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
