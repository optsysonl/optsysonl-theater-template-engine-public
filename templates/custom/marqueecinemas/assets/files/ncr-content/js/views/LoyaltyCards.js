define(['text!templates/LoyaltyCards.html',
        'sharedhelpers/cachingProvider'
], function (template) {

    var view = Backbone.View.extend({
        template: _.template(template),
        events: {
            'click #btnRemoveLoyalty': 'removeLoyalty'
        },
        render: function () {
            var that = this;
            $(this.el).html(this.template({ model: this.model, localize: that.localize }));

            _.defer(function () {
                $("#state").val(that.model.get('stateProvince').value);
                hidePageLoadingMessage();
            });
            hideZipFilter();
            hideTopNavigation();
        },
        manageAccount: function () {
            window.location.href = '#loyaltycards/profile/' + this.model.CardNumber;
        },

        removeLoyalty: function () {
            var that = this;

            showAlert(that.localize.removeLoyaltyCardDialog, {
                dialogType: true, postBack: function (result) {
                    if (result) {
                        var cache = new CachingProvider();

                        var callback = function (success) {
                            if (success) {
                                $('.ui-dialog').remove();
                                showAlert(that.localize.alertLoyaltyRemoved, {
                                    postBack: function () {
                                        Backbone.history.navigate('', true);
                                    }
                                });
                            }
                        };

                        cache.remove('loyaltycardnumber', callback);
                    } else {
                        return false;
                    }
                }
            });
        },

        initialize: function () {
            this.localize = window.ObjectCollections.Localization.result;
            _.bindAll(this);
         }
    });
    return view;

});
