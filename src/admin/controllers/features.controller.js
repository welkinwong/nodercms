/**
 * Features Controller
 */
angular.module('controllers').controller('features', ['$scope', '$rootScope', '$http', 'account',
  function ($scope, $rootScope, $http, account) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = false;
    $scope.noFeatureModel = false;
    $scope.deleteFeatureInfo = {
      modelId: '',
      featureId: '',
    };
    $scope.models = [];
    $scope.currentAuth = false;
    $scope.editAuth = false;

    /**
     * 读取用户编辑权限
     */
    account.auths()
      .then(function (auths) {
        $scope.editAuth = auths.features.edit;
      }, function () {
        $scope.$emit('notification', {
          type: 'danger',
          message: '读取权限失败'
        });
      });

    /**
     * 读取内容模型列表
     */
    async.parallel({
      model: function (callback) {
        $http.get('/api/models', {
          params: {
            type: 'feature'
          }
        }).then(function (res) {
          callback(null, res.data);
        }, function () {
          callback('读取推荐模型失败');
        });
      },
      features: function (callback) {
        $http.get('/api/features')
          .then(function (res) {
            callback(null, res.data);
          }, function () {
            callback('读取推荐失败');
          });
      }
    }, function (err, results) {
      if (err) {
        $scope.$emit('notification', {
          type: 'danger',
          message: err
        });

        return false;
      }

      if (_.isEmpty(results.model)) return $scope.noFeatureModel = true;

      $scope.models = _.map(results.model, function (model) {
        model.features = _.filter(results.features, function (feature) {
          return feature.model === model._id;
        });

        return model;
      });
    });

    /**
     * 删除推荐
     */
    $scope.deleteFeature = function () {
      $scope.transmitting = true;

      var featureInfo = $scope.deleteFeatureInfo;
      $http.delete('/api/features/' + featureInfo.featureId)
        .then(function () {
          var model = _.find($scope.models, { _id: featureInfo.modelId });

          _.forEach(model.features, function (feature, index) {
            if (feature._id === featureInfo.featureId) {
              model.features.splice(index, 1);

              return false;
            }
          });

          $('#deleteModal').modal('hide');

          $scope.transmitting = false;

          $scope.$emit('notification', {
            type: 'success',
            message: '删除推荐成功'
          });
        }, function () {
          $scope.$emit('notification', {
            type: 'danger',
            message: '删除推荐失败'
          });
        });
    };
  }
]);