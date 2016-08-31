
define(['app/collections/Base', 'app/models/contract'], function (Base, Contract) {
    'use strict';

    return Base.extend({
        url: '/api/BusinessMan/maintenance_contracts',
        rel: 'api:maintenance_contracts',
        model: Contract
    });
});
