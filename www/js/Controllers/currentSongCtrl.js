angular.module('starter').controller('CurrentSongCtrl', function ($scope, $rootScope, $ionicHistory) {
    $scope.selectedAlbumVar = $rootScope.selectedAlbumVar;
    $scope.closeView = function () {
        $ionicHistory.goBack();
    }
});
