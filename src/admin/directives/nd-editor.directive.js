/**
 * ndEditor Directives
 * Markdown 编辑器
 */
angular.module('directives').directive('ndEditor',  ['$templateCache', '$timeout', '$filter', '$http', 'Upload',
  function ($templateCache, $timeout, $filter, $http, Upload) {
    return {
      restrict: 'E',
      template: $templateCache.get('editor.view.html'),
      scope: {
        content: '=',
        media: '=',
        disabled: '=',
        rows: '='
      },
      link: function (scope, element, attr, ctrl) {
        'use strict';

        /**
         * 初始化变量
         */
        var markdownHelper = null;
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

        scope.selectViewSlide = function (target) {
          scope.thumbnailInfoView = false;
          scope.medium.edited = false;

          scope.selectView = target;
        };

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
            scope.fileNameFirst = fileName[1];
            scope.fileNameLast = fileName[2];
            scope.description = medium.description;
          } else {
            scope.thumbnailInfoView = !scope.thumbnailInfoView;
            medium.edited = !medium.edited;
          }
        };

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
            _.map(res.data.media, function (medium) {
              scope.mediaStore.push({
                file: null,
                fileName: medium.fileName,
                description: medium.description,
                src: medium.src,
                _id: medium._id,
                uploadStatus: 'success',
                active: false,
                edited: false
              });
            });
          });
        } getMedia();

        /**
         * 上传图片
         */
        scope.uploadImage = function (files) {
          if (!files) return false;

          _.map(files, function (file) {
            Upload.dataUrl(file).then(function (blob) {
              scope.media.push({
                file: blob,
                fileName: file.name,
                src: '',
                _id: '',
                uploadStatus: 'uploading',
                active: false,
                edited: false
              });
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
                    medium.active = true;

                    scope.disabledSelectViewinsert = false;
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
         * 上传图片模态关闭后重置 selectView
         */
        $('#imageSelect').on('hidden.bs.modal', function () {
          scope.$apply(function () {
            scope.selectView = 'list';
          });
        });

        /**
         * 切换选择图片模态窗按钮状态
         */
        scope.slideMediaActive = function (medium) {
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
        };

        /**
         * 移除图片
         */
        scope.removeMedia = function () {
          _.remove(scope.media, function(medium) { return medium.active });
        };

        /**
         * 插入图片
         */
        scope.addMedia = function () {
          var selected = markdownHelper.getSelection();
          var content = markdownHelper.getContent();
          var isFirstN = /\n$/.test(content.substr(0, selected.start));
          var isLastN = /^\n/.test(content.substr(selected.end, content.length));
          var str = '';

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

          var activeMedia = _.filter(scope.media, function (medium) { if (medium.active) return medium });

          if (activeMedia.length === 1) {
            var alt = selected.text ? selected.text : activeMedia[0].fileName;

            if (!isFirstN && selected.start !== 0 ) {
              str += '\n';
            }

            str += '\n![' + alt + ']('+ encodeURI(activeMedia[0].src) +' "'+ activeMedia[0].fileName +'")\n';

            if (!isLastN) {
              str += '\n';
            }
          } else if (activeMedia.length > 1) {
            for (var i = 0; i < activeMedia.length; i++) {
              if (i === 0 && !isFirstN) {
                str += '\n';
              }

              str += '\n![' + activeMedia[i].fileName + ']('+ encodeURI(activeMedia[i].src) +' "'+ activeMedia[i].fileName +'")\n';

              if (i === activeMedia.length - 1 && !isLastN) {
                str += '\n';
              }
            }
          }

          markdownHelper.replaceSelection(str);

          $('#imageSelect').modal('hide');
          _.map(scope.media, function (medium) { if (medium.active) medium.active = false });
          _.map(scope.mediaStore, function (medium) { if (medium.active) medium.active = false });
          var newSelected = markdownHelper.getContent().length - (content.length - selected.end);
          markdownHelper.setSelection(newSelected, newSelected);

          scope.content = markdownHelper.getContent();
        };

        /**
         * 初始化编辑器
         */
        $('#content').markdown({
          resize: 'vertical',
          iconlibrary: 'fa',
          language: 'zh',
          onShow: function (e) {
            markdownHelper = e;
            window.m = markdownHelper;
          },
          onChange: function (e) {
            scope.$apply(function () {
              scope.content = e.getContent();
            });
          },
          buttons: [
            [
              {},
              {
                data: [
                  {},
                  {
                    callback: function (e) {
                      $('#imageSelect').modal('show');
                    }
                  }
                ]
              }
            ]
          ]
        });

        scope.$watch('disabled', function () {
          $('#content').siblings('.btn-toolbar').find('button').prop('disabled', scope.disabled);
        });
      }
    }
  }
]);