define(['text!templates/Payment.html',
        'sharedhelpers/configurationProvider',
        'views/_purchaseSummary',
        'views/securityCodeExplanation',
        'jqueryValidate',
        'jqueryGlobalize',
        'bootstrap',
        'bigInt',
        'barrett',
        'rsa',
        'sharedhelpers/cachingProvider',
        'sharedhelpers/cultureHelper',
        'sharedhelpers/cardValidationHelper',
        'libs/selectboxit/js/jquery.selectboxit',
        'helpers/CountdownHelper'
], function (template, configurationProvider, purchaseSummaryView, securityCodeExplanation) {
    var view = Backbone.View.extend({
        template: _.template(template),

        initialize: function () {
            this.vent = this.options.vent;
            _.bindAll(this);
            var theater = window.ObjectModels.OrderModel.get('theater');
            this.useLoyalty = window.ConfigurationProvider.useLoyalty(theater);

            this.useMasterCard = theater.get('acceptsMasterCard');
            this.useAmericanExpress = theater.get('acceptsAmericanExpress');
            this.useDiscover = theater.get('acceptsDiscover');
            this.useVisa = theater.get('acceptsVisa');

            this.useAVS = theater.get('aVSRequiredForCredit');
            this.useCVV2 = theater.get('cVV2RequiredForCredit');

            this.localize = window.ObjectCollections.Localization.result;
        },

        events: {
            'click input#btn-submit': 'paymentSubmit',
            'click .btn-group button': 'click',
            'blur #creditCardNumberGift': 'getGiftCardBalance',
            'keyup #creditCardNumberGift': 'cardNumberKeyPress'
        },

        cardNumberKeyPress: function (e) {
            if (window.ActivePaymentMethod === 'GiftCard') {
                var key = e.keyCode || e.which;
                if (key === 13) {
                    this.getGiftCardBalance();
                }
            }
        },

        getGiftCardBalance: function () {
            var that = this;
            var cardNumber = $(that.el).find('#creditCardNumberGift').val();

            if (that.lastGiftCard && cardNumber === that.lastGiftCard) {
                return;
            }

            that.lastGiftCard = cardNumber;
            $(that.el).find('#giftCardBalance').css('visibility', 'hidden');

            if (cardNumber) {
                require(['sharedhelpers/giftCardHelper'], function () {
                    var theater = window.ObjectModels.OrderModel.get('theater');
                    window.giftCardHelper.setDefaultOptions(theater);

                    var handlers = {
                        onSuccess: function (balance) {
                            $(that.el).find('#giftCardBalance').css('visibility', 'visible').html(balance);
                        },
                        onError: function () {
                            $(that.el).find('#giftCardBalance').css('visibility', 'visible').html(that.localize.errorOccured);
                        },
                        onComplete: function () {
                            $(that.el).find('.balanceLoader').css('visibility', 'hidden');
                        },
                        onProgress: function () {
                            $(that.el).find('.balanceLoader').css('visibility', 'visible');
                        }
                    };

                    window.giftCardHelper.getBalance(cardNumber, handlers);
                });
            }
        },
        click: function (ev) {
            var element = $(ev.currentTarget);
            var id = element.data('id');

            if (id == "giftCard") {

                $(this.el).find("#cardForm div").show();
                $(this.el).find('.row .row-separator2').css('margin-top', '30px');
                $(this.el).find('#creditCard').hide();

                $(this.el).find('.btn[data-id="creditCard"]').removeClass('active');
                $(this.el).find('.btn[data-id="giftCard"]').addClass('active');

                window.ActivePaymentMethod = 'GiftCard';
            } else {
                $(this.el).find('label.error').remove();
                $(this.el).find('.error').removeClass('error');
                $(this.el).find('#giftCard').hide();

                $(this.el).find('.btn[data-id="giftCard"]').removeClass('active');
                $(this.el).find('.btn[data-id="creditCard"]').removeClass('active');

                this.svcOnly();

                $(this.el).find('.btn[data-id="creditCard"]').addClass('active');
                window.ActivePaymentMethod = 'CreditCard';
            };

            $(this.el).find('#' + id).show();
        },

        trigger: function () {
            this.vent.trigger('showNextPage', { fromPage: 'payment' });
        },

        paymentSubmit: function (callback) {
            var that = this;
            if (window.order && window.order.get('timedOut') === true) {
                if (callback) {
                    callback(false);
                }
                showAlert('Timed Out');
                hidePageLoadingMessage();
                return;
            }

            this.validateForm($("#cardForm"), function (result) {
                if (window.ActivePaymentMethod != 'GiftCard' && result) {
                    result = that.validateExpDate();
                }
                if (result) {
                    that.validateForm($("#receiptForm"), function (res) {
                        if (res) {
                            that.preparePayment(callback);
                        } else if (callback) {
                            callback(false);
                        }
                    });
                } else if (callback) {
                    callback(false);
                }
            });
        },

        preparePayment: function (callback) {
            var data = {};

            var encryptionKey = window.ObjectModels.OrderModel.get('encryptionKey');
            setMaxDigits(260);

            var key = new RSAKeyPair(encryptionKey.exponentHexString, "", encryptionKey.modulusHexString);

            data.authorizePayment = true;
            data.authorizationCode = null;

            var card;
            var firstName;
            var lastName;
            var giftCardBalance;
            var paymentCards = new Array();
            var paymentCard = new Object();

            if (window.ActivePaymentMethod === "GiftCard") {
                card = $("#creditCardNumberGift").val();
                firstName = $("#firstNameGift").val();
                lastName = $("#lastNameGift").val();
                giftCardBalance = $('#giftCardBalance').html();
            } else {
                card = $("#creditCardNumber").val();
                firstName = $("#firstName").val();
                lastName = $("#lastName").val();
                paymentCard.expirationMonth_MM = encryptedString(key, $("#expDateMonth").val());
                paymentCard.expirationYear_YY = encryptedString(key, $("#expDateYear").val());

                if (this.param.aVSRequiredForCredit) {
                    if (window.AppConfig.AppCulture == 'en-GB') {
                        paymentCard.aVS = encryptedString(key, $("#zipCode").val().match(/\d/g).join(""));
                    } else {
                        paymentCard.aVS = encryptedString(key, $("#zipCode").val());
                    }
                }

                if (this.param.cVV2RequiredForCredit) {
                    paymentCard.cVV2 = encryptedString(key, $("#securityCode").val());
                }
            }

            data.patronInfo = {
                "firstName": firstName,
                "lastName": lastName,
                "email": $("#email").val(),
                "phone": $("#phoneNumber").val(),
                "facebookId": "",
                "deviceId": ""
            };

            data.sendSmsReceipt = data.patronInfo.phone ? data.patronInfo.phone.length > 0 : false;
            data.sendEmailReceipt = data.patronInfo.email ? data.patronInfo.email.length > 0 : false;

            card = card.replace(/ /g, "");

            paymentCard.cardNumber = encryptedString(key, card);

            var cardType = this.getCardType(card);
            if (cardType) {
                data.cardType = cardType.name;
            }

            data.lastDigits = card.substring(card.length - 4, card);

            paymentCard.amount = parseFloat(window.ObjectModels.OrderModel.get('totalPrice')).toFixed(2);

            paymentCards.push(paymentCard);

            data.paymentCards = paymentCards;

            var loyaltyCardNumbers = new Array();
            var loyaltyCardNumber = $("#loyaltyCardNumber").val();

            loyaltyCardNumbers.push(loyaltyCardNumber);
            data.loyaltyCardNumbers = loyaltyCardNumbers;

            window.ObjectModels.OrderModel.set('paymentData', data);
            if (callback) {
                callback(true);
            }

            this.trigger();
        },

        render: function (arg) {
            this.vent.bind("submitPayment", this.paymentSubmit);
            this.vent.bind("loadPurchaseSummary", this.loadPurchaseSummary);
            var loyaltyCard;
            var that = this;
            var cache = new CachingProvider();
            loyaltyCard = cache.read('loyaltycardnumber');

            that.param = {
                aVSRequiredForCredit: this.useAVS,
                cVV2RequiredForCredit: this.useCVV2,
                acceptsAmericanExpress: arg.theater.get('acceptsAmericanExpress'),
                acceptsDiscover: arg.theater.get('acceptsDiscover'),
                acceptsMasterCard: arg.theater.get('acceptsMasterCard'),
                acceptsSVC: arg.theater.get('acceptsSVC'),
                acceptsVisa: arg.theater.get('acceptsVisa'),
                useLoyalty: window.ConfigurationProvider.useLoyalty(arg.theater),
                loyaltyCard: loyaltyCard
            };

            var paymentData = { firstName: '', lastName: '', cardNumber: '', zipCode: '', email: '', phone: '', securityCode: '', loyaltyCardNumber: loyaltyCard ? loyaltyCard : '' };
            if (window.ObjectModels.OrderModel.get('paymentData')) {
                try {
                    paymentData['firstName'] = window.ObjectModels.OrderModel.get('paymentData')['patronInfo']['firstName'];
                    paymentData['lastName'] = window.ObjectModels.OrderModel.get('paymentData')['patronInfo']['lastName'];
                    if (window.ActivePaymentMethod != 'GiftCard') {
                        paymentData['giftCardNumber'] = "";
                    } else {
                        paymentData['cardNumber'] = "";
                        paymentData['giftCardBalance'] = window.ObjectModels.OrderModel.get('paymentData')['paymentCards'][0]['giftCardBalance'] || Globalize.format(0, 'c');
                    }
                    paymentData['email'] = window.ObjectModels.OrderModel.get('paymentData')['patronInfo']['email'];
                    paymentData['phone'] = window.ObjectModels.OrderModel.get('paymentData')['patronInfo']['phone'];
                    paymentData['loyaltyCardNumber'] = window.ObjectModels.OrderModel.get('paymentData')['loyaltyCardNumbers'][0];

                } catch (e) {

                }
            }

            $(this.el).find("#cardForm").validate({
                onKeyUp: false,
                focusCleanup: true
            });

            this.container = arg.container;
            this.$el.html(this.template({ localize: window.ObjectCollections.Localization.result, param: that.param, paymentData: paymentData, configurationProvider: configurationProvider }));
            $(this.container).empty().append(this.$el);
            this.delegateEvents();
            that.loadPurchaseSummary();
            this.needRender = false;

            if (arg.callback) {
                arg.callback();
            }

            var sce = new securityCodeExplanation({});
            sce.render();

            $(this.el).find("#questionMark").popover({
                content: sce.el,
                title: this.localize.questionMarkTitle,
                trigger: 'hover'
            });

            require(['jqueryPlaceholder'], function () {
                $(function () {
                    $('input, textarea').placeholder();
                });
            });

            CountdownHelper.initCountdown();
        },

        loadPurchaseSummary: function () {
            var that = this;
            window.ObjectViews.PurchaseSummaryView = new purchaseSummaryView();

            window.ObjectViews.PurchaseSummaryView.render({ container: "#purchaseSummary", step: 'payment', localize: window.ObjectCollections.Localization.result, vent: that.vent });
        },


        build: function (dateMonth, dateYear, reverse) {
            dateMonth.find('option').remove().end();
            dateYear.find('option').remove().end();

            $.each(Globalize.culture().calendars.standard.months.namesAbbr, function (index, name) {
                if (name != '') {
                    $("<option/>", {
                        value: index + 1,
                        text: name + '(' + (index + 1).toString() + ')'
                    }).appendTo(dateMonth);
                }
            });

            if (reverse) {
                for (var i = new Date().getFullYear() ; i >= (new Date().getFullYear() - 10) ; i--) {
                    $("<option/>", {
                        value: i,
                        text: i.toString()
                    }).appendTo(dateYear);
                }
            } else {
                for (var i = new Date().getFullYear() ; i <= (new Date().getFullYear() + 20) ; i++) {
                    $("<option/>", {
                        value: i,
                        text: i.toString()
                    }).appendTo(dateYear);
                }
            }

            if (!reverse) {
                dateMonth.val((new Date().getMonth() + 1));
                dateYear.val(new Date().getFullYear());
            }

            dateMonth.selectBoxIt();
            dateYear.selectBoxIt();

            this.svcOnly();

            //HACK: Match width of dropdown menu to it's container
            $(this.el).find(".dropdown-menu").css("min-width", "90px");
        },

        validateForm: function (form, callback) {
            var self = this;
            var localize = window.ObjectCollections.Localization.result;
            var cultureHelper = new CultureHelper();
            var phoneValidation = cultureHelper.phoneValidation();
            var zipValidation = cultureHelper.zipValidation();
            var emailValidation = cultureHelper.emailValidation();
            var cardValidation = new CardValidationHelper();

            $.validator.messages.required = localize.required;

            $.validator.addMethod('creditCardNumber', function (value) {
                var creditCard = cardValidation.isCreditCardValid({
                    cardNumber: value,
                    useMasterCard: self.useMasterCard,
                    useAmericanExpress: self.useAmericanExpress,
                    useDiscover: self.useDiscover,
                    useVisa: self.useVisa,
                    checkIsSupported: true
                });

                return creditCard.isValid;
            }, localize.errorCreditCard);

            $.validator.addMethod('giftCard', function (value) {
                return !isNaN(value);
            }, localize.errorGiftCardNumber);

            $.validator.addMethod('email', function (value) {
                return value == '' || emailValidation.regex.test(value);
            }, emailValidation.msg);

            $.validator.addMethod('phone', function (value) {
                return value == '' || (phoneValidation.regex.test(value) && value.length >= 6);
            }, phoneValidation.msg);

            $.validator.addMethod('loyalty', function (value) {
                var regex = /^[0-9]+([-]*[0-9]+)*$/;
                return value == '' || (regex.test(value));
            }, localize.errorLoyaltyCard);

            $.validator.addMethod('zipCode', function (value) {
                return value == '' || (zipValidation.regex.test(value));
            }, zipValidation.msg);

            if (this.useCVV2) {
                $.validator.addMethod('securityCode', function (value) {
                    var creditCardNumber;

                    if ($(self.el).find('#creditCardNumber').val() != "") {
                        if ($(self.el).find("#creditCardNumber").hasClass('error')) return true;
                        creditCardNumber = $(self.el).find('#creditCardNumber');
                        var creditCard = {
                            cardNumber: creditCardNumber.val(),
                            useMasterCard: self.useMasterCard,
                            useAmericanExpress: self.useAmericanExpress,
                            useDiscover: self.useDiscover,
                            useVisa: self.useVisa,
                            checkIsSupported: true
                        };
                        if (cardValidation.isCreditCardValid(creditCard)) {
                            var cvv2DigitType = cardValidation.getCVV2Digits(creditCard);

                            var regExp = new RegExp('[0-9]{' + cvv2DigitType + '}');
                            var isValid = value.length == cvv2DigitType && regExp.test(value);

                            if (isValid) {
                                $(self.el).find('.error[for="cvv2"]').remove();
                                $(self.el).find('input#cvv2').removeClass('error');
                            }

                            if (!$(self.el).find('#creditCardNumber').hasClass('error'))
                                return isValid;
                        }
                    } else {
                        $(self.el).find("#creditCardNumber").addClass('error');
                    }

                    return false;
                }, localize.errorCode30);
            }

            if (form.length > 0) {
                if (form.valid()) {
                    callback(true);
                }
                else {
                    callback(false);
                }
            }
        },

        validateExpDate: function () {
            var localize = window.ObjectCollections.Localization.result;

            $("[for=expirationDate],[for=expDateMonth],[for=expDateYear]").remove();

            var expMonth = $('#expDateMonth :selected').val();
            var expYear = $('#expDateYear :selected').val();

            var todayDate = new Date();

            if (todayDate.getFullYear() < expYear || (todayDate.getFullYear() == expYear && todayDate.getMonth() + 1 <= expMonth)) {
                $("#expDateMonth, #expDateYear").addClass('valid').removeClass('error');
                return true;
            } else {
                $("#expDateMonth,#expDateYear").addClass('error').removeClass('valid');

                if ($("[for=expirationDate],[for=expDateMonth],[for=expDateYear]").length == 0) {
                    $('<label for="expirationDate" generated="true" class="error" style="">' + localize.errorExpirationDateInvalid + '</label>').insertAfter('#expDateYearSelectBoxItContainer');
                }

                return false;
            }
        },

        getCardType: function (number) {
            var cardTypes = [
              {
                  name: 'AMEX',
                  pattern: /^3[47]/,
                  valid_length: [15]
              }, {
                  name: 'Visa',
                  pattern: /^4/,
                  valid_length: [16]
              }, {
                  name: 'Mastercard',
                  pattern: /^5[1-5]/,
                  valid_length: [16]
              }, {
                  name: 'Discover',
                  pattern: /^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)|3(?:0[0-5][0-9]{11}|[68][0-9]{12})/,
                  valid_length: [16]
              }
            ];

            if (window.ActivePaymentMethod != 'GiftCard') {
                var cardType;
                for (var i = 0, len = cardTypes.length; i < len; i++) {
                    cardType = cardTypes[i];
                    if (number.match(cardType.pattern)) {
                        return cardType;
                    }
                }
            } else
                return {
                    name: 'Gift Card'
                };

            return null;
        },

        isValidLuhn: function (number) {
            var digit, n, sum, _i, _len, _ref;
            sum = 0;
            _ref = number.split('').reverse();
            for (n = _i = 0, _len = _ref.length; _i < _len; n = ++_i) {
                digit = _ref[n];
                digit = +digit;
                if (n % 2) {
                    digit *= 2;
                    if (digit < 10) {
                        sum += digit;
                    } else {
                        sum += digit - 9;
                    }
                } else {
                    sum += digit;
                }
            }
            return sum % 10 === 0;
        },

        isValidLength: function (number, cardType) {
            var ref;
            var __indexOf = [].indexOf || function (item) {
                for (var i = 0, l = number.length; i < l; i++) {
                    if (i in number && number[i] === item) return i;
                } return -1;
            };
            return ref = number.length, __indexOf.call(cardType.valid_length, ref) >= 0;
        },

        validate_number: function (number) {
            var cardType, lengthValid, luhnValid;
            cardType = this.getCardType(number);
            luhnValid = false;
            lengthValid = false;
            if (cardType != null) {
                luhnValid = this.isValidLuhn(number);
                lengthValid = this.isValidLength(number, cardType);
            }
            return {
                cardType: cardType,
                luhnValid: luhnValid,
                lengthValid: lengthValid
            };
        },

        validate: function (value) {
            var number;
            number = this.normalize(value);
            return this.validate_number(number);
        },

        normalize: function (number) {
            return number.replace(/[ -]/g, '');
        },

        destroyView: function () {
            if (this.purchaseSummaryView) {
                this.purchaseSummaryView.destroyView();
                this.purchaseSummaryView = null;
            }
            this.undelegateEvents();
            $(this.el).removeData().unbind();
            this.unbind();
            this.remove();
            Backbone.View.prototype.remove.call(this);
        },
        dispose: function () {
            this.undelegateEvents();
            this.off();
            if (this.vent)
                this.vent.off();
        },
        svcOnly: function () {
            if (this.useAmericanExpress == false && this.useDiscover == false && this.useMasterCard == false && this.useVisa == false) {
                $(this.el).find('[data-id=giftCard]').click();
                $(this.el).find('[data-id=giftCard]').remove();
                $(this.el).find('[data-id=creditCard]').remove();

                $(this.el).find('.btn-group').parent().append('<div class="span3"><b>' + this.localize.giftCard + '</b></div>');
                $(this.el).find('.btn-group').parent().find('.span3').css('margin-left', '43px');
            }
        }
    });

    return view;
});








