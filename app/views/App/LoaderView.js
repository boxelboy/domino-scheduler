define(function (require) {
    'use strict';

    var Backbone = require('backbone'),
        ItemView;

    ItemView = Backbone.View.extend({
        initialize: function (options) {
            this.collection = options.collection;
            this.label = options.label;
            this.data = options.data;
            this.loading = true;

            this.render();

            var promise = this.collection.fetch({ data: this.data });
            promise.progress(_.bind(this.fetchComplete, this));
            promise.done(_.bind(this.fetchComplete, this));
        },

        fetchComplete: function () {
            this.trigger('ready');
        },

        /*
        render: function () {
            this.$el.html(this.template({ label: this.label, loading: this.loading, collection: this.collection }));
        }
        */
    });



    return Backbone.View.extend({
        className: 'loader',
        template: require('text!template/app/loader.html'),

        initialize: function (options) {
        	var array = window.location.href.split('/');
    		this.path = "/app/"+array[4];

            this.app = options.app;
            this.loaded = 0;
            this.expected = 0;

            this.render();
        },

        load: function () {
            this.addItem('Categories', this.app.categories, { sort: 'name', fields: '*,roles.*' });
            this.addItem('Groups', this.app.groups, { sort: 'name', fields: '*,group_memberships.*,group_memberships.resource.*' });
            this.addItem('Resources', this.app.resources, { sort: 'name', fields: '*,resource_category.*,resource_category.roles.*' });
            this.addPreloadItem('Jobs', this.app.jobs, { fields : '*,schedules.*', status : '!Complete'});
            this.addPreloadItem('Clients', this.app.clients, { sort: '', fields: '*,contracts.*' });
        },

        addItem: function (label, collection, data) {
            var itemView = new ItemView({ label: label, collection: collection, data: data });
            this.expected++;
            this.listenTo(itemView, 'ready', this.ready);
            this.$('ul').append(itemView.$el);
        },

        addPreloadItem : function (label, collection, data) {
            var itemView = new ItemView({ label: label, collection: collection, data: data });
            this.$('ul').append(itemView.$el);
        },

        ready: function () {
            this.loaded++;
            if (this.loaded == this.expected) {
                this.trigger('ready');
            }
        },

        render: function () {
        	var compiledTemplate = _.template(this.template);
			this.$el.html(compiledTemplate({path : this.path}));
            return this;
        }
    });
});
