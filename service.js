//////////////////////////// P L E A S E   R E A D /////////////////////////////

//Runtime... Any functions that need to run at page load in your implementation file (app.js), needs to be put inside a $watch and inside the IF statement below.
//We're watching ClientID has been initialized before we can start making calls to the  API.
//We'll probably move this from the AngularAmsService.js to each app.js individually, but need to test createinvoice and event wizard
//and anything else that is using AngularAmsService.js before that can be done.


/*
// EXAMPLE
$rootScope.$watch('ClientID', function (newValue, oldValue) {
    if (newValue !== undefined) {
        //$scope.LoadWallPosts();
        //TODO: Load your function here.
    }
});
*/

app.service('ApiAuthenticationService', ['$q', '$injector', '$window', 'AmsApiTokenServiceUrl', 'AmsApiServiceUrl', function ($q, $injector, $window, AmsApiTokenServiceUrl, AmsApiServiceUrl) {
	this.Authenticate = function () {
		var $http = $injector.get('$http');
		var deferred = $q.defer();

		// authenticate here
		$http
			.post(AmsApiTokenServiceUrl, {})
			.then(function (result) {
				// make sure we have a valid token
				if (result.data && result.data.d && result.data.d.length > 0) {
					// we have a valid token
					var token = result.data.d;

					// now Authenticate with the API
					var authRequest = {
						method: 'POST',
						url: AmsApiServiceUrl + '/Authenticate/' + token,
						data: {},
						withCredentials: true,
						useXDomain: true,
						dataType: 'json'
					};

					$http(authRequest)
						.then(function (result) {
							// was authentication successful?
							if (result.data && result.data.UserId && result.data.ClientID) {
								// successful authorization
								AmsApiClientId = result.data.ClientID;

								deferred.resolve(result);
							}
							else {
								if (result.data && result.data.ResponseStatus) {
									// send back exception from API
									deferred.reject(result.data.ResponseStatus);
								}
								else {
									// auth failed for some unknown reason
									deferred.reject();
								}
							}
						}, function (reason) {
							deferred.reject(reason);
						});
				}
				else {
					deferred.reject('AdminSessionExpired');
				}
			}, function (reason) {
				deferred.reject(reason);
			});

		return deferred.promise;
	};
}]);

var AmsApiNumberOfCurrentHttpRequests = 0;

app.factory('ShowHideLoadingWidget', ['$q', 'LoadingWidgetSelector', function ($q, LoadingWidgetSelector)
{
	var showLoadingWidget = {
		request: function (config)
		{
			if (AmsApiCustomLoadingWidgetSelector && AmsApiCustomLoadingWidgetSelector.length > 0)
			{
				$(AmsApiCustomLoadingWidgetSelector).show();
			}
			else
			{
				AmsApiNumberOfCurrentHttpRequests++;

				if (AmsApiNumberOfCurrentHttpRequests == 1) {
					$(LoadingWidgetSelector).modal('show');
				}
			}

			return config;
		},
		response: function (response)
		{
			if (AmsApiCustomLoadingWidgetSelector && AmsApiCustomLoadingWidgetSelector.length > 0)
			{
				$(AmsApiCustomLoadingWidgetSelector).hide();
				AmsApiCustomLoadingWidgetSelector = '';
			}
			else
			{
				AmsApiNumberOfCurrentHttpRequests--;

				if (AmsApiNumberOfCurrentHttpRequests == 0) {
					$(LoadingWidgetSelector).modal('hide');
				}
			}

			return response;
		},
		responseError: function (response)
		{
			if (AmsApiCustomLoadingWidgetSelector && AmsApiCustomLoadingWidgetSelector.length > 0)
			{
				$(AmsApiCustomLoadingWidgetSelector).hide();
				AmsApiCustomLoadingWidgetSelector = '';
			}
			else
			{
				AmsApiNumberOfCurrentHttpRequests--;

				if (AmsApiNumberOfCurrentHttpRequests == 0) {
					$(LoadingWidgetSelector).modal('hide');
				}
			}

			return $q.reject(response);
		}
	};
	return showLoadingWidget;
}]);

app.factory('ApiAuthenticator', ['$q', '$injector', '$window', 'AmsApiServiceUrl', '$rootScope', function ($q, $injector, $window, AmsApiServiceUrl, $rootScope) {
	var apiAuthenticator = {
		request: function (config) {
			if (!AmsApiDisableAutoAuthentication) {
				// if we are making a call to the Ams API that is not an authentication, we must add the client id to the url
				if (config.url.indexOf(AmsApiServiceUrl) == 0 && config.url.indexOf(AmsApiServiceUrl + '/Authenticate') == -1) {
					config.url = config.url.replace(AmsApiServiceUrl, AmsApiServiceUrl + '/' + AmsApiClientId);
				}
			}

			return config;
		},
		response: function (response) {
			// reset this value so it is only good once
			AmsApiDisableAutoAuthentication = false;

			return response;
		},
		responseError: function (response)
		{
			if (!AmsApiDisableAutoAuthentication && (response.status === 401 || response.status === 403)) {
				// unauthorized so try to authenticate
				var AuthenticationService = $injector.get('ApiAuthenticationService');
				var $http = $injector.get('$http');
				var deferred = $q.defer();

				// make sure we don't try to authenticate again if any subsequent calls fail
				AmsApiDisableAutoAuthentication = true;

				// authenticate here
				AuthenticationService
					.Authenticate()
					.then(function (result) {
						deferred.resolve(result);
					}, function (reason) {
						deferred.reject(reason);
					});

				// after authentication, make same call again and chain the request
				return deferred
					.promise
					.then(function (result) {
						// if we get to this point, we know the original request was not an auth and definitely has the client id injected in the url
						// we need to deconstruct and reconstruct the original url with the correct id
						var url = response.config.url.replace(AmsApiServiceUrl, '');
						var parts = url.split('/');

						// replace old client id with new one (old one was probably 0 or the same so replace just in case)
						parts[1] = AmsApiClientId;

						// construct correct url
						response.config.url = AmsApiServiceUrl + parts.join('/');

						// ensure we don't add another client id in the url and prevent another authorization if this fails
						AmsApiDisableAutoAuthentication = true;

						return $http(response.config);
					}, function (reason) {
						if (reason) {
							if (reason == 'AdminSessionExpired') {
								// redirect so user can login again 
								$window.location.href = '/admin/Login.aspx?redir=/admin/invoice/CreateInvoice.aspx';
							}
							else {
							    // servicestack exception
							    window.console && console.log("Service Error has been logged.  Reason object follows:");
							    window.console && console.log(reason);
							    $window.alert('An service error has occurred.');
							}
						}
						else {
						    // unknown error
						    //This error was occurring when the browser request was interrupted by navigating away from the currently loading page.
                            //Suppressing for the time being on QAs request as the message does not add any value.
							//$window.alert('An unknown error has occurred.  Please try again.');
						}
					});
			}

			// reset this value so it is only good once
			AmsApiDisableAutoAuthentication = false;

			return $q.reject(response);
		}
	};
	return apiAuthenticator;
}]);

app.config(['$httpProvider', '$locationProvider', function ($httpProvider, $locationProvider) {
	$httpProvider.defaults.useXDomain = true;
	$httpProvider.defaults.withCredentials = true;

	$httpProvider.interceptors.push('ShowHideLoadingWidget');
	$httpProvider.interceptors.push('ApiAuthenticator');

	$locationProvider.html5Mode({ enabled: true, requireBase: false });
}]);

app.factory('ApiClientConfigLoader', ['$q', '$injector', 'AmsApiServiceUrl', function ($q, $injector, AmsApiServiceUrl)
{
	var apiClientConfigLoader = {
		init: function ()
		{
			var $http = $injector.get('$http');
			var deferred = $q.defer();

			$http
				.get(AmsApiServiceUrl + '/ClientConfig')
				.success(function (data, status, headers, config)
				{
					deferred.resolve(data);
				})
				.error(function (data, status, headers, config)
				{
					console.log(status);
					deferred.reject("Could not load client config data.");
				});

			return deferred.promise;
		}
	};

	return apiClientConfigLoader;
}]);

app.run(['ApiClientConfigLoader', '$rootScope', function (ApiClientConfigLoader, $rootScope)
{
	ApiClientConfigLoader
		.init()
		.then(function (result)
		{
			$rootScope.Locale = result.Locale;
			$rootScope.DateFormat = result.DateFormat;
			$rootScope.CurrencyDecimalSeparator = result.CurrencyDecimalSeparator;
			$rootScope.CurrencyGroupSeparator = result.CurrencyGroupSeparator;
			$rootScope.CurrencySymbol = result.CurrencySymbol;
			$rootScope.CurrencyNegativePattern = result.CurrencyNegativePattern;
			$rootScope.CurrencyPositivePattern = result.CurrencyPositivePattern;
			$rootScope.SiteUrl = result.SiteUrl;
			$rootScope.MaxAlertRecipients = result.MaxAlertRecipients;
            //ClientID MUST be the last property to pupulate.
			$rootScope.ClientID = result.ClientID;
		}, function (reason)
		{
			// TODO: Display a message somehow.
			message = reason;
		});
}]);