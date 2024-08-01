// Require.js allows us to configure shortcut alias
require.config({
    // The shim config allows us to configure dependencies for
    // scripts that do not call define() to register a module
    shim: {
        'underscore': {
            exports: '_'
        },
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'jquerySvg': {
            deps: ['jquery']
        },
        'jquerySvganim': {
            deps: ['jquerySvg']
        },
        'jquerySvgfilter': {
            deps: ['jquerySvg']
        },
        'jqueryGlobalize': {
            deps: ['jquery']
        },
        'jqueryGlobalizeCultures': {
            deps: ['jquery', 'jqueryGlobalize']
        },
        'jquerySprintf': {
            deps: ['jquery']
        },
        'jqueryUI': {
            deps: ['jquery']
        },
        'jqueryPlaceholder': {
            deps: ['jquery']
        },
        'jqueryDotdot': {
            deps: ['jquery']
        },
        'bootstrap': {
            deps: ['jquery']
        },
        'backboneFilter': {
            deps: ['backbone']
        },
        'easyXDM': {
            deps: ['json2']
        },
        'collections': {
            deps: ['config']
        },
        'models': {
            deps: ['config']
        },
        'sharedhelpers/utilities': {
            deps: ['aes']
        }
    },
    waitSeconds: 60,
    paths: {
        jquery: '../shared/js/libs/jquery/jquery.min',
        jqueryValidate: '../shared/js/libs/jquery/jquery.validate.min',
        jqueryGlobalizeCultures: '../shared/js/libs/jquery/globalize/globalize.cultures',
        jqueryGlobalize: '../shared/js/libs/jquery/globalize',
        jqueryUI: '../shared/js/libs/jquery/jquery-ui.min',
        jqueryPlaceholder: '../js/libs/Misc/jQuery.placeholder.min',
        jqueryDotdot: '../js/libs/Misc/jquery.dotdotdot-1.5.6',
        underscore: '../shared/js/libs/underscore/underscore.min',
        backbone: '../shared/js/libs/backbone/backbone.min',
        backboneFilter: '../shared/js/libs/backbone/backbone.routefilter',
        text: '../shared/js/libs/require/text',
        bootstrap: '../js/libs/bootstrap/bootstrap.min',
        facebook: '../shared/js/libs/facebook/facebook_js_sdk',
        bigInt: '../shared/js/RSAEncryption/BigInt',
        barrett: '../shared/js/RSAEncryption/Barrett',
        rsa: '../shared/js/RSAEncryption/RSA',
        aes: '../shared/js/RSAEncryption/aes',
        jquerySvg: '../js/libs/svg/jquery.svg.min',
        jquerySvganim: '../js/libs/svg/jquery.svganim.min',
        jquerySvgfilter: '../js/libs/svg/jquery.svgfilter.min',
        async: '../shared/js/libs/require/async',
        dateFormat: '../shared/js/helpers/date.format',
        dateTimeHelper: '../shared/js/helpers/dateTimeHelper',
        cachingProvider: '../shared/js/helpers/cachingProvider',
        xmlToJson: '../shared/js/helpers/xmlToJson',
        jquerySprintf: '../shared/js/libs/jquery/jquery.sprintf',
        easyXDM: 'libs/easyXDM/easyXDM.min',
        json2: '../shared/js/libs/json/json2',

        /* Paths above are redundant, all resources listed here can be accessed anywhere in the application using the convention e.g. 'collections/theaterCollection'
           where collections is a path.
        */
        libs: 'libs',
        shared: '../shared/js',
        templates: '../templates',
        sharedlibs: '../shared/js/libs',
        sharedhelpers: '../shared/js/helpers',
        helpers: 'helpers',
        collections: '../shared/js/objects/collections',
        models: '../shared/js/objects/models',
        languages: '../shared/js/language',
        views: 'views'
    }
});

require([
    'app',
    'jquery',
    'sharedhelpers/routeHelper',
    'underscore',
    'backbone',
    'bootstrap',
    'backboneFilter',
    'sharedhelpers/JSON.prune',
    'sharedlibs/jquery/jquery.sprintf',
    'collections/baseCollection',
    'models/baseModel'


// Some plugins have to be loaded in order due to their non AMD compliance
// Because these scripts are not "modules" they do not pass any values to the definition function below

], function (App) {
    // The "app" dependency is passed in as "App"
    // Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function

    App.initialize();
});
