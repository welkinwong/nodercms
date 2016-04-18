/**
 * Features Controller
 */
angular.module('controllers').controller('featuresChange', ['$scope', '$state','$stateParams', '$http',
  function ($scope, $state, $stateParams, $http) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = true;
    $scope.action = 'create';
    $scope._id = '';
    $scope.sort = 0;
    $scope.title = '';
    $scope.link = '';
    $scope.thumbnail = {};
    $scope.extensions = {};
    $scope.model = {};

    /**
     * 读取当前推荐模型和推荐
     */
    async.parallel({
      model: function (callback) {
        $http.get('/api/models/' + $stateParams.model)
          .then(function (res) {
            callback(null, res.data);
          }, function () {
            callback('读取推荐模型失败');
          });
      },
      feature: function (callback) {
        if (!$stateParams.feature) return callback();

        $http.get('/api/features/' + $stateParams.feature)
          .then(function (res) {
            callback(null, res.data);
          }, function () {
            callback('读取推荐失败');
          });
      }
    }, function (err, result) {
      if (err) {
        $scope.$emit('notification', {
          type: 'danger',
          message: err
        });

        return false;
      }

      var model = result.model;
      var feature = result.feature;

      $scope.model = model;
      $scope._id = feature._id;

      if ($stateParams.feature) {
        $scope.action = 'update';
        $scope.sort = feature.sort;
        $scope.title = feature.title;
        $scope.link = feature.link;
        $scope.extensions = feature.extensions;

        if (feature.thumbnail) {
          $scope.thumbnail._id = feature.thumbnail._id;
          $scope.thumbnail.uploadStatus = 'success';
          $scope.thumbnail.croppedImage = feature.thumbnail.src;
        }
      }

      $scope.transmitting = false;
    });

    /**
     * 保存当前推荐
     */
    $scope.saveFeature = function () {
      $scope.transmitting = true;

      var feature = {
        model: $scope.model._id,
        sort: $scope.sort,
        title: $scope.title,
      };

      if ($scope.link) feature.link = $scope.link;
      if ($scope.thumbnail._id) feature.thumbnail = $scope.thumbnail._id;
      if (!_.isEmpty($scope.extensions)) feature.extensions = $scope.extensions;

      if ($stateParams.feature) {
        $http.put('/api/features/' + $stateParams.feature, feature)
          .then(function () {
            $scope.$emit('notification', {
              type: 'success',
              message: '更新推荐成功'
            });

            $state.go('main.features', null, { reload: 'main.features' });
          }, function () {
            $scope.$emit('notification', {
              type: 'danger',
              message: '更新推荐失败'
            });
          });
      } else {
        $http.post('/api/features', feature)
          .then(function () {
            $scope.$emit('notification', {
              type: 'success',
              message: '发布推荐成功'
            });

            $state.go('main.features', null, { reload: 'main.features' });
          }, function () {
            $scope.$emit('notification', {
              type: 'danger',
              message: '发布推荐失败'
            });
          });
      }
    };
  }
]);