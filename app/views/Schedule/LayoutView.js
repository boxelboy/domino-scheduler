define(function (require) {
    'use strict';

    var Backbone = require('backbone'),
        SchedulerView = require('app/views/Schedule/SchedulerView'),
        MenuView = require('app/views/Schedule/MenuView');

    return Backbone.View.extend({
        className: 'scheduler_container',

        initialize: function (options) {
            this.app = options.app;
            this.scheduler = new SchedulerView({ app: this.app });
            this.render();
        },

        render: function () {
            this.$el.append(this.scheduler.$el);
        },

        start: function () {
            this.scheduler.start();
        }
    });
});
