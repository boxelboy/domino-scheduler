define(['app/collections/Base', 'app/models/schedules_additional'], function (Base, ScheduleClient) {
    'use strict';
    return Base.extend({
        url: '/api/BusinessMan/schedules_additional',
        rel: 'api:schedules_additional',
        model: ScheduleClient
    });
});
