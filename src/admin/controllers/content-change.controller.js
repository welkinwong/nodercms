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
    $scope.alias = '';
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

    /**
     * 绑定 Alias 翻译
     */
    $scope.$watch('title', function (newTitle) {
      $scope.alias = pinyin(newTitle);
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

      $http.get('/api/contents/' + $stateParams.content, { params: { toMarkdown: false } })
        .then(function (res) {
          if (res.data) {
            var content = res.data;

            $scope.status = content.status;
            $scope.title = content.title;
            $scope.alias = content.alias;

            if (res.data.thumbnail) {
              $scope.thumbnail._id = res.data.thumbnail._id;
              $scope.thumbnail.uploadStatus = 'success';
              $scope.thumbnail.croppedImage = res.data.thumbnail.src;
            }

            if (!_.isEmpty(res.data.media)) {
              _.map(res.data.media, function (medium) {
                $scope.media.push({
                  file: null,
                  fileName: medium.fileName,
                  src: medium.src,
                  _id: medium._id,
                  uploadStatus: 'success',
                  active: false
                });
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
            if (content.extensions) $scope.extensions = content.extensions;

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
     * 保存当前内容
     */
    $scope.saveContent = function () {
      var content = {
        status: $scope.status,
        category: $scope.$parent.category._id,
        title: $scope.title,
        alias: $scope.alias
      };

      if ($scope.thumbnail._id) {
        content.thumbnail = $scope.thumbnail._id;
      }

      if (!_.isEmpty($scope.media)) {
        content.media = _.map($scope.media, '_id');
      }

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