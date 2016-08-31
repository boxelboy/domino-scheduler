define(function (require) {
    'use strict';

    var Backbone = require('backbone'),
        PreviousView,
        CurrentWeekView,
        NextView;

    PreviousView = Backbone.View.extend({
        tagName: 'li',
        className: 'date_menu_item',
        template: require('doT!template/scheduler/menu/date_previous'),

        events: {
            'click': 'previousDate'
        },

        initialize: function (options) {
            this.app = options.app;

            this.render();
        },

        render: function () {
            this.$el.html(this.template());
        },

        previousDate: function () {
            this.app.trigger('menu:date:previous');
        }
    });



    NextView = Backbone.View.extend({
        tagName: 'li',
        className: 'date_menu_item',
        template: require('doT!template/scheduler/menu/date_next'),

        events: {
            'click': 'nextDate'
        },

        initialize: function (options) {
            this.app = options.app;

            this.render();
        },

        render: function () {
            this.$el.html(this.template());
        },

        nextDate: function () {
            this.app.trigger('menu:date:next');
        }
    });


    CurrentWeekView = Backbone.View.extend({
        tagName: 'li',
        className: 'date_menu_item',
        template: require('doT!template/scheduler/menu/current_week'),

        events: {
            'click': 'currentWeek'
        },

        initialize: function (options) {
            this.app = options.app;

            this.render();
        },

        render: function () {
            this.$el.html(this.template());
        },

        currentWeek: function () {
            this.app.trigger('menu:trigger:thisweek');
        }
    });

    return Backbone.View.extend({
        tagName: 'ul',
        className: 'date_menu',

        initialize: function (options) {
            this.app = options.app;

            this.render();

            this.$el.append(new PreviousView({ app: this.app }).$el);
            this.$el.append(new NextView({ app: this.app }).$el);
            this.$el.append(new CurrentWeekView({ app: this.app }).$el);
        }
    });
});
