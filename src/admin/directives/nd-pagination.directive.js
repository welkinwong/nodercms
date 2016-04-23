/**
 * ndPagination Directives
 */
angular.module('directives').directive('ndPagination', ['$templateCache',
  function ($templateCache) {
    return {
      restrict: 'E',
      template: $templateCache.get('pagination.view.html'),
      scope: {
        currentPage: '=',
        totalPages: '='
      },
      link: function (scope, element, attrs) {
        scope.pagesList = [];

        scope.changePage = function () {
          scope.pagesList = [];

          switch (true) {
            case scope.totalPages <= 7:
              for (var i = 0; i < scope.totalPages; i++) {
                scope.pagesList[i] = {
                  name: i + 1,
                  index: i + 1
                };
              }

              break;
            case scope.currentPage <= 3:
              scope.pagesList = [
                { name: 1, index: 1 },
                { name: 2, index: 2 },
                { name: 3, index: 3 },
                { name: 4, index: 4 },
                { name: 5, index: 5 },
                { name: 6, index: 6 },
                { name: '...' + scope.totalPages, index: scope.totalPages }
              ]

              break;
            case scope.currentPage > 3 && scope.currentPage <= scope.totalPages - 3:
              scope.pagesList.push({ name: '1...', index: 1 });
              for (var i = scope.currentPage - 2; i <= scope.currentPage + 2; i++) {
                scope.pagesList.push({ name: i, index: i });
              }
              scope.pagesList.push({ name: '...' + scope.totalPages, index: scope.totalPages });

              break;
            case scope.currentPage > scope.totalPages - 3:
              scope.pagesList.push({ name: '1...', index: 1 });
              for (var i = scope.totalPages - 5; i <= scope.totalPages; i++) {
                scope.pagesList.push({ name: i, index: i });
              }
          }

          $('body,html').scrollTop(0);
        };

        scope.$watchGroup(['currentPage', 'totalPages'], function () {
          scope.changePage();
        });
      }
    }
  }
]);