(function () {
    "use strict";
    angular.module('starter.services', []).factory('allAlbums', allAlbums);
    allAlbums.$inject = ['$http'];

    function allAlbums($http) {
        return {
            getAllAlbums: getAllAlbums
        };

        function getAllAlbums() {
            return $http({
                    method: "GET",
                    url: "../data.json"
                })
                .success(function (res, status, headers, config) {
                    alert("response" + res);
                    return res;
                })
                .error(function (res, status, headers, config) {
                    alert("err" + JSON.stringify(res));
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
