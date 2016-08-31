define(['require', 'app/models/Base', 'app/models/group'], function (require, Base) {
    'use strict';
    return Base.extend({
        urlRoot: '/api/BusinessMan/group_memberships',

        relations: function ()
		{
			return [
			{
				key: 'group_memberships:group',
				relatedModel: require('app/models/group'),
				collection: false
			},
			{
				key: 'group_memberships:resource',
				relatedModel: require('app/models/resource'),
				collection: false
			}];
		}
    });
});