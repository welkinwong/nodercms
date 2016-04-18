angular.module('directives').directive('ndNotification', ['$timeout', '$rootScope',
  function ($timeout, $rootScope) {
    return {
      replace: true,
      link: function(scope) {
        /**
         * 初始化变量
         */
        var isLoop;
        var counter;

        /**
         * 循环计数器
         */
        function loop () {
          isLoop = true;
          $timeout(function () {
            if (counter-- > 0) {
              loop();
            } else {
              isLoop = false;
              scope.notificationShow = false;
            }
          }, 1000);
        };

        /**
         * 接收通知
         * @param  {Object} event
         * @param  {String} data.type    通知类型
         * @param  {String} data.message 通知信息
         */
        $rootScope.$on('notification', function (event, data) {
          counter = 3;
          scope.type = data.type;
          scope.message = data.message;
          scope.notificationShow = true;
          if (!isLoop) loop();
        });
      }
    };
  }
]);