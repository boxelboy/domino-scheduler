define(function (require) {
    'use strict';

    var Backbone = require('backbone'),
        ResourceCollection = require('app/collections/resources'),
        Category = require('app/models/resource_category'),
        Group = require('app/models/group'),
        Resource = require('app/models/resource'),
        jqueryUI = require('jquery-ui'),
		choosen = require('chosen.jquery'),
        GroupsView,
        CategoriesView,
        ResourcesView;

    GroupsView = Backbone.View.extend({
        tagName: 'optgroup',
        attributes: {
            label: 'Groups'
        },

        initialize: function (options) {
            this.collection = options.collection;

            this.render();
        },

        render: function () {
            this.$el.empty();

            this.collection.each(function (group) {
                this.$el.append('<option value="group-' + group.id + '">' + group.get('name') + '</option>');
            }, this);
        }
    });

    ResourcesView = Backbone.View.extend({
        tagName: 'optgroup',
        attributes: {
            label: 'Resources'
        },

        initialize: function (options) {
            this.collection = options.collection;
            this.app = options.app;
            this.selected = options.selected;
            this.render();
        },

        render: function () {
            this.$el.empty();



            this.collection.each(function (resource) {
            	var selected = "";
            	if(resource.id == this.selected)
            	{
            		selected = "selected";

            		//this.app.trigger('finished');
            		// Once I've found a selected item I want to trigger or some how trigger a event to say hey look iv found something
            	}
                this.$el.append('<option '+selected+' value="resource-' + resource.id + '">' + resource.get('name') + '</option>');
            }, this);
        }
    });

    CategoriesView = Backbone.View.extend({
        tagName: 'optgroup',
        attributes: {
            label: 'Categories'
        },

        initialize: function (options) {
            if (options.label) {
                this.$el.attr('label', options.label);
            }

            this.render();
        },

        render: function () {
            this.$el.empty();

            this.collection.each(function (category) {
                this.$el.append('<option value="category-' + category.id + '">' + category.get('name') + '</option>');
            }, this);
        }
    });

    return Backbone.View.extend({
        template: require('doT!template/scheduler/filter/menu'),

        events: {
            'change': 'changeFilter'
        },

        className : 'filterBox',

        initialize: function (options) {
            this.app = options.app;
            this.resources = new ResourceCollection();
            this.render();
            this.$('select').append('<option value="unassigned">Unassigned</option>');
            this.$('select').append('<option value="all">All resources</option>');
            this.$('select').append(new GroupsView({ collection: this.app.groups }).$el);
            this.$('select').append(new CategoriesView({ collection: this.app.categories }).$el);
            this.$('select').append(new ResourcesView({ collection: this.app.resources, selected: this.app.filterId, app: this.app }).$el);
            this.$("select").chosen({ width: '100%' });

            if(this.app.filterId){
            	this.app.once('finished',  this.changeFilter, this);
            }
        },

        render: function () {
            this.$el.html(this.template());

        },

 		changeFilter: function () {
            var selected = this.$('select').val(), split, filter;
            filter = {
                category: [],
                group: [],
                resource: []
            };

            if (selected == 'all') {
                filter.resource = 'all';
            }

            split = selected.split('-');


            if (split[0] == 'resource') {
                filter.resource.push(split[1]);
            }


            if (split[0] == 'category') {
                filter.category.push(split[1]);
            }

            if (split[0] == 'group') {
                filter.group.push(split[1]);
            }

            this.resources.reset();
            this.app.allResources = false;

            if (filter.resource == 'all') {
            	this.app.allResources = "!";
                this.app.resources.each(_.bind(this.resources.add, this.resources));
            } else {
                _.each(filter.resource, function (id) {
                    this.resources.add(this.app.resources.get(id));
                }, this);
            }

            _.each(filter.category, function (id) {
            	this.addCategory(this.app.categories.get(id));
            }, this);

            _.each(filter.group, function (id) {
                this.addGroup(this.app.groups.get(id));
            }, this);


            this.app.trigger('menu:filter:change', filter, this.resources);
        },

        addCategory: function (category) {
        	 this.app.resources.each(function (resource) {
                if (resource.related('resources:resource_category').url() == category.url()) {
                    this.resources.add(resource);
                }
            }, this);
        },

        addGroup: function (group) {
        	 group.related('groups:group_memberships').each(function (membership) {
                this.app.resources.each(function (resource) {
                    if (membership.related('group_memberships:resource').url() == resource.url()) {
                        this.resources.add(resource);
                    }
                }, this);
            }, this);
        }
    });
});
