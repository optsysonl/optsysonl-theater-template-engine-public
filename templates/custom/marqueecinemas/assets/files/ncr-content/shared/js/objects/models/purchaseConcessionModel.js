define([], function () {
    window.PurchaseConcessionModel = BaseModel.extend({
        idAttribute: "saleId",

        initialize: function (attributes) {
        },

        url: function () {
            if (this.saleId) {
                return this.RESTUri + 'theaters/' + this.theaterId + '/sales/' + this.saleId + '/concessions';
            } else {
                return this.RESTUri + 'theaters/' + this.theaterId + '/sales/concessions';
            }
        }
    });

    return window.PurchaseConcessionModel;
});
