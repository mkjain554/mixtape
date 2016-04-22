angular.module('starter').controller('VideosCtrl', function ($scope, $http, $rootScope, $state, allAlbums) {
    $scope.onTouch = function () {
        $state.go("currentsong");
    }
    $scope.pageNumber = 0;
    $scope.noMoreItemsAvailable = false;

    function populateAlbums(page, type, callback) {
        var promise = allAlbums.getAllAlbums(page, type);
        promise.then(function (response) {
            if (response && response.data && response.data.data) {
                callback(response.data.data);
            } else {
                $scope.noMoreItemsAvailable = true;
            }
        })
    }

    $rootScope.showTabs = true;
    $scope.androidPlatform = ionic.Platform.isAndroid();
    $scope.iosPlatform = ionic.Platform.isIOS();
    $scope.albums = [];
    $scope.loadMore = function () {
        $scope.pageNumber = $scope.pageNumber + 1;
        populateAlbums($scope.pageNumber, "a", function (data) {
            $scope.albums = $scope.albums.concat(data);
            $scope.allAlbums = $scope.allAlbums.concat(data);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            if ($scope.pageNumber == 1) {
                $scope.selectedAlbumVar = $scope.albums[0];
                $rootScope.selectedAlbumVar = $scope.albums[0];
            }
        });
    };

    setTimeout(function () {
        var windowHeight = $(window).height();
        var playerHeight = 140;
        var headerHeight = 50;
        var tabHeight = 48;
        var centerHeight = 50;
        var contentHeight = windowHeight - (playerHeight + headerHeight + tabHeight + centerHeight);
        $(".musiclist").height(contentHeight);
    }, 0)

    $scope.selectedAlbum = function (item) {
        $scope.selectedAlbumVar = item;
        $rootScope.selectedAlbumVar = item;
    }
});
