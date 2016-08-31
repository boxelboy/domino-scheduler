define(['require', 'app/models/Base', 'app/models/line_items'], function (require, Base) {
    'use strict';
    return Base.extend({
        urlRoot: '/api/BusinessMan/sales_orders',
       relations: function ()
		{
			return [
			{
				key: 'sales_orders:line_items',
				relatedModel: require('app/models/line_items'),
				collection: true
			}];
		}
    });
});