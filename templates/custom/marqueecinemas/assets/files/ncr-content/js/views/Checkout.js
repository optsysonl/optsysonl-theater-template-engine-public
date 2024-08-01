define([
    'text!templates/Checkout.html',
    'models/theaterModel',
    'collections/scheduleCollection',
    'collections/facebookFriendCollection',
    'views/SelectTickets',
    'views/SelectSeats',
    'collections/ticketCollection',
    'collections/seatCollection',
    'models/orderModel',
    'views/Tabs',
    'views/Confirmation',
    'sharedhelpers/cachingProvider',
    'sharedhelpers/utilities'
], function (template, theaterModel, scheduleCollection, facebookFriendCollection,
             selectTicketsView, selectSeatsView, ticketCollection, seatCollection, orderModel, tabs, confirmationView) {

    var view = Backbone.View.extend({

        template: _.template(template),

        initialize: function () {
            var that = this;

            that.cache = new CachingProvider();
            that.destroySubviews();

            that.vent = _.extend({}, Backbone.Events);
            _.bindAll(that);

            that.vent.bind("showNextPage", that.loadNextView);
            that.vent.bind("tabClickHandler", that.tabClickHandler);
            that.vent.bind('continueToProcessing', that.loadProcessingPayment);
        },
        fbValidation: function (callback) {
            var that = this;

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
                                        var link = "tickets/" + that.options.performanceId + "/" + that.options.movieCode + "/" + that.options.theaterId;
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
                        var link = "tickets/" + that.options.performanceId + "/" + that.options.movieCode + "/" + that.options.theaterId;
                        Backbone.history.navigate(link, { trigger: true });
                    }
                });

            function fbCheck(response) {
                var fbId = response.authResponse.userID;
                if (fbId == that.facebookId) {
                    FB.api('/me', function (user) {
                        that.user = user;
                        callback();
                    });
                } else {
                    showAlert(window.ObjectCollections.Localization.result.holdPickupErrorValidation, {
                        postBack: function () {
                            Backbone.history.navigate("tickets/" + that.options.performanceId + "/" + that.options.movieCode + "/" + that.options.theaterId, { trigger: true });
                        }
                    });
                }
            };
        },
        destroySubviews: function () {
            if (window.ObjectViews.SelectTicketsView) {
                window.ObjectViews.SelectTicketsView.dispose();
            }
            if (window.ObjectViews.SelectSeats) {
                window.ObjectViews.SelectSeats.dispose();
            }
            if (window.ObjectViews.ConcessionView) {
                window.ObjectViews.ConcessionView.dispose();
            }
            if (window.ObjectViews.PaymentView) {
                window.ObjectViews.PaymentView.dispose();
            }
            if (window.ObjectViews.OrderRevView) {
                window.ObjectViews.OrderRevView.dispose();
            }
            if (window.ObjectViews.OrderProcessingView) {
                window.ObjectViews.OrderProcessingView.dispose();
            }
        },
        prepare: function (callback) {
            var that = this;

            that.theaterId = that.options.theaterId;
            that.movieCode = that.options.movieCode;
            that.performanceId = that.options.performanceId;

            var utilities = new Utilities();
            that.facebookId = utilities.decrypt(that.options.facebookId);

            that.cancelSaleIfNeeded(function () {
                var myTicketCollection = new ticketCollection({ theaterId: that.theaterId, performanceId: that.performanceId }),
                    myOrderModel = new orderModel();

                that.$el.empty();

                var cache = new CachingProvider();
                var loyaltycardnumber = cache.read("loyaltycardnumber");

                myOrderModel.set('theaterId', that.theaterId);
                myOrderModel.set('performanceId', that.performanceId);
                myOrderModel.set('tickets', myTicketCollection);
                myOrderModel.set('loyaltyCardNumber', loyaltycardnumber);

                if (that.options.onHoldConfirmationNumber && that.options.onHoldConfirmationNumber != "share")
                    myOrderModel.set('onHoldConfirmationNumber', that.options.onHoldConfirmationNumber);

                that.loadResources(function () {
                    if (that.performance) {
                        if (that.performance.get('isReservedSeating')) {
                            that.getSeatsLayout();
                        }

                        var time = new Date(that.performance.get('showTime'));
                        time.setMinutes(time.getMinutes() + that.theater.get("performanceExpirationInMinutes"));
                        var now = new Date().toISOString();

                        if (time.toISOString() < now) {
                            showAlert(window.ObjectCollections.Localization.result.performanceStarted, {
                                postBack: function () {
                                    Backbone.history.navigate("home", { trigger: true });
                                }
                            });
                            return;
                        }
                    } else {
                        showAlert(window.ObjectCollections.Localization.result.perormanceHasExpired, {
                            postBack: function () {
                                Backbone.history.navigate("home", { trigger: true });
                            }
                        });
                        return;
                    }

                    myOrderModel.set('theater', that.theater);
                    myOrderModel.set('movie', that.movie);
                    myOrderModel.set('performance', that.performance);

                    myOrderModel.get('tickets').getTickets(that.options.performanceId, that.options.theaterId, function (ticketsResponse) {
                        myOrderModel.set('tickets', ticketsResponse);
                        window.ObjectModels.OrderModel = myOrderModel;
                        callback();
                    });
                });
            });
        },
        cancelSaleIfNeeded: function (callback) {
            var that = this,
                cancelingSale = false;
            if (that.cache.read('saleId')) {
                var myOrderModel = new orderModel({ theaterId: that.theaterId });
                myOrderModel.set('saleId', that.cache.read('saleId'));
                myOrderModel.cancelSale(function () {
                    that.cache.remove('saleId');
                    callback();
                });
                cancelingSale = true;
            }
            if (!cancelingSale)
                callback();
        },
        loadResources: function (callback) {
            var that = this;

            that.theater = null;
            that.performance = null;
            that.movie = null;

            var loadSchedules = function () {
                var schedulesCollection = that.theater.schedules;
                if (!schedulesCollection) {
                    schedulesCollection = new scheduleCollection({ theaterId: that.theaterId });
                    schedulesCollection.fetch({
                        success: function (schedulesResponse) {
                            schedulesCollection = schedulesResponse;

                            var movPerfContainer = schedulesCollection.getMovieAndPerformance(that.movieCode, that.performanceId);
                            that.performance = movPerfContainer.performance;
                            that.movie = movPerfContainer.movie;

                            callback();
                        },
                        error: function () {
                            hidePageLoadingMessage();
                            showAlert(window.ObjectCollections.Localization.result.errorCode16);
                        }
                    });
                }
            };
            if (window.ObjectCollections.TheaterCollection) {
                that.theater = _.find(window.ObjectCollections.TheaterCollection.models, function (t) { return t.id == that.theaterId; });
            }

            if (!that.theater) {
                that.theater = new theaterModel({ id: that.theaterId });
                that.theater.getTheater(function (response) {
                    that.theater = response;
                    loadSchedules();
                },
                function (error) {
                    console.log('getTheater error', error);
                });
            } else {
                loadSchedules();
            }
        },

        events: {
            'click #facebook-share': 'fbShareConfirm'
        },

        fbShareConfirm: function () {
            var that = this;

            if (typeof FB != 'undefined' && FB) {
                FB.getLoginStatus(function (response) {
                    if (response && response.status == 'connected') {
                        end();
                    } else {
                        FB.login(checkLoginStatus);
                    }
                });
            } else {
                showAlert(window.ObjectCollections.Localization.result.unableToConnect);
            }

            function checkLoginStatus(response) {
                if (response.status == 'connected') {
                    showAlert(window.ObjectCollections.Localization.result.loggedInFb, { postBack: end });
                } else {
                    showAlert(window.ObjectCollections.Localization.result.unableToConnect);
                }
            };

            function end() {
                if (!window.ObjectCollections.FacebookFriendCollection) {
                    var c = new facebookFriendCollection();
                    window.ObjectCollections.FacebookFriendCollection = c;
                };
                var localize = window.ObjectCollections.Localization.result;
                var picture = that.movie.get('image') ? (that.movie.get('image').medium || window.appConfig.DefaultMoviePosterImage) : window.appConfig.DefaultMoviePosterImage;
                var caption = localize.confirmationMovie;

                var dateShowTime = DtHelper.convertDate(that.performance.get('showTime'));
                var date = Globalize.format(dateShowTime, "M", window.ObjectModels.OrderModel.get('theater').get('culture'));
                var time = Globalize.format(dateShowTime, "t", window.ObjectModels.OrderModel.get('theater').get('culture'));

                var personalMessage = $.sprintf(window.ObjectCollections.Localization.result.checkoutPersonalMessage,
                    window.ObjectModels.OrderModel.get('movie').get('name'),
                    window.ObjectModels.OrderModel.get('theater').get('name'),
                    date,
                    time);

                var link = window.appConfig.SiteURL + location.hash;
                window.ObjectCollections.FacebookFriendCollection.shareToWall(that.movie.get('name'), caption, personalMessage, link, picture, function (response) {
                    if (response && response.post_id) {
                        showAlert(window.ObjectCollections.Localization.result.postSuccessful);
                    }
                });
            };
        },
        render: function () {
            var that = this;

            var load = function () {
                var dateShowTime = DtHelper.convertDate(that.performance.get('showTime')),
             showTime = Globalize.format(DtHelper.convertDate(that.performance.get('showTime')), Globalize.findClosestCulture(that.theater.get("culture")).calendar.patterns.t, that.theater.get("culture")),
             showDate = Globalize.format(dateShowTime, "D", that.theater.get('culture')),
             showTimeMsg = showTime + ', ' + showDate;

                that.undelegateEvents();

                window.AppProperties.SelectedTheater = that.theaterId;

                $(that.el).html(that.template({ movie: that.movie, theater: that.theater, showTimeMsg: showTimeMsg }));

                that.loadTabs();

                that.delegateEvents();
                hidePageLoadingMessage();

                that.loadFirstView();
                $("#topNavigation").html("");
                $("#zipDistanceFilterTop").html("");
            };

            if (that.facebookId) {
                that.fbValidation(load);
            } else {
                var status = that.performance.get('status');
                if (status == 'L' || status == 'S') {
                    showAlert(window.ObjectCollections.Localization.result.performanceSoldOut, {
                        postBack: function () {
                            Backbone.history.navigate("home", { trigger: true });
                        }
                    });
                    return;
                }

                load();
            }
        },
        destroyLastView: function () {
            if (this.lastView) {
                this.lastView.undelegateEvents();
            }
        },
        loadFirstView: function () {
            var that = this;
            var tab = $('#checkout-menu').find("[data-tab-index='1']");
            that.currentTabIndex = 1;
            that.loadView(tab.data('tab-name'));
        },
        loadNextView: function () {
            var that = this;

            $(window).scrollTop(0);
            var currentTabIndex = $('#checkout-menu').find("[data-tab-name='" + that.currentTab + "']").data('tab-index');
            var nextTab = $('#checkout-menu').find("[data-tab-index='" + (currentTabIndex + 1) + "']");
            if (nextTab.length > 0) {
                that.currentTabIndex = currentTabIndex + 1;
                that.loadView(nextTab.data('tab-name'));
            }
        },
        loadTabs: function () {
            var that = this;
            var tabsOptions = {
                isReservedSeating: that.performance.get('isReservedSeating'),
                useConssesions: window.ConfigurationProvider.useConssesion(that.theater)
            };
            var tabView = new tabs({ el: '#tabs-container', vent: that.vent, tabsOptions: tabsOptions, localize: window.ObjectCollections.Localization.result });
            tabView.render();
        },
        handleTabSelection: function (newTabName) {
            var that = this;
            that.currentTab = newTabName;
            var currentTab = $('#checkout-menu>li:first.active'),
                currentTabName = currentTab.data('tab-name');

            if (currentTabName != newTabName) {
                currentTab.removeClass('active');
                $('#checkout-menu').find("[data-tab-name='" + newTabName + "']").addClass('active');
            }
        },
        loadView: function (viewName) {
            //TODO: Remove this line if need to show notification throughout the checkout flow
            $('#top-notification').hide();
            $('#top-notification').off();

            var that = this;
            switch (viewName) {
                case 'tickets':
                    that.loadTickets();
                    break;
                case 'seats':
                    that.shouldLoadSeats(function (shouldLoad) {
                        if (shouldLoad)
                            that.loadSeats();
                    });
                    break;
                case 'concessions':
                    that.loadConcessions();
                    break;
                case 'payment':
                    that.loadPayment();
                    break;
                case 'review':
                    that.loadReview();
                    break;
            }
        },
        tabClickHandler: function (options) {
            var that = this;
            var nextTab = $(options.e.currentTarget);
            var nextTabName = nextTab.data('tab-name');
            var nextTabIndex = nextTab.data('tab-index');

            //DEBUG: Comment this part if want to go directly to concessions tab - testing purposes only.
            if (that.currentTabIndex) {
                if (that.currentTabIndex <= nextTabIndex)
                    return;
            }

            that.currentTabIndex = nextTabIndex;
            that.loadView(nextTabName);
        },
        shouldLoadSeats: function (callback) {
            var that = this;
            var reservedTickets = window.ObjectModels.OrderModel.get('tickets').where({ 'isReservedSeating': true });
            var gaTickets = window.ObjectModels.OrderModel.get('tickets').where({ 'isReservedSeating': false, 'isOnHoldTicketType': false });
            if (_.filter(reservedTickets, function (ti) { return ti.get('quantity') > 0; }).length > 0) {
                callback(true);
            } else if (_.filter(gaTickets, function (ti) { return ti.get('quantity') > 0; }).length > 0) {
                that.currentTab = 'seats';
                callback(false);
                that.loadNextView();
            } else {
                hidePageLoadingMessage();
                window.showAlert(window.ObjectCollections.Localization.result['youMustSelectTickets']);
                callback(false);
            }
        },
        loadTickets: function () {
            var that = this;

            that.destroyLastView();
            var loadTicketsView = function () {
                var enableHold = !that.options.onHoldConfirmationNumber || that.options.onHoldConfirmationNumber == 'share';

                var ticketsView = new selectTicketsView({
                    performance: that.performance,
                    movie: that.movie,
                    theater: that.theater,
                    localize: window.ObjectCollections.Localization.result,
                    vent: that.vent,
                    enableHold: enableHold,
                    el: "#tickets"
                });
                ticketsView.render();
                that.handleTabSelection('tickets');
                that.lastView = ticketsView;
                window.ObjectViews.SelectTicketsView = ticketsView;
            };

            window.ObjectModels.TempOrder = { concessions: null, concessionsChanged: false, concessionTotal: 0, total: 0, subTotal: 0 };

            if (window.ObjectModels.OrderModel.get('saleId')) {
                var savedOrderModel = window.ObjectModels.OrderModel;

                var order = new OrderModel();

                order.set('performance', that.performance);
                order.set('movie', that.movie);
                order.set('theater', that.theater);
                order.set('loyaltyCardNumber', savedOrderModel.get('loyaltyCardNumber'));

                if (savedOrderModel.get('onHoldConfirmationNumber'))
                    order.set('onHoldConfirmationNumber', savedOrderModel.get('onHoldConfirmationNumber'));

                window.ObjectModels.OrderModel.cancelSale(function () {
                    new ticketCollection().getTickets(that.options.performanceId, that.options.theaterId, function (ticketsResponse) {
                        order.set('tickets', ticketsResponse);

                        for (var i = 0; i < savedOrderModel.get('tickets').models.length; i++) {
                            var item = savedOrderModel.get('tickets').models[i];

                            var t = order.get('tickets').where({
                                'name': item.get('name')
                            })[0];

                            if (t) {
                                t.set('quantity', t.get('quantity') + item.get('quantity'));
                                if (item.friends)
                                    t.friends = item.friends;
                            }
                            if (t && item.get('subscriptionCardNumbers')) {
                                t.set('subscriptionCardNumbers', item.get('subscriptionCardNumbers'));
                            }
                        }
                        window.ObjectModels.OrderModel = order;
                        loadTicketsView();
                    });
                });
            } else {
                loadTicketsView();
            }
        },
        loadSeats: function () {
            showPageLoadingMessage();
            var that = this;

            var showSeatsView = function () {
                that.destroyLastView();
                var seatView = new selectSeatsView({
                    localize: window.ObjectCollections.Localization.result,
                    container: "#tickets",
                    vent: that.vent
                });

                seatView.render({
                    collection: that.seatsLayout,
                    performance: that.performance,
                    performanceId: that.performanceId,
                    theaterId: that.theaterId
                });

                seatView.showTicketQuantity();
                seatView.renderPage();
                that.lastView = seatView;
                that.handleTabSelection('seats');
                window.ObjectViews.SelectSeats = seatView;

                _.defer(function () {
                    seatView.firstLoad = false;
                });

                hidePageLoadingMessage();
            };

            if (window.ObjectModels.TempOrder.concessionsChanged) {
                showOverlay();
                window.ObjectModels.OrderModel.set('processing', true);

                var concessions = window.ObjectModels.OrderModel.get('concessions');

                require(['collections/concessionCollection'], function (concessionCollection) {
                    var clonedCollection = new concessionCollection();

                    concessions.each(function (model) {
                        clonedCollection.add(new Backbone.Model(JSON.parse(JSON.stringify(model))));
                    });

                    window.ObjectModels.TempOrder.concessions = clonedCollection;

                    concessions.lockConcessions(function (success, errorCode) {
                        var continueFlow = function () {
                            window.ObjectModels.TempOrder.concessionsChanged = false;
                            window.ObjectModels.OrderModel.unset('processing');
                            showSeatsView();
                        };

                        if (errorCode) {
                            new ErrorHelper().showAlertByErrorCode(errorCode, function () { continueFlow(); });
                        } else {
                            continueFlow();
                        }
                    }, true);
                });
            } else {
                showSeatsView();
            }
        },
        loadConcessions: function () {
            var that = this;

            var localize = window.ObjectCollections.Localization.result;
            require(['collections/concessionCollection'], function (concessionCollection) {
                var concessionsData = new concessionCollection(that.theaterId);
                if (!window.ObjectModels.OrderModel.get('concessions'))
                    window.ObjectModels.OrderModel.set('concessions', new concessionCollection());

                concessionsData.fetch({
                    error: function () {
                        hidePageLoadingMessage();
                        showAlert(window.ObjectCollections.Localization.result.errorCode16);
                        return false;
                    },
                    success: function (result) {
                        if (result)
                            var code = concessionsData.result_code;

                        var message;
                        if (code != 200) {
                            var r = concessionsData.models[0].get('result');
                            message = r.message || "";
                        } else
                            message = false;

                        window.ObjectCollections.ConcessionCollection = result;
                        require(['views/Concession'], function (concessionView) {
                            window.ObjectModels.OrderModel.set('concessionsLocked', false);

                            var totalPrice = window.ObjectModels.OrderModel.get('totalPrice');
                            var subTotal = window.ObjectModels.OrderModel.get('subTotal');

                            window.ObjectModels.TempOrder.total = totalPrice - window.ObjectModels.TempOrder.concessionTotal;
                            window.ObjectModels.TempOrder.subTotal = subTotal - window.ObjectModels.TempOrder.concessionTotal;

                            var concessions = window.ObjectViews.ConcessionView;
                            if (!concessions) {
                                concessions = new concessionView({
                                    localize: localize,
                                    culture: that.theater.get('culture')
                                });
                            }
                            concessions.render({ model: result, message: message, container: "#tickets", vent: that.vent });
                            that.destroyLastView();
                            that.lastView = concessions;
                            that.handleTabSelection('concessions');
                            window.ObjectViews.ConcessionView = concessions;
                        });

                        hidePageLoadingMessage();
                    }
                });
            });
        },
        loadPayment: function () {
            var that = this;
            require(['views/Payment'], function (paymentView) {
                var loadPayment = true;
                var errorMessage = '';
                var gaTickets = window.ObjectModels.OrderModel.get('tickets').where({ 'isReservedSeating': false, 'isOnHoldTicketType': false });

                if (window.ObjectModels.OrderModel.get('tickets').getSelectedTicketQuantity() <= 0) {
                    loadPayment = false;
                    errorMessage = window.ObjectCollections.Localization.result['youMustSelectTickets'];
                }
                else if (that.performance.get('isReservedSeating') && !window.ObjectModels.OrderModel.get('sentSeats') && gaTickets < 1) {
                    loadPayment = false;
                    errorMessage = window.ObjectCollections.Localization.result['youMustSelectSeats'];
                }
                if (loadPayment) {
                    var payment;
                    if (!window.ObjectViews.PaymentView) {
                        payment = new paymentView({
                            order: window.ObjectModels.OrderModel,
                            ticketCollection: window.ObjectModels.OrderModel.get('tickets'),
                            vent: that.vent
                        });
                    } else {
                        payment = window.ObjectViews.PaymentView;
                    }
                    payment.render({
                        container: "#tickets",
                        theater: that.theater,
                        callback: function () {
                            payment.build($('#expDateMonth'), $('#expDateYear'));
                            hidePageLoadingMessage();
                        }
                    });
                    that.destroyLastView();
                    that.lastView = payment;
                    that.handleTabSelection('payment');
                } else {
                    hidePageLoadingMessage();
                    window.showAlert(errorMessage);
                }
            });
        },
        loadReview: function () {
            var that = this;
            var confView = new confirmationView({ el: "#tickets", vent: that.vent });
            confView.render({
                container: "#tickets",
                callback: function () {
                    hidePageLoadingMessage();
                }
            });
            that.destroyLastView();
            that.lastView = confView;
            that.handleTabSelection('review');
            window.ObjectViews.OrderRevView = confView;
        },
        loadProcessingPayment: function () {
            require(['views/OrderProcessing'], function (orderProcessing) {
                var orderProcessingView = new orderProcessing({ el: "#tickets" });
                orderProcessingView.render();
                hideOverlay();
                window.ObjectViews.OrderProcessingView = orderProcessingView;
            });
        },
        getSeatsLayout: function () {
            var that = this;

            var seats = new seatCollection({ performanceId: that.performanceId, theaterId: that.theaterId });
            seats.fetch({
                success: function (result) {
                    that.seatsLayout = result;
                },
                error: function () {

                }
            });
        }
    });
    return view;
});