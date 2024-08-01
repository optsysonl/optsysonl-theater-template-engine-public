define([], function () {
    window.GiftCardModel = BaseModel.extend({
        url: function () {
            return this.RESTUri + "theaters/" + this.get('theaterId') + "/GiftCard/" + this.get('cardNumber');
        },
        parse: function (response) {
            this.set('balance', response.result.balance);
            this.set('invalidCard', response.result.invalidCard);
        }
    });

    return window.GiftCardModel;
});