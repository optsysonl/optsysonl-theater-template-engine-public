define([], function () {
    window.CardValidationHelper = (function () {
        //note: Discover pattern ^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65) is joined with Diners pattern 3(?:0[0-5][0-9]{11}|[68][0-9]{12})
        var creditCards = {
            Discover: { name: 'Discover', pattern: /^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)/, valid_length: [16] },
            DinersClub: { name: 'Discover', pattern: /^3(?:0[0-5]|[689][0-9])[0-9]{11}/, valid_length: [14, 16] }, //Diners is processed as Discover
            Mastercard: { name: 'Mastercard', pattern: /^5[1-5]/, valid_length: [16] },
            AMEX: { name: 'AMEX', pattern: /^3[47]/, valid_length: [15] },
            Visa: { name: 'Visa', pattern: /^4/, valid_length: [13, 16, 17, 18, 19] },
            Maestro: { name: 'Maestro', pattern: /^(50[0-9][0-9]|6[0-4][1-3][2-9]|6[6-9][0-9][0-9]|5[6-9][0-9][0-9]|6000|600[0-9])/, valid_length: [12, 13, 14, 15, 16, 17, 18, 19] },
            Solo: { name: 'Solo', pattern: /^(6334|6767)/, valid_length: [16, 18, 19] }
        };

        function _getCardType(cardNumber) {
            var cardType = null;
            $.each(creditCards, function (key, value) {
                if (cardNumber.match(value.pattern)) {
                    cardType = value;
                }
            });

            return cardType;
        }

        function _getCvv2Digits(option) {
            var cardName;
            if (option.cardNumber !== undefined) {
                var cardType = _getCardType(option.cardNumber);
                if (cardType) {
                    cardName = cardType.name;
                } else {
                    return 0;
                }
            } else if (option.cardName !== undefined) {
                cardName = option.cardName;
            }

            if (!cardName) {
                return 0;
            }

            switch (cardName) {
                case creditCards.Mastercard.name:
                    return option.useMasterCard || option.useMasterCard === undefined ? 3 : 0;
                case creditCards.Visa.name:
                    return option.useVisa || option.useVisa === undefined ? 3 : 0;
                case creditCards.Discover.name:
                    return option.useDiscover || option.useDiscover === undefined ? 3 : 0;
                case creditCards.AMEX.name:
                    return option.useAmericanExpress || option.useAmericanExpress === undefined ? 4 : 0;
                case creditCards.Maestro.name:
                    return 3;
                case creditCards.Solo.name:
                    return 3;
                default:
                    return 0;
            }
        }

        function _isCreditCardValid(option) {
            var creditCardResult = _validate(option.cardNumber);
            var isCardValid = creditCardResult.luhnValid === true && creditCardResult.lengthValid === true;

            if (isCardValid && option.checkIsSupported !== undefined && option.checkIsSupported) {
                var cardName = creditCardResult.cardType.name;

                if (cardName) {
                    switch (cardName) {
                        case creditCards.Mastercard.name:
                            isCardValid = option.useMasterCard;
                            break;
                        case creditCards.AMEX.name:
                            isCardValid = option.useAmericanExpress;
                            break;
                        case creditCards.Discover.name:
                            isCardValid = option.useDiscover;
                            break;
                        case creditCards.Visa.name:
                            isCardValid = option.useVisa;
                            break;
                    }
                }

                return { isValid: isCardValid, isSupported: isCardValid };
            }

            return { isValid: isCardValid };
        }

        //credit card validation
        function _isValidLuhn(number) {
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
        }

        function _isValidLength(number, cardType) {
            var ref;
            var __indexOf = [].indexOf || function (item) {
                for (var i = 0, l = number.length; i < l; i++) {
                    if (i in number && number[i] === item) return i;
                }
                return -1;
            };
            return ref = number.length, __indexOf.call(cardType.valid_length, ref) >= 0;
        };

        function _validateNumber(number) {
            var cardType, lengthValid, luhnValid;
            cardType = _getCardType(number);
            luhnValid = false;
            lengthValid = false;
            if (cardType != null) {
                luhnValid = _isValidLuhn(number);
                lengthValid = _isValidLength(number, cardType);
            }
            return {
                cardType: cardType,
                luhnValid: luhnValid,
                lengthValid: lengthValid
            };
        };

        function _validate(value) {
            var number;
            number = _normalize(value);
            return _validateNumber(number);
        };

        function _normalize(number) {
            return number.replace(/ /g, '');
        };

        return {
            normalize: _normalize,
            getCardType: _getCardType,
            getCVV2Digits: _getCvv2Digits,
            creditCards: creditCards,
            isCreditCardValid: _isCreditCardValid
        };
    });
});