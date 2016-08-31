define(['app/collections/Base', 'app/models/resource'], function (Base, Resource) {
    'use strict';

    return Base.extend({
        url: '/api/BusinessMan/resources',
        rel: 'api:resources',
        model: Resource
    });
});