define(['text!templates/GiftPickupView.html',
        'models/scheduleModel',
        'models/theaterModel',
        'sharedlibs/jquery/jquery.qrcode.min',
        'sharedhelpers/dateTimeHelper',
         'sharedhelpers/utilities'
], function (template, scheduleModel, theaterModel) {

    var view = Backbone.View.extend({
        template: _.template(template),
        initialize: function () {
            this.utilities = new Utilities();
        },
        render: function () {
            var that = this;

            var load = function () {
                that.fbValidation(function () {
                    that.serialNumber = that.utilities.decrypt(that.options.serialNumber);
                    that.$el.html(that.template({
                        localize: window.ObjectCollections.Localization.result,
                        movie: that.movie,
                        performance: that.performance,
                        theater: that.theater,
                        user: that.user
                    }));

                    hidePageLoadingMessage();
                    $('#qrCode').qrcode({
                        width: 163,
                        height: 163,
                        text: that.serialNumber + "^" + that.utilities.decrypt(that.options.friendsName)
                    });
                    $('#qrCodeText').html(that.serialNumber);
                });
            };

            that.getTheater(function () {
                that.getSchedule(function () {
                    if (!that.performance) {
                        showAlert(window.ObjectCollections.Localization.result.perormanceHasExpired, {
                            postBack: function () {
                                Backbone.history.navigate("home", { trigger: true });
                            }
                        });
                        return;
                    }

                    load();
                });
            });
        },
        fbValidation: function (callback) {
            var that = this;
            var facebookId = that.utilities.decrypt(that.options.facebookId);
            if (typeof FB != 'undefined' && FB) {
                FB.getLoginStatus(function (response) {
                    if (response.status === 'connected') {
                        fbCheck(response);
                    } else {
                        FB.login(function (loginResponse) {
                            if (loginResponse.status === 'connected') {
                                showAlert(window.ObjectCollections.Localization.result.loggedInFb, { postBack: function () { fbCheck(loginResponse); } });
                            } else {
                                showAlert(window.ObjectCollections.Localization.result.fbAuthError, {
                                    postBack: function () {
                                        var link = "tickets/" + that.options.performanceNumber + "/" + that.options.featureCode + "/" + that.options.theaterId;
                                        Backbone.history.navigate(link, { trigger: true });
                                    }
                                });
                            }
                        });
                    }
                });
            } else
                showAlert(window.ObjectCollections.Localization.result.unableToConnect, {
                    postBack: function () {
                        var link = "tickets/" + that.options.performanceNumber + "/" + that.options.featureCode + "/" + that.options.theaterId;
                        Backbone.history.navigate(link, { trigger: true });
                    }
                });

            function fbCheck(response) {
                var fbId = response.authResponse.userID;
                if (fbId == facebookId) {
                    FB.api('/me', function (user) {
                        that.user = user;
                        callback();
                    });
                } else {
                    showAlert(window.ObjectCollections.Localization.result.giftPickupErrorValidation, {
                        postBack: function () {
                            Backbone.history.navigate("tickets/" + that.options.performanceNumber + "/" + that.options.featureCode + "/" + that.options.theaterId, { trigger: true });
                        }
                    });
                }
            };
        },
        getTheater: function (callback) {
            var that = this;
            var theater = new theaterModel({ id: that.options.theaterId });
            theater.getTheater(function (result) {
                that.theater = result;
                callback();
            }, function (error) {
                showAlert(window.ObjectCollections.Localization.result.errorCode16);
            });
        },
        getSchedule: function (callback) {
            var that = this;
            var schedule = new scheduleModel({ featureCode: that.options.featureCode, theaterId: that.options.theaterId });
            schedule.fetch({
                error: function () {
                    showAlert(window.ObjectCollections.Localization.result.errorCode16);
                },
                success: function (result) {
                    var performance = null;
                    _.each(result.get('result')[0].schedules, function (sch) {
                        performance = _.find(sch.performances, function (currentPerformance) {
                            return currentPerformance.number == that.options.performanceNumber;
                        });
                    });
                    that.performance = performance;
                    that.movie = result.get('result')[0];
                    callback();
                }
            });
        }
    });

    return view;
});