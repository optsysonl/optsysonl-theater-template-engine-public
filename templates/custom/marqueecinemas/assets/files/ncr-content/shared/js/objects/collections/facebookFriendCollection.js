define(["models/facebookFriendModel"], function (facebookFriendModel) {
    window.FacebookFriendCollection = Backbone.Collection.extend({
        model: facebookFriendModel,
        initialize: function () {
            this.searchParameter = 'byName';
        },

        offset: 0,
        count: 3 * 8, // 3 freinds per row * number of row
        prepare: function () {
            $(this.dom).html('');
            this.offset = 0;
        },

        getFriends: function (dom, cond, callback) {
            var that = this;
            that.reset();
            $(dom).html('');

            function fetchData() {
                FB.api("/me/friends?fields=id,name,first_name,last_name&access_token=" + FB.getAuthResponse().accessToken, function (response) {
                    if (response.data) {
                        handleFbResponse(response.data);
                    } else if (response.error && response.error.type == "OAuthException") {
                        that.login(fetchData);
                    }
                });
            }
            function handleFbResponse(data) {
                data.sort(function (left, right) {
                    if (left.name < right.name)
                        return -1;
                    if (left.name > right.name)
                        return 1;
                    return 0;
                });
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];

                    var friend = {
                        id: item.id,
                        name: item.name,
                        firstName: item.first_name,
                        lastName: item.last_name
                    };
                    if (!cond || cond != '' && friend.name.toLowerCase().indexOf(cond.toLowerCase()) !== -1)
                        that.add(friend);
                }
                callback();
            }
            that.login(function () {
                fetchData();
            });
        },

        login: function (callback) {
            FB.getLoginStatus(function (response) {
                if (response.status === 'connected') {
                    callback();
                } else {
                    FB.login(function (loginResponse) {
                        if (loginResponse.status === 'connected') {
                            showAlert(window.ObjectCollections.Localization.result.loggedInFb, { postBack: callback });
                        } else {
                            showAlert(window.ObjectCollections.Localization.result.fbAuthError);
                        }
                    });
                }
            });
        },

        //Publish a story to the user's friend's wall
        shareToWall: function (name, caption, personalMessage, link, picture, callback) {
            FB.ui({
                method: 'feed',
                name: name,
                caption: caption,
                description: personalMessage,
                link: link,
                picture: picture
            },
            function (response) {
                callback(response);
            });
        },

        publishToFriendWall: function (friendId, personalMessage, link, caption, name, picture, callback) {
            try {
                FB.ui({
                    method: 'feed',
                    to: friendId,
                    name: name,
                    caption: caption,
                    description: personalMessage,
                    link: link,
                    picture: picture,
                    access_token: FB.getAuthResponse().accessToken
                },
                    function (response) {
                        if (callback) {
                            if (!response || response.error) {
                                callback(false);
                            } else {
                                callback(true);
                            }
                        }
                    });
            } catch (e) {
                console.log(e);
            }
        },

        totalTickets: function () {
            var friends = this.where({ status: true });
            var countTickets = 0;
            _.each(friends, function (friend) {
                countTickets += parseInt(friend.get('quantity')) || 0;
            });
            return countTickets;
        }

    });

    return window.FacebookFriendCollection;
});