const { dialog } = require('electron').remote,
      fs = require('fs');
      fse = require('fs-extra');
      mime = require('mime-types');
      path = require('path');

// this function reads the contents of Source Dir and only those images and their data, that are not in Destination Dir is sent to the Client side js script to render on the html page. The function is Synchronous to facilitate working with Promises.
var renderSrcImages = function (obj) {
  var imageData = [];

  var data = fs.readdirSync(obj.srcDir);

  data.forEach(function (elem, idx) {
    //console.log('***' + idx , path.join(obj.destDir, elem), fse.pathExistsSync(path.join(obj.destDir, elem)), mime.contentType(path.extname(elem)).toString());
    if (mime.contentType(path.extname(elem)).toString().indexOf('image') != -1 && !fse.pathExistsSync(path.join(obj.destDir, elem))) {
      imageData.push({
        name: elem,
        path: path.join(obj.srcDir, elem)
      });
    }
  });

  return imageData;
};

// this function moves an image from Source Dir to Destionation Dir. Function is Synchronous, to facilitate working with Promises.
var moveImagesToDest = function(obj) {
  console.log('obj=====================', obj);
  fse.copySync(path.join(obj.srcDir, obj.fileName), path.join(obj.destDir, obj.fileName));
  return obj.divId;
};

// exporting the relevant methods and variables to the Client side script.
exports.renderSrcImages = renderSrcImages;
exports.moveImagesToDest = moveImagesToDest;
exports.dialog = dialog;