define(['text!templates/Confirmation.html',
        'views/_purchaseSummary',
        'models/confirmSaleModel',
        'sharedhelpers/dateTimeHelper',
         'helpers/CountdownHelper'
], function (template, purchaseSummaryView) {

    var view = Backbone.View.extend({
        template: _.template(template),
        initialize: function () {
            this.vent = this.options.vent;
            _.bindAll(this);
        },
        events: {
        },

        render: function (arg) {
            if (window.ObjectModels.OrderModel) {

                var myOrderModel = window.ObjectModels.OrderModel;
                var myPaymentData = myOrderModel.get('paymentData');

                var tickets = myOrderModel.get('tickets');
                var selectedConcessions = {};
                var card = myPaymentData.paymentCards && myPaymentData.paymentCards[0] ? myPaymentData.paymentCards[0] : null;

                var creditCardInfo = [];
                if (myOrderModel && myOrderModel.get('summaryInfo')) {
                    creditCardInfo = myOrderModel.get('summaryInfo').creditCardInfo;
                }
                if (card) {
                    creditCardInfo.push({ "type": myPaymentData.cardType, "number": "**** **** **** " + myPaymentData.lastDigits });
                }
                var servisCharge = myOrderModel.get('tickets').getTicketServiceCharge();

                var summaryInfo = {
                    tickets: tickets,
                    servisCharge: servisCharge,
                    selectedConcessions: selectedConcessions,
                    creditCardInfo: creditCardInfo
                };
                window.ObjectModels.OrderModel.set('summaryInfo', summaryInfo);

                this.el = arg.container;
                $(this.el).html(this.template({
                    tickets: tickets,
                    summaryInfo: summaryInfo,
                    localize: window.ObjectCollections.Localization.result,
                    subscriptionCards: this.getSubscriptionCards()
                }));
                this.loadPurchaseSummary();
                if (arg.callback)
                    arg.callback();
            } else {
                $(this.el).html('Order not exists');
                if (arg.callback)
                    arg.callback();
            };

            CountdownHelper.initCountdown();
        },

        getSubscriptionCards: function () {
            var cards = {};
            var cardNumbers = [];
            var orderModel = window.ObjectModels.OrderModel;
            var tickets = orderModel.get('tickets') ? orderModel.get('tickets').models : [];

            _.each(tickets, function (ticket) {
                if (ticket.get('subscriptionCardNumbers')) {
                    _.each(ticket.get('subscriptionCardNumbers'), function (card) {
                        cardNumbers.push(card.number);
                    });
                    cards[ticket.get('name')] = cardNumbers.join(', ');
                    cardNumbers = [];
                }

            });

            return cards;
        },

        loadPurchaseSummary: function () {
            if (this.purchaseSummaryView) {
                this.purchaseSummaryView.undelegateEvents();
                this.purchaseSummaryView.el = "#purchaseSummaryReview";
            }

            this.purchaseSummaryView = new purchaseSummaryView({
                el: "#purchaseSummaryReview"
            });

            this.purchaseSummaryView.render({ step: 'confirmation', localize: window.ObjectCollections.Localization.result, vent: this.vent });
        },
        dispose: function () {
            this.undelegateEvents();
            this.off();
            if (this.vent)
                this.vent.off();
        }
    });

    return view;
});


