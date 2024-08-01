define(['sharedkioskhelpers/utilities'], function () {
    window.WillCallModel = BaseModel.extend({
        url: function (method, arg) {
            return appConfig.UshermanApiUrl + method + '/' + appConfig.UshermanAuthId + '/' + arg;
        },
        parse: function (resp) {
            return resp;
        },
        getWillCallItems: function (args, successCallback, errorCallback) {
            var that = this;
            var allResults = [];
            var requests = [];
            
            _.each(args, function (arg) {
                var util = new Utilities();
                var pickupNum = util.encrypt(arg.pickupNumber);
                var pickupArgs = pickupNum;

                if (arg.expDate) {
                    var expMonth = arg.expDate.substring(2);
                    var expYear = arg.expDate.substring(0, 2);
                    pickupArgs = pickupNum + '/' + expMonth + '/' + expYear;
                }

                requests.push(Backbone.sync('read', that, {
                    url: that.url('GetWillCallItems', pickupArgs),
                    dataType: 'json',
                    error: function(error) {
                        if (errorCallback)
                            errorCallback(error);
                    },
                    success: function (result) {
                        allResults.push(result);
                    }
                }));
            });
            $.when.apply(undefined, requests).then(function () {
                if (successCallback) {
                    successCallback(_.flatten(allResults));
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