define(['backbone'], function (Backbone) {
    'use strict';

    return Backbone.Collection.extend({
        parse: function (response) {
            if (response.page) {
                this.page = response.page;
            }

            if (response.page_count) {
                this.pageCount = response.page_count;
            }

            if (response.page_size) {
                this.pageSize = response.page_size;
            }

            if (response.total_items) {
                this.totalItems = response.total_items;
            }

            if (response._embedded && response._embedded[this.rel]) {
                return response._embedded[this.rel];
            } else {
                return [];
            }
        }
    });
});
