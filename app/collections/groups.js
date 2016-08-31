define(['app/collections/Base', 'app/models/group'], function (Base, Group) {
    'use strict';

    return Base.extend({
        url: '/api/BusinessMan/groups',
        rel: 'api:groups',
        model: Group
    });
});