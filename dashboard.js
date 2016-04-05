var Dashboard = angular.module('YM.Engagement.Feed', ['ui.bootstrap'])
.filter('html', function ($sce)
{
	return function (val)
	{
		return $sce.trustAsHtml(val);
	};
})
.directive('feedTemplate', function () {
    return {
        restrict: 'E',
        templateUrl: '/global_inc/member_engagement/dashboard/feed.html'
    };
})
.constant('defaultLoadingId', '#AjaxLoadingWidget')
.constant('AmsApiServiceUrl', AmsApiServiceUrl)
.controller('feedCtrl', ['$scope','$rootScope', '$http', '$window', '$modal', '$timeout', 'AmsApiServiceUrl', 'defaultLoadingId', function ($scope, $rootScope, $http, $window, $modal, $timeout, AmsApiServiceUrl, defaultLoadingId)
{
    //Global Config Values
	$scope.Paging = {};
	$scope.Paging.Posts = [];
	$scope.Paging.Comments = [];
	$scope.Paging.Posts["Default"] = { PageSize: 10, PageNumber: 1 };
	$scope.Paging.Posts["Global"] = { PageSize: 10, PageNumber: 2 };
	$scope.Paging.Comments["Default"] = { PageSize: 2, PageNumber: 1 };
	$scope.Paging.Comments["Global"] = { PageSize: 5, PageNumber: 1 };

    //scope variable declarations
	$scope.BypassCache = false; //this setting only works in our internal dev environment. Setting this value anywhere else does not have any effect.
	$scope.Authenticated = false;
	$scope.Fetching = false;
	$scope.FeedList = {};
	$scope.Scraper = { Display: false }; 
	$scope.UpdateInterval = 100000; //milliseconds // This needs to be changed to SignalR and/or long polling.
	$scope.SubscriptionList = {};

	//Scope Function declarations
	$scope.HandleRequestError = function()
	{
		$modal.open({
			backdrop: false,
			animation: true,
			scope: $scope,
			templateUrl: 'modalResponseStatus.html'
		});
	}

	$scope.HandleRequest = function (options)
	{
		//enable loading widget
		options = typeof options !== 'undefined' ? options : {};
		var method = typeof options.method !== 'undefined' ? options.method : "GET";
		var data = typeof options.data !== 'undefined' ? options.data : "";
		var params = typeof options.params !== 'undefined' ? options.params : "";
		var loadingId = typeof options.loadingId !== 'undefined' ? options.loadingId : defaultLoadingId;
		var callback = options.callback;

		if (loadingId.length > 0)
		{
			$(loadingId).show();
		}

		if (typeof options.url == 'undefined')
		{
			$scope.ResponseStatus = "Url is missing from http call";
			$scope.HandleRequestError();
			return false;
		}
	
		var hasCallBack = typeof callback == 'function';

		$http({
		    url: AmsApiServiceUrl + options.url,
			method: method,
			withCredentials: true,
			useXDomain: true,
			data: data,
			params: params
		}).then(function successCallBack(response)
		{
			if (response.status == 200)
			{
				options.data = response.data;
				//options.success = true;
				
				if (hasCallBack) callback(options);
			}
			else if (response.data == null)
			{
				options.data = null;
				$scope.ResponseStatus = "No response received from the server.";
				$scope.HandleRequestError();
			}
			else
			{
				var message = typeof response.data.ResponseStatus !== 'undefined' ? response.data.ResponseStatus.Message : "No response status received from the API.";
				$scope.ResponseStatus = message;
				options.data = response.data;
				$scope.HandleRequestError();
			}
			if (loadingId.length > 0)
			{
				$(loadingId).hide();
			}

		}, function errorCallBack(response)
		{
		        $scope.ResponseStatus = response.data ? response.data.ResponseStatus.Message : "Unable to connect to server - Please make sure the destination Url is correct.";
		        console.log(response);
		        $scope.HandleRequestError();
		        if (loadingId.length > 0) {
		            $(loadingId).hide();
		        }
		});
	}

	$scope.LoadMemberFeed = function () {
	    $scope.HandleRequest(
			{
			    method: 'get',
			    url: '/Member/' + MemberID + '/WallComments',
			    params:
					{
					    PageSize: $scope.Paging.Posts["Default"].PageSize,
					    PageNumber: $scope.Paging.Posts["Default"].PageNumber,
					    DefaultComments: $scope.Paging.Comments["Default"].PageSize,
					    FeedCategory: 'Wall',
					    GuestMemberId: GuestMemberId,
					    BypassCache: $scope.BypassCache
					},
			    callback: function (response) {
			        $scope.FeedList = response.data.WallPostList;

			        if (response.data.WallPostList.length == $scope.Paging.Posts["Default"].PageSize) {
			            $scope.ShowGetMorePosts = true;
			        }

			        //$timeout(function () { $scope.CheckNewPosts() }, $scope.UpdateInterval, false);
			    }
			});
	};

	$scope.LoadGroupFeed = function () {
	    $scope.HandleRequest(
			{
			    method: 'get',
			    url: '/Member/' + MemberID + '/Feeds',
			    params:
					{
					    PageSize: $scope.Paging.Posts["Default"].PageSize,
					    PageNumber: $scope.Paging.Posts["Default"].PageNumber,
					    DefaultComments: $scope.Paging.Comments["Default"].PageSize,
					    FeedCategory: 'Groups',
					    GroupId: GroupId,
					    BypassCache: $scope.BypassCache
					},
			    callback: function (response) {
			        $scope.FeedList = response.data.FeedList;

			        if (response.data.FeedList.length == $scope.Paging.Posts["Default"].PageSize) {
			            $scope.ShowGetMorePosts = true;
			        }

			        //$timeout(function () { $scope.CheckNewPosts() }, $scope.UpdateInterval, false);
			    }
			});
	};
    
	$scope.LoadDashboardFeed = function ()
	{
		$scope.HandleRequest(
			{
				method: 'get',
				url: '/Member/' + MemberID + '/Feeds',
				params: 
					{
						PageSize: $scope.Paging.Posts["Default"].PageSize, 
						PageNumber: $scope.Paging.Posts["Default"].PageNumber,
						DefaultComments: $scope.Paging.Comments["Default"].PageSize,
						FeedCategory: 'All',
						BypassCache: $scope.BypassCache
					},
				callback: function (response)
				{
				    $scope.FeedList = response.data.FeedList;
            
				    if (response.data.FeedList.length == $scope.Paging.Posts["Default"].PageSize) {
				        $scope.ShowGetMorePosts = true;
				    }

					//$timeout(function () { $scope.CheckNewPosts() }, $scope.UpdateInterval, false);
				}
			});
	};

	$scope.GetPostAge = function (timestamp)
	{
		var now = new Date();
		var post = new Date(timestamp);
		var today = new Date().setHours(0, 0, 0, 0);
		var postDate = new Date(timestamp).setHours(0, 0, 0, 0);
		var timediff = now - post;									//utilizing full timestamp to calculate hours mins and seconds.
		var datediff = today - postDate;							//utilizing just date portion to calculate whole days (midnight to midnight)
		var strAge;
		var age = {};
		age.Years = Math.floor(datediff / (1000 * 24 * 60 * 60 * 365)); //year
		age.Days = Math.floor(datediff / (1000 * 24 * 60 * 60));	//contains the whole difference represented in Days - only use DATE portion
		age.Hours = Math.floor(timediff / (1000 * 60 * 60));		//contains the whole difference represented in Hours
		age.Minutes = Math.floor(timediff / (1000 * 60));			//contains the whole difference represented in Minutes
		//age.Seconds = Math.floor(timediff / (1000));				//contains the whole difference represented in Seconds
		if (age.Years > 1)
		{
		    strAge = age.Years + " years ago";
		}
        else if (age.Days > 1)
		{
            strAge = age.Days + " days ago at " + $scope.GetTimeString(post);
			//strAge = post.toLocaleDateString() + " at " + (post.getHours() > 12 ? post.getHours() - 12 : post.getHours()) + ':' + ("0" + post.getMinutes()).slice(-2) + ' ' + (post.getHours() > 12 ? 'pm' : 'am');
			//strAge = "format as clientConfig date/time format
		}
		else if (age.Days > 0)
		{
		    strAge = "Yesterday at " + $scope.GetTimeString(post);
		}
		else if (age.Hours > 1)
		{
			//strAge = age.Hours + " hours ago";
		    strAge = "Today at " + $scope.GetTimeString(post);
		}
		else if (age.Hours > 0)
		{
			strAge = "about an hour ago";
		}
		else if (age.Minutes > 1)
		{
			strAge = age.Minutes + " minutes ago";
		}
		else if (age.Minutes > 0)
		{
			strAge = "a minute ago";
		}
		else if (age.Minutes < 0)
		{
		    strAge = "Just now"; //"I'm from the future!"; //This accounts for different between server time and client time within the same timezone.  
		}
		else
		{
			strAge = "Just now";
		}

		return strAge;
	}

	$scope.GetTimeString = function (post)
	{
	    return (post.getHours() > 12 ? post.getHours() - 12 : post.getHours()) + ':' + ("0" + post.getMinutes()).slice(-2) + ' ' + (post.getHours() > 12 ? 'pm' : 'am');
	}

	$scope.SavePost = function()
	{
		//save post
		var wallPost = $scope.PostText;
		if ($scope.Scraper.Display)
		{
			wallPost = '<div class="scraper-result mtop-10 pleft-10 pright-10">' +
						'	<div class="scraper-content">';
			if ($scope.Scraper.Title.length > 0)
			{
			wallPost += '	<h3 class="mtop-25">' +
						'		<a href="'+$scope.Scraper.ResourceUrl+'" target="_blank">' +
						'			<span>'+$scope.Scraper.Title+'</span>' +
						'		</a>' +
						'	</h3>';
			}
			wallPost += '		<span>'+$scope.Scraper.Description+'</span>' +
						'	</div>';

			if ($scope.Scraper.Images && $scope.Scraper.Images.length > 0)
			{
			//tokenization
			$scope.Scraper.SelectedImage = $scope.Scraper.Images[$scope.Scraper.ImageNumber - 1].Src;

			wallPost += '	<div class="mtop-10 scraper-images">' +
						'		<a href="' + $scope.Scraper.ResourceUrl + '" target="_blank" class="mleft-0 mright-0">' +
						'			<img src="' + $scope.Scraper.SelectedImage + '" class="' + ($scope.Scraper.AutoFit ? 'scraper-image-fit' : 'scraper-image') + '"/>' +
						'		</a>' +
						'	</div>';
			}
			wallPost += '	<div class="scraper-website">'+$scope.Scraper.Website+'</div>' +
						'</div>';

			$scope.PostHtml = wallPost;

			if ($scope.PostText == $scope.Scraper.ResourceUrl)
			{
			    $scope.PostText = "";
			}
		}

		var post = {};
		post.PostHeadShotUrl = $scope.CurrentUser.AvatarUrl;
		post.AuthorName = "You";//$scope.CurrentUser.Name;
		post.CommentList = [];
		post.RecentComments = [];
		post.CommentCount = 0;
		post.CommenterCount = 0;
		post.LikesCount = 0;
		post.PostText = $scope.PostText;
		post.PostHtml = $scope.PostHtml;
		post.MemberID = $scope.CurrentUser.MemberID;
		post.GroupID = typeof GroupId == 'undefined' ? 0 : GroupId ;
		post.GuestMemberId = GuestMemberId; //feed vs wall- /TODO: test
		if ($scope.Scraper.Images && $scope.Scraper.Images.length > 0) {
		    post.ContentToken = typeof $scope.Scraper.Images != 'undefined' ? $scope.Scraper.Images[$scope.Scraper.ImageNumber - 1].Token : "";//tokenization GET RID OF THIS STUPID THING
		    post.ContentUrl = typeof $scope.Scraper.Images != 'undefined' ? $scope.Scraper.Images[$scope.Scraper.ImageNumber - 1].OriginalSrc : "";//tokenization
		}
		$scope.HandleRequest(
			{
				method: 'post',
				url: '/Member/' + MemberID + '/WallPosts',
				data: post,
				callback: function (response)
				{
				    post.PostId = response.data.PostId;
				    post.AuthorId = post.MemberID;
				    post.CanReply = true;
					$scope.FeedList.splice(0, 0, post);
					$scope.PostText = "";
					$scope.PostHtml = "";
					$scope.DismissScraper();

				    //Cleanup- 
					$scope.LastMatchedUrl = ""; //To allow same URL to be looked up again and reposted.

					$scope.SendEngagementAction('Feed_Post');
				}
			});
		
	}

	$scope.DeletePost = function(Post)
	{
		$scope.HandleRequest(
			{
				method: 'delete',
				url: '/Member/' + MemberID + '/WallPosts/' + Post.PostId,
				Post: Post,
				callback: function (response)
				{
					var postIndex = $scope.FeedList.indexOf(Post);
					$scope.FeedList.splice(postIndex,1);
				}
			});
	}

	$scope.PostReply = function(Post)
	{
		Post.Reply = typeof Post.Reply !== 'undefined' ? Post.Reply : "";
		var comment = {};
		comment.CommentHeadShotUrl = $scope.CurrentUser.AvatarUrl;
		comment.CommentFullName = "You"; //$scope.CurrentUser.Name;
		comment.CommentText = Post.Reply;
		comment.MemberID = $scope.CurrentUser.MemberID;

		$scope.HandleRequest(
			{
				method: 'post',
				url: '/Member/' + MemberID + '/Post/' + Post.PostId + '/WallComments',
				data: comment,
				Comment: comment,
				Post: Post,
				callback: function (response)
				{
				    var postIndex = $scope.FeedList.indexOf(response.Post);
				    $scope.FeedList[postIndex].CommentList.push(response.Comment);
					$scope.FeedList[postIndex].CommentCount += 1;
					$scope.FeedList[postIndex].Reply = "";

					//update reply count.
					var commentIndex = $scope.FeedList[postIndex].CommentList.indexOf(response.Comment);
					$scope.FeedList[postIndex].CommentList[commentIndex].CommentId = response.data.CommentId;

					$scope.SendEngagementAction('Feed_Post_Comment');
				}
			});
	}

	$scope.DeleteReply = function(Post, Comment)
	{
		$scope.HandleRequest(
			{
				method: 'delete',
				url: '/Member/' + MemberID + '/Post/' + Post.PostId + '/WallComments/' + Comment.CommentId,
				Post: Post,
				Comment: Comment,
				callback: function (response)
				{
				    if (response.data.RowsDeleted > 0) {
				        //remove it from the current array - do not reload page.
				        var postIndex = $scope.FeedList.indexOf(Post);
				        var commentIndex = $scope.FeedList[postIndex].CommentList.indexOf(Comment);
				        $scope.FeedList[postIndex].CommentList.splice(commentIndex, 1);
				        $scope.FeedList[postIndex].CommentCount--;
				    }
				    else {
				        $scope.ResponseStatus = "Unable to delete this comment at this time";
				        $scope.HandleRequestError();
				    }
				}
			});
	}
	
	$scope.GetMoreComments = function(Post)
	{
		var PageNumber = typeof $scope.Paging.Comments[Post.PostId] != 'undefined' ? $scope.Paging.Comments[Post.PostId].PageNumber : 1;
		var url = '/Member/' + MemberID + '/Post/' + Post.PostId + '/WallComments';
        var params = 
			{
			    PageSize: $scope.Paging.Comments["Global"].PageSize,
                PageNumber: PageNumber,
				OffSet: (PageNumber - 1) * $scope.Paging.Comments["Global"].PageSize +  $scope.Paging.Comments["Default"].PageSize, //default pagesize is the defaultcomments
                GuestMemberId: Post.AuthorId,
                BypassCache: $scope.BypassCache
			};

		$scope.Paging.Comments[Post.PostId] = params;
		$scope.HandleRequest(
			{
				url: url,
				Post: Post,
				params: params,
				callback: function(response){
                    var postIndex = $scope.FeedList.indexOf(response.Post);

                    //adding the items in reverse at the begining, which will display them in the proper ascending order once rendered.
                    for (var i = response.data.WallPostList[0].CommentList.length - 1; i >= 0 ; i--) {
	                    $scope.FeedList[postIndex].CommentList.splice(0, 0, response.data.WallPostList[0].CommentList[i]);
                    }

                    if (response.data.WallPostList[0].CommentList.length > 0)
                    {
	                    $scope.Paging.Comments[response.Post.PostId].PageNumber++;
                    }
				}
			});
	}

	$scope.GetMorePosts = function()
	{
	    var feedCategory;

	    switch (FeedLocation) {
	        case "dashboard_feed": feedCategory = "All";
	            break;
	        case "member_wall": feedCategory = "Wall";
	            break;
	        case "group_wall": feedCategory = "Groups";
	            break;
	        default:
	            break;
	    }

		$scope.HandleRequest(
			{
				method: 'get',
				url: '/Member/' + MemberID + '/Feeds',
				params:
					{
						PageSize: $scope.Paging.Posts["Global"].PageSize,
						PageNumber: $scope.Paging.Posts["Global"].PageNumber,
						DefaultComments: $scope.Paging.Comments["Default"].PageSize,
						FeedCategory: feedCategory,
                        GuestMemberId : GuestMemberId,
						BypassCache: $scope.BypassCache
					},
				callback: function (response)
				{
					if (response.data.FeedList.length > 0)
					{
					    for (var i = 0; i < response.data.FeedList.length; i++)
						{
						    $scope.FeedList.push(response.data.FeedList[i]);
						}
						$scope.Paging.Posts["Global"].PageNumber++;
					}

					if (response.data.FeedList.length != $scope.Paging.Posts["Global"].PageSize) {
					    $scope.ShowGetMorePosts = false;
					}
				}
			});
	}

	$scope.LikePost = function (Post)
	{
		var like =
			{
				PostId: Post.PostId,
				MemberID: MemberID,
				ClientID: ClientID
			};

		$scope.HandleRequest(
			{
				method: 'post',
				url: '/Member/' + MemberID + '/Likes',
                loadingId: "",
				data: like,
				Post: Post,
				callback: function (response)
				{
					Post.LikedPost = response.data.LikeId > 0;
				    Post.LikeId = response.data.LikeId;
				    Post.LikesCount++;

				    $scope.SendEngagementAction('Feed_Post_Like');
				}
			});
	}

	$scope.UnlikePost = function (Post)
	{
		$scope.HandleRequest(
			{
				method: 'DELETE',
				url: '/Member/' + MemberID + '/Likes/' + Post.LikeId,
                loadingId: "",
				Post: Post,
				callback: function (response)
				{
				    Post.LikedPost = false;
					Post.LikesCount--;
				}
			});
	}

	$scope.SharePost = function (Post) {
	    if(!confirm("Are you sure you'd like to share this post to your feed."))
	    {
	        return false;   
	    };
	    var shareInfo =
			{
                PostId: Post.PostId
			};

	    $scope.HandleRequest(
			{
			    method: 'post',
			    url: '/Member/' + MemberID + '/PostShares',
			    loadingId: "",
			    data: shareInfo,
			    Post: Post,
			    callback: function (response) {
			        //Let's ensure the placeholder for the infobox exists on the page before calling it.  Otherwise add it.
                    //This functionality should be part of the RaiseAlert system itself.  Further testing necessary before that happens.
			        if (!$("#jsPageAlert").length) {
			            $("<div id='jsPageAlert'></div>").prependTo("BODY"); //
			        };

			        //Raise the alert.
			        if (response.data.NewPostId > 0) {
			            RaiseAlert("This post has been shared to your feed.");
			        }
			        else {
			            //alert("Failed to share this port. The owner may have deleted from the feed.");

			            $scope.ResponseStatus = "Failed to share this port. The owner may have deleted it from the feed.";
			            $scope.HandleRequestError();
			        }

			        $scope.SendEngagementAction('Feed_Post_Share');
			    }
			});
	}

	$scope.FocusOnComment = function (Post) {
	    var id = '#post' + Post.PostId;
	    console.log(id);
	    angular.element(id).focus();
	}

	$scope.PostInputChange = function()
	{ //user types url in text field        

		//url to match in the text field
		var match_url = /\b(https?):\/\/([\-A-Z0-9.]+)(\/[\-A-Z0-9+&@#\/%=~_|!:,.;]*)?(\?[A-Z0-9+&@#\/%=~_|!:,.;]*)?/i;
		var ResourceUrl = match_url.test($scope.PostText) ? $scope.PostText.match(match_url)[0] : ""; //extracted first url from text filed if one if found

		//continue if matched url is found in text field
		if (ResourceUrl.length > 0 && $scope.LastMatchedUrl != ResourceUrl)
		{
			$scope.LastMatchedUrl = ResourceUrl;
			$("#WallPostHtmlResult").hide();

			$scope.HandleRequest({
				method: 'post',
				url: '/Member/' + MemberID + '/WebScraper',
				params: { 'ResourceUrl': ResourceUrl },
				loadingId: '#postLoading',
				callback: function (response)
				{
					if (response.data != "")
					{
						$scope.Scraper.Images = [];
						$scope.Scraper.Images = response.data.Images;
						$scope.Scraper.Title = typeof response.data.Title !== 'undefined' ? response.data.Title : "";
						$scope.Scraper.Description = typeof response.data.Description !== 'undefined' ? response.data.Description : "";
						$scope.Scraper.Display = true;
						$scope.Scraper.ResourceUrl = ResourceUrl;
						$scope.Scraper.Website = response.data.Website;
						$scope.Scraper.ImageNumber = 1;
						if (response.data.Images.length > 0) //tokenization
						{
							var proxyUrl = AmsApiServiceUrl + "/" + ClientID + "/Member/" + MemberID + "/ContentProxy?ResourceUrl=" + response.data.Images[0].OriginalSrc;
							$scope.Scraper.SelectedImage = typeof response.data.Images[0].Token !== 'undefined' ? proxyUrl : response.data.Images[0].Src;
						}
						$scope.Scraper.AutoFit = response.data.Images.length > 0 ? response.data.Images[0].AutoFit : false;
					}
					$("#WallPostHtmlResult").slideDown(); //show results with slide down effect
				}
			});
		}
	};

	$scope.NextImage = function ()
	{
		if ($scope.Scraper.ImageNumber < $scope.Scraper.Images.length)
		{
			$scope.Scraper.ImageNumber++;
		}
		else
		{
			$scope.Scraper.ImageNumber = 1;
		}
		//tokenization
		var proxyUrl = AmsApiServiceUrl + "/" + ClientID + "/Member/" + MemberID + "/ContentProxy?ResourceUrl=" + $scope.Scraper.Images[$scope.Scraper.ImageNumber - 1].OriginalSrc;
		$scope.Scraper.SelectedImage = typeof $scope.Scraper.Images[$scope.Scraper.ImageNumber - 1].Token !== 'undefined' ? proxyUrl : $scope.Scraper.Images[$scope.Scraper.ImageNumber - 1].Src;

		//$scope.Scraper.SelectedImage = $scope.Scraper.Images[$scope.Scraper.ImageNumber - 1].Src;
		$scope.Scraper.AutoFit = $scope.Scraper.Images[$scope.Scraper.ImageNumber - 1].AutoFit;

	}

	$scope.PreviousImage = function ()
	{
		if ($scope.Scraper.ImageNumber > 1)
		{
			$scope.Scraper.ImageNumber--;
		}
		else
		{
			$scope.Scraper.ImageNumber = $scope.Scraper.Images.length
		}
		//tokenization
		var proxyUrl = AmsApiServiceUrl + "/" + ClientID + "/Member/" + MemberID + "/ContentProxy?ResourceUrl=" + $scope.Scraper.Images[$scope.Scraper.ImageNumber - 1].OriginalSrc;
		$scope.Scraper.SelectedImage = typeof $scope.Scraper.Images[$scope.Scraper.ImageNumber - 1].Token !== 'undefined' ? proxyUrl : $scope.Scraper.Images[$scope.Scraper.ImageNumber - 1].Src;

		//$scope.Scraper.SelectedImage = $scope.Scraper.Images[$scope.Scraper.ImageNumber - 1].Src;
	}

	$scope.toggleTitle = function(bool)
	{
		$scope.EditTitle = bool;
		if (bool)
		{
			$scope.EditDesc = false;
			$timeout(function () { angular.element("#titleInput").focus() },0,false);
		}
	}

	$scope.toggleDesc = function(bool)
	{
		$scope.EditDesc  = bool;
		if (bool)
		{
			$scope.EditTitle = false;
			$timeout(function () { angular.element("#descInput").focus() }, 0, false);
		}
	}

	$scope.DismissScraper = function()
	{
		$scope.Scraper = {};
		$scope.Scraper.Display = false;
	}

   	$scope.CheckNewPosts = function()
   	{
   	    var feedCategory;

   	    switch (FeedLocation) {
   	        case "dashboard_feed": feedCategory = "All";
   	            break;
   	        case "member_wall": feedCategory = "Wall";
   	            break;
   	        case "group_wall": feedCategory = "Groups";
   	            break;
   	        default:
   	            break;
   	    }

		$scope.HandleRequest(
			{
				method: 'get',
				url: '/Member/' + MemberID + '/Feeds',
				params:
					{
						PageSize: 1,
						PageNumber: 1,
						DefaultComments: $scope.Paging.Comments["Default"].PageSize,
						GuestMemberId: GuestMemberId,
						FeedCategory: feedCategory,
						BypassCache: $scope.BypassCache
					},
				loadingId: "",
				callback: function (response)
				{
					var latestPost = response.data.FeedList;
					if (latestPost.length > 0)//at least one post has been posted to this wall
					{
						//should use date comparison for more accurate results
						var lastPostDate = new Date($scope.FeedList[0].PostDate);
						var latestPostDate = new Date(latestPost[0].PostDate);
						if( latestPostDate > lastPostDate )
						{
							//alert("New Posts available");
							$scope.NewPosts = true;
						}
						else //keep checking
						{
							$timeout(function () { $scope.CheckNewPosts() }, $scope.UpdateInterval, false);
						}
					}
				}
			});
   	}

   	$scope.SendEngagementAction = function (EngagementAction) {
   		var engagementScore = {
   		    EngagementAction: EngagementAction,
   		    MemberID: MemberID,
            ClientID: ClientID
   		};

   	    //Using $http object to use the default route for oneway/async service request.
        //SS does not support async request on custom routes on current version. 
   		$http({
   		    url: AmsApiServiceUrl.replace("/Ams", "") + "/json/oneway/EngagementScores",
   			method: 'post',
   		    data: engagementScore
   		});
   	}

    //Runtime... Any functions that need to run at page load, needs to be put inside this $watch and inside the IF statement.
    //We're watching ClientID has been initialized before we can start making calls to the  API.
    //We'll probably move this from the AngularAmsService.js to each app.js individually, but need to test createinvoice and event wizard
    //and anything else that is using AngularAmsService.js.
   	$rootScope.$watch('ClientID', function (newValue, oldValue) {
   	    if (newValue !== undefined) {
   	        switch(FeedLocation)
   	        {
   	            case "dashboard_feed" : $scope.LoadDashboardFeed();
   	                break;
   	            case "member_wall": $scope.LoadMemberFeed();
   	                break;
   	            case "group_wall": $scope.LoadGroupFeed();
   	                break;
   	            default:
   	                break;
   	        }
   	    }
   	});

    //This is for infinite scrolling - but the event is a little buggy firing multiple times.
    //Will look for a different script to implement and test down the road.  For now, using button click
	//angular.element($window).bind("scroll", function ()
	//{
	//	var triggerHeight = 200;
	//	var windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
	//	var body = document.body, html = document.documentElement;
	//	var docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
	//	windowBottom = windowHeight + window.pageYOffset;
	//	if (windowBottom > docHeight - triggerHeight && !$scope.Fetching)
	//	{
	//	    $scope.Fetching = true;
	//	    $scope.GetMorePosts();
	//		$scope.Fetching = false;
	//	}
	//});
}]); //end controller

