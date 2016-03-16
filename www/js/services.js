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
