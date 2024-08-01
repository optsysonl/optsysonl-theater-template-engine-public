define(['sharedhelpers/configurationProvider',
        'text!templates/OrderComplete.html',
        'text!templates/HoldSeatsConfirmationView.html',
        'sharedlibs/jquery/jquery.qrcode.min',
        'async!//maps.googleapis.com/maps/api/js?sensor=false',
        'views/_map',
        'collections/facebookFriendCollection',
        'sharedhelpers/utilities'
], function (configurationProvider, template, holdSeatsConfirmationTemplate, qrCode, googleMap, mapView, facebookFriendCollection) {

    var view = Backbone.View.extend({
        initialize: function () {
            this.movie = this.options.movie;
            this.theater = this.options.theater;
            this.performance = this.options.performance;
            this.theaterName = this.options.theater.get('name');
        },
        template: _.template(template),

        events: {
            'click #facebook-share': 'fbShareConfirm',
            'click #printPage': 'printPage',
            'click #share-hold-seats': 'shareHoldSeats',
            'click #cancel-hold-seats': 'cancelHoldSeats'
        },
        printPage: function () {
            window.print();
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
                    var c = new FacebookFriendCollection();
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

                var link = window.appConfig.SiteURL + '#tickets/' + that.performance.get('number') + '/' + $.trim(that.movie.get('code')) + '/' + that.theater.get('id');
                window.ObjectCollections.FacebookFriendCollection.shareToWall(that.movie.get('name'), caption, personalMessage, link, picture, function (response) {
                    if (response && response.post_id) {
                        showAlert(window.ObjectCollections.Localization.result.postSuccessful);
                    }
                });
            };
        },
        removeHoldSeats: function () {
            window.ObjectModels.OrderModel.get('tickets').models = _.reject(window.ObjectModels.OrderModel.get('tickets').models, function (item) {
                return item.id === "00000000-0000-0000-0000-000000000000";
            });
            window.ObjectModels.OrderModel.set('confirmSaleResult', _.reject(window.ObjectModels.OrderModel.get('confirmSaleResult'), function (item) {
                return item.name === "HOLD";
            }));
        },
        shareNext: function () {
            var that = this;
            var ff = new facebookFriendCollection();
            var friends = window.ObjectModels.OrderModel.get('tickets').find(function (t) {
                return t.get('name') == "Hold";
            }).friends;

            var nextFriend = friends[friends.length - 1];
            var picture = that.movie.get('image') ? (that.movie.get('image').small || location.host + '/assets/files/ncr-content/img/moviePlcHolder.png') : location.host + '/assets/files/ncr-content/img/moviePlcHolder.png';
            var caption = window.ObjectCollections.Localization.result.holdSeatsFbCaption;

            ff.publishToFriendWall(nextFriend.id, that.buildFbHoldMessage(nextFriend.get('quantity'), nextFriend.get('firstName')), that.makeLink(nextFriend.get('id')), caption, that.movie.get('name'), picture,
                function (success) {
                    if (success) {
                        showAlert(window.ObjectCollections.Localization.result.postToFriendsWallSuccessful);

                        $('#' + nextFriend.id).fadeOut();
                        friends.pop();
                        if (friends.length > 0) {
                            that.shareNext();
                        } else {
                            that.renderOrderComplete();
                        }
                    } else {
                    }
                });
        },
        buildFbHoldMessage: function (quantity, friendName) {
            var that = this;
            var localize = window.ObjectCollections.Localization.result;

            var dateShowTime = DtHelper.convertDate(that.performance.get('showTime'));
            var formattedDate = Globalize.format(dateShowTime, "M", that.theater.get('culture'));
            var formattedTime = Globalize.format(dateShowTime, "t", that.theater.get('culture'));

            var holdTime = dateShowTime.getTime() - window.ConfigurationProvider.holdTimeInMinutesBeforeShowTime(this.theater) * 60000;
            var maxHoldTime = new Date().getTime() + window.ConfigurationProvider.holdTimeinMinutes(this.theater) * 60000;
            var holdDate = holdTime > maxHoldTime ? new Date(maxHoldTime) : new Date(holdTime);

            var holdDateValue = Globalize.format(holdDate, "M", that.theater.get('culture'));
            var holdTimeValue = Globalize.format(holdDate, "t", that.theater.get('culture'));

            var msg = friendName ? localize.hi + ' ' + friendName + ', <br/> ' : '';
            msg += $.sprintf(localize.fbHoldSeatsMessage,
               that.movie.get('name'),
               formattedDate,
               formattedTime,
               quantity,
              (quantity > 1) ? 's' : '',
               holdDateValue,
               holdTimeValue);

            return msg;
        },
        makeLink: function (friendsFacebookId) {
            var utilities = new Utilities();
            var link = $.sprintf("%s%s/%s/%s/%s/%s/%s",
                            window.appConfig.SiteURL,
                            "#tickets",
                            $.trim(window.ObjectModels.OrderModel.get('performance').get('number')),
                            $.trim(window.ObjectModels.OrderModel.get('movie').get('code')),
                            $.trim(window.ObjectModels.OrderModel.get('theater').get('id')),
                            $.trim(window.ObjectModels.OrderModel.get('confirmationNumber')),
                            encodeURIComponent(utilities.encrypt(friendsFacebookId)));
            return link;
        },
        shareHoldSeats: function () {
            this.shareNext();
        },
        renderOrderComplete: function () {
            var that = this;
            var receipt = window.ObjectModels.OrderModel.get('confirmSaleReceipt');
            receipt.groupByItems = window.ObjectModels.OrderModel.get('tickets');

            var tickets = receipt.groupByItems;

            window.ObjectModels.OrderModel.get('summaryInfo').tickets = tickets;
            var orderHelper = new OrderHelper();
            var concessionSummary = orderHelper.formatConcessionsForSummary();

            // tracking GA Products
            var myorderModel = window.ObjectModels.OrderModel;
            var performance = myorderModel.get('performance');
            var movieName = myorderModel.get('movie').get('name');
            var dateShowTime = DtHelper.convertDate(performance.get('showTime'));
            var showTime = Globalize.format(dateShowTime,'t', myorderModel.get('theater').get('culture'));
            var showDate = Globalize.format(dateShowTime, 'D', myorderModel.get('theater').get('culture'));
            //console.dir('concessionSummary:'+ concessionSummary);

            var totals = 0;
            var groupedTickets = _.groupBy(myorderModel.get('confirmSaleResult'), function (t) { return t.name; });

            _.each(groupedTickets, function (gt) {
                var total = 0;
                var name = gt[0].name;
                var seat = '';

                _.each(gt, function (t, index) {
                    if (t.seatName != 'GA' && t.name.toUpperCase() != 'HOLD')
                        seat += index ? ', ' + t.seatName : '- ' + t.seatName;
                    total += t.price;
                });
                //console.dir(myorderModel);
                //console.log(gt);
                //console.log(myorderModel.get('movie').get('id') + '=' + myorderModel.get('movie').get('name') + '=' + name + '=' + total + '=' + gt.length);
                window.GoogleAnalyticsHelper.addProductGA(
                    myorderModel.get('movie').get('id'),
                    myorderModel.get('movie').get('name'),
                    name, //category
                    myorderModel.get('theater').get('name'), //Brand or HouseName
                    dateShowTime,  //DataTime
                    total,
                    gt.length
                );
            });

            // tracking GA Order
            var trackECId = myorderModel.get('saleId');
            var trackECPrice = myorderModel.get('totalPrice');
            var trackECTax = myorderModel.get('tax');

            window.GoogleAnalyticsHelper.trackEC(trackECId, trackECPrice, trackECTax);
            window.GoogleAnalyticsHelper.trackPage('receipt');

            $(that.el).html(that.template({
                localize: window.ObjectCollections.Localization.result,
                concessionSummary: concessionSummary,
                summaryInfo: window.ObjectModels.OrderModel.get('summaryInfo')
            }));
            var patronInfo = window.ObjectModels.OrderModel.get('paymentData').patronInfo;
            var patronName = patronInfo.firstName + ' ' + patronInfo.lastName;

            var code = window.ObjectModels.OrderModel.get('confirmationNumber');
            $('#qrCode').qrcode({
                width: 163,
                height: 163,
                text: configurationProvider.useSimpleQrCode() ? code : code + '^' + patronName
            });

            $('#qrCodeText').html(code);
            var theater = window.ObjectModels.OrderModel.get('theater');
            var coordinatesOptions = [];
            coordinatesOptions.push(
            {
                lat: theater.get('latitude'),
                lon: theater.get('longitude'),
                theaterInfo:
                {
                    theaterName: theater.get('name'),
                    theaterAddress1: theater.get('addressLine1'),
                    theaterAddress2: theater.get('addressLine2') || '',
                    theaterCity: theater.get("addressCity"),
                    theaterState: theater.get("addressState"),
                    theaterZip: theater.get("addressZip"),
                    theaterPhoneNumber: theater.get("phone")
                }
            });

            var map = new mapView({ container: "#map_canvas", coordinatesOptions: coordinatesOptions, zoom: 10 });
            map.render();
            $('#div-map').css({ width: '360px', height: '300px' });

            hidePageLoadingMessage();
            that.giftTickets();
            window.AppProperties.SelectedDate = null;
            window.AppProperties.SelectedTheater = null;
        },
        cancelHoldSeats: function () {
            var that = this;
            showAlert(window.ObjectCollections.Localization.result.giveUpHoldSeats, {
                dialogType: true,
                postBack: function (result) {
                    if (result) {
                        that.removeHoldSeats();
                        that.renderOrderComplete();
                    }
                }
            });

        },
        renderHoldSeatsConfirmation: function () {
            var that = this;
            var friends = window.ObjectModels.OrderModel.get('tickets').find(function (t) {
                return t.get('name') == "Hold";
            }).friends;
            var holdConfirmationTmpl = _.template(holdSeatsConfirmationTemplate);
            $(that.el).html(holdConfirmationTmpl({
                localize: window.ObjectCollections.Localization.result,
                friends: friends,
                message: that.buildFbHoldMessage(_.reduce(friends, function (memo, num) { return memo + num.get('quantity'); }, 0))
            }));
            hidePageLoadingMessage();
        },
        render: function () {
            var that = this;
            showPageLoadingMessage();
            var holdTicket = window.ObjectModels.OrderModel.get('tickets').find(function (t) {
                return t.get('name') == "Hold";
            });
            if (holdTicket && holdTicket.friends && holdTicket.friends.length > 0) {
                that.renderHoldSeatsConfirmation();
            } else {
                that.renderOrderComplete();
            }
        },
        giftTickets: function () {
            var htmlElement = $('#gift-container');
            showPageLoadingMessage();
            require(['views/GiftTickets'], function (giftTicketsView) {
                var page = new giftTicketsView({
                    localize: window.ObjectCollections.Localization.result
                });

                htmlElement.html(page.el);
                page.render(function () {
                    hidePageLoadingMessage();
                });
            });
        }
    });

    return view;
});
