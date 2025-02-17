﻿/*
* Globalize Culture en-US
*
* http://github.com/jquery/globalize
*
* Copyright Software Freedom Conservancy, Inc.
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
* This file was generated by the Globalize Culture Generator
* Translation: bugs found in this file need to be fixed in the generator
*/

(function (window, undefined) {

    var Globalize;

    if (typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined") {
        // Assume CommonJS
        Globalize = require("globalize");
    } else {
        // Global variable
        Globalize = window.Globalize;
    }

    Globalize.addCultureInfo("en-US", "default", {
        name: "en-US",
        englishName: "English (United States)",
        calendars: {
            standard: {
                firstDay: 1,
                patterns: {
                    d: "M/d/yyyy",
                    D: "MMMM d, yyyy",
                    t: "h:mm tt",
                    T: "HH:mm:ss",
                    f: "MMMM d, yyyy HH:mm",
                    F: "MMMM d yyyy HH:mm:ss",
                    M: "MMMM d",
                    m: "MMM d",
                    Y: "MMMM yyyy"
                }
            }
        }
    });

    Globalize.addCultureInfo("en-AU", "default", {
        name: "en-AU",
        englishName: "English (Australia)",
        nativeName: "English (Australia)",
        calendars: {
            standard: {
                firstDay: 1,
                patterns: {
                    d: "dd/MM/yyyy",
                    D: "dd MMMM yyyy",
                    t: "HH:mm",
                    T: "HH:mm:ss",
                    f: "dd MMMM yyyy HH:mm",
                    F: "dd MMMM yyyy HH:mm:ss",
                    M: "dd MMMM",
                    m: "d MMM",
                    Y: "MMMM yyyy"
                }
            }
        }
    });

    Globalize.addCultureInfo("en-GB", "default", {
        name: "en-GB",
        englishName: "English (United Kingdom)",
        nativeName: "English (United Kingdom)",
        numberFormat: {
            currency: {
                pattern: ["-$n", "$n"],
                symbol: "£"
            }
        },
        calendars: {
            standard: {
                firstDay: 1,
                patterns: {
                    d: "dd/MM/yyyy",
                    D: "dd MMMM yyyy",
                    t: "HH:mm",
                    T: "HH:mm:ss",
                    f: "dd MMMM yyyy HH:mm",
                    F: "dd MMMM yyyy HH:mm:ss",
                    M: "dd MMMM",
                    m: "d MMM",
                    Y: "MMMM yyyy"
                }
            }
        }
    });

    Globalize.addCultureInfo("en-IN", "default", {
        name: "en-IN",
        englishName: "English (India)",
        nativeName: "English (India)",
        numberFormat: {
            groupSizes: [3, 2],
            percent: {
                groupSizes: [3, 2]
            },
            currency: {
                pattern: ["$ -n", "$ n"],
                groupSizes: [3, 2],
                symbol: "Rs."
            }
        },
        calendars: {
            standard: {
                "/": "-",
                firstDay: 1,
                patterns: {
                    d: "dd-MM-yyyy",
                    D: "dd MMMM yyyy",
                    t: "HH:mm",
                    T: "HH:mm:ss",
                    f: "dd MMMM yyyy HH:mm",
                    F: "dd MMMM yyyy HH:mm:ss",
                    M: "dd MMMM",
                    m: "d MMM"
                }
            }
        }
    });

}(this));
