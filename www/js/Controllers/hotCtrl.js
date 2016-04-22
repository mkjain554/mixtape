angular.module('starter').controller('HotCtrl', function ($scope, $http, $rootScope, $state, hotAlbums) {
    console.log("hotCtrl called");
    $scope.pageNumber = 0;
    $scope.hotAlbums = [];

    function populateAlbums(page, callback) {
        var promise = hotAlbums.getHotAlbums(page);
        promise.then(function (response) {
            if (response && response.data && response.data.data) {
                callback(response.data.data);
            } else {
                $scope.noMoreItemsAvailable = true;
            }
        })
    }
    $scope.loadMore = function () {
        $scope.pageNumber = $scope.pageNumber + 1;
        populateAlbums($scope.pageNumber, function (data) {
            $scope.hotAlbums = $scope.hotAlbums.concat(data);
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };

});
