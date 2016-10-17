/**
 * ndMediaSelect Directives
 * 媒体库模态窗
 */
angular.module('directives').directive('ndMediaSelect',  ['$templateCache', '$timeout', '$filter', '$http', 'Upload',
  function ($templateCache, $timeout, $filter, $http, Upload) {
    return {
      restrict: 'E',
      replace: true,
      template: $templateCache.get('media-select.view.html'),
      scope: {
        media: '='
      },
      link: function (scope, element, attr, ctrl) {
        'use strict';

        /**
         * 初始化变量
         */
        scope.transmitting = true;
        scope.mediaStore = [];
        scope.selectView = 'list';
        scope.thumbnailInfoView = false;
        scope.medium = {};
        scope.mediumId = '';
        scope.fileNameFirst = '';
        scope.fileNameLast = '';
        scope.description = '';
        scope.disabledSelectViewRemove = true;
        scope.disabledSelectViewinsert = true;
        scope.selectLimit = 0;
        scope.callback = null;
        scope.disabledUploadThumbnail = false;

        /**
         * 检查是否达到选择个数限制及禁用选择
         */
        function checkDisabledUploadThumbnail () {
          var activeMediaItems;

          switch (scope.selectView) {
            case 'list':
              activeMediaItems = _.filter(scope.media, { 'active': true }).length;

              break;
            case 'store':
              activeMediaItems = _.filter(scope.mediaStore, { 'active': true }).length;
          }

          if (scope.selectLimit && scope.selectLimit - activeMediaItems < 1) {
            scope.disabledUploadThumbnail = true;
          } else {
            scope.disabledUploadThumbnail = false;
          }
        }

        /**
         * 向外层暴露媒体库接口
         * @param options
         * @param callback
         */
        scope.$parent.mediaSelect = function (options, callback) {
          scope.selectLimit = options.limit || null;
          scope.callback = callback || null;

          checkDisabledUploadThumbnail();

          element.modal('show');
        };

        /**
         * 切换媒体库
         * @param target
         */
        scope.selectViewSlide = function (target) {
          scope.thumbnailInfoView = false;
          scope.medium.edited = false;
          _.map(scope.media, function (medium) { return medium.active = false });
          _.map(scope.mediaStore, function (medium) { return medium.active = false });
          scope.disabledSelectViewRemove = true;
          scope.disabledSelectViewinsert = true;

          checkDisabledUploadThumbnail();

          scope.selectView = target;
        };

        /**
         * 展开媒体详情
         * @param medium
         * @param $event
         */
        scope.thumbnailInfoSlide = function (medium, $event) {
          $event.stopPropagation();

          if (medium._id !== scope.mediumId) {
            scope.transmitting = false;
            scope.thumbnailInfoView = true;
            scope.medium.edited = false;
            medium.edited = true;
            scope.medium = medium;
            scope.mediumId = medium._id;
            var fileName = medium.fileName.match(/^(.+)(\.\w+)$/);
            scope.fileNameFirst = _.get(fileName, 1);
            scope.fileNameLast = _.get(fileName, 2);
            scope.description = medium.description;
          } else {
            scope.thumbnailInfoView = !scope.thumbnailInfoView;
            medium.edited = !medium.edited;
          }
        };

        /**
         * 保存媒体库详情
         */
        scope.saveThumbnailInfo = function () {
          scope.transmitting = true;

          var data = {
            fileName: scope.fileNameFirst + scope.fileNameLast
          };

          if (scope.description) data.description = scope.description;

          $http.put('/api/media/' + scope.mediumId, data)
            .then(function () {
              scope.transmitting = false;

              scope.medium.fileName = _.clone(scope.fileNameFirst + scope.fileNameLast);
              scope.medium.description = _.clone(scope.description);

              scope.$emit('notification', {
                type: 'success',
                message: '图片信息保存成功'
              });
            }, function () {
              scope.$emit('notification', {
                type: 'danger',
                message: '图片信息保存失败'
              });
            });
        };

        /**
         * 读取媒体库
         */
        function getMedia () {
          scope.mediaStore = [];

          $http.get('/api/media', {
            params: {
              currentPage: 1,
              pageSize: 9
            }
          }).then(function (res) {
            var data = res.data.media;

            _.map(data, function (medium) {
              var fileNameLast = _.get(medium.fileName.match(/^.+\.(\w+)$/), 1);

              var _medium = {
                file: null,
                fileName: medium.fileName,
                fileNameLast: fileNameLast,
                isImage: false,
                description: medium.description,
                src: medium.src,
                _id: medium._id,
                uploadStatus: 'success',
                active: false,
                edited: false
              };

              switch (fileNameLast) {
                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'gif':
                  _medium.isImage = true;
              }

              scope.mediaStore.push(_medium);
            });
          });
        } getMedia();

        /**
         * 上传媒体
         */
        scope.uploadMedia = function (files) {
          if (!files) return false;

          _.map(files, function (file) {
            Upload.dataUrl(file).then(function (blob) {
              var fileNameLast = _.get(file.name.match(/^.+\.(\w+)$/), 1);

              var medium = {
                file: blob,
                fileName: file.name,
                fileNameLast: fileNameLast,
                isImage: false,
                src: '',
                _id: '',
                uploadStatus: 'uploading',
                active: false,
                edited: false
              };

              switch (fileNameLast) {
                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'gif':
                  medium.isImage = true;
              }

              scope.media.push(medium);
            });
          });

          async.eachLimit(files, 3, function (file, callback) {
            Upload.upload({
              url: '/api/media',
              data: { file: file }
            }).then(function (res) {
              var data = res.data;

              _.map(scope.media, function (medium) {
                Upload.dataUrl(file).then(function (blob) {
                  if (blob === medium.file) {
                    medium._id = data._id;
                    medium.src = data.src;
                    medium.uploadStatus = 'success';
                  }
                });
              });

              getMedia();

              callback(null);
            }, function (res) {
              callback(res);
            });
          }, function (err) {
            if (err) {
              scope.$emit('notification', {
                type: 'danger',
                message: '上传缩略图失败'
              });
            }
          });
        };

        /**
         * 上传媒体模态关闭后重置 selectView
         */
        element.on('hidden.bs.modal', function () {
          scope.$apply(function () {
            scope.selectView = 'list';
          });
        });

        /**
         * 切换选择媒体模态窗按钮状态
         */
        scope.slideMediaActive = function (medium) {
          if (medium.active === false && scope.disabledUploadThumbnail) return false;

          medium.active = !medium.active;

          switch (scope.selectView) {
            case 'list':
              if (_.filter(scope.media, function (medium) { return medium.active })[0]) {
                scope.disabledSelectViewRemove = false;
                scope.disabledSelectViewinsert = false;
              } else {
                scope.disabledSelectViewRemove = true;
                scope.disabledSelectViewinsert = true;
              }

              break;
            case 'store':
              if (_.filter(scope.mediaStore, function (medium) { return medium.active })[0]) {
                scope.disabledSelectViewinsert = false;
              } else {
                scope.disabledSelectViewinsert = true;
              }
          }

          checkDisabledUploadThumbnail();
        };

        /**
         * 移除媒体
         */
        scope.removeMedia = function () {
          _.remove(scope.media, function(medium) { return medium.active });

          scope.disabledSelectViewRemove = true;
          scope.disabledSelectViewinsert = true;

          checkDisabledUploadThumbnail();
        };

        /**
         * 插入媒体
         */
        scope.addMedia = function () {
          _.map(scope.mediaStore, function (medium) {
            if (medium.active) {
              var inList = _.find(scope.media, function (_medium) {
                if (_medium._id === medium._id) {
                  _medium.active = true;
                  return _medium;
                }
              });

              if (!inList) {
                scope.media.unshift(medium);
              }
            }
          });

          var activeMedia = _(scope.media)
            .filter(function (medium) { return medium.active })
            .map(function (medium) {
              return _.pick(medium, ['_id', 'description', 'fileName', 'fileNameLast', 'isImage', 'src']);
            })
            .value();

          element.modal('hide');

          scope.callback(activeMedia);

          _.map(scope.media, function (medium) { medium.active = false });

          scope.disabledSelectViewRemove = true;
          scope.disabledSelectViewinsert = true;

          checkDisabledUploadThumbnail();
        };
      }
    }
  }
]);