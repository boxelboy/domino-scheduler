var array = window.location.href.split('/'),
	appName = array[4];

require.config({
    baseUrl: '/app/' + appName + '/lib',
    paths: {
        "app": '../app',
        "template": '../template',
        "doTCompiler": '../lib/dot',
        "doT": '../lib/require-dot',
        "underscore": 'underscore',
        "async": '../lib/require-async',
        "jquery.bootstrap": "../lib/jquery/bootstrap-min",
        "jquery-ui": "../lib/jquery/jquery-ui.min",
        "jquery-timepicker": "../lib/jquery/jquery-timepicker",
        'jquery.validate' : '../lib/jquery/jquery-validate',
        'chosen.jquery': '../lib/jquery/chosen.jquery.min',
        'moment': '../lib/moment'
    },
    shim: {
		"jquery.bootstrap": {
        	deps: ["jquery"]
    	},
    	"jquery-ui": {
            exports: "$",
            deps: ['jquery']
        },
        "jquery-timepicker" : {
            deps: ["jquery", "jquery-ui"]
        },
        "chosen.jquery" : {
            deps: ["jquery"]
        },
        "backbone": {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
	    'underscore': {
	        exports: '_'
	    },
        'lz-string': {
            exports: 'LZString'
        },
        'dhtmlxscheduler': {
            deps: ['jquery'],
            exports: 'scheduler'
        },
        'dhtmlxscheduler_active_links': {
            deps: ['dhtmlxscheduler']
        },
        'dhtmlxscheduler_map_view': {
            deps: ['dhtmlxscheduler', 'async!http://maps.google.com/maps/api/js?sensor=false']
        },
        'dhtmlxscheduler_minical': {
            deps: ['dhtmlxscheduler']
        },
        'dhtmlxscheduler_multisection': {
            deps: ['dhtmlxscheduler']
        },
        'dhtmlxscheduler_outerdrag': {
            deps: ['dhtmlxscheduler']
        },
        'dhtmlxscheduler_serialize': {
            deps: ['dhtmlxscheduler']
        },
        'dhtmlxscheduler_timeline': {
            deps: ['dhtmlxscheduler']
        },
        'dhtmlxscheduler_tooltip': {
            deps: ['dhtmlxscheduler']
        },
        'dhtmlxscheduler_units': {
            deps: ['dhtmlxscheduler']
        },
        'dhtmlxscheduler_year_view': {
            deps: ['dhtmlxscheduler']
        },
        'dhtmlxscheduler_mvc': {
            deps: ['dhtmlxscheduler']
        }
    }
});

require(
    [
      'jquery', 'underscore', 'backbone', 'sync', 'app/router', 'app/views/App/AppView'
    ],
    function ($, _, Backbone, Sync, Router, AppView) {

        var app = new AppView();
        app.setRouter(new Router({ app: app }));

        $('body').append(app.$el);

        app.on('ready', function () {
            Backbone.history.start({
            	pushState: true,
            	root: '/app/' + appName + '/'
            });
        });
    }
);
