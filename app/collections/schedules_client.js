define(['app/collections/Base', 'app/models/schedules_client'], function (Base, ScheduleClient) {
    'use strict';

    return Base.extend({
        url: '/api/BusinessMan/schedules_client',
        rel: 'api:schedules_client',
        model: ScheduleClient
    });
});
