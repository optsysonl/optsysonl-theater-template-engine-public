define(['text!templates/OrderProcessing.html',
        'helpers/CountdownHelper'
], function (template) {

    var view = Backbone.View.extend({

        initialize: function () {
            this.localize = window.ObjectCollections.Localization.result;
        },

        template: _.template(template),
        events: {
            'click #tryAgain': 'loadPayment'
        },

        loadPayment: function () {
            var tab = $('#checkout-menu').find("[data-tab-name='payment']");
            $(tab).trigger('click');
        },

        render: function () {
            if (window.ObjectModels.OrderModel && window.ObjectModels.OrderModel.get('movie')) {
                showPageLoadingMessage();
                var that = this;

                $(this.el).html(this.template({
                    localize: window.ObjectCollections.Localization.result
                }));

                CountdownHelper.initCountdown();

                setTimeout(function () {
                    that.makeOrder();
                }, 200);

                that.partialAmounts = [];
            } else
                Backbone.history.navigate('home', true);
        },

        makeOrder: function () {
            $('#tryAgain').hide();
            $('#title').show();
            $('.order-processing').delay(500).fadeIn();
            showOverlay();
            window.ObjectModels.OrderModel.set('processing', true);
            var that = this;
            this.confirmSale(function (result) {
                hidePageLoadingMessage();
                hideOverlay();
                window.ObjectModels.OrderModel.unset('processing');
                if (result) {
                    $('.order-processing').hide();
                    $(".order-complete").show();
                    that.endProcessingOrder();

                }
                else {
                    $('#title').hide();
                    $('#tryAgain').show();
                    hideOverlay();
                    window.ObjectModels.OrderModel.unset('processing');
                    window.ObjectModels.OrderModel.get('summaryInfo').creditCardInfo.pop();
                };
            });
        },

        confirmSale: function (callback) {
            CountdownHelper.stop();
            var that = this;
            var model = new ConfirmSaleModel();
            var myOrderModel = window.ObjectModels.OrderModel;
            var myPaymentData = myOrderModel.get('paymentData');

            if (myOrderModel.get('remainingAmount')) {
                myOrderModel.set('totalPrice', myOrderModel.get('remainingAmount'));
            }
            window.confirmSaleModel = model;
            model.theaterId = myOrderModel.get('theater').get('id');
            model.saleId = myOrderModel.get('saleId');

            model.set({
                authorizePayment: myPaymentData.authorizePayment,
                authorizationCode: myPaymentData.authorizationCode,
                sendSmsReceipt: myPaymentData.sendSmsReceipt,
                sendEmailReceipt: myPaymentData.sendEmailReceipt,
                patronInfo: myPaymentData.patronInfo,
                paymentCards: myPaymentData.paymentCards,
                loyaltyCardNumbers: myPaymentData.loyaltyCardNumbers,
                allowPartialPayment: true
            });

            Backbone.sync('update', model, {
                error: function () {
                    CountdownHelper.start();
                    new ErrorHelper().showAlertByErrorCode();

                    callback(false);
                },
                success: function (response) {
                    if (response.result_code == 200) {
                        var orderModel = window.ObjectModels.OrderModel;
                        clearInterval(orderModel.get('interval'));
                        orderModel.set('interval', null);

                        var tickets = [];

                        _.each(response.result.tickets, function (item) {
                            response.result.receipt.items = _.reject(response.result.receipt.items, function (receiptItem) { return receiptItem.name == item.name; });
                            tickets.push({ name: item.name, serialNumber: item.serialNumber, seatName: item.seatName, price: item.price, displayPrice: item.displayPrice, friendId: '', isGifted: false });
                        });

                        for (var i = 0; i < orderModel.get('concessions').models.length; i++) {
                            var conc = orderModel.get('concessions').models[i];

                            var concItems = _.filter(response.result.receipt.items, function (c) {
                                return c.name == conc.get('name');
                            });

                            if (concItems.length) {
                                //Remove response concession items to get other items
                                _.each(response.result.receipt.items, function (it) {
                                    var removeIndex = $.inArray(it, response.result.receipt.items);
                                    response.result.receipt.items.splice(removeIndex, 1);
                                });
                            }
                        }

                        var otherItems = _.sortBy(response.result.receipt.items, function (it) {
                            return it.sortOrder;
                        });

                        orderModel.set('totalPrice', response.result.receipt.total);
                        orderModel.set('otherItems', otherItems);
                        orderModel.set('confirmSaleReceipt', response.result.receipt);
                        orderModel.set('confirmSaleResult', tickets);
                        orderModel.set('confirmationNumber', response.result.receipt.confirmationNumber);
                        orderModel.set('authorizationCode', response.result.receipt.authorizationCode);
                        orderModel.set('ticketPickupMessage', response.result.receipt.ticketPickupMessage);
                        orderModel.set('concPickupMessage', response.result.receipt.concPickupMessage);
                        orderModel.set('finished', true);

                        that.saveLastPayedAmount(orderModel.get('remainingAmount'));

                        if (callback)
                            callback(true);
                    }
                    else {
                        if (response.result.error_sub_code == 99) {
                            var paymentCard = myPaymentData.paymentCards[0];
                            that.saveLastPayedAmount(response.result.message);
                            showAlert(that.handlePartialPaymentMessage(paymentCard, parseFloat(response.result.message || 0)), {
                                dialogType: true,
                                postBack: function (result) {
                                    if (result) {
                                        that.loadPayment();
                                    } else {
                                        window.ObjectModels.OrderModel.cancelSale(function () {
                                            window.ObjectModels.OrderModel = null;
                                            Backbone.history.navigate('home', true);
                                        });
                                    }
                                }
                            });
                        } else {
                            CountdownHelper.start();
                            new ErrorHelper().showAlertByErrorCode(response.result.error_sub_code);
                            if (callback)
                                callback(false);
                        }
                    }
                },
                complete: function () {
                    hidePageLoadingMessage();
                }
            });
        },
        saveLastPayedAmount: function (payedAmount) {
            var creditCardInfo = window.ObjectModels.OrderModel.get('summaryInfo').creditCardInfo;
            var lastCard = creditCardInfo[creditCardInfo.length - 1];
            lastCard.payedAmount = parseFloat(payedAmount);
        },
        handlePartialPaymentMessage: function (paymentCard, payedAmount) {
            var that = this;
            var theater = window.ObjectModels.OrderModel.get('theater');
            var remainingAmount = that.setPartialAmount(paymentCard, payedAmount);
            var insufficientFundsMessage = $.sprintf(that.localize.insufficientFundsError, Globalize.format(remainingAmount, "c", theater.get('culture')));

            return insufficientFundsMessage;

        },
        setPartialAmount: function (paymentCard, payedAmount) {
            var that = this;
            payedAmount = parseFloat(payedAmount || 0);
            if (payedAmount <= 0) {
                return [];
            }
            var existing = _.find(that.partialAmounts, function (p) { return p.number == paymentCard.number; });
            if (existing) {
                existing.amount = value + parseFloat(existing.amount);
            } else {
                that.partialAmounts.push({ number: paymentCard.cardNumber, amount: payedAmount });
            }

            var rest = window.ObjectModels.OrderModel.get('totalPrice');
            _.each(that.partialAmounts, function (item) {
                rest = rest - item.amount;
            });

            window.ObjectModels.OrderModel.set('remainingAmount', rest.toFixed(2));

            return rest;
        },
        endProcessingOrder: function () {
            this.completeOrder();
        },

        completeOrder: function () {
            Backbone.history.navigate('orderComplete', true);
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
