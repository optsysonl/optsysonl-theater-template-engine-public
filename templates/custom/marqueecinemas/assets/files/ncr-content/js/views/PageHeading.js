define(['text!templates/PageHeading.html',
    'sharedhelpers/configurationProvider'
], function (template, configurationProvider) {

    var view = Backbone.View.extend({
        el: "#page-menu",
        initialize: function () {

        },
        template: _.template(template),
        render: function () {
            var showPromotions = configurationProvider.promotions() != undefined && configurationProvider.promotions().length > 0;
            if (showPromotions) {
                $('#page-menu').css({ 'width': '550px' });
            }
            $(this.el).html(this.template({ localize: this.options.localize, showPromotions: showPromotions }));
        },

        events: {
            'click #tab-theaters': 'theaters',
            'click #tab-movies': 'movies',
            'click #tab-promotions': 'promotions',
            'click #tab-loyalty-card': 'loyaltyCard'
        },

        theaters: function () {
            checkOrderStatus(function (response) {
                if (response) {
                    if (window.singleSite) {
                        Backbone.history.navigate('theater/' + window.ConfigurationProvider.theaterId(), true);
                    } else {
                        Backbone.history.navigate('theaters', true);
                    }
                }
            });
        },

        movies: function () {
            checkOrderStatus(function (response) {
                if (response) {
                    //Reset movie page and sorting
                    window.lastSelectedPage = null;
                    window.moviesLastSort = null;
                    Backbone.history.navigate('movies', true);
                }
            });
        },
        promotions: function () {
            require(['views/Promotions'], function (promotionPopup) {
                var promotionData = configurationProvider.promotions();
                var promotions = new promotionPopup({ localize: window.ObjectCollections.Localization.result, promotionData: promotionData });
                $(".container-content").append(promotions.render());
                $('#promotions-modal').modal();
            });
        },

        loyaltyCard: function () {
            checkOrderStatus(function (response) {
                if (response) {
                    var cache = new CachingProvider();
                    var loyaltycardnumber = cache.read("loyaltycardnumber");
                    if (loyaltycardnumber) {
                        Backbone.history.navigate('loyaltycards', true);
                    } else {
                        require(['views/LoyaltyCardsLoginPopup'], function (loyaltyCardsLoginPopupView) {
                            var loyaltyPopupView = new loyaltyCardsLoginPopupView({ localize: window.ObjectCollections.Localization.result });
                            $("#main-container").append(loyaltyPopupView.render());

                            $('#loyalty-login-modal').on('shown', function () {
                                _.defer(function () {
                                    $('#loyalty-account-number').focus();
                                });
                            });

                            $('#loyalty-login-modal').modal();

                            $(".container-content").removeClass('hide');

                            require(['jqueryPlaceholder'], function () {
                                $(function () {
                                    $('input, textarea').placeholder();
                                });
                            });
                        });
                    }
                }
            });
        }
    });

    return view;
});
