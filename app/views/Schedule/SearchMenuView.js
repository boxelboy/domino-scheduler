define(function (require) {
    'use strict';

    var Backbone = require('backbone');

    return Backbone.View.extend({
        tagName: 'li',
        className: 'date_menu_item',
        template: require('doT!template/scheduler/menu/search'),

        events: {
            "keyup input": "update"
        },

        initialize: function (options) {
            this.app = options.app;
            this.render();
        },

        render: function () {
            this.$el.html(this.template());
        },

        update: function (event) {
        	if(event.keyCode == 13){
        		event.preventDefault();
				var id = $(event.currentTarget).val();
				if(id){
					this.app.trigger('menu:job:change', id);
				}else{
					this.app.trigger('menu:job:change', false);
				}
			}
        }
    });
});
