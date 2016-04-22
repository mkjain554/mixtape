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
        })
    }
    $scope.unMarkFavourite = function (song) {
        var promise = albumDetail.unMarkFavourite(song, $rootScope.user.id);
        promise.then(function (response) {
            console.log("response of unMarkFavouirte.." + JSON.stringify(response));
        })
    }
    $scope.ratingArray = [];
    $scope.currentSongRating;
    $scope.ratingsObject = {
        iconOn: 'ion-ios-star',
        iconOff: 'ion-ios-star-outline',
        iconOnColor: 'rgb(200, 200, 100)',
        iconOffColor: 'rgb(200, 100, 100)',
        rating: 0,
        minRating: 1,
        callback: function (rating) {
            $scope.ratingsCallback(rating);
            $scope.currentSongRating = rating;
        }
    };

    $scope.setRating = function (song) {
        $scope.ratingArray[song.id] = $scope.currentSongRating;
        var promise = albumDetail.getSongFeedback(song.id, $rootScope.user.id, $scope.currentSongRating);
        promise.then(function (response) {
            if (response && response.data && response.data.data) {

            }
        })
    }

    $scope.ratingsCallback = function (rating) {};
});
