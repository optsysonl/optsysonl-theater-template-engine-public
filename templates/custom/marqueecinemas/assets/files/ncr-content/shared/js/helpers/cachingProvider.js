/* 
 * Caching data by utilizing Web Storage feature of modern browsers. 
 *
 * Created: 10/18/2012.
 * Last updated: 10/19/2012.
 */

(function () {
    /*
    * Initializes a new instance of CachingProvider object.
    * 
    * Options:
    *  defaultDuration (optional) : Tells how long items will be alive in our cache (in minutes). Usefull mainly to help developers so they don't
    *                               have to specify duration with every "store" method call. Default is 5.
    *  itemsPrefix (optional)     : As our data is stored in browser's localStorage object, we will use this to distinguish cache 
    *                               items from other items developers may want to store in localStorage object. Default is 'ncr_cache'.
    *  beSilent (optional)        : Tells CacheProvider to surpress every exception that might get thrown. Default is true.
    *  
    */
    CachingProvider = function (params) {
        // Defaults first
        this.defaultDuration = 5;               // Default cache item duration in minutes.
        this.itemsPrefix = 'ncr_cache_';        // Specifying storage prefix for items (used and managed internally).
        this.beSilent = true;                   // Do not allow throwing any exceptions.
        this.garbageCollectorInterval = 30;     // How often the internal "garbage collector" will get fired to clean expired items (in seconds).
        this.disableGarbageCollector = false;   // You may want to turn the gargage collector stuff off?
        this.itemRemovedCallback = null;        // User may specify callback that will be called when garbage collector detects and removes expired item

       /*
    * Checks if localStorage is supported by UserAgent.
    */
        this.isSupported = function () {
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
        
        this.read = function (name, expirationCallback) {
            // Check if loading is possible, and proceed if it is.
            if (!this.isSupported())
                return false;
            
            try {
                // Combine prefix and name to create unique key for accessing item.
                var fullName = this.itemsPrefix + name;

                // Load item from storage that's been stored as a JSON string.
                var jsonifiedObject = localStorage[fullName];

                // This item does not exist anymore, or has never been stored previously.
                if (jsonifiedObject == null)
                    return null;

                // Parse JSON string into object.
                var object = JSON.parse(jsonifiedObject);

                // Check if item has expired, and if is, remove it from localStorage, and return null. Optionally,
                // if user has specified to do so, execute user's callback method he provided through args.
                if (this.hasExpired(object)) {
                    localStorage.removeItem(fullName);

                    // If user has specified callback method, execute it
                    if (typeof (expirationCallback) !== 'undefined')
                        expirationCallback(name); // We will pass a name of cache item through params, so user can make decisions accordingly.

                    return null;
                }
                // Return data
                return object.data;
            } catch (e) {
                
            }
        };

        /*
    * Checks if cached item has expired. Developers do not need to use this, unless they really want to...
    * 
    * Arguments:
    *  item : Cache Item object to verify for expiration.
    */
        this.hasExpired = function (item) {
            try {
                // Parse the date
                var expirationDate = new Date(Date.parse(item.storageDate));

                // Return expiration check - true in case item has expired
                return expirationDate < (new Date());
            } catch (e) {
            }
        };

        // Needed by garbageCollector...
        var outsideWorld = this;

        /*
        * Goes through items and check for expired ones... I don't want this to be accessed from the
        * "outside", so I decided to make it "private"...
        */
        var garbageCollector = function () {
            // Check if localStorage is supported
            if (!outsideWorld.isSupported())
                return false;

            try {
                // Clear only keys that were created by Caching Provider
                for (var key in localStorage) {
                    // We found our key...
                    if (key.indexOf(outsideWorld.itemsPrefix) == 0) {
                        // Now check if it has expired
                        var jsonifiedObject = localStorage[key];

                        // Parse JSON string into object.
                        var object = JSON.parse(jsonifiedObject);

                        // If item has expired, remove it from cache.
                        if (outsideWorld.hasExpired(object)) {
                            localStorage.removeItem(key);

                            // If user has specified callback method, execute it passing a key of removed item via params.
                            if (typeof (outsideWorld.itemRemovedCallback) !== 'undefined')
                                outsideWorld.itemRemovedCallback(key.replace(outsideWorld.itemsPrefix, ''));
                        }
                    }
                }
            } catch (e) {
            }
        };

        // Fire up a garbage collector
        setInterval(garbageCollector, this.garbageCollectorInterval * 1000);

        // Read and preserve options if any
        if (params == null)
            return this;

        if (typeof (params.defaultDuration) !== 'undefined')
            this.defaultDuration = params.defaultDuration;
        if (typeof (params.itemsPrefix) !== 'undefined')
            this.itemsPrefix = params.itemsPrefix;
        if (typeof (params.beSilent) !== 'undefined')
            this.beSilent = params.beSilent;
        if (typeof (params.garbageCollectorInterval) !== 'undefined')
            this.garbageCollectorInterval = params.garbageCollectorInterval;
        if (typeof (params.disableGarbageCollector) !== 'undefined')
            this.disableGarbageCollector = params.disableGarbageCollector;
        if (typeof (params.itemRemovedCallback) !== 'undefined')
            this.itemRemovedCallback = params.itemRemovedCallback;
    };

    /*
    * Clear cache items that were ever created by using Caching Provider.
    */
    CachingProvider.prototype.empty = function () {
        // Check if localStorage is supported
        if (!this.isSupported())
            return false;

        try {
            // Clear only keys that were created by Caching Provider
            for (var key in localStorage) {
                // We found our key...
                if (key.indexOf(this.itemsPrefix) == 0) {
                    localStorage.removeItem(key);
                }
            }
        } catch (e) {
        }
    };

    

    /*
    * Stores a new object into the Cache.
    * 
    * Arguments:
    *  name                : Name of object we want to store. Old one will be overwritten if exists.
    *  data                : Actual object we want to store into cache. It will be stringified in case it's not a string.
    *  duration (optional) : Tells how long this item will be held in cache (in minutes).
    */
    CachingProvider.prototype.store = function (name, data, duration) {
        // Check if storing is possible, and proceed if it is.
        if (!this.isSupported())
            return false;

        try {
            // This object will hold data and duration info for item we want to cache.
            var storageObject = {};
            storageObject.data = data;

            // Store duration info for this item.
            storageObject.duration = this.defaultDuration;
            if (typeof (duration) !== 'undefined') {
                storageObject.duration = duration;
            }

            // Store the date when item has been saved to cache.
            storageObject.storageDate = new Date();
            storageObject.storageDate.setMinutes(storageObject.storageDate.getMinutes() + storageObject.duration);

            // Serialize object to JSON string (because localStorage accepts only strings).
            var jsonStorageObject = JSON.stringify(storageObject);

            // Store this into localStorage.
            localStorage[this.itemsPrefix + name] = jsonStorageObject;

            // Item has been successfully saved.
            return true;
        } catch (e) {
        }
    };

    CachingProvider.prototype.remove = function(name, callback){
        if (!this.isSupported())
            return false;
        try{
            var fullName = this.itemsPrefix + name;
            if (localStorage.getItem(fullName)) {
                localStorage.removeItem(fullName);
                if (callback)
                    callback(true);
            }
        }
        catch (e){
            if (callback)
                callback(false);
        }
    };
}).call(this);