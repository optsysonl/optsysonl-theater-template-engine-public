Utilities = (function (key) {

    if (!key)
        key = "12e8da920d4599458e84ec5e";

    function encrypt(value) {
        return CryptoJS.AES.encrypt(value, key).toString();
    }

    function decrypt(value) {
        return CryptoJS.AES.decrypt(value, key).toString(CryptoJS.enc.Utf8);
    }

    function randomUUID() {
        var s = [], itoh = '0123456789ABCDEF';

        // Make array of random hex digits. The UUID only has 32 digits in it, but we
        // allocate an extra items to make room for the '-'s we'll be inserting.
        for (var i = 0; i < 36; i++) s[i] = Math.floor(Math.random() * 0x10);

        // Conform to RFC-4122, section 4.4
        s[14] = 4;  // Set 4 high bits of time_high field to version
        s[19] = (s[19] & 0x3) | 0x8;  // Specify 2 high bits of clock sequence

        // Convert to hex chars
        for (var i = 0; i < 36; i++) s[i] = itoh[s[i]];

        // Insert '-'s
        s[8] = s[13] = s[18] = s[23] = '-';

        return s.join('');
    }
    
    function capitalize (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function capitalizeAfterHyphen(string) {
        var value = "";
        _.each(string.split('-'), function (str) {
            value += capitalize(str) + "-";
        });

        return value.slice(0, -1);
    }

    //Returns a random number between min (inclusive) and max (exclusive)
    function random(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    return {
        encrypt: encrypt,
        decrypt: decrypt,
        randomUUID: randomUUID,
        capitalize: capitalize,
        capitalizeAfterHyphen:capitalizeAfterHyphen,
        random: random
    };
});
