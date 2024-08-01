define(['models/ticketModel', 'collections/performanceSeatInfoCollection', 'sharedhelpers/configurationProvider', 'collections/concessionCollection', 'sharedhelpers/errorHelper'],
    function (ticketModel, performanceSeatInfoCollection, configurationProvider) {
        window.TicketCollection = BaseCollection.extend({
            model: ticketModel,
            maxTickets: 0,
            maxOnHoldTickets: 0,
            countInviteFriends: 0,
            performanceId: "",
            theaterId: "",
            initialize: function (arg) {
                if (arg) {
                    this.maxTickets = arg.maxTickets || 0;
                    this.maxOnHoldTickets = arg.maxOnHoldTickets || 0;
                    this.performanceId = arg.performanceId;
                    this.theaterId = arg.theaterId;
                };

                this.localize = window.ObjectCollections.Localization.result;
            },

            url: function () {
                return this.RESTUri + "theaters/" + this.theaterId + "/performances/" + this.performanceId + "/tickettypes";
            },

            parse: function (resp) {
                if (resp.result) {
                    this.maxTickets = resp.result.maxTickets;
                    this.maxOnHoldTickets = resp.result.maxHoldTickets != undefined ? resp.result.maxHoldTickets : resp.result.maxOnHoldTickets;

                    return resp.result.ticketTypes;
                } else {
                    this.maxTickets = resp.maxTickets;
                    this.maxOnHoldTickets = resp.maxHoldTickets != undefined ? resp.maxHoldTickets : resp.maxOnHoldTickets;

                    return resp.ticketTypes;
                }
            },

            getTicketTotal: function () {
                var ticketSubTotal = this.getTicketSubTotal();
                var ticketServiceCharge = this.getTicketServiceCharge();
                var ticketTotal = ticketSubTotal + ticketServiceCharge;

                return parseFloat(Math.round(ticketTotal * 100) / 100);
            },

            getTicketTotalDisplay: function (culture) {
                return Globalize.format(this.getTicketTotal(), "c", culture);
            },

            getTicketSubTotal: function () {
                var ticketTotal = 0.00;

                for (var i = 0; i < this.models.length; i++) {
                    var item = this.models[i];
                    var totalPrice = item.getTotalPrice() || 0.00;
                    ticketTotal += totalPrice;
                }
                return parseFloat(Math.round(ticketTotal * 100) / 100);
            },

            getTicketSubTotalDisplay: function (culture) {
                return Globalize.format(this.getTicketSubTotal(), "c", culture);
            },

            getSelectedTicketQuantity: function () {
                var count = 0;

                for (var i = 0; i < this.models.length; i++) {
                    var ticket = this.models[i];
                    if (!ticket.get('isOnHoldTicketType'))
                        count += parseInt(ticket.get('quantity')) || 0;
                }

                return count;
            },

            getOnHoldTickets: function () {
                var result = new TicketCollection();

                _.each(this.models, function (ticket) {
                    if (ticket.get('isOnHoldTicketType')) {
                        result.add(ticket);
                    }
                });

                return result;
            },

            getReservedTicketQuantity: function () {
                var count = 0;

                for (var i = 0; i < this.models.length; i++) {
                    var ticket = this.models[i];
                    if (!ticket.get('isOnHoldTicketType') && ticket.get('isReservedSeating'))
                        count += parseInt(ticket.get('quantity')) || 0;
                }

                return count;
            },

            getReservedTickets: function () {
                var result = _.filter(this.models, function (model) {
                    return !model.get('isOnHoldTicketType') && model.get('quantity') > 0 && model.get('isReservedSeating');
                });

                return result;
            },

            getOnHoldTicketQuantity: function () {
                var count = 0;
                for (var i = 0; i < this.models.length; i++) {
                    var item = this.models[i];
                    if (item.get('isOnHoldTicketType'))
                        count += parseInt(item.get('quantity')) || 0;
                }
                return count;
            },

            getSelectedTickets: function () {
                var result = _.filter(this.models, function (model) {
                    return model.get('quantity') > 0;
                });

                return result;
            },

            getNonHoldTickets: function () {
                var result = _.filter(this.models, function (model) {
                    return !model.get('isOnHoldTicketType') && model.get('quantity') > 0;
                });

                return result;
            },

            getAllTicketQuantity: function () {
                return this.getOnHoldTicketQuantity() + this.getReservedTicketQuantity();
            },

            getTicketsForLock: function () {
                var result = _.filter(this.models, function (model) {
                    return model.get('quantity') > 0;
                });

                return result;
            },

            getSeatStatuses: function (seatInfo) {
                var seats = new performanceSeatInfoCollection();

                for (var i = 0; i < seatInfo.statuses.length; i++) {
                    var item = seatInfo.statuses[i];
                    var stat = new PerformanceSeatInfoModel({ row: item.row, column: item.column, status: item.status });
                    seats.add(stat);
                }

                seats.overrides = seatInfo.overrides;
                return seats;
            },

            filterReceipt: function (receiptItems, orderTickets) {
                var lockedTickets = new TicketCollection();
                orderTickets = orderTickets || this.models;

                _.each(orderTickets, function (t) {
                    var item = _.find(receiptItems, function (it) {
                        var isTicketLocked = it.name.toUpperCase() == t.get('name').toUpperCase();

                        t.set('quantity', isTicketLocked ? it.quantity : 0);
                        t.set('totalPrice', isTicketLocked ? it.total : 0);

                        return isTicketLocked;
                    });

                    if (item) {
                        var removeIndex = $.inArray(item, receiptItems);
                        receiptItems.splice(removeIndex, 1);
                        lockedTickets.models.push(t);
                    }
                });

                return lockedTickets;
            },

            lockSeats: function (saleId, callback, preventHidingLoader) {
                var orderModel = window.ObjectModels.OrderModel;
                var that = this;
                var seatCollection = [];

                window.showPageLoadingMessage();

                var lockTickets = that.getTicketsForLock();
                _.each(lockTickets, function (item) {
                    var ticketType = item.get('name');

                    if (item.get('seats')) {
                        _.each(item.get('seats').models, function (seat) {
                            if (ticketType.toUpperCase() != "HOLD") {
                                seatCollection.push({ "seatType": "purchased", "seatRow": seat.get('row'), "seatColumn": seat.get('column') });
                            }
                            else {
                                seatCollection.push({ "seatType": "hold", "seatRow": seat.get('row'), "seatColumn": seat.get('column') });
                            }
                        });
                    }
                });

                //We need to set url to seats because of easyXDM
                seatCollection.url = that.RESTUri + "theaters/" + that.theaterId + "/sales/" + saleId + "/" + that.performanceId + "/seats";
                Backbone.sync('update', seatCollection, {
                    url: that.RESTUri + "theaters/" + that.theaterId + "/sales/" + saleId + "/" + that.performanceId + "/seats",
                    error: function (error) {
                        if (error.stausText == 'timeout')
                            new ErrorHelper().showAlertByErrorCode(37);
                        else
                            new ErrorHelper().showAlertByErrorCode();

                        callback(false);
                    },
                    success: function (result) {
                        var response = result.result;

                        if (result.result_code == 200) {
                            that.filterReceipt(response.receipt.items, lockTickets);

                            var concessions = new ConcessionCollection();
                            concessions.filterReceipt(response.receipt.items, orderModel.get('concessions'));

                            var sentSeats = new Array();
                            var changedSeats = false;
                            _.each(orderModel.get('seatStatuses').models, function (item) {
                                if (item.get('status') == 'Locked' || item.get('status') == 'Hold')
                                    sentSeats.push(item);
                            });

                            var otherItems = _.sortBy(response.receipt.items, function (it) {
                                return it.sortOrder;
                            });

                            var seats = that.getSeatStatuses(response.seatInfo);
                            orderModel.set('sentSeats', sentSeats);
                            orderModel.set('seatStatuses', seats);

                            orderModel.set('otherItems', otherItems);
                            orderModel.set('totalPrice', response.receipt.total);
                            orderModel.set('apiTotalPrice', response.receipt.total);

                            orderModel.set('timeout', response.timeoutInMinutes * 60);
                            orderModel.set('encryptionKey', response.encryptionKey);

                            //Reset countdown timer after call to api
                            clearInterval(orderModel.get('interval'));
                            orderModel.set('interval', null);
                            orderModel.set('orderTimeout', null);

                            var responseSeats = new Array();
                            _.each(seats.models, function (item) {
                                if (item.get('status') == 'Locked' || item.get('status') == 'Hold')
                                    responseSeats.push(item);
                            });

                            _.each(sentSeats, function (sentSeat) {
                                var seatMatch = $.grep(responseSeats, function (item) { return (item.get('row') === sentSeat.get('row') && item.get('column') === sentSeat.get('column')); });

                                if (seatMatch.length > 0) {
                                    sentSeat.set('status', seatMatch[0].get('status'));
                                }
                                if (seatMatch.length != 1)
                                    changedSeats = true;
                            });

                            if (sentSeats.length != responseSeats.length) {
                                window.showAlert(that.localize.alertLockSeatsFirstScenario);
                                callback(false);
                            } else if (changedSeats) {
                                window.showAlert(that.localize.alertLockSeatsSecondScenario);
                                callback(false);
                            } else {
                                callback(true);
                            }
                        } else {
                            new ErrorHelper().showAlertByErrorCode(response.error_sub_code);
                        }
                    },
                    complete: function () {
                        if (!preventHidingLoader) {
                            window.hidePageLoadingMessage();
                        }
                    }
                });
            },
            giftTicket: function (giftTicketObj, ticketSerial, theaterId, callback) {
                var giftTicketModel = new BaseModel(giftTicketObj);
                giftTicketModel.url = this.RESTUri + "theaters/" + theaterId + '/gift/' + ticketSerial;

                Backbone.sync('update', giftTicketModel, {
                    error: function () {
                        callback(false);
                    },
                    success: function (result) {
                        var response = result.result;

                        if (result.result_code == 200) {
                            callback(response.confirmationNumber);
                        } else {
                            callback(false);
                            new ErrorHelper().showAlertByErrorCode(response.error_sub_code);
                        }
                    },
                    complete: function () {
                        window.hidePageLoadingMessage();
                    }
                });
            },
            lockTickets: function (callback, preventHidingLoader) {
                var that = this;
                var orderModel = window.ObjectModels.OrderModel;

                require(['models/purchaseTicketModel', 'sharedhelpers/storageProvider'], function (purchaseTicketModel) {
                    window.showPageLoadingMessage();
                    var model = new purchaseTicketModel();
                    var storage = new StorageProvider();
                    model.theaterId = orderModel.get('theater').get('id');
                    model.performanceNumber = orderModel.get('performance') ? orderModel.get('performance').get('number') : '';
                    model.saleId = orderModel.get('saleId');

                    var useLoyalty = configurationProvider.useLoyalty(orderModel.get('theater'));
                    var tickets = new Array();

                    storage.read("LoyaltyCard", function (value) {
                        if (useLoyalty) {
                            var loyaltyCardNumber = orderModel.get('loyaltyCardNumber');

                            if (value !== null || loyaltyCardNumber) {
                                var loyaltyCards = new Array();
                                loyaltyCards.push(value ? value.number : loyaltyCardNumber);

                                model.set('loyaltyCardNumbers', loyaltyCards);
                            }
                        }

                        var selectedTickets = that.getTicketsForLock();
                        if (selectedTickets) {
                            for (var i = 0; i < selectedTickets.length; i++) {
                                var selectedTicket = selectedTickets[i];
                                var ticket = { ticketTypeId: selectedTicket.get('id'), quantity: selectedTicket.get('quantity') };

                                if (selectedTicket.get('subscriptionCardNumbers')) {
                                    ticket.subscriptionCardNumbers = selectedTicket.get('subscriptionCardNumbers');
                                }

                                tickets.push(ticket);
                            }

                            model.set('tickets', tickets);
                        }

                        if (orderModel.get('onHoldConfirmationNumber'))
                            model.set('onHoldConfirmationNumber', orderModel.get('onHoldConfirmationNumber'));

                        var operation = 'create';
                        if (model.saleId) operation = 'update';

                        Backbone.sync(operation, model, {
                            error: function () {
                                new ErrorHelper().showAlertByErrorCode();
                                window.hidePageLoadingMessage();
                                if (callback)
                                    callback(false);
                            },
                            success: function (result) {
                                var response = result.result;

                                if (result.result_code == 200) {
                                    var lockedTickets = that.filterReceipt(response.receipt.items);
                                    lockedTickets.maxOnHoldTickets = orderModel.get('tickets').maxOnHoldTickets;
                                    lockedTickets.maxTickets = orderModel.get('tickets').maxTickets;
                                    lockedTickets.performanceId = model.performanceNumber;
                                    lockedTickets.theaterId = model.theaterId;

                                    var otherItems = _.sortBy(response.receipt.items, function (it) {
                                        return it.sortOrder;
                                    });

                                    if (response.seatInfo) {
                                        var seats = that.getSeatStatuses(response.seatInfo);
                                        orderModel.set('seatStatuses', seats); //Best seat selection
                                    }

                                    var lockedGroupTickets = _.filter(lockedTickets.models, function (lockedTicket) {
                                        return lockedTicket.get('volume') > 1;
                                    });

                                    orderModel.set('lockedGroupTickets', lockedGroupTickets);
                                    orderModel.set('tickets', lockedTickets);
                                    orderModel.set('otherItems', otherItems);

                                    orderModel.set('saleId', response.saleId);
                                    orderModel.set('timeout', response.timeoutInMinutes * 60);
                                    orderModel.set('encryptionKey', response.encryptionKey);

                                    orderModel.set('tax', response.receipt.tax);
                                    orderModel.set('subTotal', response.receipt.subTotal);
                                    orderModel.set('totalPrice', response.receipt.total);
                                    orderModel.set('apiTotalPrice', response.receipt.total);

                                    clearInterval(orderModel.get('interval'));
                                    orderModel.set('interval', null);
                                    orderModel.set('orderTimeout', null);

                                    if (callback) {
                                        callback(true);
                                    }
                                } else {
                                    if (callback)
                                        callback(false, response);
                                }
                            },
                            complete: function () {
                                if ((!orderModel.get('performance').get('isReservedSeating') || window.performanceLayout) && !preventHidingLoader) {
                                    window.hidePageLoadingMessage();
                                }
                            }
                        });
                    });
                });
            },

            getTicketServiceCharge: function () {
                var result = 0;
                var serviceChargeType = window.ChainInfo.get('serviceChargeType');
                var serviceChargeAmount = parseFloat(window.ChainInfo.get('serviceChargeAmount')) || 0;
                var maxServiceChargeAmount = parseFloat(window.ChainInfo.get('maxServiceChargeAmount')) || 0;
                if (serviceChargeType == 'ticket') {
                    result = parseFloat(serviceChargeAmount * this.getSelectedTicketQuantity()) || 0;
                } else if (serviceChargeType == 'transaction') {
                    result = this.getSelectedTicketQuantity() ? (parseFloat(serviceChargeAmount) || 0) : 0;
                }

                if (result > maxServiceChargeAmount) {
                    return maxServiceChargeAmount;
                }
                else
                    return result;
            },

            getTicketServiceChargeDisplay: function (culture) {
                var result = this.getTicketServiceCharge();
                return Globalize.format(result, "c", culture);
            },

            getTicketServiceChargeMessage: function (culture) {
                var that = this;

                var serviceChargeAmount = parseFloat(window.ChainInfo.serviceChargeAmount()) || 0;
                var serviceChargeType = window.ChainInfo.serviceChargeType();
                var serviseChargeAmountFormat = Globalize.format(serviceChargeAmount, "c", culture);

                var msg = $.sprintf(that.localize.thereWillBeServiceCharge,
                    serviseChargeAmountFormat,
                    serviceChargeType);

                return msg;
            },
            getTickets: function (performanceId, theaterId, callback) {
                this.performanceId = performanceId;
                this.theaterId = theaterId;

                this.fetch({
                    success: function (result) {
                        callback(result);
                    },
                    error: function () {
                        callback();
                        new ErrorHelper().showAlertByErrorCode();
                    }
                });
            },
            resetTicketsQuantity: function () {
                _.each(this.models, function (ticket) {
                    ticket.set('quantity', 0);
                });
            }
        });

        return window.TicketCollection;
    });