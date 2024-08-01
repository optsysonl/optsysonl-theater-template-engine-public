define(['text!templates/LoyaltyCardsAdd.html',
        'jqueryValidate'
], function (template) {

    var view = Backbone.View.extend({
        el: $("body"),
        template: _.template(template),

        events: {
            "click #btn-manage-account": "manageAccount",
            "click #btn-get-card": "getCard"
        },
        
        initialize: function () {
            _.bindAll(this, "manageAccount", "getCard");

            $("#frm-loyaltycard-add").validate();
        },

        render: function () {
            this.el = this.template();
        },
        
        manageAccount: function () {

            if ($("#frm-loyaltycard-add").valid()) {
                var loyaltycardnumber = $("#loyaltycardnumber").val();

                if (/^\d+$/.test(loyaltycardnumber) == false) {
                    $("#frm-loyaltycard-add").validate().showErrors({ "loyaltycardnumber": "Please enter a valid number." });
                    $("#loyaltycardnumber").focus();
                    return;
                }
                
                var cache = new CachingProvider();
                if (cache.isSupported()) {
                    cache.store("loyaltycardnumber", loyaltycardnumber, 5);
                }

                window.location.href = '#loyaltycards/' + loyaltycardnumber;
            }
            $("#loyaltycardnumber").focus();
        },

        getCard: function () {
            window.location.href = '#loyaltycards/singup';
        }
    });
    return view;

});