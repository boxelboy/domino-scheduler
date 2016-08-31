define(['app/collections/Base', 'app/models/client'], function (Base, Client) {
    'use strict';

    return Base.extend({
        url: '/api/BusinessMan/clients',
        rel: 'api:clients',
        model: Client
    });
});
