define([], function () {
    window.MarqueeModel = BaseModel.extend({
        url: "marquee.json",
        getPromotions: function (theater, callback) {
            var that = this;

            if (theater && theater.get('promotions') && theater.get('promotions').length > 0) {
                callback(theater.get('promotions'));                
            } else {
                that.fetch({
                    success: function (marquee, result) {
                        callback(result);
                    }
                });
            }
        },
        parse: function (resp) {
            return resp;
        },
    });

    return window.MarqueeModel;
});