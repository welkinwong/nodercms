/**
 * base64 转换为 Blob File
 */
angular.module('services').factory('base64ToBlobFile', [
  function () {
    'use strict';
    
    return function (base64Data, fileName, contentType) {
      fileName = fileName || 'BlobFile.png';
      contentType = contentType || '';

      var sliceSize = 1024;
      var byteCharacters = atob(base64Data.replace('data:image/png;base64,', ''));
      var bytesLength = byteCharacters.length;
      var slicesCount = Math.ceil(bytesLength / sliceSize);
      var byteArrays = new Array(slicesCount);

      for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        var begin = sliceIndex * sliceSize;
        var end = Math.min(begin + sliceSize, bytesLength);

        var bytes = new Array(end - begin);
        for (var offset = begin, i = 0 ; offset < end; ++i, ++offset) {
          bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
      }

      var blobFile = new Blob(byteArrays, { type: contentType });
      blobFile.name = fileName;
      blobFile.lastModifiedDate = new Date();

      return blobFile;
    };
  }
]);