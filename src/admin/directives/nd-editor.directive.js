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
        disabled: '=',
        rows: '=',
      },
      link: function (scope, element, attr, ctrl) {
        'use strict';

        /**
         * 初始化变量
         */
        var markdownHelper = null;
        var mediaSelect = scope.$parent.mediaSelect;
        scope.transmitting = true;
        scope.description = '';
        scope.videoSource = '';

        /**
         * 插入视频
         */
        scope.insertVideo = function () {
          var selected = markdownHelper.getSelection();
          var content = markdownHelper.getContent();
          var isFirstN = /\n$/.test(content.substr(0, selected.start));
          var isLastN = /^\n/.test(content.substr(selected.end, content.length));
          var str = '';

          if (!isFirstN && selected.start !== 0 ) {
            str += '\n';
          }

          str += '\n' + scope.videoSource + '\n';

          if (!isLastN) {
            str += '\n';
          }

          markdownHelper.replaceSelection(str);

          $('#videoInsert').modal('hide');
          scope.videoSource = '';
          scope.videoInsertForm.$setUntouched();
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
                    name: 'cmdMedia',
                    title: '媒体库',
                    icon: { fa: 'fa fa-archive' },
                    callback: function (e) {
                      mediaSelect({}, function (activeMedia) {
                        var selected = e.getSelection();
                        var content = e.getContent();
                        var isFirstN = /\n$/.test(content.substr(0, selected.start));
                        var isLastN = /^\n/.test(content.substr(selected.end, content.length));
                        var str = '';

                        if (activeMedia.length === 1) {
                          var alt = selected.text ? selected.text : activeMedia[0].fileName;

                          if (activeMedia[0].isImage) {
                            if (!isFirstN && selected.start !== 0) {
                              str += '\n';
                            }

                            str += '\n![' + alt + '](' + encodeURI(activeMedia[0].src) + ' "' + activeMedia[0].fileName + '")\n';

                            if (!isLastN) {
                              str += '\n';
                            }
                          } else {
                            str += '[' + alt + '](' + encodeURI(activeMedia[0].src) + ' "' + activeMedia[0].fileName + '")'
                          }
                        } else if (activeMedia.length > 1) {
                          for (var i = 0; i < activeMedia.length; i++) {
                            if (i === 0 && !isFirstN) {
                              str += '\n';
                            }

                            if (activeMedia[i].isImage) {
                              str += '\n![' + activeMedia[i].fileName + '](' + encodeURI(activeMedia[i].src) + ' "' + activeMedia[i].fileName + '")\n';
                            } else {
                              str += '\n[' + activeMedia[i].fileName + '](' + encodeURI(activeMedia[i].src) + ' "' + activeMedia[i].fileName + '")\n';
                            }
                            if (i === activeMedia.length - 1 && !isLastN) {
                              str += '\n';
                            }
                          }
                        }

                        e.replaceSelection(str);

                        var newSelected = e.getContent().length - (content.length - selected.end);
                        e.setSelection(newSelected, newSelected);

                        scope.content = e.getContent();
                      });
                    }
                  },
                  {
                    name: 'cmdVideo',
                    title: '视频',
                    hotkey: 'Ctrl+D',
                    icon: { fa: 'fa fa-video-camera' },
                    callback: function (e) {
                      $('#videoInsert').modal('show');
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