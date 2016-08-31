define(['require', 'app/models/Base'], function (require, Base) {
    'use strict';
    return Base.extend({
        urlRoot: '/api/BusinessMan/groups',

        relations: function ()
		{
			return [
			{
				key: 'groups:group_memberships',
				relatedModel: require('app/models/group_membership'),
				collection: true
			}];
		}
    });
});