define(['require', 'app/models/Base', 'app/models/resource', 'app/models/role'], function (require, Base)
{
	'use strict';
	return Base.extend(
	{
		urlRoot: '/api/BusinessMan/participants',
		relations: function ()
		{
			return [
			{
				key: 'participants:resource',
				relatedModel: require('app/models/resource'),
				collection: false
			},
			{
				key: 'participants:role',
				relatedModel: require('app/models/role'),
				collection: false
			}];
		}
	});
});