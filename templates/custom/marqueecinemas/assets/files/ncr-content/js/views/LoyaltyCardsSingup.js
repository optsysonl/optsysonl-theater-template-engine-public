define(['text!templates/LoyaltyCardsSingup.html',
        'xmlToJson'
], function (template) {

    var view = Backbone.View.extend({
        template: _.template(template),

        events: {
            "click #btn-singup": "singUp",
            "change #PostalCode": "checkZip",
            "change input": "changeData"
        },

        initialize: function () {
            _.bindAll(this, "singUp");

            // NOTE: Additional validation for phone and date. Maybe we can add this on global
            $.validator.addMethod('phone', function (value) {
                return /^[01]?[- .]?\(?[2-9]\d{2}\)?[- .]?\d{3}[- .]?\d{4}$/.test(value);
            }, 'Please enter a valid US phone number.');
            $.validator.addMethod('date', function (value) {
                return /^((0?[1-9]|1[012])[- /.](0?[1-9]|[12][0-9]|3[01])[- /.](19|20)?[0-9]{2})*$/.test(value);
            }, 'Please enter a valid date.');
            $.validator.addClassRules({ phone: { phone: true }, date: { date: true } });

            $("#frm-singup").validate();
        },

        render: function () {
            this.el = this.template({ model: this.model });
            $("#main-container").html(this.el);
        },
        
        changeData: function (event) {
            var target = event.target;
            $("#" + target.id).valid();

            var item = this.model.get(target.id);
            if (item) {
                item.value = target.value;
                this.model.set(item);
            } else {
                this.model.set(target.id, { "name": target.alt, "value": target.value });
            }
        },
        
        singUp: function () {
            if ($("#frm-singup").valid()) {
                this.model.saveCustom();
                showAlert("TODO: This must be tested on real server and handle responces (error, success)");
            }
        },
        
        checkZip: function () {
            $.ajax({
                url: "/start/GetInfoByZIP/" + $("#PostalCode").val(),
                beforeSend: function () {
                    $(".ajax-loader").show();
                },
                complete: function () {
                    $(".ajax-loader").hide();
                },
                success: function (data) {

                    try {
                        var xml = new DOMParser().parseFromString(data, 'text/xml');
                        var json = xmlToJson(xml);

                        $("#State").val(json.NewDataSet.Table.STATE["#text"]);
                        $("#City").val(json.NewDataSet.Table.CITY["#text"]);
                    }
                    catch (err) {
                        $("#State").val("");
                        $("#City").val("");
                    }
                }
            });
        }
        
    });
    return view;

});