define(['app/collections/Base', 'app/models/group_membership'], function (Base, GroupMembership) {
    'use strict';

    return Base.extend({
        url: '/api/BusinessMan/group_memberships',
        rel: 'api:group_memberships',
        model: GroupMembership
    });
});