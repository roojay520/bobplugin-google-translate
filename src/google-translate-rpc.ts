import querystring from 'querystring';
import Bob from './bob';
import { _detect, _audio } from './google-translate';

interface QueryOption {
  timeout?: number;
  to?: Bob.Language;
  from?: Bob.Language;
  tld?: string;
  cache?: string;
}

enum Rpc {
  translate = 'MkEWBc',
  tts = 'jQ1olc'
}

// 参考自: https://github.com/vitalets/google-translate-api/blob/master/index.js
function parseTranslateRes(text: string) {
  var json = text.slice(6);
  var length = '';

  var result = {
    text: '',
    pronunciation: '',
    from: {
      language: '',
    },
    dict: {
      parts: [],
    },
    raw: '',
  };

  try {
    length = /^\d+/.exec(json)?.[0] || '';
    if (!length) return result;
    json = JSON.parse(json.slice(length?.length, parseInt(length, 10) + length.length));
    json = JSON.parse(json[0][2]);
    result.raw = json;
  } catch (e) {
    return result;
  }

  if (Bob.util.isNil(json?.[1]?.[0]?.[0]?.[5])) {
    // translation not found, could be a hyperlink or gender-specific translation?
    result.text = json?.[1]?.[0]?.[0]?.[0] || '';
  } else {
    const mean = json[1][0][0][5] as any;
    result.text = mean
      .map((obj: any[]) => obj[0])
      .filter(Boolean)
      // Google api seems to split text per sentences by <dot><space>
      // So we join text back with spaces.
      // See: https://github.com/vitalets/google-translate-api/issues/73
      .join(' ');
  }
  const dict = json?.[3]?.[5]?.[0] as any;
  if (Bob.util.isArrayAndLenGt(dict, 0)) {
    const parts = dict
      .filter((item: Bob.PartObject) => Bob.util.isArrayAndLenGt(item, 0))
      .map(([part, means]: [string, string[]]) => {
        if (!Bob.util.isArrayAndLenGt(means, 0)) {
          return false;
        }
        const meanList = means.map((mean) => mean[0]);
        return { part: `${part}.`, means: meanList };
      })
      .filter((item: Bob.PartObject) => !!item);
    if (Bob.util.isArrayAndLenGt(parts, 0)) result.dict.parts = parts;
  }

  result.pronunciation = json[1][0][0][1];

  // From language
  if (json[0] && json[0][1] && json[0][1][1]) {
    result.from.language = json[0][1][1][0];
  } else if (json[1][3] === 'auto') {
    result.from.language = json[2];
  } else {
    result.from.language = json[1][3];
  }
  return result;
}

function extract(key: string, res: Bob.HttpResponse) {
  const re = new RegExp(`"${key}":".*?"`);
  const result = re.exec(res.data);
  if (result !== null) {
    return result[0].replace(`"${key}":"`, '').slice(0, -1);
  }
  return '';
}

var config = new Bob.Cache('google-translate-api');
async function getRpcParams(rpcids: Rpc, opts: QueryOption) {
  const updateTime = Date.now();
  const cacheUpdateTime = 1000 * 60 * 60 * 24 * 1; // 缓存时间一天
  let { translate = {} } = config.getAll();
  let { params, time } = translate;
  if (updateTime - cacheUpdateTime < time && params?.bl && params?.['f.sid']) {
    return params;
  }
  const { tld = 'cn', timeout = 10000 } = opts;
  const [err, res] = await Bob.util.asyncTo<Bob.HttpResponse>(
    Bob.$http.get({
      timeout,
      url: `https://translate.google.${tld}`,
      header: {
        'User-Agent': Bob.util.userAgent,
        Cookie: Bob.util.googleNid,
      },
    }),
  );
  if (err) throw Bob.util.error('network', '秘钥接口网络错误', err);
  if (!res) throw Bob.util.error('api', '秘钥返回数据出错', res);

  params = {
    rpcids,
    'f.sid': extract('FdrFJe', res),
    bl: extract('cfb2h', res),
    hl: 'en-US',
    'soc-app': 1,
    'soc-platform': 1,
    'soc-device': 1,
    _reqid: Math.floor(1000 + Math.random() * 9000),
    rt: 'c',
  };
  if (params) {
    config.set('translate', { params, updateTime });
    return params;
  }
  throw Bob.util.error('api', '秘钥获取失败', res);
}

var resultCache = new Bob.CacheResult();
// 接口请求频率过快导致错误, 隔三分钟再请求
var API_LIMIT_TIME: number = 1000 * 60 * 3;
var apiLimitErrorTime = 0;

async function translateByRPC(text: string, opts: QueryOption = {}) {
  if (text?.length > 5000) {
    throw Bob.util.error('param', '翻译文本过长, 单次翻译字符上限为5000');
  }
  const { from = 'auto', to = 'auto', tld = 'cn', cache = 'enable', timeout = 10000 } = opts;
  const baseApi = `https://translate.google.${tld}`;
  if (apiLimitErrorTime + API_LIMIT_TIME > Date.now()) throw Bob.util.error('api', '请求频率过快, 请稍后再试');
  apiLimitErrorTime = 0;
  const cacheKey = text + from + to + tld;
  if (cache === 'enable') {
    const _cacheData = resultCache.get(cacheKey);
    if (_cacheData) return _cacheData;
  } else {
    resultCache.clear();
  }
  const lang = await _detect(text, opts);
  const params = await getRpcParams(Rpc.translate, opts);
  Bob.$log.info(params);
  const url = `${baseApi}/_/TranslateWebserverUi/data/batchexecute?${querystring.stringify(params)}`;
  const [err, res] = await Bob.util.asyncTo<Bob.HttpResponse>(
    Bob.$http.post({
      timeout,
      url,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'User-Agent': Bob.util.userAgent,
        Cookie: Bob.util.googleNid,
      },
      body: {
        'f.req': JSON.stringify([
          [[Rpc.translate, JSON.stringify([[text, lang || from, to, true], [null]]), null, 'generic']],
        ]),
      },
    }),
  );

  if (res?.response.statusCode === 429) {
    apiLimitErrorTime = Date.now();
    throw Bob.util.error('api', '接口请求频率过快', err);
  }

  if (err || !res) throw Bob.util.error('network', '接口网络错误', err);

  const resData = res?.data;
  const data = parseTranslateRes(resData);
  const result: Bob.Result = { from, to, toParagraphs: [] };

  try {
    result.toParagraphs = [data.text];

    const dict = data.raw?.[3]?.[5]?.[0] as any;
    if (Bob.util.isArrayAndLenGt(dict, 0)) {
      result.toDict = { parts: data.dict.parts, phonetics: [] };

      const ttsUrl = _audio(text, { tld, from: lang || from });
      result.fromTTS = { type: 'url', value: ttsUrl };
      result.toDict.phonetics = [{ type: 'us', value: 'us', tts: { type: 'url', value: ttsUrl, raw: {} } }];
    }
  } catch (error) {
    throw Bob.util.error('api', '接口返回数据解析错误出错', error);
  }

  if (cache === 'enable') {
    resultCache.set(cacheKey, result);
  }
  return result;
}

export { translateByRPC };
