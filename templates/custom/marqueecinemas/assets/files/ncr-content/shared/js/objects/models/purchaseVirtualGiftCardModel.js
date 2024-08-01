define([], function () {
    window.PurchaseVirtualGiftCardModel = BaseModel.extend({
        url: function () {
            return this.RESTUri + 'theaters/' + this.theaterId + '/sales/giftCard';
        }
    });

    return window.PurchaseVirtualGiftCardModel;
});
