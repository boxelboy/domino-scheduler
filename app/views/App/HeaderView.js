define(function (require) {
    'use strict';

    var Backbone = require('backbone');

    return Backbone.View.extend({
        template: require('doT!template/app/header'),

        initialize: function (options) {
            this.app = options.app;

            this.render();
        },

        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });
});
