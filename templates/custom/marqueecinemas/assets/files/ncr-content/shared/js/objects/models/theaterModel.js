define(["collections/movieCollection", 'sharedhelpers/errorHelper'], function (MovieCollection) {
    window.TheaterModel = BaseModel.extend({
        idAttribute: "id",

        initialize: function (attributes) {
            this.id = attributes.id; // DO NOT REMOVE
            this.coords = attributes.latitude + "," + attributes.longitude;
            if (!this.movies)
                this.movies = new MovieCollection();
        },

        parse: function (response) {
            if (response.features) {
                this.movies = new MovieCollection(response.features);
                // Required, don't delete.
                delete response.features;
                return response;
            } else if (response.result && response.result.features) {
                this.movies = new MovieCollection(response.result.features);
                // Required, don't delete.
                delete response.result.features;
                return response.result;
            }
            else
                return response;
        },

        getTheater: function (successCallback, errorCallback) {
            this.url = this.RESTUri + 'theaters/' + this.id;
            return this.fetch({
                success: function (result) {
                    successCallback(result);
                },
                error: function (err) {
                    if (errorCallback)
                        errorCallback(err);
                }
            });
        },

        getTheaterSchedule: function (businessDate, successCallback, errorCallback) {
            this.url = this.RESTUri + 'theaters/' + this.id + "/schedule" + (businessDate ? ("/" + businessDate) : "");
            this.fetch({
                success: function (result) {
                    successCallback(result);
                },
                error: function (err) {
                    errorCallback(err);
                    new ErrorHelper().showAlertByErrorCode();
                }
            });
        },

        getTheaterScheduleMobile: function (businessDate, callback) {
            var that = this;
            require(['collections/movieCollection'],
               function (MovieCollection) {

                   // Get complete schedule for a given theater:
                   var movieCollection = new MovieCollection({ theaterId: that.id });
                   movieCollection.url = appConfig.RESTUri + 'theaters/' + that.id + '/schedule/' + businessDate;

                   movieCollection.fetch({
                       success: function () {
                           hidePageLoadingMessage();
                           callback(movieCollection);
                       },
                       error: function () {
                           hidePageLoadingMessage();
                           new ErrorHelper().showAlertByErrorCode();
                       }
                   });
               }

           );
        },
        getFormattedAddress: function () {
            var formattedAddress = '';

            formattedAddress += this.get("addressLine1") + " " + (this.get('addressLine2') ? this.get('addressLine2') + " " : "") + this.get("addressCity") + ", " + this.get("addressState") + " " +
            this.get("addressZip");

            return formattedAddress;
        }
    });

    return window.TheaterModel;
});