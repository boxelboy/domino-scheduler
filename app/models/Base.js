define(['backbone'], function (Backbone) {
    'use strict';

    return Backbone.Model.extend({
    	constructor: function () {
    		this._embedded = {};
    		this._links = {};
    		this._related = {};

    		Backbone.Model.apply(this, arguments);
    	},

        parse: function (response) {
    		this._related = {};

            _.extend(this._embedded, typeof response._embedded == 'object' ? response._embedded : {});
            _.extend(this._links, typeof response._links == 'object' ? response._links : {});

            delete response._embedded;
            delete response._links;

            return response;
        },

        toJSON: function (options) {
            var json = _.clone(this.attributes);

            delete json[this.idAttribute];
            delete json._links;
            delete json._embedded;

            return json;
        },

        url: function () {
        	if (this._links && this._links.self) {
                return this._links.self.href;
            }
            
            if (this.urlRoot) {
                if (this.id) {
                    return this.urlRoot + '/' + this.id;
                } else {
                    return this.urlRoot;
                }
            }

            throw 'Unable to get model URL';
        },

        hasRelated: function (rel) {
            return typeof _.findWhere(_.result(this, 'relations'), { key: rel }) == 'object' && (typeof this._links[rel] !== 'undefined' || typeof this._embedded[rel] !== 'undefined');
        },

        related: function (rel) {
            var model, relation, options = {};

            relation = _.clone(_.findWhere(_.result(this, 'relations'), { key: rel }));

            if (!relation) {
                throw 'Model has no relation named ' + rel;
            }

            if (!this._related[rel]) {
                relation = _.defaults(relation, {collection: false, relatedModel: this.constructor});

                if (relation.collection) {
                    options.model = relation.relatedModel;
                    options.parse = true;

                    if (this._links[rel]) {
                        options.url = this._links[rel].href;
                    }

                    model = [];

                    if (this._embedded[rel]) {
                        _.each(this._embedded[rel], function (embedded) {
                            model.push(new relation.relatedModel(embedded, {parse: true}));
                        });
                    }

                    this._related[rel] = new Backbone.Collection(model, options);
                } else {
                    if (this._embedded[rel]) {
                        model = this._embedded[rel];
                    } else {
                        model = {
                            _links: {
                                self: this._links[rel]
                            }
                        };
                    }

                    this._related[rel] = new relation.relatedModel(model, {parse: true});
                }
            }

            return this._related[rel];
        }
    });
});
