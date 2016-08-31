define(['require', 'app/models/Base', 'app/models/resource_category'], function (require, Base) {
    'use strict';
    return Base.extend({
        urlRoot: '/api/BusinessMan/roles',

        relations: function ()
		{
			return [
			{
				key: 'roles:resource_category',
				relatedModel: require('app/models/resource_category'),
				collection: false
			}
			];
		}
    });
});