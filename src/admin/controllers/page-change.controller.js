/**
 * Page Change Controller
 */
angular.module('controllers').controller('pageChange', ['$scope', '$state', '$stateParams', '$http', 'account', '$sce',
  function ($scope, $state, $stateParams, $http, account, $sce) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = true;
    $scope._id = $stateParams.page;
    $scope.name = '';
    $scope.pageContent = '';
    $scope.pageMedia = [];
    $scope.editAuth = false;
    $scope.readAuth = false;

    /**
     * 读取用户编辑权限以及返回读取当前单页
     */
    var getAuthAndGetPage = account.auths()
      .then(function (auths) {
        $scope.editAuth = auths.pages.edit;
        $scope.readAuth = auths.pages.read;

        if (auths.pages.read && !auths.pages.edit) {
          return $http.get('/api/pages/' + $stateParams.page);
        } else if (auths.pages.edit) {
          return $http.get('/api/pages/' + $stateParams.page, { params: { markdown: true } });
        }
      }, function () {
        $scope.$emit('notification', {
          type: 'danger',
          message: '读取权限失败'
        });
      });

    /**
     * 读取当前单页
     */
    if ($stateParams.page) {
      getAuthAndGetPage
        .then(function (res) {
          var data = res.data;

          if (data) {
            if (!_.isEmpty(data.pageMedia)) {
              _.forEach(data.pageMedia, function (medium) {
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

                $scope.pageMedia.push(_medium);
              });
            }

            $scope.name = data.name;

            if ($scope.editAuth) {
              $scope.pageContent = data.pageContent;
            } else if ($scope.readAuth) {
              $scope.pageContent = $sce.trustAsHtml(data.pageContent);
            }

            $scope.transmitting = false;
          } else {
            $scope.transmitting = true;
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
    $scope.savePage = function () {
      $scope.transmitting = true;

      var data = {
        pageContent: $scope.pageContent
      };

      if (!_.isEmpty($scope.pageMedia)) {
        data.pageMedia = _.map($scope.pageMedia, '_id');
      }

      $http.put('/api/pages/' + $stateParams.page, data)
        .then(function () {
          $scope.transmitting = false;

          $scope.$emit('notification', {
            type: 'success',
            message: '更新单页成功'
          });

          $state.go('main.pages', { page: $stateParams.page }, { reload: 'main.pages' });
        }, function () {
          $scope.$emit('notification', {
            type: 'danger',
            message: '更新单页失败'
          });
        });
    };
  }
]);