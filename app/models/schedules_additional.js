define(['require', 'app/models/Base', 'app/models/client', 'app/models/client_contacts'], function (require, Base)
{
	'use strict';
	return Base.extend(
	{
		urlRoot: '/api/BusinessMan/schedules_additional',

		relations: function ()
		{
			return [
				{
					key: 'schedules_additional:client',
					relatedModel: require('app/models/client')
				},
				{
					key: 'schedules_additional:client_contact',
					relatedModel: require('app/models/client_contacts')
				}
			];
		},

	});
});