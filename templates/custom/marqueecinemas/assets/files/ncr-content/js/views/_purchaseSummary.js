define(['text!templates/_purchaseSummary.html',
        'collections/concessionCollection',
        'helpers/OrderHelper',
        'jqueryValidate'
], function (template, concessionCollection) {

    var view = Backbone.View.extend({

        template: _.template(template),

        initialize: function () {
            this.localize = window.ObjectCollections.Localization.result;
            _.bindAll(this);
        },

        events: {
            'click #btnContinue': 'btnContinue',
            'click #make-order': 'makeOrder',
            'click #continueAction': 'concessionsContinue',
            'click #btnTicketContinue': 'ticketsContinue',
            'click .concession-remove-item ': 'removeConcessionItem'
        },

        btnContinue: function () {
            var that = this;
            $(this.container).find('#btnContinue').attr('disabled', 'disabled');

            this.vent.trigger('submitPayment', function () {
                $(that.container).find('#btnContinue').removeAttr('disabled');
            });
        },

        makeOrder: function () {
            showPageLoadingMessage();
            showOverlay();
            this.vent.trigger('continueToProcessing');
        },
        handleSubscriptionTickets: function (callback) {
            var that = this;
            var orderModel = window.ObjectModels.OrderModel;
            var subscriptionTickets = _.filter(orderModel.get('tickets').models, function (ticket) {
                return ticket.get('ticketValidationRuleId') != 99 && ticket.get('quantity') > 0 && (ticket.get('discountFlag') || ticket.get('validate'));
            });

            if (subscriptionTickets.length == 0) {
                callback();
                return;
            }
            require(['views/InfoPopup'], function (infoPopupView) {
                var form = $('<form id="frmSubscription" class="validate">');
                form.append('<span class="bodyText">' + that.localize.enterSubscriptionCards + '</span><br/><br/>');

                _.each(subscriptionTickets, function (ticket) {
                    //When going back to select tickets screen, pre-fill the popup with subscription card numbers
                    var subscriptionCards = ticket.get('subscriptionCardNumbers') || [];

                    for (var i = 0; i < ticket.get('quantity') ; i++) {
                        var value = subscriptionCards[i] ? subscriptionCards[i].number : '';

                        var input = $('<input type="text" value="' + value + '" class="required input-dialog subscriptioncard cardNumber">');
                        input.attr({
                            'data-ticketid': ticket.get('id'),
                            'placeholder': ticket.get('name'),
                            'name': 'subscriptioncard' + i
                        });

                        form.append(input);

                        //Add error messages returned from the lock ticket response below the appropriate input field
                        _.each(orderModel.get('invalidSubscriptions'), function (invalidSubscription) {
                            if (invalidSubscription.cardNumber == value) {
                                input.addClass('error');

                                var error = $('<label for="subscriptioncard' + i + '"  generated="false" class="error">' + invalidSubscription.message + '</label>');
                                form.append(error);
                            }
                        });
                    }

                });
                var cache = new CachingProvider();
                var emailValue = cache.read("emailAddress") || "";

                var validateInput = $('<br/><span class="bodyText">' + that.localize.email + '</span><br/><br/>' +
                                      '<input type="email" value="' + emailValue + '" class="email keyValue" required  placeholder="' + that.localize.email + '"/>');
                form.append(validateInput);

                //Remove invalid subscription cards return from the lock ticket response
                orderModel.unset('invalidSubscriptions');

                var saveSubscriptionCards = function () {
                    _.each(subscriptionTickets, function (ticket) {
                        ticket.unset('subscriptionCardNumbers');
                    });

                    var frm = $('#frmSubscription');
                    if (frm.valid()) {
                        var cards = frm.find('.cardNumber');

                        _.each(cards, function (card) {
                            var id = $(card).attr('data-ticketid');
                            var cardNumber = $(card).val();
                            var keyValue = frm.find('.keyValue').val();

                            orderModel.get('tickets').get(id).addSubscriptionCard(cardNumber, keyValue);
                        });

                        $('#info-modal').addClass('hidden').hide();
                        if (callback) {
                            callback();
                        }
                    }
                };
                var infoPopup = new infoPopupView({
                    container: $('#infoPopup'),
                    title: that.localize.subscriptionCardTitle,
                    content: form[0].outerHTML,
                    confirmButton: {
                        text: that.localize.ok,
                        callback: saveSubscriptionCards,
                        preventDismiss: true
                    },
                    cancelButton: {
                        text: that.localize.cancel,
                        callback: function () {
                            $('#btnTicketContinue').removeAttr('disabled', 'disabled');
                            $('#info-modal').addClass('hidden');
                        }
                    }
                });
                infoPopup.render();
                $('#info-modal').css({ 'width': '430px', 'margin-left': '-210px' });

                $('#frmSubscription input').on('keypress', function (e) {
                    if (e.keyCode == 13) {
                        saveSubscriptionCards();
                        return false;
                    }
                });

                $.validator.addMethod('subscriptioncard', function (value, element) {
                    var regExp = new RegExp('^[0-9]+$');
                    return regExp.test(value);
                }, that.localize.errorEnterValidSubscription);

                $('#frmSubscription').validate({
                    onkeyup: false,
                    focusCleanup: true
                });
            });
        },
        ticketsContinue: function () {
            var that = this;

            $(this.container).find('#btnTicketContinue').attr('disabled', 'disabled');

            var orderHelper = new OrderHelper();
            var orderModel = window.ObjectModels.OrderModel;

            var selectedGroupTickets = _.filter(orderModel.get('tickets').models, function (model) {
                return model.get('quantity') > 0 && model.get('volume') > 1;
            });

            var getTicketQuantity = function (tickets) {
                var quantity = 0;
                _.each(tickets, function (t) {
                    quantity += t.get('quantity');
                });
                return quantity;

            }
            var selectedGroupTicketsQuantity = getTicketQuantity(selectedGroupTickets);

            var lockTicketsCallback = function () {
                orderHelper.lockTickets(function (result) {
                    if (result) {

                        if (selectedGroupTickets.length != orderModel.get('lockedGroupTickets').length || selectedGroupTicketsQuantity != getTicketQuantity(orderModel.get('lockedGroupTickets'))) {
                            window.showAlert(that.localize.groupedTicketsNotification, {
                                postBack: function () {
                                    that.vent.trigger('showNextPage');
                                }
                            });
                        } else {
                            that.vent.trigger('showNextPage');
                        }
                    } else if (window.ObjectModels.OrderModel.get('invalidSubscriptions')) {
                        that.ticketsContinue();
                    } else {
                        $(that.container).find('#btnTicketContinue').removeAttr('disabled');
                    }
                });
            };
            that.handleSubscriptionTickets(lockTicketsCallback);
        },
        concessionsContinue: function () {
            showPageLoadingMessage();
            var that = this;
            $(this.container).find('#continueAction').attr('disabled', 'disabled');
            var orderModel = window.ObjectModels.OrderModel;

            showOverlay();
            orderModel.set('processing', true);

            var concessions = orderModel.get('concessions');
            var clonedCollection = new concessionCollection();
            concessions.each(function (model) {
                clonedCollection.add(new Backbone.Model(JSON.parse(JSON.stringify(model))));
            });
            window.ObjectModels.TempOrder.concessions = clonedCollection;

            var callback = function (success, errorCode) {
                var continueFlow = function () {
                    if (!success) {
                        window.ObjectModels.TempOrder.concessions = null;
                    }

                    window.ObjectModels.TempOrder.concessionsChanged = false;
                    orderModel.unset('processing');

                    that.vent.trigger('concessionsContinue', function () {
                        $(that.container).find('#continueAction').removeAttr('disabled');
                        hidePageLoadingMessage();
                    });
                };

                if (errorCode) {
                    new ErrorHelper().showAlertByErrorCode(errorCode, function () { continueFlow(); });
                } else {
                    continueFlow();
                }
            };
            concessions.lockConcessions(callback, window.ObjectModels.TempOrder.concessionsChanged);
        },

        removeConcessionItem: function (ev) {
            var that = this;
            ev.preventDefault();
            var itemToRemove = $(ev.currentTarget);
            var itemId = itemToRemove.data("concession-id");
            this.vent.trigger('removeConcessionItem', itemId, function () {
                that.render(that.obj);
            });
        },

        render: function (obj) {
            var receipt = [];
            this.obj = obj;
            try {
                this.undelegateEvents();
                this.step = obj.step;
                receipt = window.ObjectModels.OrderModel.get('result').receipt;
                if (receipt) {
                    receipt.groupByItems = window.order.getTicketsGroupByType(receipt);
                    var serviceCharge = parseFloat(window.ObjectCollections.TicketCollection.getTicketServiceCharge()) || 0;
                    var totalFee = window.ObjectCollections.SeatCollection.getTotalFeeSelectedSeats();
                    receipt.servisCharge = serviceCharge;
                    receipt.totalFee = totalFee;
                }
            }
            catch (e) {
            }

            var orderHelper = new OrderHelper();
            var concessionSummary = orderHelper.formatConcessionsForSummary();

            var orderTotals = orderHelper.calculateOrderTotals(concessionSummary);

            this.vent = obj.vent;
            this.container = obj.container;
            var culture = window.ObjectModels.OrderModel.get('theater').get('culture');
            this.$el.html(this.template({ step: obj.step, receipt: receipt, localize: window.ObjectCollections.Localization.result, concessionSummary: concessionSummary, orderTotals: orderTotals, culture: culture }));
            $(obj.container).empty().append(this.$el);

            this.delegateEvents();
        },

        destroyView: function () {
            this.undelegateEvents();
            $(this.el).removeData().unbind();
            this.unbind();
            this.remove();
            if (this.vent)
                this.vent.off();

            Backbone.View.prototype.remove.call(this);
        }
    });

    return view;
});