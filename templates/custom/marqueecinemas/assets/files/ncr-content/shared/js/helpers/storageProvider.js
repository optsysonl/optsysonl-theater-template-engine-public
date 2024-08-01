/* 
* Provides functions for permanent data storage (platform independent).
*
* Created: 10/21/2012.
* Last updated: 10/23/2012.
*/

(function () {
    /*
    * Initializes a new instance of StorageProvider object.
    * 
    * Options:
    *  useLocalStorage (optional) : Tells whether the localStorage should be used for storing data.
    *  itemsPrefix (optional)     : Used to distinguish StorageProvider's items from the others (used only when useLocalStorage = true).
    *  
    */
    StorageProvider = function () {
        this.provider = new LocalStorageProvider();
        if (!this.provider.isSupported())
            this.provider = null;

    };

    /*
    * Stores a value by using primary storage provider object, or if told to do so, store using all available providers.
    */
    StorageProvider.prototype.store = function (key, value) {
        return this.provider.store(key, value);
    };

    /*
    * Stores a value by using primary storage provider object, or if told to do so, store using all available providers. Uses JSON.prune instead JSON.stringify method to serialize. 
    */
    StorageProvider.prototype.storep = function (key, value) {
        return this.provider.storep(key, value);
    };


    /*
    * Reads a value by using active storage provider object.
    */
    StorageProvider.prototype.read = function (key, loadedCallback) {
        return this.provider.read(key, loadedCallback);
    };

    /*
    * Deletes a value by using active storage provider object.
    */
    StorageProvider.prototype.remove = function (key) {
        return this.provider.remove(key);
    };

    /*
    * Clear Web Storage items that were ever created by using LocalStorage Provider.
    */
    StorageProvider.prototype.clear = function () {
        return this.provider.clear();
    };

    /*
    * Provides store, read, delete, isSupported methods for working with Web Storage (localStorage).
    */
    (function () {
        /*
        * Initializes a new instance of LocalStorageProvider object.
        */
        LocalStorageProvider = function () {
            this.itemsPrefix = 'ncr_storageProvider_';          // Items prefix that will be appended to key names (managed internally).
            this.providerName = 'LocalStorage';                 // Used to identify itself to the caller.
        };

        /*
        * Checks if localStorage is supported by UserAgent.
        */
        LocalStorageProvider.prototype.isSupported = function () {
            try {
                // Try to store some value.
                localStorage.isSupportedTest = 'Y';

                // If execution gets to this point, localStorage object is present. We need to remove the dummy value.
                localStorage.removeItem('isSupportedTest');

                // Signal that localStorage is supported.
                return true;
            } catch (e) {
                // It seems that localStorage is not supported.
                return false;
            }
        };

        /*
        * Clear Web Storage items that were ever created by using LocalStorage Provider.
        */
        LocalStorageProvider.prototype.clear = function () {
            try {
                localStorage.clear();
            } catch (e) {
            }
        };

        /*
        * Removes a key from Web Storage.
        *
        * Arguments:
        *  key                 : Name of object we want to remove.
        */
        LocalStorageProvider.prototype.remove = function (key) {
            try {
                localStorage.removeItem(this.itemsPrefix + key);

                // Deleted.
                return true;
            }
            catch (e) {
                // Something failed, not deleted.
                return false;
            }
        };

        /*
        * Stores a new object (or modifies existing) into the Web Storage.
        * 
        * Arguments:
        *  key                 : Name of object we want to store. Old one will be overwritten if exists.
        *  value               : Actual object we want to store into Web Storage. It will be stringified in case it's not a string.
        */
        LocalStorageProvider.prototype.store = function (key, value) {
            try {
                // Serialize object to JSON string (because localStorage accepts only strings).
                var jsonStorageObject = JSON.stringify(value);

                // Store this into localStorage.
                localStorage[this.itemsPrefix + key] = jsonStorageObject;

                // Item has been successfully saved.
                return true;
            } catch (e) {
                return false;
            }
        };
        /*
        * Stores a new object (or modifies existing) into the Web Storage.
        * 
        * Arguments:
        *  key                 : Name of object we want to store. Old one will be overwritten if exists.
        *  value               : Actual object we want to store into Web Storage. It will be stringified in case it's not a string.
        */
        LocalStorageProvider.prototype.storep = function (key, value) {
            try {
                // Serialize object to JSON string (because localStorage accepts only strings).
                var jsonStorageObject = JSON.prune(value);

                // Store this into localStorage.
                localStorage[this.itemsPrefix + key] = jsonStorageObject;

                // Item has been successfully saved.
                return true;
            } catch (e) {
                return false;
            }
        };


        /*
        * Loads an object from Web Storage (if exists).
        * 
        * Arguments:
        *  key                : Key that we want to retrieve.
        */
        LocalStorageProvider.prototype.read = function (key, loadedCallback) {
            try {
                // Combine prefix and name to create unique key for accessing item.
                var fullName = this.itemsPrefix + key;

                // Load item from storage that's been stored as a JSON string.
                var jsonifiedObject = localStorage[fullName];

                // This item does not exist anymore, or has never been stored previously.
                if (jsonifiedObject == null) {
                    if (typeof (loadedCallback) !== 'undefined')
                        loadedCallback(null);
                }

                // Parse JSON string into object and tell callback we're done.
                if (typeof (loadedCallback) !== 'undefined') {
                    loadedCallback(JSON.parse(jsonifiedObject), this.providerName);
                }
            } catch (e) {
                return false;
            }
        };

    }).call(this);
}).call(this);