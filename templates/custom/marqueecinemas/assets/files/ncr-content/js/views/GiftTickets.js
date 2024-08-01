define(['text!templates/GiftTickets.html',
        'views/SelectGiftFriends',
        'sharedlibs/jquery/jquery.qrcode.min',
        'collections/facebookFriendCollection'
], function (template, selectGiftFriendsView, jqueryQrCode, facebookFriendCollection) {

    var view = Backbone.View.extend({

        initialize: function () {
            var myOrderModel = window.ObjectModels.OrderModel;
            this.performance = myOrderModel.get('performance');
            this.theater = myOrderModel.get('theater');
            this.movie = myOrderModel.get('movie');

            this.localize = this.options.localize;
        },

        events: {
            'click [data-id="giftTicket"]': 'click'
        },

        click: function (ev) {
            var serial = $(ev.target).attr('id');
            this.inviteFriends(serial);
        },

        inviteFriends: function (serial) {
            var that = this;

            if (this.selectGiftFriendsView)
                this.selectGiftFriendsView.destroyView();

            var c = new facebookFriendCollection();

            that.selectGiftFriendsView = new selectGiftFriendsView({
                collection: c,
                movie: that.movie,
                theater: that.theater,
                performance: that.performance,
                localize: that.localize,
                onClose: function (arg) {
                    var avatar = '<img src="//graph.facebook.com/' + arg.friend.get('id') + '/picture">';
                    $("#" + arg.friend.get('ticketSerial')).parent('div').html(avatar).addClass('fb-field');
                }
            });
            this.selectGiftFriendsView.render(serial);
        },

        template: _.template(template),

        render: function (callback) {
            var tickets = window.ObjectModels.OrderModel.get('confirmSaleResult');

            $(this.el).html(this.template({ tickets: tickets, localize: this.localize }));
            if (callback)
                callback();

            //Setting tickets to same height that is the height of the biggest ticket
            var giftBox = $(".gift-box");

            var heights = giftBox.map(function () {
                return $(this).height();
            }).get();

            var maxHeight = Math.max.apply(null, heights);

            giftBox.height(maxHeight);

            if (window.ObjectModels.OrderModel) {
                var cache = new CachingProvider();
                cache.remove('saleId');
            }
        }

    });

    return view;
});
