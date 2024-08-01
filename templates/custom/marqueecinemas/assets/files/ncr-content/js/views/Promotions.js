define([
    'text!templates/Promotions.html'
], function (template) {

    var view = Backbone.View.extend({
        el: 'body',
        template: _.template(template),
        initialize: function () {
            this.localize = this.options.localize;
            this.promotionData = this.options.promotionData;
            this.counter = 0;
        },
        render: function () {
            var that = this;
            var promotion = that.promotionData[0].url;
            return this.template({ localize: that.localize, promotion: promotion });
        },
        events: {
            'click .prev-arrow': 'previousPromotion',
            'click .next-arrow': 'nextPromotion',
            'click .close': 'closePromotion'
        },
        previousPromotion: function () {
            var that = this;
            var imgSrc;

            if (that.counter == 0) {
                that.counter = that.promotionData.length;
            }
            imgSrc = that.promotionData[that.counter - 1].url;
            that.setPromotionImage(imgSrc);
            that.counter--;
            return;
        },
        nextPromotion: function () {
            var that = this;
            var imgSrc;

            if (that.counter == that.promotionData.length - 1) {
                that.counter = -1;
            }
            imgSrc = that.promotionData[that.counter + 1].url;
            that.setPromotionImage(imgSrc);
            that.counter++;
            return;
        },
        setPromotionImage: function (imgSrc) {
            $('.promotion-item').attr('src', imgSrc);
        },
        closePromotion: function () {
            hideOverlay();
            var that = this;
            that.counter = 0;
            $(".container-content").children("#promotions-modal").remove();
            $('#promotions-modal').modal('hide');
        },
    });
    return view;
});