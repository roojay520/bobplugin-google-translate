import { Language } from '@bob-plug/core';

type ILang = [Language, string];

// https://ripperhe.gitee.io/bob/#/plugin/addtion/language
// Bob 语种标识和第三方语种标识符映射关系 [['bob语种, '第三方接口语种']]
var languageList: ILang[] = [
  ['auto', 'auto'],
  ['zh-Hans', 'zh-CN'],
  ['zh-Hant', 'zh-TW'],
  ['en', 'en'],
  ['yue', 'zh'],
  ['wyw', 'zh'],
  ['en', 'en'],
  ['ja', 'ja'],
  ['ko', 'ko'],
  ['fr', 'fr'],
  ['de', 'de'],
  ['es', 'es'],
  ['it', 'it'],
  ['ru', 'ru'],
  ['pt', 'pt'],
  ['nl', 'nl'],
  ['pl', 'pl'],
  ['ar', 'ar'],
  ['af', 'af'],
  ['am', 'am'],
  ['az', 'az'],
  ['be', 'be'],
  ['bg', 'bg'],
  ['bn', 'bn'],
  ['bs', 'bs'],
  ['ca', 'ca'],
  ['ceb', 'ceb'],
  ['co', 'co'],
  ['cs', 'cs'],
  ['cy', 'cy'],
  ['da', 'da'],
  ['el', 'el'],
  ['eo', 'eo'],
  ['et', 'et'],
  ['eu', 'eu'],
  ['fa', 'fa'],
  ['fi', 'fi'],
  ['fj', 'fj'],
  ['fy', 'fy'],
  ['ga', 'ga'],
  ['gd', 'gd'],
  ['gl', 'gl'],
  ['gu', 'gu'],
  ['ha', 'ha'],
  ['haw', 'haw'],
  ['he', 'he'],
  ['hi', 'hi'],
  ['hmn', 'hmn'],
  ['hr', 'hr'],
  ['ht', 'ht'],
  ['hu', 'hu'],
  ['hy', 'hy'],
  ['id', 'id'],
  ['ig', 'ig'],
  ['is', 'is'],
  ['jw', 'jw'],
  ['ka', 'ka'],
  ['kk', 'kk'],
  ['km', 'km'],
  ['kn', 'kn'],
  ['ku', 'ku'],
  ['ky', 'ky'],
  ['la', 'lo'],
  ['lb', 'lb'],
  ['lo', 'lo'],
  ['lt', 'lt'],
  ['lv', 'lv'],
  ['mg', 'mg'],
  ['mi', 'mi'],
  ['mk', 'mk'],
  ['ml', 'ml'],
  ['mn', 'mn'],
  ['mr', 'mr'],
  ['ms', 'ms'],
  ['mt', 'mt'],
  ['my', 'my'],
  ['ne', 'ne'],
  ['no', 'no'],
  ['ny', 'ny'],
  ['or', 'or'],
  ['pa', 'pa'],
  ['ps', 'ps'],
  ['ro', 'ro'],
  ['rw', 'rw'],
  ['si', 'si'],
  ['sk', 'sk'],
  ['sl', 'sl'],
  ['sm', 'sm'],
  ['sn', 'sn'],
  ['so', 'so'],
  ['sq', 'sq'],
  ['sr', 'sr'],
  ['sr-Cyrl', 'sr'],
  ['sr-Latn', 'sr'],
  ['st', 'st'],
  ['su', 'su'],
  ['sv', 'sv'],
  ['sw', 'sw'],
  ['ta', 'ta'],
  ['te', 'te'],
  ['tg', 'tg'],
  ['th', 'th'],
  ['tk', 'tk'],
  ['tl', 'tl'],
  ['tr', 'tr'],
  ['tt', 'tt'],
  ['ug', 'ug'],
  ['uk', 'uk'],
  ['ur', 'ur'],
  ['uz', 'uz'],
  ['vi', 'vi'],
  ['xh', 'xh'],
  ['yi', 'yi'],
  ['yo', 'yo'],
  ['zu', 'zu'],
];

type IGoogleLanguage = typeof languageList[number][1];
export type { IGoogleLanguage };

// Bob 语种标识符
var standardLangMap = new Map(languageList);
// 第三方语种标识符
var noStandardLangMap = new Map(languageList.map(([standardLang, lang]) => [lang, standardLang]));

// Bob 语种标识符转服务商语种标识符
function standardToNoStandard(lang: Language): IGoogleLanguage {
  return standardLangMap.get(lang) || 'auto';
}

// 服务商语种标识符转 Bob 语种标识符
function noStandardToStandard(lang: string): Language {
  return noStandardLangMap.get(lang) || 'auto';
}

// 获取支持的语种
function getSupportLanguages(): Language[] {
  return languageList.map(([standardLang]) => standardLang);
}

export { getSupportLanguages, standardToNoStandard, noStandardToStandard };
