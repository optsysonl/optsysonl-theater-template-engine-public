define([], function () {
    window.ConfirmSaleModel = BaseModel.extend({
        idAttribute: "id",
        url: function () { return this.RESTUri + "theaters/" + this.theaterId + "/sales/" + this.saleId + "/Confirm"; }
    });

    return window.ConfirmSaleModel;
});