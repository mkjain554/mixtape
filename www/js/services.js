(function () {
    "use strict";
    angular.module('starter').factory('allAlbums', allAlbums);
    allAlbums.$inject = ['$http'];

    function allAlbums($http) {
        return {
            getAllAlbums: getAllAlbums
        };

        function getAllAlbums(page, type) {

            return $http.get("http://mixtapeupload.net/webservices/get_albums.php?page=" + page + "&type=" + type)
                .success(function (res, status, headers, config) {
                    return res.data;
                })
                .error(function (res, status, headers, config) {
                    return res;
                });
        }
    }
})();
(function () {
    "use strict";
    angular.module('starter').factory('albumDetail', albumDetail);
    albumDetail.$inject = ['$http'];

    function albumDetail($http) {
        return {
            getAlbumDetail: getAlbumDetail,
            markFavourite: markFavourite,
            unMarkFavourite: unMarkFavourite
        };

        function getAlbumDetail(page, songid) {

            return $http({
                    method: "GET",
                    url: "http://mixtapeupload.net/webservices/get_songs.php?page=" + page + "&al_id=" + songid
                })
                .success(function (res, status, headers, config) {
                    return res.data;
                })
                .error(function (res, status, headers, config) {
                    return res;
                });
        }

        function markFavourite(song, user_id) {
            return $http({
                    method: "GET",
                    url: "http://mixtapeupload.net/webservices/add_single_favorite.php?song_id=" + song.id + "&user_id=" + user_id
                })
                .success(function (res, status, headers, config) {
                    return res.data;
                })
                .error(function (res, status, headers, config) {
                    return res;
                });
        }

        function unMarkFavourite(song, user_id) {
            return $http({
                    method: "GET",
                    url: "http://mixtapeupload.net/webservices/del_single_favorite.php?song_id=" + song.id + "&user_id=" + user_id
                })
                .success(function (res, status, headers, config) {
                    return res.data;
                })
                .error(function (res, status, headers, config) {
                    return res;
                });
        }
    }
})();
(function () {
    "use strict";
    angular.module('starter').factory('loginService', login);
    login.$inject = ['$http'];

    function login($http) {
        return {
            login: login
        };

        function login(email, password) {
            return $http({
                    method: "GET",
                    url: "http://mixtapeupload.net/webservices/signin.php?email=" + email + "&password=" + password
                })
                .success(function (res, status, headers, config) {
                    return res.data;
                })
                .error(function (res, status, headers, config) {
                    return res;
                });
        }
    }
})();
(function () {
    "use strict";
    angular.module('starter').factory('registerService', register);
    register.$inject = ['$http'];

    function register($http) {
        return {
            register: register
        };

        function register(email, password, cpassword) {
            return $http({
                    method: "GET",
                    url: "http://mixtapeupload.net/webservices/register.php?email=" + email + "&password=" + password + "&cpassword=" + cpassword
                })
                .success(function (res, status, headers, config) {
                    return res.data;
                })
                .error(function (res, status, headers, config) {
                    return res;
                });
        }
    }
})();
(function () {
    "use strict";
    angular.module('starter').factory('hotAlbums', hotAlbums);
    hotAlbums.$inject = ['$http'];

    function hotAlbums($http) {
        return {
            getHotAlbums: getHotAlbums
        };

        function getHotAlbums(page) {
            return $http({
                    method: "GET",
                    url: "http://mixtapeupload.net/webservices/get_hot_songs.php?page=" + page
                })
                .success(function (res, status, headers, config) {
                    return res.data;
                })
                .error(function (res, status, headers, config) {
                    return res;
                });
        }
    }
})();

angular.module('starter.services', [])
    .service('UserService', function () {
        // For the purpose of this example I will store user data on ionic local storage but you should save it on a database
        var setUser = function (user_data) {
            window.localStorage.starter_facebook_user = JSON.stringify(user_data);
        };

        var getUser = function () {
            return JSON.parse(window.localStorage.starter_facebook_user || '{}');
        };

        return {
            getUser: getUser,
            setUser: setUser
        };
    });
