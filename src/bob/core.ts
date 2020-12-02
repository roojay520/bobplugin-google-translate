interface IBobCore {
  $http: Bob.Http;
  $info: Bob.Info;
  // $option: Bob.Option;
  $log: Bob.Log;
  $data: Bob.Data;
  $file: Bob.File;
  getOption: (key: string) => string;
}

var BobCore: Readonly<IBobCore> = {
  $http,
  // todo: 无法监听变化
  // $option,
  $info,
  $log,
  $data,
  $file,

  getOption: (key: string): string => $option[key],
};

export default BobCore;
