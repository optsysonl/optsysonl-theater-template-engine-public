define(['sharedkioskhelpers/utilities'], function () {
    window.TrackDecodeModel = BaseModel.extend({
        url: function () {
            return appConfig.UshermanApiUrl + 'TrackDecodeRequest/' + appConfig.UshermanAuthId + '/' + this.track1Data + '/' + this.track2Data;
        },
        initialize: function (arg) {
            if (arg) {
                var util = new Utilities();
                this.track1Data = util.encrypt(arg.track1Data || '');
                this.track2Data = util.encrypt(arg.track2Data || '');
            }
        },
        fetch: function (options) {
            var that = this;
            $.ajax({
                type: 'GET',
                url: that.url(),
                converters: {
                    'text json': function (jsonString) {
                        var data = JSON.parse(jsonString);
                        var type = data.CardType.split('And');
                        data.CardType = type;
                        return data;
                    }
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

    return window.TrackDecodeModel;
});