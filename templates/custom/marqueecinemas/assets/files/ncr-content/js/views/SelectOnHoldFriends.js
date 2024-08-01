define(['text!templates/SelectOnHoldFriends.html',
        'views/_facebookFriendsContent',
        'views/_purchaseSummary'
], function (template, facebookFriendsContent, purchaseSummaryView) {
    var t;
    var view = Backbone.View.extend({
        template: _.template(template),
        initialize: function () {
            _.bindAll(this, 'submit');
            this.vent = this.options.vent;
            this.subView = new facebookFriendsContent();
            if (window.selectOnHoldCollection)
                window.selectOnHoldCollection.reset();
            this.countInviteFriends = 0;
            if (this.options) {
                this.localize = this.options.localize;
            }
            this.onHoldTicket = window.ObjectModels.OrderModel.get('tickets').find(function (ht) { return ht.get('isOnHoldTicketType'); });
            if (!this.onHoldTicket.friends)
                this.onHoldTicket.friends = [];
        },
        events: {
            'click .fb-field input[type="checkbox"]': 'click',
            'click #submit': 'submit',
            'click #fbAdd': 'addQuantity',
            'click #fbRemove': 'removeQuantity',
            'click #searchBtn': 'search',
            'keyup #search': 'searchKeyPress'
        },

        render: function () {
            if (!this.filled) {
                $('#step2').html($(this.el));

                $(this.el).html(this.template({ localize: this.localize, msgBottomOnHold: this.options.msgBottomOnHold }));
                require(['jqueryPlaceholder'], function () {
                    $(function () {
                        $('input, textarea').placeholder();
                    });
                });

                this.fillFriend();
            };
            this.showMsgCountTickets();
        },

        renderSubView: function (clear) {
            if (clear) {
                $(this.dom).html($(this.subView.el));
                this.subView.render(false, { collection: this.collection, isOnHold: true });
            }
            else {
                if (this.collection.offset <= this.collection.length)
                    this.subView.render(true, { collection: this.collection, isOnHold: true });
            }
        },
        handleFriendSelection: function (friend, added) {
            var that = this;
            var existingFriend = _.find(that.onHoldTicket.friends, function (f) { return f.get('id') == friend.get('id'); });

            if (!existingFriend) {
                that.onHoldTicket.friends.push(friend);
                friend.set('quantity', 1);
                existingFriend = friend;
                $('[data-id="' + friend.get('id') + '"]#fbRemove').fadeIn();
            } else {
                if (added)
                    existingFriend.set('quantity', existingFriend.get('quantity') + 1);
                else {
                    existingFriend.set('quantity', existingFriend.get('quantity') - 1);

                    if (existingFriend.get('quantity') == 0) {
                        that.onHoldTicket.friends = jQuery.grep(that.onHoldTicket.friends, function (f) {
                            return f.get('id') != friend.get('id');
                        });
                        $('[data-id="' + friend.get('id') + '"]#fbRemove').fadeOut();
                    }
                }
            }
            $('#quantity' + friend.get('id')).text(existingFriend.get('quantity') == 0 ? "" : existingFriend.get('quantity'));
        },

        addQuantity: function (ev) {
            var that = this;
            if (that.onHoldTicket.addTicket(false)) {
                var friendId = $(ev.target).data('id');
                var friend = that.collection.find(function (f) { return f.get('id') == friendId; });
                that.handleFriendSelection(friend, true);
            }
            that.showMsgCountTickets();
        },

        removeQuantity: function (ev) {
            var that = this;
            var friendId = $(ev.target).data('id');
            if (!_.find(that.onHoldTicket.friends, function (f) { return f.get('id') == friendId; }))
                return;
            if (that.onHoldTicket.removeTicket()) {
                var friend = that.collection.find(function (f) { return f.get('id') == friendId; });
                that.handleFriendSelection(friend, false);
            }
            that.showMsgCountTickets();
        },
        removeFriend: function (ev) {
            var id = ev.target.id;
            if (!id) {
                id = $(ev.target).parent().parent().attr('id');
            }
            if (id) {
                var friend = this.collection.where({ id: id })[0];
                if (friend) {
                    friend.set({ status: false });
                    $('#' + id).parent().parent().removeClass('fb-field-selected');
                    $('#' + id).attr('checked', false);
                    this.removeFrom($('#selectedFriends'), friend);
                }
            }
        },

        changeSearch: function (e) {
            this.collection.searchParameter = $(e.currentTarget).attr('data');
            $('.btnSearch').html(this.collection.searchParameter);
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
        showMsgCountTickets: function () {
            var that = this;
            if (that.onHoldTicket) {
                var msg = this.localize.msgCountTickets;
                msg = $.sprintf(msg, that.onHoldTicket.get('quantity'), this.maxOnHoldTickets);

                $('#msgCountTickets').html(msg);
                if (that.onHoldTicket.get('quantity') >= this.maxOnHoldTickets)
                    $('#msgCountTickets').css('color', 'red');
                else
                    $('#msgCountTickets').css('color', 'black');
            };
        },
        loadPurchaseSummary: function () {
            var that = this;
            window.ObjectViews.PurchaseSummaryView = new purchaseSummaryView();
            window.ObjectViews.PurchaseSummaryView.render({ container: "#orderSummary", step: 'tickets', localize: window.ObjectCollections.Localization.result, vent: that.vent });
        },
        submit: function () {
            $('#facebook').modal('hide');
            this.loadPurchaseSummary();
        },
        click: function (ev) {
            var id = $(ev.target).attr('id');
            var friend = this.collection.where({ id: id.toString() })[0];
            var status = friend.get('status');
            if (status) {
                //old status
                $(ev.target).parent().parent().removeClass('fb-field-selected');
            } else {
                $(ev.target).parent().parent().addClass('fb-field-selected');
            }

            friend.set({ status: !status });
            if (status)
                this.removeFrom($('#b' + id), friend, id);
            else {
                this.appendTo($('#b' + id), friend, id);
            };

            this.showMsgCountTickets();
        },
        appendTo: function (domSelectionsFriend, friend, id) {
            if (!window.selectOnHoldCollection)
                window.selectOnHoldCollection = new FacebookFriendCollection();
            friend.set('quantity', 1);
            var q = friend.get('quantity') || 0;
            if (q == 0)
                friend.set('quantity', 1);
            q = friend.get('quantity') || 0;
            var a = $('#quantity' + id);
            a.html(q);

            window.selectOnHoldCollection.add(friend);
            $(domSelectionsFriend).show();
        },
        removeFrom: function (domSelectionsFriend, friend) {
            friend.set('quantity', 0);
            $(domSelectionsFriend).hide();
        },
        filled: false,
        fillFriend: function () {
            var that = this;
            this.collection.getFriends(this.dom, '', function () {
                that.renderSubView(true);

                hidePageLoadingMessage();

                $('#facebook').modal();

            });

            $(this.dom).scroll(function () {
                that.scroll();
            });
            this.filled = true;
        },

        destroyView: function () {
            this.undelegateEvents();
            $(this.el).removeData().unbind();
            this.remove();
            Backbone.View.prototype.remove.call(this);
        }
    });

    return view;
});


