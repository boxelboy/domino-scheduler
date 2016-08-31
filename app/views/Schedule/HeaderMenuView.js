define(function (require) {
    'use strict';

    var Backbone = require('backbone'),
        DateMenuView = require('app/views/Schedule/Menu/DateMenuView'),
        FilterMenuView = require('app/views/Schedule/Menu/FilterMenuView');

    return Backbone.View.extend({
        className: 'headWrapper',

        initialize: function (options) {
            this.app = options.app;
            this.dateMenu = new DateMenuView({ app: this.app });
            this.filterMenu = new FilterMenuView({ app: this.app });
            this.render();
            this.$el.append(this.filterMenu.$el);
            this.$el.append(this.dateMenu.$el);
            
        }
    });
});



