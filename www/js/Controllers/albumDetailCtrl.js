angular.module('starter').controller('AlbumDetailCtrl', function ($scope, $state, $rootScope, albumDetail, $cordovaMedia, $ionicLoading) {
    var albumid = $state.params.id;
    for (var i = 0; i < $rootScope.allAlbums.length; i++) {
        if ($rootScope.allAlbums[i].id == albumid) {
            $scope.selectedAlbumVar = $rootScope.allAlbums[i];
        }
    }
    var promise = albumDetail.getAlbumDetail(1, albumid);
    promise.then(function (response) {
        if (response && response.data && response.data.data) {
            $scope.selectedAlbumVar.songs = response.data.data;
            for (var i = 0; i < $scope.selectedAlbumVar.songs.length; i++) {
                $scope.selectedAlbumVar.songs[i].rating = 1;
            }
        }
        console.log("$scope.selectedAlubmvar.." + JSON.stringify($scope.selectedAlbumVar));
    })

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

    $scope.markFavourite = function (song) {
        var promise = albumDetail.markFavourite(song, $rootScope.user.id);
        promise.then(function (response) {
            console.log("response of markFavouirte.." + JSON.stringify(response));
            for (var i = 0; i < $scope.selectedAlbumVar.songs.length; i++) {
                if ($scope.selectedAlbumVar.songs[i].id == song.id) {
                    $scope.selectedAlbumVar.songs[i].like = true;
                }
            }
        })
    }
    $scope.unMarkFavourite = function (song) {
        var promise = albumDetail.unMarkFavourite(song, $rootScope.user.id);
        promise.then(function (response) {
            console.log("response of unMarkFavouirte.." + JSON.stringify(response));
            for (var i = 0; i < $scope.selectedAlbumVar.songs.length; i++) {
                if ($scope.selectedAlbumVar.songs[i].id == song.id) {
                    $scope.selectedAlbumVar.songs[i].like = false;
                }
            }
        })
    }
    $scope.isReadonly = true;
    $scope.rating2 = 5;
    $scope.rateFunction = function (rating, songId) {
        var promise = albumDetail.addSongFeedback(songId, $rootScope.user.id, rating);
        promise.then(function (response) {
            for (var i = 0; i < $scope.selectedAlbumVar.songs.length; i++) {
                if ($scope.selectedAlbumVar.songs[i].id == songId) {
                    $scope.selectedAlbumVar.songs[i].rating = rating;
                }
            }
        });
    };
});
