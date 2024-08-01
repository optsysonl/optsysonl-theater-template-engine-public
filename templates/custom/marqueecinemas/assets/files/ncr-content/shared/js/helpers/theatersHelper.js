
define([
	'sharedhelpers/storageProvider'
], function () {

    TheatersHelper = (function () {
        var storage = new StorageProvider();
        var theaterKey = 'TheaterDefaultId';

        function saveTheaterDefaultId(value) {
            storage.store(theaterKey, value);
        }

        function getTheaterDefaultId(callback) {
            storage.read(theaterKey, function (value) {
                callback(value);
            });
        }        
      
        return {
            saveTheaterDefaultId: saveTheaterDefaultId,
            getTheaterDefaultId: getTheaterDefaultId
        };
    });
})