angular.module('starter').controller('AlbumDetailCtrl', function ($scope, $state, $rootScope, albumDetail, $cordovaMedia, $ionicLoading) {
    var albumid = $state.params.id;
    /*    for (var i = 0; i < $rootScope.allAlbums.length; i++) {
            if ($rootScope.allAlbums[i].id == albumid) {
                $scope.selectedAlbumVar = $rootScope.allAlbums[i];
            }
        }*/
    var userid = $rootScope.user && $rootScope.user.id ? $rootScope.user.id : '';
    var promise = albumDetail.getAlbumDetail(1, albumid, userid);
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
        if ($rootScope.user && $rootScope.user.id) {
            var promise = albumDetail.markFavourite(song, $rootScope.user.id);
            promise.then(function (response) {
                console.log("response of markFavouirte.." + JSON.stringify(response));
                for (var i = 0; i < $scope.selectedAlbumVar.songs.length; i++) {
                    if ($scope.selectedAlbumVar.songs[i].id == song.id) {
                        $scope.selectedAlbumVar.songs[i].like = true;
                    }
                }
            })
        } else {
            alert("Please Login to like this song");
        }
    }
    $scope.likeSong = function (song) {
        if ($rootScope.user && $rootScope.user.id) {
            var promise = albumDetail.likeSong(song, $rootScope.user.id);
            promise.then(function (response) {
                console.log("response of markFavouirte.." + JSON.stringify(response));
                for (var i = 0; i < $scope.selectedAlbumVar.songs.length; i++) {
                    if ($scope.selectedAlbumVar.songs[i].id == song.id) {
                        $scope.selectedAlbumVar.songs[i].like = true;
                    }
                }
            })
        } else {
            alert("Please Login to like this song");
        }
    }

    $scope.unMarkFavourite = function (song) {
        if ($rootScope.user && $rootScope.user.id) {
            var promise = albumDetail.unMarkFavourite(song, $rootScope.user.id);
            promise.then(function (response) {
                console.log("response of unMarkFavouirte.." + JSON.stringify(response));
                for (var i = 0; i < $scope.selectedAlbumVar.songs.length; i++) {
                    if ($scope.selectedAlbumVar.songs[i].id == song.id) {
                        $scope.selectedAlbumVar.songs[i].like = false;
                    }
                }
            })
        } else {
            alert("Please Login to like this song");
        }

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


    $scope.download = function (song) {
        var song_url = song.song_url;
        var songName = song_url.substring(song_url.lastIndexOf("/") + 1);
        $ionicLoading.show({
            template: 'Loading...'
        });
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
                fs.root.getDirectory(
                    "EP", {
                        create: true
                    },
                    function (dirEntry) {
                        dirEntry.getFile(
                            songName, {
                                create: true,
                                exclusive: false
                            },
                            function gotFileEntry(fe) {
                                var p = fe.toURL();
                                fe.remove();
                                ft = new FileTransfer();
                                ft.download(
                                    encodeURI(song_url),
                                    p,
                                    function (entry) {
                                        $ionicLoading.hide();
                                        console.log(entry.toURL());
                                        //$scope.imgFile = entry.toURL();
                                    },
                                    function (error) {
                                        alert(error);
                                        $ionicLoading.hide();
                                        alert("Download Error Source -> " + error.source);
                                    },
                                    false,
                                    null
                                );
                            },
                            function () {
                                $ionicLoading.hide();
                                console.log("Get file failed");
                            }
                        );
                    }
                );
            },
            function () {
                $ionicLoading.hide();
                console.log("Request for filesystem failed");
            });
    }
    $scope.loadSong = function (song) {
        var song_url = song.song_url;
        var songName = song_url.substring(song_url.lastIndexOf("/") + 1);
        $ionicLoading.show({
            template: 'Loading...'
        });
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
                fs.root.getDirectory(
                    "EP", {
                        create: false
                    },
                    function (dirEntry) {
                        dirEntry.getFile(
                            songName, {
                                create: false,
                                exclusive: false
                            },
                            function gotFileEntry(fe) {
                                $ionicLoading.hide();
                                $scope.playSong(fe.toURL());
                                //$scope.imgFile = fe.toURL();
                            },
                            function (error) {
                                $ionicLoading.hide();
                                console.log("Error getting file");
                                $scope.playSong();
                            }
                        );
                    }
                );
            },
            function () {
                $ionicLoading.hide();
                console.log("Error requesting filesystem");
                $scope.playSong();
            });
    }
});