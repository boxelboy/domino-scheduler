define(['app/collections/Base', 'app/models/participant'], function (Base, Participant) {
    'use strict';

    return Base.extend({
        url: '/api/BusinessMan/participants',
        rel: 'api:participants',
        model: Participant
    });
});
