angular.module('starter').controller('LoginCtrl', function ($scope, $http, usSpinnerService, $state, $q, $ionicLoading, UserService, loginService, registerService, $rootScope) {
    $scope.loginData = {
        username: '',
        password: ''
    };
    $scope.error = {
        username: false,
        password: false
    };
    $scope.registerData = {
        email: '',
        password: '',
        cpassword: ''
    };
    $scope.registererror = {
        email: false,
        password: false,
        cpassword: false,
        invalidemail: false
    };
    $scope.loginform = true;
    $scope.showLogin = function () {
        $scope.loginform = true;
        $scope.registerform = false;
    }
    $scope.showRegister = function () {
        $scope.registerform = true;
        $scope.loginform = false;
    }
    $scope.login = function () {
        if ($scope.loginData.username.length == 0 || $scope.loginData.password == 0) {
            $scope.error = {
                username: false,
                password: false
            };
            if ($scope.loginData.username.length == 0) {
                $scope.error.username = true;
            }
            if ($scope.loginData.password.length == 0) {
                $scope.error.password = true;
            }
            return;
        } else {
            $scope.error = {
                username: false,
                password: false
            };
        }
        var loginUrl = "http://mixtapeupload.net/webservices/signin.php";
        usSpinnerService.spin('spinner-1');
        loginService.login($scope.loginData.username, $scope.loginData.password).success(function (response) {
            console.log("response.data." + JSON.stringify(response.data));
            if (response && response.data) {
                $scope.loginData = {
                    username: '',
                    password: ''
                };
                $rootScope.user = response.data;
                $state.go("root.videos");
                return;
            }
        }).error(function (error) {
            alert(error);
        })

    }

    $scope.register = function () {
            if ($scope.registerData.email.length > 0) {
                var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                console.log(re.test($scope.registerData.email));
                if (!re.test($scope.registerData.email)) {
                    $scope.registererror.invalidemail = true;
                    $scope.registererror.email = true;
                } else {
                    $scope.registererror.invalidemail = false;
                    $scope.registererror.email = false;
                }
            } else {
                $scope.registererror.email = true;
            }
            if ($scope.registerData.password == 0 || $scope.registerData.cpassword == 0) {
                if ($scope.registerData.password.length == 0) {
                    $scope.registererror.password = true;
                }
                if ($scope.registerData.cpassword.length == 0) {
                    $scope.registererror.cpassword = true;
                }
                return;
            } else {
                $scope.registererror = {
                    email: false,
                    password: false,
                    cpassword: false
                };
            }

            usSpinnerService.spin('spinner-1');
            var promise = registerService.register($scope.registerData.email, $scope.registerData.password, $scope.registerData.cpassword);
            promise.then(function (response) {
                if (response && response.data) {
                    $scope.registerData = {
                        email: '',
                        password: '',
                        cpassword: ''
                    };
                    $state.go("root.login");
                    return;
                }
            });
        }
        // This is the success callback from the login method
    var fbLoginSuccess = function (response) {
        if (!response.authResponse) {
            fbLoginError("Cannot find the authResponse");
            return;
        }

        var authResponse = response.authResponse;

        getFacebookProfileInfo(authResponse)
            .then(function (profileInfo) {
                // For the purpose of this example I will store user data on local storage
                UserService.setUser({
                    authResponse: authResponse,
                    userID: profileInfo.id,
                    name: profileInfo.name,
                    email: profileInfo.email,
                    picture: "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
                });
                $ionicLoading.hide();
                $state.go('root.videos');
            }, function (fail) {
                // Fail get profile info
                alert('profile info fail', fail);
            });
    };

    // This is the fail callback from the login method
    var fbLoginError = function (error) {
        alert('fbLoginError', error);
        $ionicLoading.hide();
    };
    //This method is executed when the user press the "Login with facebook" button
    $scope.facebookSignIn = function () {
        facebookConnectPlugin.getLoginStatus(function (success) {
            if (success.status === 'connected') {
                // The user is logged in and has authenticated your app, and response.authResponse supplies
                // the user's ID, a valid access token, a signed request, and the time the access token
                // and signed request each expire
                console.log('getLoginStatus', success.status);

                // Check if we have our user saved
                var user = UserService.getUser('facebook');
                alert("user found from userservice.." + user);
                if (!user.userID) {
                    getFacebookProfileInfo(success.authResponse)
                        .then(function (profileInfo) {
                            // For the purpose of this example I will store user data on local storage
                            UserService.setUser({
                                authResponse: success.authResponse,
                                userID: profileInfo.id,
                                name: profileInfo.name,
                                email: profileInfo.email,
                                picture: "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large"
                            });

                            $state.go('root.videos');
                        }, function (fail) {
                            // Fail get profile info
                            console.log('profile info fail', fail);
                        });
                } else {
                    $state.go('root.videos');
                }
            } else {
                // If (success.status === 'not_authorized') the user is logged in to Facebook,
                // but has not authenticated your app
                // Else the person is not logged into Facebook,
                // so we're not sure if they are logged into this app or not.

                console.log('getLoginStatus', success.status);

                $ionicLoading.show({
                    template: 'Logging in...'
                });

                // Ask the permissions you need. You can learn more about
                // FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
                facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
            }
        });
    };
    // This method is to get the user profile info from the facebook api
    var getFacebookProfileInfo = function (authResponse) {
        var info = $q.defer();

        facebookConnectPlugin.api('/me?fields=email,name&access_token=' + authResponse.accessToken, null,
            function (response) {
                console.log(response);
                info.resolve(response);
            },
            function (response) {
                console.log(response);
                info.reject(response);
            }
        );
        return info.promise;
    };
});
