define(['require', 'app/models/Base', 'app/models/schedule', 'app/models/sales_orders', 'app/models/client'], function (require, Base) {
    'use strict';
    return Base.extend({
       urlRoot: '/api/BusinessMan/jobs',
       relations: function ()
		{
			return [
			{
				key: 'jobs:schedules',
				relatedModel: require('app/models/schedule'),
				collection: true
			},
			{
				key: 'jobs:sales_order',
				relatedModel: require('app/models/sales_orders')
			},

			{
				key: 'jobs:client',
				relatedModel: require('app/models/client')
			}
			];
		}
    });
});