define(['text!templates/SelectTickets.html',
        'jqueryGlobalize',
        'collections/ticketCollection',
        'views/SelectOnHoldFriends',
        'views/SelectSeats',
        'collections/facebookFriendCollection',
        'views/_purchaseSummary'
], function (template, jqueryGlobalize, ticketCollection, facebookFriendView, selectSeatsView, facebookFriendCollection, purchaseSummaryView) {

    var view = Backbone.View.extend({

        template: _.template(template),

        infoModalLoading: false,

        initialize: function () {
            this.localize = this.options.localize;
            this.performance = this.options.performance;
            this.theater = this.options.theater;
            this.performanceId = this.options.performanceId;
            this.theaterId = this.options.theaterId;
            this.movie = this.options.movie;
            this.vent = this.options.vent;
            this.enableHold = this.options.enableHold;
            this.undelegateEvents();
        },

        prepareFacebook: function () {
            var that = this;
            var c = new FacebookFriendCollection();
            window.ObjectCollections.FacebookFriendCollection = c;
            window.selectOnHoldCollection = null;

            var msgBottomOnHold;
            if (that.performance) {
                var dateShowTime = DtHelper.convertDate(that.performance.get('showTime'));

                var holdTime = dateShowTime.getTime() - window.ConfigurationProvider.holdTimeInMinutesBeforeShowTime(that.theater) * 60000;
                var maxHoldTime = new Date().getTime() + window.ConfigurationProvider.holdTimeinMinutes(that.theater) * 60000;
                var holdDate = holdTime > maxHoldTime ? new Date(maxHoldTime) : new Date(holdTime);

                var showTime = Globalize.format(holdDate, 't', that.theater.get('culture'));
                var showDate = Globalize.format(holdDate, 'D', that.theater.get('culture'));

                msgBottomOnHold = $.sprintf(window.ObjectCollections.Localization.result.msgBottomOnHold, showTime, showDate);
            }
            else {
                msgBottomOnHold = "error performance";
            };

            that.facebookView = new facebookFriendView({
                collection: c,
                localize: window.ObjectCollections.Localization.result,
                msgBottomOnHold: msgBottomOnHold,
                isHoldSeats: true,
                vent: that.vent,
                onClose: function () {
                    that.showTicketTotal();
                    var ticketHold = window.ObjectCollections.TicketCollection.where({ 'isOnHoldTicketType': true });
                    if (ticketHold && ticketHold[0])
                        ticketHold[0].set('quantity', window.selectOnHoldCollection.totalTickets());

                    hidePageLoadingMessage();
                }
            });

            that.facebookView.maxOnHoldTickets = window.ConfigurationProvider.maxOnHoldTickets(that.theater);
        },

        el: 'body',
        events: {
            'click img#add': 'addTicket',
            'click img#remove': 'removeTicket',
            'click #selectFriends': 'selectFriends'
        },
        selectFriends: function () {
            this.prepareFacebook();
            this.facebookView.render();

            $('#facebook').on('hidden', function () {
                hidePageLoadingMessage();
            });
        },
        showPolicyInfo: function (that) {
            var theater = that.theater;
            if (!theater.get('warningLong') || that.infoModalLoading) return;
            that.infoModalLoading = true;
            require(['views/InfoPopup'], function (infoPopupView) {
                var infoPopup = new infoPopupView({ container: $('#policy'), title: theater.get('warningTitle'), content: theater.get('warningLong'), confirmButton: { text: that.localize.ok } });
                infoPopup.render();
                that.infoModalLoading = false;
            });

        },
        clickPage: function (ev) {
            var a = $(ev.target).text();
            var id = $(ev.target).parent('li').data('id');
            var ticket = this.collection.where({ id: id })[0];
            if (ticket) {
                var q = parseInt(a) | 0;
                ticket.set('quantity', q);
                $('#quantityLabel' + id).html(a);
                var objTotalPrice = $("#price" + id);
                this.showTotalPrice(objTotalPrice, ticket.getTotalPriceDisplay());
                this.showTicketTotal();
            }
        },

        checked: function (ev) {
            var id = $(ev.target).data('id');

            var ticket = this.collection.where({ id: id })[0];
            if (ticket.get('quantity') == 0) {
                ticket.set('quantity', parseInt(this.collection.maxOnHoldTickets));
            } else {
                ticket.set('quantity', 0);
            }
        },

        showTotalPrice: function (objTotalPrice, totalPrice) {
            objTotalPrice.html('<strong>' + totalPrice + '</strong>');
        },

        addTicket: function (e) {
            var that = this;
            var ticket = that.findTicket(e);
            ticket.addTicket(true);
            if (ticket.get('quantity') > 0) {
                $(that.el).find('[data-id="' + ticket.get('id') + '"]#remove').fadeIn();
            }
            $(that.el).find('#' + ticket.get('id')).text(ticket.get('quantity'));
            window.ObjectModels.OrderModel.unset('saleId');
            this.loadPurchaseSummary();
        },
        removeTicket: function (e) {
            var that = this;
            var ticket = that.findTicket(e);
            ticket.removeTicket();
            if (ticket.get('quantity') == 0) {
                $(that.el).find('[data-id="' + ticket.get('id') + '"]#remove').fadeOut();
                $('#' + ticket.get('id')).text("");
            } else {
                $(that.el).find('#' + ticket.get('id')).text(ticket.get('quantity'));
            }

            if (ticket.get('subscriptionCardNumbers')) {
                ticket.removeSubscriptionCard();
            }

            window.ObjectModels.OrderModel.unset('saleId');
            this.loadPurchaseSummary();
        },
        findTicket: function (e) {
            var myOrderModel = window.ObjectModels.OrderModel,
                type = $(e.currentTarget).data("id");
            return myOrderModel.get('tickets').where({ "id": type })[0];
        },
        loadPurchaseSummary: function () {
            if (!window.ObjectViews.PurchaseSummaryView) {
                window.ObjectViews.PurchaseSummaryView = new purchaseSummaryView();
            }
            window.ObjectViews.PurchaseSummaryView.render({ container: "#orderSummary", step: 'tickets', localize: window.ObjectCollections.Localization.result, vent: this.vent });

            var culture = window.ObjectModels.OrderModel.get('theater').get('culture');
            var tickets = window.ObjectModels.OrderModel.get('tickets');

            $('#serviceCharge').text(tickets.getTicketServiceChargeDisplay(culture));
            $('#ticketTotal').text(tickets.getTicketTotalDisplay(culture));
        },

        render: function () {
            window.ActivePaymentMethod = 'CreditCard';
            var that = this,
                showTime = that.performance ? Globalize.format(new Date(that.performance.get('showTime')), "h:mmtt") + ', ' +
                           Globalize.format(new Date(that.performance.get('showTime')), "dddd (MMM) d") : '',
                performanceMsg = this.buildPerformanceMessage(that.performance);

            $(that.el).html(that.template({
                tickets: window.ObjectModels.OrderModel.get('tickets'),
                movie: that.movie,
                theater: that.theater,
                performanceMsg: performanceMsg,
                showTime: showTime,
                enableHold: that.enableHold,
                localize: window.ObjectCollections.Localization.result
            }));

            that.loadPurchaseSummary();
            that.delegateEvents();
            hidePageLoadingMessage();

            if (that.theater.get('warningShort')) {
                var notificationContent = $(that.el).find('#notification-content').html();

                var container = $('#top-notification');
                $(container.children()[0]).html(notificationContent);
                container.show();

                container.bind('click', function () { that.showPolicyInfo(that); });
            }
        },
        buildPerformanceMessage: function (performance) {
            var performanceMsg = '';
            if (performance) {
                if (performance.get('dolbySoundFlag'))
                    performanceMsg = this.localize.dolbySoundFlag + ', ';
                if (performance.get('dTSSoundFlag'))
                    performanceMsg += this.localize.dTSSoundFlag + ', ';
                if (performance.get('sDDSSoundFlag'))
                    performanceMsg += this.localize.sDDSSoundFlag + ', ';

                if (performance.get('tHXSoundFlag'))
                    performanceMsg += this.localize.tHXSoundFlag + ', ';

                if (performance.get('dDDFlag'))
                    performanceMsg += this.localize.dDDFlag + ', ';

                if (performance.get('imaxFlag'))
                    performanceMsg += this.localize.imaxFlag + ', ';
                if (!performance.get('passesAllowed'))
                    performanceMsg += this.localize.noPasses + ', ';

                if (performance.get('isReservedSeating'))
                    //performanceMsg += this.localize.seatSelection + ', ';
                if (performance.get('ageRestriction') > 1)
                    performanceMsg += this.localize.ageRestricted + ', ';
                if (performance.get('variableSeatPricing'))
                    performanceMsg += this.localize.variableSeatPricing + ', ';
            } else {
                performanceMsg = this.localize.noPerformance;
            }

            performanceMsg = $.trim(performanceMsg);
            if (performanceMsg[performanceMsg.length - 1] == ',') {
                performanceMsg = performanceMsg.substring(0, performanceMsg.length - 1) + '. ';
            }

            return performanceMsg;
        },
        dispose: function () {
            this.undelegateEvents();
            this.off();
            if (this.vent) this.vent.off();
        }
    });

    return view;
});



