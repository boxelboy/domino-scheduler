define(function (require) {
    'use strict';

    var Backbone = require('backbone'),
        self,
        array = window.location.href.split('/'),
        routes = {};

	routes['view'] = 'scheduler';
	routes['view/:view'] = 'scheduler';
	routes['view/:view/:type'] = 'schedulerType';
	routes['view/:view/:type/:filterId'] = 'schedulerTypeResource';
	routes['view/:view/:type/:filterId/:contactId/:clientcontactId'] = 'schedulerAddContact';

    return Backbone.Router.extend({
        initialize: function (options){
            self = this;
            this.app = options.app;
        },

        routes: routes,

        schedulerAddContact: function(view, type, filterId, contactId, clientcontactId)
        {
        	if(view)
        	{
        		this.app.baseView = view;
        	}else{
        		this.app.baseView = "month";
        	}

        	if(!isNaN(filterId)){
        		this.app.filterId = filterId;
        	}

        	//Contact ID can be a string, filemaker weridness
        	if(contactId){
        		this.app.contactId = contactId;
        		this.app.clientcontactId = clientcontactId;
        	}

        	require(['app/views/Schedule/LayoutView', 'app/views/Schedule/MenuView', 'app/views/Schedule/HeaderMenuView', 'app/views/Schedule/SearchMenuView'], function (LayoutView, LayoutMenuView, HeaderMenuView, SearchMenuView) {

                var scheduler = new LayoutView({ app: self.app });
                var menu = new LayoutMenuView({ app: self.app });
                var header = new HeaderMenuView({ app: self.app });
                var search = new SearchMenuView({ app: self.app });
                self.app.setView(scheduler);
                self.app.setNavigation(menu);
                self.app.setHeader(header);
                self.app.setSearch(search);
                scheduler.start();
            });
        },

        schedulerTypeResource : function (view, type, filterId)
        {
        	if(view)
        	{
        		this.app.baseView = view;
        	}else{
        		this.app.baseView = "month";
        	}

        	if(type)
        	{
        		if(type == "jobs")
        		{
        			this.app.scheduleType = type;
        		}
        	}
        	if(filterId){
        		this.app.filterId = filterId;
        	}
        	require(['app/views/Schedule/LayoutView', 'app/views/Schedule/MenuView', 'app/views/Schedule/HeaderMenuView', 'app/views/Schedule/SearchMenuView'], function (LayoutView, LayoutMenuView, HeaderMenuView, SearchMenuView) {

                var scheduler = new LayoutView({ app: self.app });
                var menu = new LayoutMenuView({ app: self.app });
                var header = new HeaderMenuView({ app: self.app });
                var search = new SearchMenuView({ app: self.app });
                self.app.setView(scheduler);
                self.app.setNavigation(menu);
                self.app.setHeader(header);
                self.app.setSearch(search);
                scheduler.start();
            });
        },
        schedulerType: function(view, type){
        	if(view)
        	{
        		this.app.baseView = view;
        	}else{
        		this.app.baseView = "month";
        	}

        	if(type)
        	{
        		if(type == "jobs")
        		{
        			this.app.scheduleType = type;
        		}
        	}
            require(['app/views/Schedule/LayoutView', 'app/views/Schedule/MenuView', 'app/views/Schedule/HeaderMenuView', 'app/views/Schedule/SearchMenuView'], function (LayoutView, LayoutMenuView, HeaderMenuView, SearchMenuView) {

                var scheduler = new LayoutView({ app: self.app });
                var menu = new LayoutMenuView({ app: self.app });
                var header = new HeaderMenuView({ app: self.app });
                var search = new SearchMenuView({ app: self.app });
                self.app.setView(scheduler);
                self.app.setNavigation(menu);
                self.app.setHeader(header);
                self.app.setSearch(search);
                scheduler.start();
            });

        },
        scheduler: function (view) {
        	if(view)
        	{
        		this.app.baseView = view;
        	}else{
        		this.app.baseView = "month";
        	}

            require(['app/views/Schedule/LayoutView', 'app/views/Schedule/MenuView', 'app/views/Schedule/HeaderMenuView', 'app/views/Schedule/SearchMenuView'], function (LayoutView, LayoutMenuView, HeaderMenuView, SearchMenuView) {

                var scheduler = new LayoutView({ app: self.app });
                var menu = new LayoutMenuView({ app: self.app });
                var header = new HeaderMenuView({ app: self.app });
                var search = new SearchMenuView({ app: self.app });
                self.app.setView(scheduler);
                self.app.setNavigation(menu);
                self.app.setHeader(header);
                self.app.setSearch(search);
                scheduler.start();
            });
        }
    });
});
