define(['text!templates/LoyaltyCardsAccountProfile.html',
        'jqueryValidate',
        'libs/selectboxit/js/jquery.selectboxit',
        'sharedhelpers/cultureHelper'
], function (template) {

    var view = Backbone.View.extend({
        template: _.template(template),

        events: {
            "click #btn-save": "saveCard",
            "blur  #postalCode": "checkZip",
            "change input": "changeData",
            "change #phoneNumber": "phoneValidate"
        },

        initialize: function (options) {
            this.loyaltyAccountModel = options.loyaltyAccountModel;
            this.cultureHelper = new CultureHelper();
            this.zipValidation = this.cultureHelper.zipValidation();

            _.bindAll(this, "saveCard", "checkZip", "changeData");
        },

        render: function () {
            var that = this;
            this.localize = window.ObjectCollections.Localization.result;

            this.$el.html(this.template({ model: this.loyaltyAccountModel, localize: this.localize, zipValidation: this.zipValidation }));

            if (that.loyaltyAccountModel.get('stateProvince'))
                $(that.el).find("#state").val(that.loyaltyAccountModel.get('stateProvince').value).attr('selected', true).siblings('option').removeAttr('selected');

            $("#main-container").append(this.el);
            $("#state").selectBoxIt();
            $(".selectboxit").css("width", "235px");
            $(".selectboxit-options").css("width", "235px");

            require(['jqueryPlaceholder'], function () {
                $(function () {
                    $('input, textarea').placeholder();
                });
            });

            this.initValidation();
            this.phoneValidate();

            _.defer(function () {
                hidePageLoadingMessage();
            });
            hideZipFilter();
            hideTopNavigation();
        },
        initValidation: function () {
            var self = this;
            var dateValidation = self.cultureHelper.dateValidation();

            $.validator.addMethod('date', function (value) {
                return dateValidation.regex.test(value);
            }, dateValidation.msg);
            $.validator.addMethod('postalCode', function (value) {
                return self.zipValidation.regex.test(value);
            }, self.zipValidation.msg);

            $.validator.addClassRules({ dateOfBirth: { dateOfBirth: true }, postalCode: { postalCode: true } });
            $.validator.messages.required = 'This ﬁeld cannot be blank.';

            var rulesOptions = [];
            _.each(self.loyaltyAccountModel.attributes, function (item) {
                if (item) {
                    rulesOptions[item.name] = {
                        required: item.required,
                        minlength: item.minLength,
                        maxlength: (item.maxLength == 0 ? 50 : item.maxLength)

                    };
                }
            });

            $("#frm-account-profile").validate({
                rules: rulesOptions,
                messages: {
                    required: "This ﬁeld cannot be blank."
                }
            });

        },

        changeData: function (event) {
            var item = this.loyaltyAccountModel.get(event.target.id);
            if (item) {
                item.value = item.name == 'lastName' || item.name == 'firstName' ? $.trim(event.target.value) : event.target.value;
                item.isUpdated = true;
                this.loyaltyAccountModel.set(item);
            }

        },
        setSelectedState: function () {
            var state = $("#state").val();

            var item = this.loyaltyAccountModel.get("stateProvince");
            if (item) {
                if (item.value != state) {
                    item.value = state;
                    item.isUpdated = true;
                    this.loyaltyAccountModel.set(item);
                }
            }
        },
        saveCard: function (e) {
            var self = this;
            e.preventDefault();
            self.setSelectedState();

            if ($("#frm-account-profile").valid() && $("[for=phoneNumber]").length <= 0) {
                showPageLoadingMessage();
                require(['shared/encode'], function () {
                    self.loyaltyAccountModel.saveCustom({ isUpdate: true, callback: function (newModel) { self.saveCardSuccess(newModel, self); } });
                });
            }
        },
        saveCardSuccess: function (newModel, that) {
            var cache = new CachingProvider();
            if (cache.isSupported()) {
                cache.store("securitypin", that.loyaltyAccountModel.get("lastName").value, window.AppProperties.CacheTimeout);
            }
            hidePageLoadingMessage();
            showAlert("Account data updated successfully", {
                postBack: function () {
                    Backbone.history.navigate('loyaltycards', true);
                }
            });
        },
        checkZip: function () {
            if (!this.zipValidation.searchZip)
                return;

            $.ajax({
                type: 'GET',
                url: '//gomashup.com/json.php?fds=geo/usa/zipcode/' + $("#postalCode").val() + '&jsoncallback=?',
                data: '',
                dataType: 'jsonp',
                beforeSend: function () {
                    $(".ajax-loader").show();
                },
                complete: function () {
                    $(".ajax-loader").hide();
                },
                success: function (data) {
                    var state = $("#state");
                    state.data("selectBox-selectBoxIt").selectOption(data.result[0].State);
                    $("#city").val(data.result[0].City).trigger('change');
                },
                error: function (err) {
                    console.log(err);
                }
            });
        },
        phoneValidate: function () {
            var parent, value = $("#phoneNumber").val();

            var phoneValidation = this.cultureHelper.phoneValidation();
            $("[for=phoneNumber]").remove();

            if (phoneValidation.regex.test(value) == false) {
                parent = $('#phoneNumber').parent();
                parent.css('margin-bottom', '15px');
                parent.append('<label for="phoneNumber" generated="true" class="error" style="display:block!important">' + phoneValidation.msg + '</label>');
                $('[for=phoneNumber]').css({ 'width': '220px', 'margin-bottom': '-30px' });
            } else {
                $('#phoneNumber').parent().css('margin-bottom', '0px');
            };
        }
    });
    return view;

});