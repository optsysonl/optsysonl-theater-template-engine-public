
define(['sharedjs/RSAEncryption/aes'], function () {

    EncryptionHelper = (function (key) {
        var keyByteArray = [139, 7, 60, 220, 183, 176, 239, 207, 18, 205, 242, 128, 152, 108, 177, 26];
        var ivByteArray = [168, 132, 69, 8, 76, 47, 74, 79, 97, 82, 99, 111, 31, 147, 86, 17];

        var keyBase64String = CryptoJS.enc.Base64.parse(_base64EncArr(keyByteArray));
        var ivBase64String = CryptoJS.enc.Base64.parse(_base64EncArr(ivByteArray));

        function _encrypt(value) {
            var options = {
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
                iv: ivBase64String,
                keySize: 128 / 32,
                blockSize: 128 / 32
            };
            var encodedData = CryptoJS.AES.encrypt(value, keyBase64String, options).toString();

            encodedData = encodedData.replace(/\+/gi, "_");
            encodedData = encodedData.replace(/\//gi, "-");

            return encodedData;
        }

        function _decrypt(value) {
            value = value.replace(/\_/gi, "+");
            value = value.replace(/\-/gi, "/");

            return CryptoJS.AES.decrypt(value, keyBase64String, { iv: ivBase64String }).toString(CryptoJS.enc.Utf8);
        }

        function _uint6ToB64(nUint6) {
            return nUint6 < 26 ? nUint6 + 65 : nUint6 < 52 ? nUint6 + 71 : nUint6 < 62 ? nUint6 - 4 : nUint6 === 62 ? 43 : nUint6 === 63 ? 47 : 65;
        }

        function _base64EncArr(aBytes) {
            var nMod3, sB64Enc = "";

            for (var nLen = aBytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
                nMod3 = nIdx % 3;
                if (nIdx > 0 && (nIdx * 4 / 3) % 76 === 0) {
                    sB64Enc += "\r\n";
                }
                nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24);
                if (nMod3 === 2 || aBytes.length - nIdx === 1) {
                    sB64Enc += String.fromCharCode(_uint6ToB64(nUint24 >>> 18 & 63), _uint6ToB64(nUint24 >>> 12 & 63), _uint6ToB64(nUint24 >>> 6 & 63), _uint6ToB64(nUint24 & 63));
                    nUint24 = 0;
                }
            }

            return sB64Enc.replace(/A(?=A$|$)/g, "=");
        }
        function _capitalize(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
        function _createGuid() {
            var rNumber = function () {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            };
            return (rNumber() + rNumber() + '-' + rNumber() + '-' + rNumber() + '-' + rNumber() + '-' + rNumber() + rNumber() + rNumber());
        }
        return {
            encrypt: _encrypt,
            decrypt: _decrypt,
            capitalize: _capitalize,
            createGuid: _createGuid
        };
    });
})