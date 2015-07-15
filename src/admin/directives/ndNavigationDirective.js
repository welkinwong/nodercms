/**
 * ndNavigation Directives
 */
angular.module('directives').directive('ndNavigation', ['$timeout', '$http', '$filter',
  function ($timeout, $http, $filter) {
    return {
      link: function (scope, element) {
        /**
         * 初始化变量
         */
        scope.categories = [];

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
        $('.sub-list-heading').on('click', function () {
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