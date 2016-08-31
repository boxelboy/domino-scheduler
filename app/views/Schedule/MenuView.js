define(function (require) {
    'use strict';

    var Backbone = require('backbone'),
        ViewMenuView = require('app/views/Schedule/Menu/ViewMenuView');

    return Backbone.View.extend({
        className: 'menu',

        initialize: function (options) {
            this.app = options.app;

            this.viewMenu = new ViewMenuView({ app: this.app });
            this.render();
            this.$el.append(this.viewMenu.$el);
        }
    });
});



