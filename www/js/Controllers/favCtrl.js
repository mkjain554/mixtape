angular.module('starter').controller('FavCtrl', function ($scope, $http, $rootScope, $state, favSongs) {
    console.log("fav ctrl intiated");
    $rootScope.showTabs = true;
    $scope.androidPlatform = ionic.Platform.isAndroid();
    $scope.iosPlatform = ionic.Platform.isIOS();
    $scope.allFavSongs = [];

    $scope.loadFavSongs = function () {
        console.log("loadFavSongs Called");
        var promise = favSongs.getFavSongs(9);
        promise.then(function (response) {
            if (response && response.data && response.data.data) {
                $scope.allFavSongs = response.data.data;
                for (var i = 0; i < $scope.allFavSongs.length; i++) {
                    $scope.allFavSongs[i].star = true;
                }
            }
        })
    }
});
