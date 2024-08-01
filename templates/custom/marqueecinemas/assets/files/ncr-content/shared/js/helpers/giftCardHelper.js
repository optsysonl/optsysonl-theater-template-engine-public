window.giftCardHelper = (function () {
    var that = this;
    that.useQue = !window.appConfig.EnableConcurrentBalanceCalls;

    function _getBalance(cardNumber, handlers) {
        require(['sharedhelpers/configurationProvider', 'models/giftCardModel'], function (configurationProvider) {

            if (!that.theaterId) {
                var th = window.ObjectCollections.TheaterCollection.models && window.ObjectCollections.TheaterCollection.models.length > 0 ? window.ObjectCollections.TheaterCollection.models[0] : new BaseModel();

                if (!th.get('id')) {
                    that.clearTheaterId = true;
                }

                that.theaterId = th.get('id') || configurationProvider.theaterId();
                that.theaterCulture = th.get('culture') || window.AppConfig.AppCulture;
            }

            var model = new GiftCardModel({
                theaterId: that.theaterId,
                cardNumber: cardNumber
            });

            if (that.useQue && that.balanceCall) {
                if (that.balanceCall.cardNumber == cardNumber) {
                    if (handlers.onProgress) {
                        handlers.onProgress();
                    }
                }

                _addBalanceRequestToQueue(cardNumber, handlers);
                return;
            }

            if (handlers.onProgress) {
                handlers.onProgress();
            }

            var onComplete = function () {
                that.balanceCall = null;
                if (handlers.onComplete) {
                    handlers.onComplete();
                }

                if (that.useQue) {
                    _handleBalanceRequests(model);
                }
            };

            that.balanceCall = { cardNumber: cardNumber };
            that.balanceCall.request = model.fetch({
                success: function () {
                    var balance = model.get('balance');
                    if ($.isNumeric(balance)) {
                        handlers.onSuccess(Globalize.format(balance, "c", that.theaterCulture));
                    } else {
                        handlers.onError(model);
                    }
                    onComplete();
                },
                error: function (error, xhr) {
                    if (xhr.statusText != 'abort') {
                        handlers.onError();
                    }
                    onComplete();
                },
                preventLoadingMessage: true
            });
        });
    }

    function _addBalanceRequestToQueue(cardNumber, args) {
        if (!that.balanceRequests) {
            that.balanceRequests = [];
        }

        that.balanceRequests.push(
            {
                cardNumber: cardNumber,
                handlers: args || {}
            });
    }

    function _handleBalanceRequests(card) {
        that.balanceRequests = _.reject(that.balanceRequests, function (request) {
            var rejectRequest = false;
            if (request.cardNumber == card.get('cardNumber')) {
                rejectRequest = true;
                if ($.isNumeric(card.get('balance'))) {
                    request.handlers.onSuccess(Globalize.format(card.get('balance'), "c", that.theaterCulture));
                } else {
                    request.handlers.onError();
                }

                if (request.handlers.onComplete) {
                    request.handlers.onComplete();
                }
            }
            return rejectRequest;
        });

        if (that.balanceRequests.length > 0) {
            var nextRequest = that.balanceRequests.shift();

            _getBalance(nextRequest.cardNumber, nextRequest.handlers);
        }
    }

    function _abortBalanceCall(clearQue) {
        if (that.balanceCall) {
            var activeRequestCardNumber = that.balanceCall.cardNumber;
            that.balanceRequests = _.reject(that.balanceRequests, function (balanceRequest) {
                return clearQue || balanceRequest.cardNumber == activeRequestCardNumber;
            });

            that.balanceCall.request.abort();
        }
    }

    function _invalidateBalance(callback) {
        require(['sharedhelpers/storageProvider'], function () {
            var storage = new StorageProvider();
            storage.read('PaymentMethod', function (value) {
                if (value.length > 0) {
                    var cards = value;
                    _.each(cards, function (card) {
                        if ((card.Type == 'GiftCard' || card.Type == 'VirtualGiftCard') && card.Balance) {
                            card.UpdateBalance = true;
                        }
                    });
                    storage.store('PaymentMethod', cards);

                    if (callback) {
                        callback();
                    }
                }
            });
        });
    }

    function _updateBalance(card) {
        require(['sharedhelpers/storageProvider', 'sharedhelpers/utilities'], function () {
            var storage = new StorageProvider();
            storage.read('PaymentMethod', function (paymentMethods) {
                _.each(paymentMethods, function (paymentMethod) {
                    if (new Utilities().decrypt(paymentMethod.CardNumber) == card.CardNumber && card.Balance) {
                        paymentMethod.Balance = card.Balance;
                        delete paymentMethod.UpdateBalance;
                    }
                });
                storage.store('PaymentMethod', paymentMethods);
            });
        });
    }

    function _showBalanceLoader(cardNumber) {
        var selector = $(this.el).find('.giftCardBalanceLoader[data-card="' + cardNumber + '"]');
        if (selector.length <= 0) {
            selector = $(this.el).find('.giftCardBalanceLoader');
        }
        selector.show();
    }

    function _hideBalanceLoader(cardNumber) {
        var selector = $(this.el).find('.giftCardBalanceLoader[data-card="' + cardNumber + '"]');
        if (selector.length <= 0) {
            selector = $(this.el).find('.giftCardBalanceLoader');
        }
        selector.hide();
    }

    function _setDefaultOptions(theater, useQue) {
        that.theaterId = theater.get('id');
        that.theaterCulture = theater.get('culture');
        that.clearTheaterId = false;

        if (useQue != undefined) {
            that.useQue = useQue;
        }
    }

    function _clearTheaterId() {
        return that.clearTheaterId;
    }

    return {
        getBalance: _getBalance,
        abortBalanceCall: _abortBalanceCall,
        invalidateBalance: _invalidateBalance,
        updateBalance: _updateBalance,
        showBalanceLoader: _showBalanceLoader,
        hideBalanceLoader: _hideBalanceLoader,
        setDefaultOptions: _setDefaultOptions,
        clearTheaterId: _clearTheaterId
    };
})();