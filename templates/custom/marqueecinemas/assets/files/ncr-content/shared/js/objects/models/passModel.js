define([], function () {
    window.PassModel = BaseModel.extend({
        url: function () {
            var passslotURI = 'https://api.passslot.com/v1/';

            if (this.id) {
                this.url = passslotURI + 'templates/' + this.id + '/pass';
            } else {
                this.url = passslotURI + 'templates';
            }

            return this.url;
        },

        sendAuthentication: function (xhr) {
            xhr.setRequestHeader('Authorization', appConfig.PassslotAPIKey);
        },

        generatePass: function (successCallback, errorCallback) {
            this.fetch({
                type: 'POST',
                data: JSON.stringify(this.get('passObject')),
                beforeSend: this.sendAuthentication,
                success: function (result) {
                    successCallback(result);
                },
                error: function (err) {
                    if (errorCallback)
                        errorCallback(err);
                }
            });
        },

        updatePass: function (successCallback, errorCallback) {
            this.fetch({
                type: 'PUT',
                data: JSON.stringify(this.get('passObject')),
                url: 'https://api.passslot.com/v1/passes/' + this.get('type') + '/' + this.get('serial') + '/values',
                beforeSend: this.sendAuthentication,
                success: function (result) {
                    successCallback(result);
                },
                error: function (err) {
                    if (errorCallback)
                        errorCallback(err);
                }
            });
        },

        generatePassWithImages: function (successCallback, errorCallback) {
            this.fetch({
                type: 'POST',
                data: this.get('formData'),
                contentType: false,
                processData: false,
                beforeSend: this.sendAuthentication,
                success: function (result) {
                    successCallback(result);
                },
                error: function (err) {
                    if (errorCallback)
                        errorCallback(err);
                }
            });
        },

        getTemplates: function (successCallback, errorCallback) {
            this.fetch({
                beforeSend: this.sendAuthentication,
                success: function (result) {
                    successCallback(result);
                },
                error: function (err) {
                    if (errorCallback)
                        errorCallback(err);
                }
            });
        }
    });

    return window.PassModel;
});