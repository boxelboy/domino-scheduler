define(function (require) {
    'use strict';

    var Backbone = require('backbone'),
        HeaderView = require('app/views/App/HeaderView'),
        LoaderView = require('app/views/App/LoaderView'),
        CategoryCollection = require('app/collections/resource_categories'),
        GroupCollection = require('app/collections/groups'),
        ResourceCollection = require('app/collections/resources'),
        ClientsCollection = require('app/collections/clients'),
        JobsCollection = require('app/collections/jobs');

    return Backbone.View.extend({
        el: 'body',
        template: require('doT!template/app/app'),

   		initialize: function () {
            this.categories = new CategoryCollection();
            this.groups = new GroupCollection();
            this.resources = new ResourceCollection();
            this.clients = new ClientsCollection();
            this.jobs = new JobsCollection();

            this.render();

            this.loader = new LoaderView({ app: this });


            this.$el.append(this.loader.$el);

            this.listenTo(this.loader, 'ready', this.ready);

            this.loader.load();
        },

        ready: function () {
            this.loader.remove();
            this.trigger('ready');
        },


        setRouter: function (router) {
            this.router = router;
        },

        setView: function (view, url) {
            this.$('#app_content').empty().append(view.$el);
            if (url && this.router) {
                this.router.navigate(url);
            }
        },

        setNavigation : function(view, url){
        	this.$('#app_navigation').empty().append(view.$el);
            if (url && this.router) {
                this.router.navigate(url);
            }

        },

       setSearch : function(view, url){
        	this.$('.topBlock').empty().append(view.$el);
            if (url && this.router) {
                this.router.navigate(url);
            }

        },

        setHeader : function(view, url){
        	this.$('.outerBlock').empty().append(view.$el);
            if (url && this.router) {
                this.router.navigate(url);
            }

        },

        render: function () {
            this.$el.html(this.template());
            return this;
        }
    });
});
