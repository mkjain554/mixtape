angular.module('starter').controller('RootCtrl', function ($scope, $state) {
    $scope.logout = function () {
        $state.go("login", {
            reload: true
        });
    }

});
