/**
 * Content Change Controller
 */
angular.module('controllers').controller('contentChange', ['$scope', '$state', '$stateParams', '$http', '$timeout', 'pinyin', 'Upload', '$filter',
  function ($scope, $state, $stateParams, $http, $timeout, pinyin, Upload, $filter) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = false;
    $scope.action = 'create';
    $scope.categoryId = $stateParams.category;
    $scope._id = $stateParams.content;
    $scope.status = 'draft';
    $scope.title = '';
    $scope.oldTitle = '';
    $scope.alias = '';
    $scope.oldAlias = '';
    $scope.abstract = '';
    $scope.content = '';
    $scope.tags = '';
    $scope.extensions = {};
    $scope.releaseDate = 'now';
    $scope.date = $filter('date')(new Date(), 'yyyy年MM月dd日');
    $scope.hour = $filter('date')(new Date(), 'hh');
    $scope.minute = $filter('date')(new Date(), 'mm');
    $scope.thumbnail = {};
    $scope.media = [];
    $scope.disabledExtMediaAdd = {};

    /**
     * 绑定 Alias 翻译
     */
    $scope.$watch('title', function (newTitle) {
      if (newTitle !== $scope.oldTitle) {
        $scope.alias = pinyin(newTitle);
      } else {
        $scope.alias = $scope.oldAlias;
      }
    });

    /**
     * 配置 Datepicker 控件
     */
    $('.input-group.date').datepicker({
      format: 'yyyy年mm月dd日',
      todayBtn: "linked",
      language: "zh-CN",
      autoclose: true,
      todayHighlight: true
    });

    /**
     * 读取当前内容
     * @param  {String} $stateParams.content 内容ID
     */
    if ($stateParams.content) {
      $scope.action = 'update';
      $scope.transmitting = true;

      $http.get('/api/contents/' + $stateParams.content, { params: { markdown: true } })
        .then(function (res) {
          if (res.data) {
            var content = res.data;

            $scope.status = content.status;
            $scope.title = content.title;
            $scope.oldTitle = _.clone(content.title);
            $scope.alias = content.alias;
            $scope.oldAlias = _.clone(content.alias);

            if (res.data.thumbnail) {
              $scope.thumbnail._id = res.data.thumbnail._id;
              $scope.thumbnail.uploadStatus = 'success';
              $scope.thumbnail.croppedImage = res.data.thumbnail.src;
            }

            if (!_.isEmpty(res.data.media)) {
              _.map(res.data.media, function (medium) {
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

                $scope.media.push(_medium);
              });
            }

            if (res.data.status === 'pushed') {
              $scope.date = $filter('date')(content.date, 'yyyy年MM月dd日');
              $scope.hour = $filter('date')(content.date, 'HH');
              $scope.minute = $filter('date')(content.date, 'mm');
              $scope.releaseDate = 'current';
            }

            if (content.abstract) $scope.abstract = content.abstract;
            if (content.content) $scope.content = content.content;
            if (content.tags) $scope.tags = content.tags.join(',');
            if (content.extensions) {
              $scope.extensions = content.extensions;

              _.map($scope.category.model.extensions, function (extension) {
                if (extension.type === 'media') {
                  if ($scope.extensions[extension.key] && extension.mixed.limit - $scope.extensions[extension.key].length < 1) {
                    $scope.disabledExtMediaAdd[extension.key] = true;
                  } else {
                    $scope.disabledExtMediaAdd[extension.key] = false;
                  }
                }
              });
            }

            $scope.transmitting = false;
          } else {
            $state.go('main.contents', { category: $scope.$parent.category._id }, { reload: 'main.contents' });
          }
        }, function () {
          $scope.$emit('notification', {
            type: 'danger',
            message: '获取内容失败'
          });
        });
    }

    /**
     * 添加扩展信息媒体
     */
    $scope.addExtensionMedia = function (key, limit) {
      $scope.extensions[key] = $scope.extensions[key] || [];

      $scope.mediaSelect({ limit: limit - $scope.extensions[key].length }, function (media) {
        $scope.extensions[key] = _.concat($scope.extensions[key], media);

        if (limit - $scope.extensions[key].length < 1) {
          $scope.disabledExtMediaAdd[key] = true;
        } else {
          $scope.disabledExtMediaAdd[key] = false;
        }
      });
    };

    /**
     * 删除扩展信息媒体
     */
    $scope.removeExtensionsMedia = function (key, limit, medium) {
      _.pull($scope.extensions[key], medium);

      if (limit - $scope.extensions[key].lengt < 1) {
        $scope.disabledExtMediaAdd[key] = true;
      } else {
        $scope.disabledExtMediaAdd[key] = false;
      }
    };

    /**
     * 保存当前内容
     */
    $scope.saveContent = function () {
      var content = {
        status: $scope.status,
        category: $scope.$parent.category._id,
        title: $scope.title,
        alias: $scope.alias
      };

      if ($scope.thumbnail._id) content.thumbnail = $scope.thumbnail._id;
      if (!_.isEmpty($scope.media)) content.media = _.map($scope.media, '_id');

      if ($scope.abstract !== '' || $scope.abstract !== undefined) {
        content.abstract = $scope.abstract;
      }

      if ($scope.content !== '' || $scope.content !== undefined) {
        content.content = $scope.content;
      }

      if ($scope.releaseDate === 'current') {
        content.date = moment($scope.date, 'YYYY年MM月DD日').hour($scope.hour).minute($scope.minute).format();
      } else if ($scope.releaseDate === 'now') {
        content.date = moment().format();
      }

      if ($scope.tags !== '' && $scope.tags !== undefined) {
        var tags = angular.copy($scope.tags);
        tags = tags.replace(/，| /g, ',');
        content.tags = tags.split(',');
      }

      if (!$.isEmptyObject($scope.extensions)) {
        content.extensions = $scope.extensions;
      }

      if ($stateParams.content) {
        $http.put('/api/contents/' + $stateParams.content, content)
          .then(function () {
            $scope.$emit('notification', {
              type: 'success',
              message: '修改内容成功'
            });

            $state.go('main.contents', { category: $scope.$parent.category._id }, { reload: 'main.contents' });
          });
      } else {
        $http.post('/api/contents', content)
          .then(function (res) {
            if ($scope.status === 'draft') {
              $scope.$emit('notification', {
                type: 'success',
                message: '保存草稿成功'
              });
            } else if ($scope.status === 'pushed') {
              $scope.$emit('notification', {
                type: 'success',
                message: '发布内容成功'
              });
            }

            $state.go('main.contents', { category: $scope.$parent.category._id }, { reload: 'main.contents' });
          }, function () {
            $scope.$emit('notification', {
              type: 'danger',
              message: '发布内容失败'
            });
          });
      }
    };
  }
]);