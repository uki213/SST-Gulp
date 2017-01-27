var setPath = function (setPathArray, ejsPath) {
  var workPathReplaced = setPathArray.initpath.replace(/\//g, '\\');
  var ejsPathReplaced = ejsPath.replace(/\//g, '\\');
  var lengthSlash = (ejsPathReplaced.replace(workPathReplaced, '').match(/\\/g) || []).length
  var basePath = '.';

  // スラッシュの数に応じてパスを作成する
  if (lengthSlash > 0) {
    basePath = '';
    for (i = 0; i < lengthSlash; i++) {
      basePath = basePath + '../'
    }
    basePath = basePath.slice(0, -1);
  }

  // rootpathがtrueの場合はルート相対とする。
  if (setPathArray.rootpath === true) {
    basePath = '';
  }

  return basePath;
}
module.exports = setPath;
