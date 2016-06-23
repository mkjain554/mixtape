// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var contentHeight = "";
angular.module('starter', ['ionic', 'starter.services', 'ngAudio', 'ngLoadingSpinner', 'ngCordova', 'ionic-ratings'])

.run(function ($ionicPlatform, $rootScope) {
    $ionicPlatform.ready(function () {

        //alert(contentHeight)


        //alert(playerHeight)
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
        $rootScope.allAlbums = [];
        $rootScope.showTabs = true;

    });
})

.config(function ($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider


        .state('root', {
            url: '/root',
            abstract: true,
            templateUrl: 'templates/main.html',
            controller: "RootCtrl"
        })
        .state('root.login', {
            url: '/login',
            views: {
                'main-content': {
                    templateUrl: 'templates/login.html',
                    controller: 'LoginCtrl'
                }
            }
        })
        .state('root.videos', {
            url: '/videos',
            views: {
                'main-content': {
                    templateUrl: 'templates/tab-videos.html',
                    controller: 'VideosCtrl'
                }
            }
        })
        .state('root.favouites', {
            url: '/favouites',
            views: {
                'main-content': {
                    templateUrl: 'templates/favsongs.html',
                    controller: 'FavCtrl'
                }
            }
        })
        .state('root.hot', {
            url: '/hot',
            views: {
                'main-content': {
                    templateUrl: 'templates/tab-hot.html',
                    controller: 'HotCtrl'
                }
            }
        })
        .state('root.newMusic', {
            url: '/newMusic',
            views: {
                'main-content': {
                    templateUrl: 'templates/new-music.html',
                    controller: 'NewMusicCtrl'
                }
            }
        })
        .state('root.hosted', {
            url: '/hostedMusic',
            views: {
                'main-content': {
                    templateUrl: 'templates/tab-hosted.html',
                    controller: 'HostedMusicCtrl'
                }
            }
        })
        .state('root.videos-single', {
            url: '/videos-single/:id',
            views: {
                'main-content': {
                    templateUrl: 'templates/albumdetail.html',
                    controller: 'AlbumDetailCtrl'
                }
            }
        })
        .state('root.hot-single', {
            url: '/hot-single/:id',
            views: {
                'main-content': {
                    templateUrl: 'templates/hotdetail.html',
                    controller: 'HotCtrl'
                }
            }
        })

    .state('root.comingsoon', {
            url: '/comingsoon',
            views: {
                'main-content': {
                    templateUrl: 'templates/comingsoon.html',
                    controller: 'ComingSoonCtrl'
                }
            }
        })
        .state('currentsong', {
            url: "/currentsong",
            templateUrl: 'templates/currentsong.html',
            controller: 'CurrentSongCtrl'
        });


    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/root/videos');

});
