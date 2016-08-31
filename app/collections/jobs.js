define(['app/collections/Base', 'app/models/job'], function (Base, Job) {
    'use strict';

    return Base.extend({
        url: '/api/BusinessMan/jobs',
        rel: 'api:jobs',
        model: Job
    });
});