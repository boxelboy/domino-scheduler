define(function (require) {
    'use strict';

    var Backbone = require('backbone'),
        ViewMenuItemView;

    ViewMenuItemView = Backbone.View.extend({
        tagName: 'li',
        className: 'view_menu_item',
        template: require('doT!template/scheduler/menu/view_item'),

        events: {
            'click'		: 'changeView',
        },

        initialize: function (options) {
            this.label = options.label;
            this.view = options.view;
            this.menu = options.menu;
            this.currentView = options.currentView;

            switch(this.view){
            	case 'unit':
            	case 'timeline':
            		this.disabled = true;
            		break;
            }

            this.active = false;

            this.render();

            this.listenTo(this.menu.app, 'scheduler:view:change', this.onViewChange);
            this.listenTo(this.menu.app, 'scheduler:filter:change', this.onFilterChange);
        },

        onViewChange: function (view, filter, resources) {
            this.active = view == this.view;
            this.render();
        },

        onFilterChange: function (filter, resources) {
            this.disabled = ((this.view == 'unit' || this.view == 'timeline') && !resources.size());
            this.render();
        },

        subViewOut : function ()
        {
        	this.$el.find('.customFilters').remove();
        },

        render: function () {
            this.$el.html(this.template({ label: this.label, view: this.menu, disabled: this.disabled, active: this.active }));

        },

        changeView: function () {
        	var self = this;
            if (!this.active && !this.disabled) {
                this.menu.app.trigger('menu:view:change', this.view);
            }

            if(this.view == "timeline")
        	{
        		if($('.filterTimeLine').length === 0){
        			$('.menu').append('<div class="filterTimeLine"> <div data-timeline="1" class="btn btn-warning"> 1 Day</div>  <div data-timeline="7"  class="btn btn-warning"> 7 Days</div>  <div data-timeline="14"  class="btn btn-warning"> 14 Days</div>  <div data-timeline="1m"  class="btn btn-warning"> 1 Month</div> </div>');
	            	$('.filterTimeLine .btn').click(function (button){
	            		self.menu.app.trigger('scheduler:filter:timeLineClick', $(this).data('timeline'));
	            	});
        		}

        	}else{
        		$('.filterTimeLine').remove();
        	}

        }
    });

    return Backbone.View.extend({
        tagName: 'ul',
        className: 'view_menu',

        initialize: function (options) {
            this.app = options.app;
            this.render();

            this.addItem('Day', 'day');
            this.addItem('Week', 'week');
            this.addItem('Month', 'month');
            this.addItem('Year', 'year');
            this.addItem('Timeline', 'timeline');
            this.addItem('Resource', 'unit');
            var self = this;

            if(this.app.baseView == "timeline"){
    			this.$el.append('<div class="filterTimeLine"> <div data-timeline="1" class="btn btn-warning"> 1 Day</div>  <div data-timeline="7"  class="btn btn-warning"> 7 Days</div>  <div data-timeline="14"  class="btn btn-warning"> 14 Days</div>  <div data-timeline="1m"  class="btn btn-warning"> 1 Month</div> </div>');
           		this.$('.filterTimeLine .btn').click(function (button){
	            	self.app.trigger('scheduler:filter:timeLineClick', $(this).data('timeline'));
	            });
            }
            this.listenTo(this.app, 'clickTimeLine', this.clickTimeLine);
        },

        clickTimeLine : function ()
        {
            $('a.Timeline').click();
        },

        addItem: function (label, view) {
            this.$el.append(new ViewMenuItemView({ menu: this, label: label, view: view }).$el);
        }
    });
});
