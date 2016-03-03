angular.module('starter.controllers', [])

.controller('VideosCtrl', function ($scope, $http) {
    $scope.images = [];
    $scope.loadImages = function () {
        /*$http.get("data.json").success(function (response) {
    $scope.images = response;
})*/
        for (var i = 1; i < 10; i++) {
            $scope.images.push({
                id: i,
                src: "img/" + i + ".jpg",
            });
        }   
        $scope.selectedItem = $scope.images[0];
        console.log("selectedItem.." + JSON.stringify($scope.selectedItem));
    }

    setTimeout(function () {
        console.log($('.musiclist').html())
        $('.musiclist').slick({
            slidesToShow: 2,
            rows: 2,
            slidesToScroll: 2,
            arrows: false
        });
        $("#jquery_jplayer_1").jPlayer({
            ready: function (event) {
                $(this).jPlayer("setMedia", {
                    title: "Bubble",
                    m4a: "http://jplayer.org/audio/m4a/Miaow-07-Bubble.m4a",
                    oga: "http://jplayer.org/audio/ogg/Miaow-07-Bubble.ogg"
                });
            },
            //swfPath: "../../dist/jplayer",
            supplied: "m4a, oga",
            wmode: "window",
            useStateClassSkin: true,
            autoBlur: false,
            smoothPlayBar: true,
            keyEnabled: true,
            remainingDuration: true,
            toggleDuration: true
        });
    }, 0);
    $scope.playSelectedItem = function (item) {
        $scope.selectedItem = item;
    }
})

.controller('NewMusicCtrl', function ($scope) {})

.controller('AllCtrl', function ($scope, $stateParams) {})

.controller('HostedCtrl', function ($scope) {});
