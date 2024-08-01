define([
    'jqueryGlobalize',
    'jqueryGlobalizeCultures',
    'models/chainInfoModel',
    'sharedhelpers/cachingProvider',
    'helpers/CountdownHelper',
    'jqueryDotdot'
], function () {
    var appRouter = Backbone.Router.extend({
        routes: {
            "": "home",
            "home": "home",
            "loyaltycards": "loyaltyCards",
            "loyaltycards/:option": "loyaltyCards",
            "loyaltycards/:option/:accountNumber": "loyaltyCards",
            'processing': 'processing',
            'orderComplete': 'orderComplete',
            'pickup/:serialNumber/:facebookId/:friendsName/:performanceNumber/:featureCode/:theaterId': 'giftPickup'
        },
        storeRoute: function () {
            if (this.saveRoute) {
                this.history.push(Backbone.history.fragment);
                this.index = this.history.length;
            }
        },
        previous: function () {
            var url = '';
            if (this.history.length > 1 && this.index > 0) {
                this.index--;
                url = this.history[this.index];
            }

            this.saveRoute = false;
            Backbone.history.navigate(url, true);
            this.saveRoute = true;
        },
        initialize: function () {
            //Adding routes shared between mobile and web app
            var routesHelper = new RoutesHelper();
            routesHelper.addSharedRoutes.call(this);

            this.history = [];
            this.saveRoute = true;
            this.index = 0;

            window.AppRouter = this;

            require(['views/PageHeading'], function (pageHeadingView) {
                var page = new pageHeadingView({ localize: window.ObjectCollections.Localization.result });
                page.render();
            });

            $('#logo-nav').live('click', function () {
                checkOrderStatus(function (response) {
                    if (response)
                        Backbone.history.navigate('', true);
                });
            });

            window.singleSite = window.ConfigurationProvider.chainType() == 'single';
            window.smallSite = window.ConfigurationProvider.chainType() == 'small';

            if (window.smallSite || window.singleSite) {
                var cache = new CachingProvider();

                cache.store("Latitude", 0, window.AppProperties.CacheTimeout);
                cache.store("Longitude", 0, window.AppProperties.CacheTimeout);
            }
        },

        back: function () {
            var that = this;
            checkOrderStatus(function (result) {
                if (result)
                    that.previous();
            });
        },

        before: function (route, name, callback) {
            var that = this;

            var nextStep = function (response) {
                if (response)
                    that.storeRoute();
                callback(response);
            };

            if (name != 'getTickets' && name != 'processing') {
                checkOrderStatus(function (response) {
                    nextStep(response);
                });
            } else
                nextStep(true);
        },
        home: function () {
            //Reset movie page and sorting
            window.lastSelectedPage = null;
            window.moviesLastSort = null;

            showPageLoadingMessage();
            window.Breadcrumbs = [{ displayName: 'Home', link: "#home" }];

            var that = this;

            // Android smart app banner
            if (/Android/i.test(navigator.userAgent)) {
                if (!window.smartBannerShown) {
                    require(['views/_smartbanner'], function (smartBannerView) {
                        var smartbanner = new smartBannerView({ localize: window.ObjectCollections.Localization.result });
                        smartbanner.render();
                    });
                    window.smartBannerShown = true;
                }
            }

            var callback = function () {
                require(['views/Home'], function (homeView) {
                    $("#page-menu li").removeClass("active");
                    $("#topNavigation").html("");

                    var cache = new CachingProvider();

                    var postalCode = cache.read("ZipCode") || "";

                    var view = new homeView({
                        movies: window.ObjectCollections.MovieCollection,
                        theaters: window.ObjectCollections.TheaterCollection,
                        zipCode: postalCode,
                        distance: window.ConfigurationProvider.searchRadius()
                    });

                    that.changePage(view);
                });
            };
            require(['helpers/GoogleAnalyticsHelper'], function () {
                if (window.smallSite || window.singleSite) {
                    $('.searchBar').hide();
                    window.GoogleAnalyticsHelper.intialize(callback);
                } else {
                    window.GoogleAnalyticsHelper.intialize(function () {
                        that.getGeoPosition(callback);
                    });
                }
            });
        },

        theaters: function () {
            //Reset movie page and sorting
            window.lastSelectedPage = null;
            window.moviesLastSort = null;
            var that = this;

            showPageLoadingMessage();


            $("#page-menu li").removeClass("active");
            $("a#tab-theaters").parent().addClass("active");

            if (window.singleSite) {
                that.theater(window.ConfigurationProvider.theaterId());
            } else {
                var cache = new CachingProvider();
                var postalCode = cache.read("ZipCode") || "";

                require(['views/Theaters'], function (theatersView) {
                    var view = new theatersView({
                        theaters: window.ObjectCollections.TheaterCollection,
                        localize: window.ObjectCollections.Localization.result,
                        distance: window.ConfigurationProvider.searchRadius(),
                        zipCode: postalCode
                    });

                    // unbind all events of the previous view to avoid "ghost views"
                    if (that.previousView) that.previousView.remove();

                    that.changePage(view);
                });
            }
        },

        theater: function (theaterId) {
            showPageLoadingMessage();
            var that = this;
            require(['views/Theater'], function (theaterView) {
                var view = new theaterView({ theaterId: theaterId });
                that.changePage(view);
            });
        },
        fetchTheaters: function (lat, lng, callback) {
            showPageLoadingMessage();
            require(['collections/theaterCollection'], function (theaterCollection) {
                var theaters = new theaterCollection();

                theaters.latitude = lat;
                theaters.longitude = lng;
                theaters.distance = window.ConfigurationProvider.searchRadius();;

                // Retrieve theaters for provided coordinates
                theaters.fetch({
                    error: function () {
                        showAlert(window.ObjectCollections.Localization.result.unableToConnect);
                    },
                    success: function (result) {
                        window.ObjectCollections.TheaterCollection = result;
                        window.ObjectCollections.MovieCollection = result.getMovies();
                        if (window.appConfig.GroupMovies) {
                            window.ObjectCollections.MovieCollection.groupedMovies = window.ObjectCollections.MovieCollection.groupMultiTypeMovies();
                        }

                        if (callback)
                            callback();
                    }
                });
            });
        },
        populateTheatersAndMovies: function (callback, blockZipPopup) {
            var that = this;

            if (window.singleSite) {
                $('.searchBar').hide();
                require(['models/theaterModel', 'collections/theaterCollection'], function (theaterModel, theaterCollection) {
                    var singleTheaterModel = new theaterModel({ id: window.ConfigurationProvider.theaterId() });
                    singleTheaterModel.getTheater(function (result) {
                        if (!result) {
                            showAlert(window.ObjectCollections.Localization.result.unableToConnect);
                        }
                        var theatersColl = new theaterCollection();
                        theatersColl.push(result);
                        window.ObjectCollections.TheaterCollection = theatersColl;
                        window.ObjectCollections.MovieCollection = theatersColl.getMovies();
                        if (window.appConfig.GroupMovies) {
                            window.ObjectCollections.MovieCollection.groupedMovies = window.ObjectCollections.MovieCollection.groupMultiTypeMovies();
                        }

                        if (callback)
                            callback();
                    });
                });
            } else {
                var cache = new CachingProvider();
                if (window.smallSite) {
                    $('.searchBar').hide();

                    that.fetchTheaters(0, 0, callback);
                } else {
                    that.getGeoPosition(function () {
                        that.fetchTheaters(cache.read("Latitude") || 0, cache.read("Longitude") || 0, callback);
                    }, blockZipPopup);
                }
            }
        },
        movies: function () {
            var that = this;

            $("#page-menu li").removeClass("active");
            $("a#tab-movies").parent().addClass("active");
            that.moviesInternal();
        },

        moviesInternal: function () {
            var that = this;
            require(['views/Movies'],
                function (moviesView) {
                    var view = new moviesView({
                        localize: window.ObjectCollections.Localization.result
                    });
                    that.changePage(view);
                    if (window.singleSite || window.smallSite) {
                        $('.btn-group').hide();
                        $('.separator').hide();
                        $('#zipDistanceFilterTop').hide();
                    }
                });
        },

        movie: function (featureCode, theaterId) {
            showPageLoadingMessage();
            var that = this;
            require(['views/Movie', 'collections/movieScheduleCollection'], function (movieView, movieScheduleCollection) {
                var featureCodes = featureCode.split(',');
                var groupedResult;
                var callsFinished = 0;

                var changePage = function () {
                    var uniqueResult = {};
                    _.each(groupedResult.get('schedules'), function (res) {
                        if (uniqueResult[res.theaterId]) {
                            uniqueResult[res.theaterId].performances = uniqueResult[res.theaterId].performances.concat(res.performances);
                        } else {
                            uniqueResult[res.theaterId] = res;
                        }
                    });

                    groupedResult.set('schedules', _.values(uniqueResult));

                    $('#page-menu .active').removeClass('active');

                    that.changePage(new movieView({ model: groupedResult, featureCode: featureCodes[0], theaterId: theaterId }));
                    hidePageLoadingMessage();
                };

                var scheduleCallback = function (code) {
                    var schedule = new movieScheduleCollection({ featureCode: code, theaterId: theaterId });
                    schedule.getMovieSchedule(function (result) {
                        callsFinished++;

                        if (result.models.length == 0) return;

                        if (groupedResult) {
                            groupedResult.set('schedules', groupedResult.get('schedules').concat(result.models[0].get('schedules')));
                        } else {
                            groupedResult = result.models[0];
                        }

                        if (callsFinished == featureCodes.length) {
                            changePage();
                        }
                    },
                        function () {
                            showAlert(window.ObjectCollections.Localization.result.errorLoadingMovieSchedule);
                            hidePageLoadingMessage();
                        });
                };

                if (window.ObjectCollections.MovieCollection.length == undefined) {
                    that.populateTheatersAndMovies(function () {
                        _.each(featureCodes, function (code) {
                            scheduleCallback(code);
                        });
                    });
                } else {
                    _.each(featureCodes, function (code) {
                        scheduleCallback(code);
                    });
                }
            });
        },

        checkout: function (performanceId, movieCode, theaterId, onHoldConfirmationNumber, facebookId) {
            //Reset movie page and sorting
            window.lastSelectedPage = null;
            window.moviesLastSort = null;

            var that = this;
            showPageLoadingMessage();
            var callback = function () {
                require(['views/Checkout'], function (checkoutView) {
                    var viewOptions = {
                        theaterId: theaterId,
                        performanceId: performanceId,
                        movieCode: movieCode,
                        facebookId: decodeURIComponent(facebookId)
                    };

                    if (onHoldConfirmationNumber) {
                        viewOptions["onHoldConfirmationNumber"] = onHoldConfirmationNumber;
                    }

                    var myCheckoutView = new checkoutView(viewOptions);

                    myCheckoutView.prepare(function () {
                        that.changePage(myCheckoutView);
                    });
                });
            }
            require(['helpers/GoogleAnalyticsHelper'], function () {
                window.GoogleAnalyticsHelper.intialize(callback);
                window.GoogleAnalyticsHelper.trackPage('checkout');
            });
        },
        orderComplete: function () {
            var that = this;
            if (window.ObjectModels.OrderModel) {
                require(['views/OrderComplete'], function (orderCompleteView) {
                    var page = new orderCompleteView({
                        movie: window.ObjectModels.OrderModel.get('movie'),
                        theater: window.ObjectModels.OrderModel.get('theater'),
                        performance: window.ObjectModels.OrderModel.get('performance')
                    });
                    that.changePage(page);
                });
            } else {
                Backbone.history.navigate('home', true);
            }
        },
        getGeoPosition: function (callback, blockZipPopup) {
            var that = this;
            require(['async!//maps.googleapis.com/maps/api/js?sensor=false', 'sharedhelpers/googleapis'], function () {
                var cache = new CachingProvider();
                if (that.index != 1 || blockZipPopup) {
                    if (cache.read("Latitude")) {
                        if (callback)
                            callback();

                        return;
                    }
                } else {
                    cache.remove("ZipCode");
                }

                var geoCallback = function (latitude, longitude) {
                    hidePageLoadingMessage();

                    cache.store("Latitude", latitude, window.AppProperties.CacheTimeout);
                    cache.store("Longitude", longitude, window.AppProperties.CacheTimeout);
                    if (latitude !== "0" || longitude !== "0") {
                        window.AppProperties.ShowTheaterDistance = true;
                    }

                    if (callback)
                        callback();
                };


                var storePostalCode = function (respPostalCode) {
                    cache.store("ZipCode", respPostalCode, window.AppProperties.CacheTimeout);
                };


                var postalCode = undefined;

                if (navigator.geolocation) {
                    var timeoutVal = 5000;

                    var t = setTimeout(function () {
                        navigatorErrorCallback();
                    }, timeoutVal);

                    var navigatorSuccessCallback = function (position) {
                        clearTimeout(t);
                        $('#zip-modal').modal('hide');
                        geoCallback(position.coords.latitude, position.coords.longitude);
                    };
                    var navigatorErrorCallback = function () {
                        clearTimeout(t);
                        hidePageLoadingMessage();
                        $(".container-content").removeClass('hide');
                        that.getZipCode(postalCode, function (retPostalCode) {
                            getCoordinates(retPostalCode, function (coordinates) {
                                if (coordinates) {
                                    storePostalCode(retPostalCode);
                                    geoCallback(coordinates.lat, coordinates.lon);
                                } else {
                                    geoCallback("0", "0");
                                }
                            });
                        });
                    };

                    var navigatorOptions = { enableHighAccuracy: true, maximumAge: window.AppProperties.CacheTimeout * 1000 * 1000 };
                    navigator.geolocation.getCurrentPosition(navigatorSuccessCallback, navigatorErrorCallback, navigatorOptions);

                } else {
                    that.getZipCode(postalCode, function () {
                        getCoordinates(postalCode, function (coordinates) {
                            if (coordinates) {
                                storePostalCode(postalCode);
                                geoCallback(coordinates.lat, coordinates.lon);
                            }
                        });
                    });
                }
            });
        },

        getZipCode: function (postalCode, callback) {
            if (!$('#zip-modal').is(":visible")) {
                require(['views/ZipPopup'], function (zipModalView) {
                    var cache = new CachingProvider();

                    postalCode = postalCode || cache.read("ZipCode");
                    if (postalCode == undefined) {
                        var zipView = new zipModalView({
                            el: "#main-container",
                            isStandalone: true,
                            callback: callback
                        });
                        zipView.render();
                    }

                    if (postalCode != undefined) {
                        callback(postalCode);
                    }
                });
            }
        },


        loyaltyCards: function (option) {
            var that = this;

            require(['models/loyaltyAccountModel',
                    'views/LoyaltyCardsSingup',
                    'views/LoyaltyCardsAdd',
                    'views/LoyaltyCardsAccountProfile',
                    'views/LoyaltyCards'],
                function (loyaltyAccountModel, loyaltyCardsSingupView, loyaltyCardsAddView, loyaltyCardsAccountProfileView, loyaltyCards) {
                    if (_.isString(option)) {
                        option = option.toLowerCase();
                    }
                    var cache = new CachingProvider();
                    var securityPin = cache.read("securitypin");

                    $("#page-menu li").removeClass("active");
                    $("a#tab-loyalty-card").parent().addClass("active");

                    switch (option) {
                        case "singup":
                            that.changePage(new loyaltyCardsSingupView({ model: new loyaltyAccountModel() }));
                            break;
                        case "profile":
                            showPageLoadingMessage();
                            if (cache.isSupported()) {
                                var cardNumber = cache.read("loyaltycardnumber", function () {
                                    that.changePage(new loyaltyCardsAddView());
                                });

                                if (cardNumber) {
                                    var data = new loyaltyAccountModel({ id: cardNumber, securityKey: securityPin });
                                    data.fetch({
                                        error: function () {
                                            showAlert(window.ObjectCollections.Localization.result.unableToConnect);
                                        },
                                        success: function (result) {
                                            result.set("id", cardNumber);
                                            that.changePage(new loyaltyCardsAccountProfileView({ model: result, loyaltyAccountModel: data }));
                                        }
                                    });
                                } else {
                                    that.changePage(new loyaltyCardsAddView());
                                }
                            } else {
                                that.changePage(new loyaltyCardsAddView());
                            }
                            break;
                        default:
                            if (cache.isSupported()) {
                                showPageLoadingMessage();

                                var loyaltycardnumber = cache.read("loyaltycardnumber");

                                if (loyaltycardnumber && securityPin) {
                                    var model = new loyaltyAccountModel({ id: loyaltycardnumber, securityKey: securityPin });
                                    model.fetch({
                                        error: function () {
                                            showAlert(window.ObjectCollections.Localization.result.unableToConnect);
                                        },
                                        success: function (result) {
                                            if (result.get('errorCode') == 38) {
                                                cache.remove('loyaltycardnumber');
                                                cache.remove('securitypin');

                                                require(['views/LoyaltyCardsLoginPopup'], function (loyaltyCardsLoginPopupView) {
                                                    var loyaltyPopupView = new loyaltyCardsLoginPopupView({ localize: window.ObjectCollections.Localization.result });
                                                    $("#main-container").append(loyaltyPopupView.render());
                                                    $('#loyalty-login-modal').modal();

                                                    $(".container-content").removeClass('hide');
                                                    require(['jqueryPlaceholder'], function () {
                                                        $(function () {
                                                            $('input, textarea').placeholder();
                                                        });
                                                    });

                                                    hidePageLoadingMessage();
                                                });
                                            } else {
                                                result.set("id", loyaltycardnumber);
                                                that.changePage(new loyaltyCards({ model: result }));
                                            }
                                        }
                                    });
                                }
                            } else {
                                that.changePage(new loyaltyCardsAddView());
                            }
                    }
                });
        },
        giftPickup: function (serialNumber, facebookId, friendsName, performanceNumber, featureCode, theaterId) {
            var that = this;
            require(['views/GiftPickupView'], function (giftPickupView) {
                var view = new giftPickupView({
                    serialNumber: decodeURIComponent(serialNumber),
                    facebookId: decodeURIComponent(facebookId),
                    friendsName: decodeURIComponent(friendsName),
                    performanceNumber: performanceNumber,
                    featureCode: featureCode,
                    theaterId: theaterId
                });
                that.changePage(view);
            });
        },
        processing: function () {
            $("#topNavigation").html("");
            $("#zipDistanceFilterTop").html("");
            var that = this;

            require(['views/OrderProcessing'], function (orderProcessingView) {
                var view = new orderProcessingView();
                that.changePage(view);
            });
        },

        changePage: function (page) {
            $(window).scrollTop(0);
            this.destroyLastView();
            $('#top-notification').hide();
            $('#top-notification').off();
            $("#main-container").html($(page.el));
            page.render();
            $(".container-content").removeClass('hide');
            this.lastView = page;
        },

        destroyLastView: function () {
            var view = this.lastView;
            if (view) {
                view.undelegateEvents();
                $(view.el).removeData().unbind();
                view.remove();
                Backbone.View.prototype.remove.call(view);
                if (view.vent)
                    view.vent.off();
            }
        }
    });


    var initialize = function () {
        var app_router = new appRouter;
        Backbone.history.start();

        require(['helpers/GoogleAnalyticsHelper'], function () {
            Backbone.history.on("route", function (router, route) {
                window.GoogleAnalyticsHelper.trackPage(route);
            });
        });
    };
    return {
        initialize: initialize
    };
});
