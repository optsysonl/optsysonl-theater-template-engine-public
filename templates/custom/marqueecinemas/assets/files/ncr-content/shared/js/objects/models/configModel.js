define([], function () {
    window.ConfigModel = BaseModel.extend({
        url: function () {
            return appConfig.UshermanApiUrl + 'GetConfig/' + appConfig.UshermanAuthId;
        }
    });

    return window.ConfigModel;
})