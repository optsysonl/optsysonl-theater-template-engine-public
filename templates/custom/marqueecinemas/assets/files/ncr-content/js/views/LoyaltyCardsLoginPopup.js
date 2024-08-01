define(['text!templates/LoyaltyCardsLoginPopup.html',
        'models/loyaltyAccountModel',
        'jqueryValidate'
], function (template, loyaltyAccountModel) {

    var view = Backbone.View.extend({
        el: 'body',
        template: _.template(template),
        events: {
            'click #btn-login-loyaltycard': 'loyaltyAccountLogin',
            'keypress #loyalty-account-number': 'loyaltyAccountLogin',
            'keypress #security-pin': 'loyaltyAccountLogin',
            'click #close-dialog': 'closeDialog'
        },
        initialize: function () {
            _.bindAll(this, 'loyaltyAccountLogin');
            this.localize = this.options.localize;
            var that = this;
            jQuery.extend(jQuery.validator.messages, {
                required: that.localize.required,
            });
        },
        render: function () {
            $('#loyalty-account-number').val('');
            $('#security-pin').val('');
            $('#loyaltyLoginForm .error').hide();
            $('#loyalty-login-modal').remove();
            hidePageLoadingMessage();
            return this.template({ localize: this.localize });
        },
        closeDialog: function () {
            hideOverlay();
            if (window.location.href.indexOf("#tickets/") >= 0)
                location.reload(true);
        },
        loyaltyAccountLogin: function (e) {
            if (e.keyCode == 13 || e.type == 'click') {
                var that = this;
                that.validateForm(function (result) {
                    if (result) {
                        var loyaltyAccountNumber = $("#loyalty-account-number").val().replace(/-/g, '').replace(/ /g, '');
                        var securityPin = $.trim($("#security-pin").val());
                        if (loyaltyAccountNumber && securityPin) {
                            showPageLoadingMessage();
                            var data = new loyaltyAccountModel({ id: loyaltyAccountNumber, securityKey: securityPin });
                            data.fetch({
                                error: function () {
                                    showAlert(window.ObjectCollections.Localization.result.errorCode16);
                                },
                                success: function (model) {
                                    model.set("id", loyaltyAccountNumber);
                                    hidePageLoadingMessage();
                                    if (model.get("planStatus") == undefined) {
                                        that.$el.find("#loyalty-data-error").removeClass("hide");
                                        that.$el.find('#loyalty-data-error').text(that.localize.loyaltyCardErrorLogin);
                                        $('body').append('<div class="modal-backdrop fade in"></div>');
                                    } else {
                                        var cache = new CachingProvider();
                                        if (cache.isSupported()) {
                                            cache.store("loyaltycardnumber", loyaltyAccountNumber, window.AppProperties.CacheTimeout);
                                            cache.store("securitypin", securityPin, window.AppProperties.CacheTimeout);
                                            cache.store("emailAddress", model.get('emailAddress').value, window.AppProperties.CacheTimeout);
                                        }
                                        $('#loyalty-login-modal').modal('hide');
                                        Backbone.history.navigate('loyaltycards/' + loyaltyAccountNumber, true);
                                    }
                                }
                            });
                        }
                    }
                });
            }
        },
        validateForm: function (callback) {
            var that = this;
            var valid = true;

            $('#loyalty-card-error').addClass('hide');
            $('#security-pin-error').addClass('hide');
            $('#loyalty-data-error').addClass('hide');

            var loyaltyCardNumber = $('#loyalty-account-number');
            var lastName = $('#security-pin');

            loyaltyCardNumber.removeClass('error');
            lastName.removeClass('error');

            if (loyaltyCardNumber.val() == '') {
                loyaltyCardNumber.addClass('error');
                $('#loyalty-card-error').text(that.localize.required);
                $('#loyalty-card-error').removeClass('hide');
                valid = false;
            }

            if ($.trim(lastName.val()) == '') {
                lastName.addClass('error');
                $('#security-pin-error').text(that.localize.required);
                $('#security-pin-error').removeClass('hide');
                valid = false;
            }

            var loyaltyCardNumberValue = loyaltyCardNumber.val().replace(/-/g, '').replace(/ /g, '');
            if (loyaltyCardNumberValue != "" && isNaN(loyaltyCardNumberValue)) {
                $('#loyalty-data-error').text(that.localize.errorLoyaltyCard);
                $('#loyalty-data-error').removeClass('hide');
                valid = false;
            }

            if (valid)
                callback(valid);
        }
    });

    return view;
});