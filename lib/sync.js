define(function (require)
{
	'use strict';
	var Backbone = require('backbone'),
		backboneSync = Backbone.sync,
		newError = function (method, options) {
			var oldError = options.error,
				successCodes = {
					create: 201
				};

			if (!successCodes[method]) {
				return options.error;
			}

			return function (jqXHR, textStatus, errorThrown)
			{
				var wasSuccessful = jqXHR.status === successCodes[method],
					response;

				if (wasSuccessful && _.isFunction(jqXHR.success)) {
					response = jqXHR.responseJSON ? jqXHR.responseJSON : {};
					options.success(response, textStatus, jqXHR);
				} else if (_.isFunction(options.error)) {
					oldError(jqXHR, textStatus, errorThrown);
				}
			};
		};

	Backbone.sync = function (method, model, options) {
		options.error = newError(method, options);

		//Dev
		//options.url = 'http://127.0.0.1:32767' + _.result(model, 'url');

		//Live
		options.url =   _.result(model, 'url');
		return backboneSync(method, model, options);
	};
});

