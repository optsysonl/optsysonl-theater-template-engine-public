// JSON.prune : a function to stringify any object without overflow
// example : var json = JSON.prune(window)
// two additional optional parameters :
//   - the maximal depth (default : 6)
//   - the maximal length of arrays (default : 50)
// Web site : http://dystroy.org/JSON.prune/
// JSON.prune on github : https://github.com/Canop/JSON.prune
// This was discussed here : http://stackoverflow.com/q/13861254/263525
// The code is based on Douglas Crockford's code : https://github.com/douglascrockford/JSON-js/blob/master/json2.js
(function () {
    'use strict';

	var DEFAULT_MAX_DEPTH = 6;
	var DEFAULT_ARRAY_MAX_LENGTH = 50;
	var seen; // Same variable used for all stringifications

	Date.prototype.toPrunedJSON = Date.prototype.toJSON;
	String.prototype.toPrunedJSON = String.prototype.toJSON;

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        };

    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }

    function str(key, holder, depthDecr, arrayMaxLength) {
        var i, k, v, length, partial, value = holder[key];
        if (value && typeof value === 'object' && typeof value.toPrunedJSON === 'function') {
            value = value.toPrunedJSON(key);
        }

        switch (typeof value) {
        case 'string':
            return quote(value);
        case 'number':
            return isFinite(value) ? String(value) : 'null';
        case 'boolean':
        case 'null':
            return String(value);
        case 'object':
            if (!value) {
                return 'null';
            }
            if (depthDecr<=0 || seen.indexOf(value)!==-1) {
				return '"-pruned-"';
			}
			seen.push(value);
            partial = [];
            if (Object.prototype.toString.apply(value) === '[object Array]') {
                length = Math.min(value.length, arrayMaxLength);
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value, depthDecr-1, arrayMaxLength) || 'null';
                }
                return  partial.length ? '[' + partial.join(',') + ']' : '[]';
            }
			for (k in value) {
				if (Object.prototype.hasOwnProperty.call(value, k)) {
					try {
						v = str(k, value, depthDecr-1, arrayMaxLength);
						if (v) partial.push(quote(k) + ':' + v);
					} catch (e) { 
						// this try/catch due to forbidden accessors on some objects
					}
				}
			}
            return partial.length ? '{' + partial.join(',') + '}' : '{}';
        }
    }

    var JSON = JSON || {};
	JSON.prune = function (value, depthDecr, arrayMaxLength) {
		seen = [];
        depthDecr = depthDecr || DEFAULT_MAX_DEPTH;
        arrayMaxLength = arrayMaxLength || DEFAULT_ARRAY_MAX_LENGTH;
		return str('', {'': value}, depthDecr, arrayMaxLength);
    };


    JSON.prune.log = function() {
        console.log.apply(console, Array.prototype.slice.call(arguments).map(function (v) { return JSON.parse(JSON.prune(v)); }));
    };

}());
