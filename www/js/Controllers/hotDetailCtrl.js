angular.module('starter').controller('HotDetailCtrl', function ($scope, $state, $rootScope, albumDetail, $cordovaMedia, $ionicLoading) {
    var albumid = $state.params.id;
    for (var i = 0; i < $rootScope.allAlbums.length; i++) {
        if ($rootScope.allAlbums[i].id == albumid) {
            $scope.selectedAlbumVar = $rootScope.allAlbums[i];
        }
    }


    var mediaStatusCallback = function (status) {
        if (status == 1) {
            $ionicLoading.show({
                template: 'Loading...'
            });
        } else {
            $ionicLoading.hide();
        }
    }
    $scope.pauseSong = function () {
        $rootScope.currentPosition = $rootScope.media.getCurrentPosition();
        $scope.togglePlayPause = !$scope.togglePlayPause;
        $rootScope.media.pause();
    }
    $scope.playSelectedSong = function (song, index) {
        $scope.selectedSong = song;
        $scope.playSong(song.song_url, index);
    }
    $scope.playSong = function (src, index) {
        if ($rootScope && $rootScope.media) {
            $rootScope.media.stop();
            delete $rootScope.media;
            delete $rootScope.currentPosition;
        }
        $scope.togglePlayPause = !$scope.togglePlayPause;
        if (src) {
            var media = new Media(src, null, null, mediaStatusCallback);
            $rootScope.media = media;
            media.play();
        } else {

            var media = new Media($scope.selectedSong.song_url, null, null, mediaStatusCallback);
            $rootScope.media = media;
            if ($rootScope.currentPosition) {
                $rootScope.media.seekTo($rootScope.currentPosition);
            }
            media.play();
        }
    }


});
