CultureHelper = (function (culture) {
    if (!culture)
        culture = window.appConfig.AppCulture;

    var localize = window.ObjectCollections.Localization.result;

    function _phoneValidation() {
        switch (culture) {
            case 'en-GB':
                return {
                    regex: /^(((\+|00)?44|0)([123578]{1}))(((\d{1}\s?\d{4}|\d{2}\s?\d{3})\s?\d{4})|(\d{3}\s?\d{2,3}\s?\d{3})|(\d{4}\s?\d{4,5}))$/,
                    msg: localize.errorEnterValidPhoneNumber
                };
            case 'en-AU':
                return {
                    regex: /^\({0,1}((0|\+61)(2|4|3|7|8)){0,1}\){0,1}(\ |-){0,1}[0-9]{2}(\ |-){0,1}[0-9]{2}(\ |-){0,1}[0-9]{1}(\ |-){0,1}[0-9]{3}$/,
                    msg: localize.errorEnterValidPhoneNumber
                };
            default:
                return {
                    regex: /^(1-?)?(\([2-9]\d{2}\)|[2-9]\d{2})-?[2-9]\d{2}-?\d{4}$/,
                    msg: localize.errorEnterValidPhoneNumber
                };
        }
    }

    function _zipValidation() {
        switch (culture) {
            case 'en-GB':
                return {
                    regex: /^(GIR ?0AA|(?:[A-PR-UWYZ](?:\d|\d{2}|[A-HK-Y]\d|[A-HK-Y]\d\d|\d[A-HJKSTUW]|[A-HK-Y]\d[ABEHMNPRV-Y])) ?\d[ABD-HJLNP-UW-Z]{2})$/,
                    inputType: 'text',
                    showState: false,
                    msg: localize.errorZipCode
                };
            case 'en-AU':
                return {
                    regex: /^(0[289][0-9]{2})|([1345689][0-9]{3})|(2[0-8][0-9]{2})|(290[0-9])|(291[0-4])|(7[0-4][0-9]{2})|(7[8-9][0-9]{2})$/,
                    inputType: 'tel',
                    showState: false,
                    msg: localize.errorZipCode
                };
            default:
                return {
                    regex: /(^\d{5}$)|(^\d{5}-\d{4}$)/,
                    inputType: 'tel',
                    showState: true,
                    searchZip: function (arg) {
                        $.ajax({
                            type: 'GET',
                            url: 'http://gomashup.com/json.php?fds=geo/usa/zipcode/' + arg.zipCode + '&jsoncallback=?',
                            data: '',
                            success: arg.successCallback,
                            error: arg.errorCallback,
                            dataType: 'jsonp'
                        });
                    },
                    msg: localize.errorZipCode
                };
        }
    }

    function _dateValidation() {
        switch (culture) {
            case 'en-GB':
            case 'en-AU':
                return {
                    regex: /^((0?[1-9]|[12][0-9]|3[01])[-/.](0?[1-9]|1[012])[-/.](19|20)?[0-9]{2})*$/,
                    msg: localize.dateInvalid
                };
            default:
                return {
                    regex: /^((0?[1-9]|1[012])[-/.](0?[1-9]|[12][0-9]|3[01])[-/.](19|20)?[0-9]{2})*$/,
                    msg: localize.dateInvalid
                };
        }
    }

    function _emailValidation() {
        return {
            regex: /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/i,
            msg: localize.errorEnterValidEmailAddress
        };
    }

    return {
        phoneValidation: _phoneValidation,
        zipValidation: _zipValidation,
        dateValidation: _dateValidation,
        emailValidation: _emailValidation
    };
});
