define(["collections/concessionCollection"], function (concessionCollection) {
    window.OrderModel = BaseModel.extend({
        idAttribute: "Id",
        url: function () {
            return this.RESTUri + "theaters/" + this.theaterId + "/sales/" + this.performanceId + "/tickets";
        },

        modulusHexString: "",
        exponentHexString: "",
        saleId: "",
        authorizationCode: "",
        confirmationNumber: "",
        sync: function (method, model, options) {
            return Backbone.sync(method, model, options);
        },

        initialize: function () {
            this.set('concessions', new concessionCollection());
        },

        getConcessionsPrice: function () {
            var price = 0;
            _.each(this.get('concessions').models, function (item) {
                price += item.price;
            });

            return price;
        },

        cancelSale: function (callback, hidePageLoading) {
            var that = this;
            showPageLoadingMessage();

            if (!that.get('saleId')) {
                window.ObjectModels.OrderModel = new OrderModel();
                if (callback)
                    callback(false);
                return;
            }
            var theaterId = that.get('theater') ? that.get('theater').get('id') : that.get('theaterId');

            clearInterval(that.get('interval'));
            var cancelSaleObject = new Object();
            cancelSaleObject.url = appConfig.RESTUri + "theaters/" + theaterId + "/sales/" + that.get('saleId');
            Backbone.sync('delete', cancelSaleObject, {
                url: appConfig.RESTUri + "theaters/" + theaterId + "/sales/" + that.get('saleId'),
                error: function () {
                    new ErrorHelper().showAlertByErrorCode();
                    if (callback)
                        callback(false);
                },
                success: function () {
                    window.ObjectModels.OrderModel = new OrderModel();

                    if (callback)
                        callback(true);
                },
                complete: function () {
                    if (hidePageLoading !== false) {
                        hidePageLoadingMessage();
                    }
                }
            });
        }
    });

    return window.OrderModel;
});