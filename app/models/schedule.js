define(['require', 'app/models/Base', 'app/models/participant', 'app/models/job', 'app/models/schedules_additional'], function (require, Base)
{
	'use strict';
	return Base.extend(
	{
		urlRoot: '/api/BusinessMan/schedules',

		relations: function ()
		{
			return [
				{
					key: 'schedules:participants',
					relatedModel: require('app/models/participant'),
					collection: true
				},
				{
					key: 'schedules:job',
					relatedModel: require('app/models/job')
				},
				{
					key: 'schedules:schedules_additional',
					relatedModel: require('app/models/schedules_additional'),
					collection: true
				}
			];
		},

		set: function (data, options) {

			if (typeof data == 'object') {
				if (data.start_date && typeof data.start_date == 'object') {
					var startDateObj = data.start_date;
					data.start_date = data.start_date.getFullYear() + '-' + (data.start_date.getMonth() + 1) + '-' + data.start_date.getDate();
					data.start_time = startDateObj.getHours() + ':' + startDateObj.getMinutes() + ':' + startDateObj.getSeconds();
				}

				if (data.end_date && typeof data.end_date == 'object') {
					var endDateObj = data.end_date;
					data.end_date = data.end_date.getFullYear() + '-' + (data.end_date.getMonth() + 1) + '-' + data.end_date.getDate();
					data.end_time = endDateObj.getHours() + ':' + endDateObj.getMinutes() + ':' + endDateObj.getSeconds();
				}

				delete data.color;
				delete data.resource_id;
				delete data.resources;
				delete data.textColor;
				delete data.text;
				delete data._count;
				delete data._inner;
				delete data._sday;
				delete data._sorder;
				delete data._timed;
				delete data.customerName;
				delete data.customerAddress;
				delete data.popupText;
				//delete data.start_uk_date;
				//delete data.end_uk_date;
			}

			return Base.prototype.set.call(this, data, options);
		}
	});
});