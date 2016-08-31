define(['require', 'app/models/Base', 'app/models/resource_category', 'app/models/group_membership'], function (require, Base)
{
	'use strict';
	return Base.extend(
	{
		urlRoot: '/api/BusinessMan/resources',
		relations: function ()
		{
			return [
			{
				key: 'resources:resource_category',
				relatedModel: require('app/models/resource_category'),
				collection: false
			},
			{
				key: 'resources:group_memberships',
				relatedModel: require('app/models/group_membership'),
				collection: true
			}
			];
		}
	});
});