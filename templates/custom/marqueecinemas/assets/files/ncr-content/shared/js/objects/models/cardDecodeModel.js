define([], function () {
    window.CardDecodeModel = BaseModel.extend({
        url: function () {
            return this.RESTUri + 'theaters/' + this.theaterId + '/CardDecodeRequest/' + this.cardnum;
        },
        initialize: function (arg) {
            if (arg) {
                this.cardnum = arg.cardnum;
                this.theaterId = arg.theaterId;
            }
        },
        fetch: function (options) {
            var that = this;
            $.ajax({
                type: 'GET',
                url: that.url(),
                dataType: 'json',
                success: function (data) {
                    var cardType = [];

                    if (data.result.isLoyalty) {
                        cardType.push('Loyalty');
                    }

                    if (data.result.isPayment) {
                        cardType.push('SVC');
                    }

                    options.success(cardType);
                },
                error: function (errorMessage) {
                    options.error(errorMessage);
                }
            });
        }
    });

    return window.CardDecodeModel;
});