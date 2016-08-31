define(['app/collections/Base', 'app/models/schedule'], function (Base, Schedule) {
    'use strict';

    return Base.extend({
        url: '/api/BusinessMan/schedules',
        rel: 'api:schedules',
        model: Schedule
    });
});