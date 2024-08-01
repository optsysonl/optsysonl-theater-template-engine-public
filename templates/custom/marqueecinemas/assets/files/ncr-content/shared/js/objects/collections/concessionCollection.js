define(['models/concessionModel', 'collections/productCollection', 'sharedhelpers/errorHelper'],
    function (concessionModel, productCollection) {
        window.ConcessionCollection = BaseCollection.extend({
            model: concessionModel,
            url: function () {
                return this.RESTUri + "theaters/{theaterId}/concessions".replace("{theaterId}", this.id);
            },

            parse: function (resp) {
                this.result_code = resp.result_code;
                switch (resp.result_code) {
                    case 200:
                        this.products = new productCollection(resp.result.products);
                        return resp.result.menuItems;
                    default:
                        return resp;
                }
            },

            initialize: function (theaterId) {
                this.id = theaterId;
            },

            getConcessions: function (theaterId, callback) {
                var that = this;
                that.id = theaterId;

                that.fetch({
                    success: function (response) {
                        if (response.result_code == 200) {
                            callback(response);
                        }
                        else {
                            new ErrorHelper().showAlertByErrorCode(response && response.result ? response.result.error_sub_code : "");
                            callback();
                        }
                    },
                    error: function () {
                        new ErrorHelper().showAlertByErrorCode();
                        callback();
                    }
                });
            },

            getGroupedConcessions: function () {
                if (this.models.length == 0) return null;

                var result = _.groupBy(this.models, function (model) {
                    if (!model.get('modifiers') || (model.get('modifiers') && model.get('modifiers').length == 0)) return model.get('productId');
                    return model.cid;
                });

                window.ObjectModels.OrderModel.set('concessionsLocked', false);

                return result;
            },

            filterReceipt: function (receiptItems, orderConcessions) {
                var lockedConcessions = new ConcessionCollection();

                for (var i = 0; i < orderConcessions.models.length; i++) {
                    var concessionItem = orderConcessions.models[i];

                    var items = _.filter(receiptItems, function (c) {
                        return c.name == concessionItem.get('name');
                    });

                    if (items.length) {
                        if (window.ObjectModels.OrderModel.get('concessionsLocked')) {
                            concessionItem.set('originalPrice', concessionItem.get('originalPrice') || concessionItem.get('price'));
                            concessionItem.set('price', items[0].total);
                            concessionItem.set('quantity', items[0].quantity);
                        }

                        //Remove concession price from total price
                        if (window.isMobileDevice()) {
                            window.ObjectModels.OrderModel.set('totalPrice', window.ObjectModels.OrderModel.get('totalPrice') - items[0].total);
                        }

                        //Remove response concession items to get other items
                        var removeIndex = receiptItems.indexOf(items[0]);
                        receiptItems.splice(removeIndex, 1);

                        lockedConcessions.models.push(concessionItem);
                    } else {
                        //Grouping modifiers for multiple grouped items
                        var index = -1;
                        var existingItem = _.filter(lockedConcessions.models, function (c, ci) {
                            if (c.get('name') == concessionItem.get('name')) {
                                index = ci;
                                return true;
                            }
                            return false;
                        })[0];

                        if (index > -1) {
                            var ms = concessionItem.get('modifiers');
                            var id = existingItem.get('concessionItemId') + ', ' + concessionItem.get('concessionItemId');
                            existingItem.set('concessionItemId', id);

                            if (ms && ms.length > 0) {
                                existingItem.set('modifiers', existingItem.get('modifiers').concat(ms));

                                lockedConcessions.models[index] = existingItem;
                            }
                        }
                    }
                }

                return lockedConcessions;
            },
            lockConcessions: function (callback, concessionsChanged) {
                var that = this;
                var orderModel = window.ObjectModels.OrderModel;
                var selectedConcessions = orderModel.get('concessions');
                var conc = selectedConcessions.models || selectedConcessions;
                if (!concessionsChanged && (!selectedConcessions || conc.length == 0)) {
                    callback(null);
                    return;
                }

                require(['models/purchaseConcessionModel', 'sharedhelpers/configurationProvider', 'collections/ticketCollection', 'sharedhelpers/storageProvider'], function (purchaseConcessionModel, configurationProvider) {
                    var model = new purchaseConcessionModel();
                    var storage = new StorageProvider();
                    var useLoyalty = configurationProvider.useLoyalty(orderModel.get('theater'));
                    model.theaterId = orderModel.get('theater').get('id');
                    model.saleId = orderModel.get('saleId');

                    storage.read("LoyaltyCard", function (value) {
                        if (useLoyalty) {
                            var loyaltyCardNumber = orderModel.get('loyaltyCardNumber');

                            if (value !== null || loyaltyCardNumber) {
                                var loyaltyCards = new Array();
                                loyaltyCards.push(value ? value.number : loyaltyCardNumber);

                                model.set('loyaltyCardNumbers', loyaltyCards);
                            }
                        }

                        var concessions = new Array();

                        var setModifiers = function (collection) {
                            var mod = [];
                            if (collection && collection.length > 0) {
                                for (var k = 0; k < collection.length; k++) {
                                    mod.push({ productId: collection[k].productId, quantity: collection[k].quantity });
                                }
                            }
                            return mod;
                        };

                        for (var i = 0; i < selectedConcessions.models.length; i++) {
                            var concessionItem = selectedConcessions.models[i];
                            var item = { productId: concessionItem.get('productId'), quantity: concessionItem.get('quantity') };

                            var modifiers = setModifiers(concessionItem.get('modifiers'));
                            if (modifiers.length > 0)
                                item.modifiers = modifiers;

                            var comboItems = new Array();
                            var combos = concessionItem.get('comboItems');
                            if (combos && combos.length > 0) {
                                for (var c = 0; c < combos.length; c++) {
                                    comboItems.push({ productId: combos[c].productId, modifiers: setModifiers(combos[c].modifiers) });
                                }
                            }

                            if (comboItems.length > 0)
                                item.comboItems = comboItems;

                            concessions.push(item);
                        }
                        model.set('concessions', concessions);

                        var operation = 'create';
                        if (model.saleId) operation = 'update';

                        Backbone.sync(operation, model, {
                            error: function () {
                                new ErrorHelper().showAlertByErrorCode();
                                callback(false);
                            },
                            success: function (result) {
                                var response = result.result;

                                if (result.result_code == 200) {
                                    var selectedTickets = orderModel.get('tickets') ? orderModel.get('tickets').getTicketsForLock() : [];

                                    var tickets = new TicketCollection();
                                    tickets.filterReceipt(response.receipt.items, selectedTickets);

                                    orderModel.set('concessionsLocked', true);
                                    orderModel.set('totalPrice', response.receipt.total);

                                    var lockedConcessions = that.filterReceipt(response.receipt.items, selectedConcessions);

                                    var otherItems = _.sortBy(response.receipt.items, function (it) {
                                        return it.sortOrder;
                                    });

                                    orderModel.set('apiLockedConcessions', lockedConcessions);
                                    orderModel.set('concessions', lockedConcessions);
                                    orderModel.set('saleId', response.saleId);
                                    orderModel.set('encryptionKey', response.encryptionKey);
                                    orderModel.set('timeout', response.timeoutInMinutes * 60);

                                    orderModel.set('otherItems', otherItems);
                                    orderModel.set('tax', response.receipt.tax);
                                    orderModel.set('subTotal', response.receipt.subTotal);
                                    orderModel.set('apiTotalPrice', response.receipt.total);

                                    //Reset countdown timer after call to api
                                    clearInterval(orderModel.get('interval'));
                                    orderModel.set('interval', null);
                                    orderModel.set('orderTimeout', null);

                                    callback(true);
                                }
                                else {
                                    if (isMobileDevice() && response.error_sub_code == 16) {
                                        if (callback) {
                                            new ErrorHelper().showAlertByErrorCode(response.error_sub_code, function () {
                                                window.goBack(window.tempHistoryCount);
                                            });
                                        } else {
                                            window.goBack(window.tempHistoryCount);
                                        }
                                        return;
                                    }

                                    callback(false, response.error_sub_code);
                                }
                            },
                            complete: function () {
                                hidePageLoadingMessage();
                            }
                        });
                    });
                });
            }
        });

        // Returns the Model class
        return window.ConcessionCollection;
    });