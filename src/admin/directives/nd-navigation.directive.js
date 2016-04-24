/**
 * ndNavigation Directives
 */
angular.module('directives').directive('ndNavigation', ['$templateCache', '$rootScope', '$state', '$timeout', '$http', '$filter', 'account',
  function ($templateCache, $rootScope, $state, $timeout, $http, $filter, account) {
    return {
	    restrict: 'E',
	    template: $templateCache.get('navigation.view.html'),
      link: function (scope, element) {
        /**
         * 初始化变量
         */
        scope.notFoundPages = false;
        scope.notFoundContents = false;
        scope.auth = {};
        scope.categories = [];
	      scope.user = {};

        /**
         * 激活滑动门
         */
        function slideShow () {
          $timeout(function () {
            $('.sub-list').each(function () {
              var self = $(this);

              if (self.children('.item').hasClass('active')) {
                self.siblings('.item').addClass('active select');
              } else {
                self
                  .slideUp('fast', function () {
                    self.siblings('.sub-list-heading').removeClass('select');
                  })
                  .siblings('.sub-list-heading').removeClass('active');
              }
            });
          });
        }

        /**
         * 读取用户
         */
        function loadUser () {
          account.get()
            .then(function (user) {
              scope.user = user;
            }, function () {
              scope.$emit('notification', {
                type: 'danger',
                message: '读取用户失败'
              });
            });

          account.auths()
            .then(function (auths) {
              scope.auths = auths;
            }, function () {
              scope.$emit('notification', {
                type: 'danger',
                message: '读取权限失败'
              });
            });
        } loadUser();

        /**
         * 退出登录
         */
        scope.signOut = function () {
          $http.put('/api/account/sign-out')
            .then(function () {
              // 清空账户缓存
              account.reset();
              $state.go('signIn');
            }, function () {
              scope.$emit('notification', {
                type: 'danger',
                message: '退出登录失败'
              });
            });
        };

        /**
         * 读取栏目列表
         */
        function loadCategories () {
          $http.get('/api/categories')
            .then(function (res) {
              var data = res.data;

              scope.categories = $filter('filter')(data, function (value) {
                if (value.type !== 'channel' && value.type !== 'link') {
                  return true;
                }
              });

              if (!_.find(data, { type: 'page', mixed: { isEdit: true } })) {
                scope.notFoundPages = true;
              } else {
                scope.notFoundPages = false;
              }

              if (!_.find(data, { type: 'column' })) {
                scope.notFoundContents = true;
              } else {
                scope.notFoundContents = false;
              }

              $timeout(function () {
                slideShow();
              });
            });
        } loadCategories();

        /**
         * 接收路由状态变更消息
         */
        $rootScope.$on('$stateChangeSuccess', function () {
          $timeout(function () {
            slideShow();
          });
        });

        /**
         * 接收分类更新消息
         */
        $rootScope.$on('mainCategoriesUpdate', function () {
          loadCategories();
        });

        /**
         * 接收用户更新消息
         */
        $rootScope.$on('mainUserUpdate', function () {
          account.reset();

          loadUser();
        });

        /**
         * 滑动门
         */
        $('.navigation').on('click', '.sub-list-heading', function () {
          var self = $(this);

          if (self.hasClass('select')) {
            self.siblings('.sub-list').slideUp('fast', function () {
              $(this).siblings('.sub-list-heading').removeClass('select');
            });
          } else {
            self.siblings('.sub-list').slideDown('fast', function () {
              $(this).siblings('.sub-list-heading').addClass('select');
            });
          }

          $('.sub-list:visible').not(self.siblings('.sub-list')).slideUp('fast', function () {
            $(this).siblings('.sub-list-heading').removeClass('select');
          });
        });
      }
    }
  }
]);