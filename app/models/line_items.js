define(['require', 'app/models/Base', 'app/models/line_items'], function (require, Base) {
    'use strict';
    return Base.extend({
        urlRoot: '/api/BusinessMan/sales_orders_line_items'
    });
});