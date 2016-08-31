define(['app/collections/Base', 'app/models/resource_category'], function (Base, ResourceCategories) {
    'use strict';

    return Base.extend({
        url: '/api/BusinessMan/resource_categories',
        rel: 'api:resource_categories',
        model: ResourceCategories
    });
});