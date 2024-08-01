define([], function () {

    // Get Loyalty Account Fields: GET  https://ecloudserver.radianthosting.net/v2/Loyalty/CreateAccountInfo
    // Get Loyalty Account Info:   GET  https://ecloudserver.radianthosting.net/v2/Loyalty/Accounts/{accountNumber}/{securityKey}
    // Update Loyalty Account:     PUT  https://ecloudserver.radianthosting.net/v2/Loyalty/Accounts/{accountNumber}
    // Create Loyalty Account:     POST https://ecloudserver.radianthosting.net/v2/Loyalty/Accounts

    window.LoyaltyAccountModel = BaseModel.extend({
        url: function () {
            var restUri = window.appConfig.RESTUri;

            var url = restUri + "Loyalty/Accounts/{accountNumber}/{securityKey}/";
            if (this.id) {
                this.url = url.replace("{accountNumber}", this.id);
                this.url = this.url.replace("{securityKey}", this.get("securityKey"));
            }
            else {
                this.url = restUri + "Loyalty/Accounts";
            }

            return this.url;
        },
        parse: function (response) {
            var accountInfo = response.result === undefined ? response.accountInfo : response.result.accountInfo;
            var planStatus = response.result === undefined ? response.planStatus : response.result.planStatus;

            //TODO: change this property name when the Loyalty changes are implemented on the API side (if needed)
            var loyaltyBanners = response.result === undefined ? response.loyaltyBanners : response.result.loyaltyBanners;

            _.each(accountInfo, function (item) {
                this.set(item.name, {
                    "value": item.value,
                    "minLength": item.minLength,
                    "maxLength": item.maxLength,
                    "name": item.name,
                    "type": item.type,
                    "required": item.required,
                    "isEditable": item.isEditable
                });

            }, this);

            this.set("planStatus", planStatus);
            this.set("loyaltyBanners", loyaltyBanners);
            this.set('errorCode', response.result.error_sub_code);
        },
        saveCustom: function (option) {
            var self = this;

            var customTmpModel = Backbone.Model.extend({
                url: self.url,
                id: self.id,
                sync: function (method, model, options) {
                    if (method === 'update') {
                        self.url = window.appConfig.RESTUri + 'Loyalty/Accounts/{accountNumber}';
                        self.url = self.url.replace("{accountNumber}", self.id);
                    }

                    return Backbone.sync(method, model, options);
                }
            });

            var modelToSave = new customTmpModel();
            var isUpdate = option.isUpdate === undefined ? false : option.isUpdate;
            var itemsToSave = [];
            _.each(this.attributes, function (item) {
                if (item) {
                    if (isUpdate) {
                        if (item.isUpdated) {
                            this.push({ "name": item.name, "value": item.value });
                        }
                    }
                    else if (item.value) {
                        this.push({ "name": item.name, "value": item.value });
                    }
                }
            }, itemsToSave);
            modelToSave.attributes = itemsToSave;

            if (option && option.callback) {
                var localize = window.ObjectCollections.Localization.result;

                modelToSave.save(null, {
                    success: function (response) {
                        if (response.attributes.result_code === 200) {
                            option.callback(modelToSave);
                        } else {
                            var message = '';
                            if (response.attributes.message)
                                message = response.attributes.message;

                            if (option.errorCallback) {
                                option.errorCallback();
                            }
                            showAlert(localize.errorLoyaltyAccountUpdate + ' ' + message);
                        }
                    },
                    error: function () {
                        showAlert(localize.errorLoyaltySignup);

                        Backbone.history.navigate('home', true);
                    },
                    complete: function () {
                        hidePageLoadingMessage();
                    }
                });
            } else {
                modelToSave.save();
            }
        }
    });

    return window.LoyaltyAccountModel;
});