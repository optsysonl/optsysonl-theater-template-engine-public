define(['sharedkioskhelpers/utilities'], function () {
    window.UsherCardDecodeModel = BaseModel.extend({
        url: function () {
            return appConfig.UshermanApiUrl + 'CardDecodeRequest/' + appConfig.UshermanAuthId + '/' + this.cardnum;
        },
        initialize: function (arg) {
            if (arg) {
                var util = new Utilities();
                this.cardnum = appConfig.UshermanAuthId ? util.encrypt(arg.cardnum) : arg.cardnum;
            }
        },
        fetch: function (options) {
            var that = this;
            $.ajax({
                type: 'GET',
                url: that.url(),
                dataType: 'text',
                dataFilter: function (data) {
                    return data.split('And');
                },
                success: function (responseMessage) {
                    options.success(responseMessage);
                },
                error: function (errorMessage) {
                    options.error(errorMessage);
                }
            });
        }
    });

    return window.UsherCardDecodeModel;
});