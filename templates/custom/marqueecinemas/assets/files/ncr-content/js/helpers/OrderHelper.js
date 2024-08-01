window.OrderHelper = (function () {
    function _formatConcessionsForSummary() {
        var concessions = window.ObjectModels.OrderModel.get('concessions');
        var formattedConcessions = [];
        if (concessions) {
            var groupedConcessions = _.groupBy(concessions.models, function (concession) {
                if (!concession.get('comboItems') && !concession.get('modifiers'))
                    return concession.get('productId');
                return concession.cid;
            });

            _.each(groupedConcessions, function (concessionGroup) {
                var item = concessionGroup[0];
                var price = item.get('price');
                var quantity = item.get('quantity');

                var formattedConcession = {
                    quantity: concessionGroup.length > 1 ? concessionGroup.length : quantity,
                    totalPrice: price * concessionGroup.length,
                    name: item.get('name'),
                    id: item.get('productId'),
                    concessionItemId: item.get('concessionItemId')
                };

                var modifierNames = "";
                var totalPrice = 0;
                _.each(concessionGroup, function (concession) {
                    if (concession.get('modifiers')) {
                        var groupedModifiers = _.groupBy(concession.get('modifiers'), function (m) {
                            return m.productId;
                        });
                        _.each(groupedModifiers, function (modifier) {
                            if (modifier[0].name != undefined && modifier[0].name != formattedConcession.name) {
                                modifierNames += ', ' + modifier[0].name;
                                totalPrice += modifier[0].price;
                            }
                        });
                    }
                    else if (concession.get('comboItems')) {
                        _.each(concession.get('comboItems'), function (comboItem) {
                            if (comboItem.modifiers) {
                                _.each(comboItem.modifiers, function (modifier) {
                                    if (modifier.name != undefined && modifier.name != formattedConcession.name) {
                                        totalPrice += modifier.price;
                                    }
                                });
                            }
                        });

                    }
                });

                formattedConcession.modifiers = modifierNames;
                if (window.ObjectModels.OrderModel.get('concessionsLocked') != true)
                    formattedConcession.totalPrice += totalPrice;

                formattedConcessions.push(formattedConcession);

            });
        }



        return formattedConcessions;


    }

    function _calculateOrderTotals(concessions) {
        var orderModel = window.ObjectModels.OrderModel;
        var tickets = window.ObjectModels.OrderModel.get('tickets');
        window.ObjectModels.TempOrder.concessionTotal = 0;

        var total;
        var subTotal;

        if (orderModel.get('concessionsLocked') === true) {
            total = window.ObjectModels.TempOrder.total;
            subTotal = window.ObjectModels.TempOrder.subTotal;
        } else {
            total = orderModel.get('totalPrice') || tickets.getTicketTotal() || 0;
            subTotal = orderModel.get('subTotal') || tickets.getTicketSubTotal() || 0;
        }


        var tax = orderModel.get('tax') || 0;

        if (concessions && concessions.length > 0) {
            _.each(concessions, function (concession) {
                total += concession.totalPrice;
                subTotal += concession.totalPrice;

                window.ObjectModels.TempOrder.concessionTotal += concession.totalPrice;
            });
        }

        return { total: total, subTotal: subTotal, tax: tax };
    }

    function _lockTickets(callback) {
        try {
            var myOrderModel = window.ObjectModels.OrderModel,
                myTicketCollection = myOrderModel.get('tickets'),
                cache = new CachingProvider();
            var tempOrderModel = $.extend(true, {}, window.ObjectModels.OrderModel);

            showOverlay();
            window.ObjectModels.OrderModel.set('processing', true);

            myTicketCollection.lockTickets(function (success, errorResponse) {
                var orderModel = window.ObjectModels.OrderModel;
                try {
                    if (success) {
                        cache.store("saleId", orderModel.get('saleId'), window.AppProperties.CacheTimeout);
                        if (tempOrderModel) {
                            var savedOrderModel = tempOrderModel;

                            for (var i = 0; i < savedOrderModel.get('tickets').models.length; i++) {
                                var item = savedOrderModel.get('tickets').models[i];

                                var t = orderModel.get('tickets').where({ 'name': item.get('name') })[0];
                                if (!t) orderModel.get('tickets').add(item);
                            }

                            orderModel.set('loyaltyCardNumber', savedOrderModel.get('loyaltyCardNumber'));
                        }

                        if (callback) {
                            callback(true);
                        }
                    } else if (errorResponse) {
                        var isArray = _.isArray(errorResponse);

                        if (isArray) {
                            var cardNumbers = [];

                            _.each(errorResponse, function (error) {
                                if (error.card_num) {
                                    cardNumbers.push({
                                        cardNumber: error.card_num,
                                        message: error.message
                                    });
                                }
                            });

                            if (cardNumbers.length > 0) {
                                var localize = window.ObjectCollections.Localization.result;
                                orderModel.set('invalidSubscriptions', cardNumbers);

                                window.showAlert(localize.subscriptionCardError, {
                                    postBack: function () {
                                        if (callback)
                                            callback(false);
                                    }
                                });

                            }
                        } else {
                            var errorCode = errorResponse.error_sub_code;

                            if (errorCode == new ErrorHelper().errorCodes.NotAValidTicketType) {
                                new ErrorHelper().showAlertByErrorCode(errorCode, function () {
                                    location.reload(true);
                                });
                                return;
                            }

                            new ErrorHelper().showAlertByErrorCode(errorCode);
                        }
                    } else {
                        callback(false);
                        hidePageLoadingMessage();
                    }
                    orderModel.unset('processing');
                }
                catch (e) {
                    $('#btnTicketContinue').removeAttr('disabled');
                    hidePageLoadingMessage();
                    hideOverlay();
                    orderModel.unset('processing');
                }
            });
        } catch (ex) {
            $('#btnTicketContinue').removeAttr('disabled');
            hidePageLoadingMessage();
        }
    }

    function _getOrderCompleteSummary() {
        var summary = [];
        if (window.ObjectModels.OrderModel.get('confirmSaleReceipt')) {
            var items = window.ObjectModels.OrderModel.get('confirmSaleReceipt').items;
            var qroupedItems = _.groupBy(items, function (item) {
                return item.name;
            });

            _.each(qroupedItems, function (groupedItem) {
                var itemSummary = {
                    quantity: _.reduce(groupedItem, function (memo, num) { return memo.quantity + num.quantity; }, 0),
                    name: groupedItem[0].name,
                    total: _.reduce(groupedItem, function (memo, num) { return memo.total + num.total; }, 0)
                };
                summary.push(itemSummary);
            });
        }
        return summary;
    }

    return {
        formatConcessionsForSummary: _formatConcessionsForSummary,
        calculateOrderTotals: _calculateOrderTotals,
        lockTickets: _lockTickets,
        getOrderCompleteSummary: _getOrderCompleteSummary
    };

});