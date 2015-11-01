/**
 * ndNavigation Directives
 */
angular.module('directives').directive('ndNavigation', ['$timeout', '$http', '$filter', 'ipCookie',
  function ($timeout, $http, $filter, ipCookie) {
    return {
      link: function (scope, element) {
        /**
         * 初始化变量
         */
        scope.auth = {
          contentManage: false,
          mediaLibrary: false,
          setting: false,
          siteInfo: false,
          categories: false,
          contentModels: false,
          roles: false,
          adminUsers: false
        };
        scope.categories = [];
        scope.user = ipCookie('userInfo');

        /**
         * 按用户权限设置可见性
         */
        for (var i = 0; i < scope.user.role.authorities.length; i++) {
          var currentAuth = scope.user.role.authorities[i];
          var roleString = currentAuth.toString();
          var firstRole = Number(roleString.substring(0, 5));
          var settingRole = Number(roleString.substring(0, 2));

          // 权限为管理员时
          if (firstRole === 10000) {
            for (var key in scope.auth) {
              scope.auth[key] = true;
            }

            // 退出外层循环
            break;
          }

          // 权限包含设置
          if (!scope.auth.setting && settingRole === 14) scope.auth.setting = true;

          // 按权限设置可见性
          switch (firstRole) {
            // 内容管理
            case 11000:
              scope.auth.contentManage = true;

              break;
            // 媒体库
            case 12000:
              scope.auth.mediaLibrary = true;

              break;
            // 网站配置
            case 14001:
              scope.auth.siteInfo = true;

              break;
            // 内容分类
            case 14002:
              scope.auth.categories = true;

              break;
            //内容模型
            case 14003:
              scope.auth.contentModels = true;
          }
        }

        /**
         * 激活滑动门
         */
        function slideShow () {
          $('.sub-list').each(function () {
            if ($(this).children('.item').hasClass('active')) {
              $(this).siblings('.item').addClass('active select');
            } else {
              $(this)
                .slideUp('fast', function () {
                  $(this).siblings('.sub-list-heading').removeClass('select');
                })
                .siblings('.sub-list-heading').removeClass('active');
            }
          });
        }

        /**
         * 读取栏目列表
         */
        $http.get('/api/categories')
          .success(function (data) {
            scope.categories = $filter('filter')(data, function (value, index) {
              if (value.type !== 'channel' && value.type !== 'link') {
                return true;
              }
            });

            $timeout(function () {
              slideShow();
            });
          });

        /**
         * 接收状态变更消息
         */
        scope.$on('$stateChangeSuccess', function () {
          $timeout(function () {
            slideShow();
          });
        });

        /**
         * 滑动门
         */
        $('.navigation').on('click', '.sub-list-heading', function () {
          if ($(this).hasClass('select')) {
            $(this)
              .siblings('.sub-list')
              .slideUp('fast', function () {
                $(this).siblings('.sub-list-heading').removeClass('select');
              });
          } else {
            $(this)
              .siblings('.sub-list')
              .slideDown('fast', function () {
                $(this).siblings('.sub-list-heading').addClass('select');
              });
          }
        });
      }
    }
  }
]);