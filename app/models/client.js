define(['require', 'app/models/Base', 'app/models/contract'], function (require, Base)
{
	'use strict';
	return Base.extend(
	{
		urlRoot: '/api/BusinessMan/clients',

		relations: function () {
			return [
				{
					key: 'clients:contracts',
					relatedModel: require('app/models/contract'),
					collection: true
				},
				{
					key: 'clients:client_contacts',
					relatedModel: require('app/models/client_contacts'),
					collection: true
				}
			];
		}
	});
});