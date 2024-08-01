define(["helpers/utilities"], function () {
    window.WillCallModel = BaseModel.extend({
        url: function (method, arg) {
            return appConfig.UshermanApiUrl + method + '/' + appConfig.UshermanAuthId + '/' + arg;
        },
        parse: function (resp) {
            return resp;
        },
        getWillCallItems: function (pickupNum, successCallback, errorCallback) {
            var that = this;
            var util = new Utilities();
            that.pickupNum = util.encrypt(pickupNum);

            Backbone.sync('read', that, {
                url: that.url('GetWillCallItems', that.pickupNum),
                dataType: 'json',
                error: function (error) {
                    if (errorCallback)
                        errorCallback(error);
                },
                success: function (result) {
                    if (successCallback)
                        successCallback(result);
                }
            });
        },
        removeItemFromWillCall: function (serial, successCallback, errorCallback) {
            var that = this;
            Backbone.sync('read', that, {
                url: that.url('RemoveItemsFromWillCall', serial),
                dataType: 'text',
                error: function (error) {
                    errorCallback(error);
                },
                success: function (result) {
                    successCallback(result, serial);
                }
            });
        },
        answerConcessionQuestion: function (answer, successCallback, errorCallback) {
            var that = this;
            Backbone.sync('read', that, {
                url: that.url('AnswerAdvanceConcessionsQuestions', answer),
                dataType: 'text',
                error: function (error) {
                    if (errorCallback)
                        errorCallback(error);
                },
                success: function (result) {
                    if (successCallback)
                        successCallback(result, answer);
                }
            });
        }
    });

    return window.WillCallModel;
})