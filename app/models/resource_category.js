define(['require', 'app/models/Base', 'app/models/role'], function (require, Base) {
    'use strict';
    return Base.extend({
        urlRoot: '/api/BusinessMan/resource_categories',

        relations: function ()
		{
			return [
			{
				key: 'resource_categories:roles',
				relatedModel: require('app/models/role'),
				collection: true
			}];
		}
    });
});