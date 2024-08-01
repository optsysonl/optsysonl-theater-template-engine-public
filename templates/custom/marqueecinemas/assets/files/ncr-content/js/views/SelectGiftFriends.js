define(['text!templates/SelectGiftFriends.html',
        'views/_facebookFriendsContent',
        'sharedhelpers/utilities'
], function (template, facebookFriendsContent) {
    var t;
    var view = Backbone.View.extend({
        template: _.template(template),

        initialize: function () {
            _.bindAll(this, 'submit');
            this.subView = new facebookFriendsContent();

            if (this.options) {
                this.link = this.options.link;
                this.localize = this.options.localize;
            }
        },

        events: {
            'click .fb-field input[type="radio"]': 'click',
            'click #submit': 'submit',
            'click #searchBtn': 'search',
            'keyup #search': 'searchKeyPress'

        },

        render: function (serial) {
            var that = this;
            this.serial = serial;
            var msg = '';

            if (!this.filled) {
                $('#friends').html($(this.el));

                $(this.el).html(this.template({ localize: this.localize, msg: msg }));
                $(document).ready(function () {
                    $('#facebookSelectGift').on('shown', function () {
                        $(this).css({ visibility: "visible" });
                        $('html,body').scrollTop(0);
                        hidePageLoadingMessage();
                        $('body').append('<div class="modal-backdrop fade in"></div>');
                    });
                    $('#facebookSelectGift').on('hidden', function () {
                        hidePageLoadingMessage();
                        that.filled = false;
                        $('.modal-backdrop').remove();

                    });
                });

                that.countInviteFriends = 1; //Only one Friend can be selected at once.
                that.fillFriend();

                require(['jqueryPlaceholder'], function () {
                    $(function () {
                        $('input, textarea').placeholder();
                    });
                });
            };
        },

        renderSubView: function (clear) {
            if (clear) {
                $(this.dom).html($(this.subView.el));
                this.subView.render(false, { collection: this.collection, isOnHold: false });
            }
            else {
                if (this.collection.offset <= this.collection.length)
                    this.subView.render(true, { collection: this.collection, isOnHold: false });
            }
            if (this.selectedFriend)
                $('#' + this.selectedFriend.get('id')).prop('checked', true);
        },
        dom: '#user-friends',

        inUse: false,

        scroll: function () {
            var scrollHeight = $(this.dom).get(0).scrollHeight;
            var bootomOffset = 100;
            var c = $(this.dom).scrollTop() + $(this.dom).height() + bootomOffset;
            if (!this.inUse && c > scrollHeight) {
                this.inUse = true;
                this.collection.offset += this.collection.count;
                this.renderSubView(false);
                this.inUse = false;
            };
        },
        searchKeyPress: function (e) {
            var that = this;
            var key = e.keyCode || e.which;
            if (key == 13) {
                if (t) clearTimeout(t);
                this.search();
            } else {
                if (t) clearTimeout(t);
                t = setTimeout(function () { that.search(); }, 200);
            }
        },
        search: function () {
            var text = $('#search').val();
            this.searchInternal(true, text);
        },
        makeLink: function (friendsFacebookId, friendsName, confirmationNumber) {
            var utilities = new Utilities();
            var link = $.sprintf("%s%s/%s/%s/%s/%s/%s/%s",
                        window.appConfig.SiteURL,
                        "#pickup",
                        encodeURIComponent(utilities.encrypt(($.trim(confirmationNumber)))),
                        encodeURIComponent(utilities.encrypt(friendsFacebookId)),
                        encodeURIComponent(utilities.encrypt(friendsName)),
                        $.trim(window.ObjectModels.OrderModel.get('performance').get('number')),
                        $.trim(window.ObjectModels.OrderModel.get('movie').get('code')),
                        $.trim(window.ObjectModels.OrderModel.get('theater').get('id'))
                    );
            return link;
        },

        searchInternal: function (force, text) {
            var that = this;

            if (!force && text.length < 3) return;

            showPageLoadingMessage();
            that.collection.prepare();
            that.collection.getFriends(this.dom, text, function () {
                if (that.collection.models.length > 0) {
                    that.renderSubView(true);
                } else {
                    var lbl = $('<label>').css({ 'margin-top': '10px', 'margin-left': '10px', position: 'relative' });
                    lbl.text(window.ObjectCollections.Localization.result.noResultsFor + ': ' + text);
                    $(that.dom).html(lbl);
                }
                hidePageLoadingMessage();
            });
        },

        submit: function () {
            if ($('#submit').hasClass('disabled'))
                return;
            var that = this;
            if (this.selectedFriend) {
                var orderModel = window.ObjectModels.OrderModel;
                var message = $('#message').html();

                var movieName = orderModel.get('movie').get('name');
                var picture = orderModel.get('movie').get('image') ? (orderModel.get('movie').get('image').small || location.host + '/assets/files/ncr-content/img/moviePlcHolder.png') : location.host + '/assets/files/ncr-content/img/moviePlcHolder.png';

                var giftTicketObj = {
                    firstName: that.selectedFriend.get('firstName'),
                    lastName: that.selectedFriend.get('lastName'),
                    phoneNumber: '',
                    facebookId: that.selectedFriend.get('id'),
                    email: ''
                };

                orderModel.get('tickets').giftTicket(giftTicketObj, that.serial, orderModel.get('theater').get('id'), function (confirmationNumber) {
                    if (confirmationNumber) {
                        that.collection.publishToFriendWall(that.selectedFriend.get('id'), message, that.makeLink(that.selectedFriend.get('id'), that.selectedFriend.get('firstName') + " " + that.selectedFriend.get('lastName'), confirmationNumber), that.localize.giftTicketFbCaption, movieName, picture, function (success) {
                            if (success) {
                                that.options.onClose({ friend: that.selectedFriend });
                                showAlert(window.ObjectCollections.Localization.result.postToFriendsWallSuccessful);
                            }
                        });
                    }
                });

                $('#' + this.selectedFriend.get('id').toString()).trigger("click");
            };
            $('#facebookSelectGift').modal('hide');

        },
        click: function (ev) {
            var id = $(ev.target).attr('id');
            var friend = this.collection.where({ id: id.toString() })[0];

            friend.set({ ticketSerial: this.serial });
            this.selectedFriend = friend;
            var msg = this.makeMsg(friend.get('firstName'), id);

            $('#message').html(msg).css('display', 'block');
            $('#post-invitation-note').hide();
            $('#submit').removeClass('disabled');
        },

        makeMsg: function (friendName) {
            var msg;
            var orderModel = window.ObjectModels.OrderModel;

            if (orderModel) {
                var dateShowTime = DtHelper.convertDate(orderModel.get('performance').get('showTime'));
                var date = Globalize.format(dateShowTime, "M", orderModel.get('theater').get('culture'));
                var time = Globalize.format(dateShowTime, "t", orderModel.get('theater').get('culture'));

                msg = $.sprintf(this.localize.msgBottomGift,
                                        friendName,
                                        orderModel.get('movie').get('name'),
                                        orderModel.get('theater').get('name'),
                                        date,
                                        time);
            }
            else
                msg = "error performance";
            return msg;
        },

        filled: false,
        fillFriend: function () {
            var that = this;
            showPageLoadingMessage();
            this.collection.getFriends(this.dom, '', function () {
                that.renderSubView(true);

                $('#facebookSelectGift').modal();
            });

            $(this.dom).scroll(function () {
                that.scroll();
            });
            this.filled = true;
        },

        destroyView: function () {
            this.remove();
            this.unbind();

            this.undelegateEvents();
            this.off();
            if (this.vent)
                this.vent.off();
        }

    });

    return view;
});


