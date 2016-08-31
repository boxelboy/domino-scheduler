define(function(require) {
    'use strict';
    var Backbone = require('backbone'),
        ScheduleCollection = require('app/collections/schedules'),
        JobsCollection = require('app/collections/jobs'),
        JobModel = require('app/models/job'),
        ClientsContactsCollection = require('app/collections/schedules_additional'),
        ScheduleModel = require('app/models/schedule'),
        ScheduleAdditionalModel = require('app/models/schedules_additional'),
        ParticipantModel = require('app/models/participant'),
        ParticipantCollection = require('app/collections/participants'),
        ClientModel = require('app/models/client'),
        SettingModel = require('app/models/setting'),
        Resource = require('app/models/resource'),
        ResourceCollection = require('app/collections/resources'),
        ClientsCollection = require('app/collections/clients'),
        ContractsCollection = require('app/collections/contracts'),
        scheduler = require('scheduler'),
        LoaderView,
        ConfirmPopup,
        PopUpView,
        ClashPopUpView,
        jqueryUI = require('jquery-ui'),
        choosen = require('chosen.jquery'),
        timepicker = require('jquery-timepicker'),
        moment = require('moment');

    ClashPopUpView = Backbone.View.extend({
        tagName: 'div',
        id: 'form',
        template: require('text!template/scheduler/popup/clash.html'),
        events: {
            'click a.closeModal': 'closeModal',
        },

        initialize: function(data) {
            this.data = data;
            this.render();
        },

        closeModal: function(event) {
            event.preventDefault();
            this.remove();
        },

        render: function() {
            var data = {
                data: this.data,
            };
            var compiledTemplate = _.template(this.template);
            this.$el.html(compiledTemplate(data));
        },
    });

    ConfirmPopup = Backbone.View.extend({
        tagName: 'div',
        id: 'form',
        template: require('text!template/scheduler/popup/confirm.html'),
        events: {
            'click a.closeModal': 'closeModal',
            'click a.confirmModal': 'confirmModal',
        },

        initialize: function(data) {
            this.data = data;
            this.render();
        },

        confirmModal: function(event) {
            event.preventDefault();
            this.trigger('confirmed');
            this.remove();
        },

        closeModal: function(event) {
            event.preventDefault();
            this.trigger('failed');
            this.remove();
        },

        render: function() {
            var data = {
                data: this.data,
            };
            var compiledTemplate = _.template(this.template);
            this.$el.html(compiledTemplate(data));
        },
    });
    PopUpView = Backbone.View.extend({
        tagName: 'div',
        id: 'form',
        template: require('text!template/scheduler/popup/form.html'),
        events: {
            'click a.saveModal': 'saveModal',
            'click a.deleteModal': 'deleteModal',
            'click button.deleteParticipants': 'deleteParticipant',
            'click button.deleteClient': 'deleteClient',
            'change .stepResource': 'resourceChange',
            'change .jobSelect': 'jobChange',
            'change .clients': 'clientsChange',
            'click button.addResource': 'addResource',
            'click button.addClient': 'addClient',
            'click button.selectJob': 'selectJob',
            'click button.createJob': 'createJob',
            'click button.submitJob': 'submitJob',
            'click ul li a': 'changeTab',
            'change .checkboxJobs': 'checkboxChange',
            'click .resourceEventText i': 'enableEditEvent',
            'change .resourceEventSelect': 'selectEditEvent',
            'click span.jobLink' : 'jobLinkTrigger'
        },
        jobLinkTrigger : function (e)
        {
        	$.post('/fm', { action: 'script', file: 'BusinessMan', script: 'Dashboard View Job', parameter: $('.jobLink').data('id') });
        },

        enableEditEvent: function(e) {
            var selected = $(e.target).attr('data-id');
            var roleId = $(e.target).attr('data-roleId');
            var resource = new Resource({
                id: selected
            });
            resource.fetch({
                async: false,
                data: {
                    fields: '*,resource_category.*,resource_category.roles.*',
                },
                success: _.bind(function(backboneObj) {
                    $(e.target).parent().hide();
                    $('.resourceEventSelect').show();
                    var selectedItem;
                    $('.resourceEventSelect .form-control').find('option').remove().end();
                    _.each(backboneObj.related('resources:resource_category').related('resource_categories:roles').models, function(role) {
                        if (roleId == role.get('id')) {
                            selectedItem = "selected";
                        } else {
                            selectedItem = "";
                        }
                        $('.resourceEventSelect .form-control').append($("<option " + selectedItem + "></option>").attr("value", role.get('id')).text(role.get('event_type')));
                    });
                }, this)
            });
        },

        selectEditEvent: function(e) {
            var role_id = $(e.target).find(":selected").val();
            var event_name = $(e.target).find(":selected").text();
            var participant = $(e.target).parent().parent().parent().find('.resourceEventText i').attr('data-participant');
            var participantModel = new ParticipantModel({
                id: participant,
                role_id: parseInt(role_id)
            });
            participantModel.save();
        },

        checkboxChange: function(event) {
            event.preventDefault();
            var value = $(event.target).is(':checked');
            if (value) {
                $('.unscheduledSelect').show();
                $('.scheduledSelect').hide();
                $('.jobSelect').trigger("chosen:updated");
            } else {
                $('.unscheduledSelect').show();
                $('.scheduledSelect').show();
                $('.jobSelect').trigger("chosen:updated");
            }
        },

        submitJob: function(event) {
            event.preventDefault(event);
            var job;
            if (this.$('.contracts').find(":selected").val()) {
                job = {
                    job_type: this.$('.settingsJobType').find(":selected").val(),
                    job_stage: this.$('.settingsJobStage').find(":selected").val(),
                    contract_no: parseInt(this.$('.contracts').find(":selected").val()),
                    description: this.$('.details  textarea').val(),
                    job_description: this.$('.details  textarea').val(),
                    group_id: this.schedule.get('group_id')
                };
            } else {
                job = {
                    job_type: this.$('.settingsJobType').find(":selected").val(),
                    job_stage: this.$('.settingsJobStage').find(":selected").val(),
                    description: this.$('.details  textarea').val(),
                    job_description: this.$('.details  textarea').val(),
                    group_id: this.schedule.get('group_id')
                };
            }
            var jobModel = new JobModel(job);
            jobModel.save(null, {
                success: _.bind(function(model, response) {
                    this.schedule.set('job_number', parseInt(model.get('id')));
                    this.schedule.set('start_date', this.getFormateUSDate(this.$("form input[name=start_date]").val()));
                    this.schedule.set('start_time', this.$("form input[name=start_time]").val());
                    this.schedule.set('end_date', this.getFormateUSDate(this.$("form input[name=end_date]").val()));
                    this.schedule.set('end_time', this.$("form input[name=end_time]").val());
                    this.schedule.set('booked_for', this.$('form textarea[name=description]').val());
                    this.schedule.unset('end_uk_date');
                    this.schedule.unset('start_uk_date');
                    this.schedule.unset('customerName');
                    this.schedule.unset('customerAddress');
                    this.schedule.save(null, {
                        success: _.bind(function(model, response) {
                            this.trigger('scheduler:reloadAndRemove');
                            this.remove();
                        }, this)
                    });
                }, this)
            });
        },

        clientsChange: function(event) {
            event.preventDefault();
            var selected = $(event.target).find(":selected").val();
            if (selected == 'default') {
                selected = "";
                return false;
            }
            var results = this.clients.get(selected).related('clients:contracts');
            if (results.length) {
                $('.contracts').empty();
                _.each(results.models, function(result) {
                    $('.contracts').append($("<option></option>").attr("value", result.get('id')).text(result.get('id')));
                });
            } else {
                $('.contracts').empty();
            }
        },

        selectJob: function(event) {
            event.preventDefault();
            this.$('.jobSelectHide').fadeIn();
            this.$('.createJobBox').hide();
        },

        createJob: function(event) {
            event.preventDefault();
            this.$('.jobSelectHide').hide();
            this.$('.createJobBox').fadeIn();
        },

        changeTab: function(event) {
            event.preventDefault();
            var tab = $(event.target).parent();
            var key = $(event.target).attr('data-key');
            this.$('li.active, .tabSection.active').removeClass('active');
            tab.addClass('active');
            this.$('.tabSection.' + key).addClass('active');
        },

        initialize: function(event) {
            this.jobs = event.jobs;
            this.event = event.event;
            this.clients = event.clients;
            this.allResource = event.allresources;
            this.schedule = event.schedules.get(this.event.id);



            if (this.schedule.related('schedules:job').get('id')) {
                this.job = this.schedule.related('schedules:job');
            } else {
                this.job = false;
            }
            this.settings = new SettingModel({
                id: 1
            });
            this.settings.fetch({
                success: _.bind(function(model, response) {
                    this.render();
                }, this),
            });
        },

        timeTo12HrFormat: function(time)
		{   // Take a time in 24 hour format and format it in 12 hour format
			var time_part_array = time.split(":"),
				ampm = 'am',
				formatted_time;

			if (time_part_array[0] >= 12) {
				ampm = 'pm';
			}

			if (time_part_array[0] > 12) {
				time_part_array[0] = time_part_array[0] - 12;
			}

			formatted_time = time_part_array[0] + ':' + time_part_array[1]  + ' ' + ampm;

			if(formatted_time.charAt(1) == ":"){
				return '0' + formatted_time;
			}else{
				return formatted_time;
			}

		},

		timeTo24HrFormat : function(time) {
			var output = moment(time, ["hh:mm a"]).format("HH:mm");
			return output;
		},

        render: function() {
        	this.schedule.set('start_time', this.timeTo12HrFormat(this.schedule.get('start_time')));
        	this.schedule.set('end_time', this.timeTo12HrFormat(this.schedule.get('end_time')));

            var categories = [];
            _.each(this.allResource.models, _.bind(function(item) {
                categories.push(item.related('resources:resource_category').get('name'));
            }, this));

            var settings = {
                job_stage: this.settings.get('job_stage').split("\r"),
                job_type: this.settings.get('job_type').split("\r")
            };

            var data = {
                job: this.job,
                jobs: this.jobs,
                clients: this.clients,
                settings: settings,
                data: this.event,
                schedule: this.schedule,
                allresources: this.allResource.models,
                resources: this.schedule.related('schedules:participants').models,
                categories: _.uniq(categories)
            };

            data.schedule.set('start_uk_date', this.getFormateUKDate(data.schedule.get('start_date')));
            data.schedule.set('end_uk_date', this.getFormateUKDate(data.schedule.get('end_date')));

            var compiledTemplate = _.template(this.template);
            this.$el.html(compiledTemplate(data));
            this.removeAddedResources();

            this.$(".jobSelect").chosen({
                width: '100%'
            });

            this.$(".stepResource").chosen({
                width: '100%'
            });

            this.$(".stepClient").chosen({
                width: '100%'
            });

            if (this.$('.jobSelect').find(":selected").val() != "default") {
                this.$('.createJobBox').hide();
                this.$('.selectJob').hide();
                this.$('.jobSelectHide').show();
            }

			//TimePicker
			this.$("form input[name=start_time]").timepicker({
				timeFormat: 'hh:mm tt'
			});

			this.$("form input[name=end_time]").timepicker({
				timeFormat: 'hh:mm tt'
			});

			//DatePicker
			this.$("form input[name=start_date]").datepicker({
				dateFormat: 'dd-mm-yy',
			});
			this.$("form input[name=end_date]").datepicker({
				dateFormat: 'dd-mm-yy',
			});
        },

        getFormateUKDate: function(dateString) {
            var dateArray = dateString.split("-"); // ex input "2010-01-18"

            return dateArray[2] + "-" + dateArray[1] + "-" + dateArray[0]; //ex out: "18/01/10"
        },

        getFormateUSDate: function(dateString) {
            var dateArray = dateString.split("-");

            return dateArray[2] + "-" + dateArray[1] + "-" + dateArray[0];
        },

        removeAddedResources: function() {
            var resourceIds = [];
            _.each(this.$('.loopedElements'), _.bind(function(item) {
                this.$(".stepResource option[value='" + $(item).find('.deleteParticipants').data('resourceid') + "']").remove();
            }, this));
        },

        saveModal: function(event) {

            event.preventDefault();
            var self = this;
            var resourceIds = [];
            //Chech for clashes on save
            this.$('.loopedElements').each(function(count, item) {
                resourceIds.push($(this).find('.deleteParticipants').data('resourceid'));
            });

            var clash = new ScheduleCollection();
            //search for clash...
            clash.fetch({
                data: {
                    start_date: '<=' + self.$("form input[name=end_date]").val(),
                    end_date: '>=' + self.$("form input[name=start_date]").val(),
                    fields: '*,participants.*,participants.resource.*,participants.resource.*',
                    sort: 'start_date',
                    start_time: '<=' + self.$("form input[name=end_time]").val(),
                    end_time: '>=' + self.$("form input[name=start_time]").val(),
                    scheduled: 1,
                    id: '!' + this.schedule.get('id'),
                    'participants.resource.id': resourceIds.join(','),
                },
                success: _.bind(function(model, response) {
                    if (response.total_items > 0) {
                        var errors = clash.models.map(function(model) {
                            var resourceClashsArray = [];
                            _.each(model.related('schedules:participants').models, function(participant) {
                                if ($.inArray(participant.get('resource_id'), resourceIds) > -1) {
                                    // the value is in the array
                                    resourceClashsArray.push(participant.related('participants:resource').get('name') + ' (' + participant.get('event_name') + ') ');
                                }
                            });
                            return {
                                schedule_id: model.get('id'),
                                schedule_start_date: model.get('start_date'),
                                schedule_end_date: model.get('end_date'),
                                resource_clashs: resourceClashsArray
                            };
                        });
                        var clashPopup = new ClashPopUpView({
                            'data': errors,
                        });
                        this.$el.append(clashPopup.$el);
                    } else {
                        this.schedule.set('start_date', this.getFormateUSDate(this.$("form input[name=start_date]").val()));
                        this.schedule.set('start_time', this.timeTo24HrFormat(this.$("form input[name=start_time]").val()));
                        this.schedule.set('end_date', this.getFormateUSDate(this.$("form input[name=end_date]").val()));
                        this.schedule.set('end_time', this.timeTo24HrFormat(this.$("form input[name=end_time]").val()));
                        this.schedule.set('description', this.$('form textarea[name=description]').val());
                        this.schedule.unset('end_uk_date');
                        this.schedule.unset('start_uk_date');
                         this.schedule.unset('customerName');
                    this.schedule.unset('customerAddress');
                        this.schedule.save(null, {
                            success: _.bind(function(model, response) {
                                this.trigger('scheduler:reloadAndRemove');
                                this.remove();
                            }, this),
                            error: _.bind(function(error) {}, this),
                        });
                    }
                }, this),
            });
        },

        deleteModal: function(event) {
            event.preventDefault();
            this.schedule.destroy({
                success: _.bind(function(model, reponse) {
                    this.trigger('scheduler:reloadAndRemove');
                    this.remove();
                }, this),
                error: _.bind(function(error) {}, this)
            });
        },

        deleteParticipant: function(event) {
            event.preventDefault();
            var id = $(event.currentTarget).data("id");

            var model = new ParticipantModel({
                id: id
            });
            model.destroy({
                success: _.bind(function() {
                    $(event.currentTarget).parent().parent().parent().remove();
                }, this),
                error: _.bind(function(error, response) {}, this),
            });
        },

        jobChange: function(event) {
            event.preventDefault();
            var selected = $(event.target).find(":selected").val();

            if (selected == 'default') {
                selected = "";
            }

            this.schedule.set('job_number', parseInt(selected));
            this.schedule.unset('start_uk_date');
            this.schedule.unset('end_uk_date');
            this.schedule.unset('customerName');
            this.schedule.unset('customerAddress');
            this.schedule.save(null, {
                success: _.bind(function(model, response) {
                    $('.jobNumber').html(selected);
                }, this),
                error: _.bind(function(errror) {}, this),
            });

            var jobModel = new JobModel({
                id: parseInt(selected)
            });
            jobModel.set('group_id', this.schedule.get('group_id'));
            jobModel.save();
        },

        resourceChange: function(event) {
            var selected = $(event.target).find(":selected").val();

            if (selected == 'default') {
                $('.stepRoles').find('option').remove().end();
                return false;
            }

            var resource = new Resource({
                id: selected
            });
            resource.fetch({
                async: false,
                data: {
                    fields: '*,resource_category.*,resource_category.roles.*',
                },
                success: _.bind(function(backboneObj) {
                    $('.stepRoles').find('option').remove().end();
                    _.each(backboneObj.related('resources:resource_category').related('resource_categories:roles').models, function(role) {
                        $('.stepRoles').append($("<option></option>").attr("value", role.get('id')).text(role.get('event_type')));
                    });
                }, this)
            });
        },

        addClient: function(event) {
            if (this.$('.stepClient').find(":selected").val() == "default") {
                this.$('.stepClient').focus();
                return false;
            }
            var client = new ClientModel({
                client_id: this.$('.stepClient').find(":selected").val(),
                resource_company: this.$('.stepClient').find(":selected").attr('data-name'),
                schedules: parseInt(this.schedule.get('id'))
            });
            client.save(null, {
                success: _.bind(function(model, response) {
                    this.$('.jobHide').hide();
                    this.$('.customers  tbody').append('<tr class="loopedElementsClients"><td> ' + this.$('.stepClient').find(":selected").attr('data-name') + '</td><td><div class="btn-group"><button type="button" data-id="' + model.id + '" class="btn btn-danger deleteClient">Delete</button></div></td></tr>');
                }, this),
                error: _.bind(function(errror) {}, this),
            });
        },

        deleteClient: function(event) {
            event.preventDefault();
            var id = $(event.currentTarget).data("id");
            var model = new ClientModel({
                id: id
            });
            model.destroy({
                success: _.bind(function() {
                    $(event.currentTarget).parent().parent().parent().remove();
                    if ($('.loopedElementsClients').length === 0) {
                        this.$('.jobHide').show();
                    }
                }, this),
                error: _.bind(function(error, response) {}, this),
            });
        },

        addResource: function(event) {
            if (this.$('.stepResource').find(":selected").val() == "default") {
                this.$('.stepResource').focus();
                return false;
            }
            if (this.$('.stepRoles').find(":selected").val() === undefined) {
                this.$('stepRoles').focus();
                return false;
            }
            var clash = new ScheduleCollection();
            //search for clash...
            clash.fetch({
                data: {
                    start_date: '<=' + this.$("form input[name=end_date]").val(),
                    end_date: '>=' + this.$("form input[name=start_date]").val(),
                    fields: '*,participants.*,participants.resource.*,participants.resource*',
                    sort: 'start_date',
                    start_time: '<=' + this.$("form input[name=end_time]").val(),
                    end_time: '>=' + this.$("form input[name=start_time]").val(),
                    scheduled: 1,
                    id: '!' + this.schedule.get('id'),
                    'participants.resource.id': parseInt(this.$('.stepResource').find(":selected").val()),
                },
                success: _.bind(function(model, response) {
                    if (response.total_items > 0) {
                        var errors = clash.models.map(function(model) {
                            var resourceClashsArray = [];
                            _.each(model.related('schedules:participants').models, function(participant) {
                                if ($.inArray(participant.get('resource_id'), resourceIds) > -1) {
                                    // the value is in the array
                                    resourceClashsArray.push(participant.related('participants:resource').get('name') + ' (' + participant.get('event_name') + ') ');
                                }
                            });
                            return {
                                schedule_id: model.get('id'),
                                schedule_start_date: model.get('start_date'),
                                schedule_end_date: model.get('end_date'),
                                resource_clashs: resourceClashsArray
                            };
                        });
                        var clashPopup = new ClashPopUpView({
                            'data': errors,
                        });
                        this.$el.append(clashPopup.$el);
                    } else {
                        var filter = this.allResource.get(parseInt(this.$('.stepResource').find(":selected").val()));
                        var participant = new ParticipantModel({
                            group_id: this.schedule.get('group_id'),
                            event_id: filter.related('resources:resource_category').get('id'),
                            event_name: filter.related('resources:resource_category').get('name'),
                            resource_id: parseInt(this.$('.stepResource').find(":selected").val()),
                            resource_name: this.$('.stepResource').find(":selected").text(),
                            schedule_id: parseInt(this.schedule.get('id')),
                            role_id: parseInt(this.$('.stepRoles').find(":selected").val()),
                        });
                        participant.save(null, {
                            success: _.bind(function(model, response) {
                                var insetedParticipant = new ParticipantModel({
                                    id: parseInt(response.id)
                                });
                                insetedParticipant.fetch({
                                    data: {
                                        fields: '*,role.*,resource.*,resource.resource_category.*'
                                    },
                                    success: _.bind(function(model, response) {
                                        this.$(".stepResource").val('default').change();
                                        this.$('.resources  tbody').append('<tr class="loopedElements"><td>' + insetedParticipant.related('participants:resource').get('name') + '</td><td>' + insetedParticipant.related('participants:role').get('event_type') + '</td><td><div class="btn-group"><button type="button" data-id="116325" class="btn btn-primary viewResource">View</button><button type="button" data-resourceid="' + insetedParticipant.related('participants:resource').get('id') + '" data-id="' + insetedParticipant.get('id') + '" class="btn btn-danger deleteParticipants">Delete</button></div></td></tr>');
                                        this.schedule.fetch({
                                            data: {
                                                fields: '*,participants.*,participants.role.*,participants.resource.*,participants.resource.resource_category.*'
                                            }
                                        });
                                        this.removeAddedResources();
                                    }, this),
                                });
                            }, this),
                            error: _.bind(function(errror) {}, this),
                        });
                    }
                }, this),
            });
        }
    });

    LoaderView = Backbone.View.extend({
        className: 'loader',
        template: require('doT!template/scheduler/loader'),
        initialize: function() {
            this.render();
        },

        render: function() {
            this.$el.html(this.template());
        },

        show: function() {
            this.$el.css('display', 'flex');
        },

        hide: function() {
            this.$el.css('display', 'none');
        }
    });

    return Backbone.View.extend({
        className: 'scheduler dhx_cal_container',
        template: require('doT!template/scheduler/scheduler'),

        initialize: function(options) {

        	 // $.fn.timepicker.regional = 'it';
            this.app = options.app;
            this.loader = new LoaderView();
            this.schedules = new ScheduleCollection();
            this.filter = {};
            this.resources = null;
            this.started = false;
            this.preloaded = false;

            if (this.app.scheduleType == "jobs") {
                this.jobID = "!";
            } else {
                this.jobID = false;
            }
            this.render();

            this.listenTo(this.app, 'menu:filter:change', this.onFilterChange);
            this.listenTo(this.app, 'menu:job:change', this.onJobChange);
            this.listenTo(this.app, 'menu:view:change', this.setView);
            this.listenTo(this.app, 'menu:date:previous', this.previousDate);
            this.listenTo(this.app, 'menu:date:next', this.nextDate);
            this.listenTo(this.app, 'scheduler:filter:timeLineClick', this.reloadTimeLine);
            //Default Timeline Settings
            this.timelineSettings = {};
            this.timelineSettings.unit = "minute";
            this.timelineSettings.date = "%H:%i";
            this.timelineSettings.step = 60;
            this.timelineSettings.size = 24;
            this.timelineSettings.start = 0;
            this.timelineSettings.length = 24;
            this.timelineSettings.secondUnit = 'day';
            this.timelineSettings.secondDate = '%d %M';
            this.current = moment(new Date()).format('YYYY-MM-DD HH:mm');
            this.startOfWeek = moment().startOf('week').add(1, 'days');

            var tmpSchedules = new ScheduleCollection();
            this.freeze = 1;
            setInterval(_.bind(function() {
                if (this.freeze) {
                    tmpSchedules.fetch({
                        data: {
                            'last_updated ': '>' + this.current
                        },
                        success: _.bind(function(collection) {
                            if (tmpSchedules.length > 0) {
                                this.current = moment(new Date()).format('YYYY-MM-DD HH:mm');
                                this.loadEvents(true, false, true);
                            }
                        }, this)
                    });
                }
            }, this), 10000);
        },

        render: function() {
            this.$el.html(this.template());
            this.$el.append(this.loader.$el);
        },

        reloadTimeLine: function(timeline) {
            switch (timeline.toString()) {
                case "1":
                    this.timelineSettings.unit = "minute";
                    this.timelineSettings.date = "%H:%i";
                    this.timelineSettings.step = 60;
                    this.timelineSettings.size = 24;
                    this.timelineSettings.start = 0;
                    this.timelineSettings.length = 24;
                    this.timelineSettings.secondUnit = 'day';
                    this.timelineSettings.secondDate = '%d %M';
                    break;
                case "7":
                    this.timelineSettings.unit = "day";
                    this.timelineSettings.date = "%D %d";
                    this.timelineSettings.step = 1;
                    this.timelineSettings.size = 7;
                    this.timelineSettings.start = 0;
                    this.timelineSettings.length = 7;
                    this.timelineSettings.secondUnit = 'month';
                    this.timelineSettings.secondDate = '%M';
                    break;
                case "14":
                    this.timelineSettings.unit = "day";
                    this.timelineSettings.date = "%D %d";
                    this.timelineSettings.step = 1;
                    this.timelineSettings.size = 14;
                    this.timelineSettings.start = 0;
                    this.timelineSettings.length = 14;
                    this.timelineSettings.secondUnit = 'month';
                    this.timelineSettings.secondDate = '%M';
                    break;
                case "1m":
                    this.timelineSettings.unit = "day";
                    this.timelineSettings.date = "%D %d";
                    this.timelineSettings.step = 1;
                    this.timelineSettings.size = 31;
                    this.timelineSettings.start = 0;
                    this.timelineSettings.length = 31;
                    this.timelineSettings.secondUnit = 'month';
                    this.timelineSettings.secondDate = '%M';
                    break;
                case "3m":
                    this.timelineSettings.unit = "day";
                    this.timelineSettings.date = "%D %d";
                    this.timelineSettings.step = 3;
                    this.timelineSettings.size = 31;
                    this.timelineSettings.start = 0;
                    this.timelineSettings.length = 31;
                    this.timelineSettings.secondUnit = 'month';
                    this.timelineSettings.secondDate = '%M';
                    break;
                case "1y":
                    this.timelineSettings.unit = "month";
                    this.timelineSettings.date = "%M";
                    this.timelineSettings.step = 1;
                    this.timelineSettings.size = 12;
                    this.timelineSettings.start = 0;
                    this.timelineSettings.length = 12;
                    this.timelineSettings.secondUnit = 'year';
                    this.timelineSettings.secondDate = '%Y';
                    break;
            }
            this.createResourceViews();
        },

        onJobChange: function(id) {
            this.jobID = id;
            this.loadEvents(true);
        },

        onFilterChange: function(filter, resources) {
            this.filter = filter;
            this.resources = resources;
            this.schedules.reset();
            scheduler.clearAll();
            if (this.getView() == 'unit' && !resources.size()) {
                this.setView('month');
            }
            this.loadEvents(true);
            this.createResourceViews();
            this.app.trigger('scheduler:filter:change', filter, resources);
        },

        onViewChange: function(view, date) {
            this.loadEvents(false);
            this.app.trigger('scheduler:view:change', view, date);
        },

        createResourceViews: function() {
			scheduler.date.timeline_start = _.bind(function(date) {
				if (scheduler.date.day_start(date).toString() == scheduler.date.day_start(new Date()).toString()) {
					date.setTime(this.startOfWeek);
				}

				if(this.timelineSettings.unit == "minute")
				{
					date.setTime(new Date().getTime());
				}
				return date;
			}, this);

			var resources = [];
			this.resources.each(function(resource) {
				resources.push({
					key: resource.id,
					label: resource.get('name')
				});
			});

            if (resources.length) {
				if(typeof this.currentResource !== "undefined"){
					scheduler.config.multi_day = true;
					scheduler.createUnitsView({
						name: 'unit',
						property: 'resource_id',
						list: resources,
						step: 1,
						size: this.currentResource.has('s_resource_matrix_count') ? parseInt(this.currentResource.get('s_resource_matrix_count')) : 16,
						skip_incorrect: true
					});
				} else {
					scheduler.createUnitsView({
						name: 'unit',
						property: 'resource_id',
						list: resources,
						step: 1,
						size: 16,
						skip_incorrect: true
					});
				}

				scheduler.createTimelineView({
					name: 'timeline',
					x_unit: this.timelineSettings.unit,
					x_date: this.timelineSettings.date,
					x_step: this.timelineSettings.step,
					x_size: this.timelineSettings.size,
					x_start: this.timelineSettings.start,
					x_length: this.timelineSettings.length,
					round_position: true,
					y_unit: resources,
					y_property: 'resource_id',
					render: 'bar'
				});

				scheduler.date.timeline_start = _.bind(function(date) {
				if (scheduler.date.day_start(date).toString() == scheduler.date.day_start(new Date()).toString()) {
					date.setTime(this.startOfWeek);
				}

				if(this.timelineSettings.unit == "minute")
				{
					date.setTime(new Date().getTime());
				}
					return date;
				}, this);

				var mouseMove = scheduler.mouse_timeline;
				scheduler['.mouse_timeline'] = function(pos) {
				var res = mouseMove.apply(this, arguments);
				if (this._drag_event) {
					this._drag_event._dhx_changed = !!(this._drag_pos && this._is_pos_changed(this._drag_pos, pos));
				}
					return res;
				};
			}
        },
        setView: function(view) {
        	this.timelineSettings.unit = "minute";
            scheduler.setCurrentView(scheduler._date, view);
        },

        getView: function() {
            return scheduler._mode;
        },

        previousDate: function() {
            scheduler._click.dhx_cal_next_button(0, -1);
        },

        nextDate: function() {
            scheduler._click.dhx_cal_next_button(0, 1);
        },

        start: function() {
            if (this.app.filterId) {
                this.currentResource = this.app.resources.get(this.app.filterId);
            }


            if(typeof this.currentResource !== "undefined"){
                scheduler.config.last_hour = this.currentResource.has('s_grid_finish_hour') ? parseInt(this.currentResource.get('s_grid_finish_hour')) : 24;
                scheduler.config.first_hour = this.currentResource.has('s_grid_start_hour') ? parseInt(this.currentResource.get('s_grid_start_hour')) : 0;
                scheduler.config.scroll_hour = this.currentResource.has('s_resource_scroll_hour') ? parseInt(this.currentResource.get('s_resource_scroll_hour')) : 8;
            }else{
                scheduler.config.last_hour = 24;
                scheduler.config.first_hour = 0;
                scheduler.config.scroll_hour = 0;
            }

            scheduler.skin = 'flat';
            scheduler.config.xml_date = '%Y-%m-%d %H:%i';
            scheduler.config.show_loading = false;
            scheduler.config.multi_day = true;
            scheduler.config.mark_now = true;
            scheduler.config.edit_on_create = false;
            scheduler.config.default_date = '%D, %M %d %Y';
            scheduler.config.hour_date = '%g:%i %A';
            scheduler.config.dblclick_create = false;
            scheduler.config.edit_on_create = false;
            scheduler.config.details_on_dblclick = true;
            scheduler.config.details_on_create = true;
            scheduler.config.drag_create = true;
            scheduler.config.icons_select = ['icon_details', 'icon_delete'];
            scheduler.config.full_day = true;
            scheduler.config.multisection = true;
            scheduler.config.multisection_shift_all = false;
            scheduler.config.resize_month_events = true;
            scheduler.config.resize_month_timed = true;
            scheduler.config.map_inital_zoom = 8;
            scheduler.config.map_resolve_user_location = false;
            scheduler.xy.nav_height = 0;
            scheduler.config.multi_day = true;
            scheduler.xy.menu_width = 0;

            scheduler._init_event = _.bind(function(event) {
                var schedule = this.schedules.get(event.id),
                    resourceIds = [];
                var Job_Number;
                event.start_date = scheduler._init_date(schedule.get('start_date') + ' ' + schedule.get('start_time'));
                event.end_date = scheduler._init_date(schedule.get('end_date') + ' ' + schedule.get('end_time'));
                var Booked_For = (schedule.has('booked_for')) ? schedule.get('booked_for') : " ";
                event.text = Booked_For;

                if(schedule.related('schedules:job').get('id')){
                	event.customerName = schedule.related('schedules:job').get('customer_name');
                	var address = schedule.related('schedules:job').get('site_address');
                	var town = schedule.related('schedules:job').get('site_post_town');
                	var postcode = schedule.related('schedules:job').get('site_postcode');
                	event.customerAddress = address + " <br> " + town + " <br> " + postcode;
          		}
                if (typeof schedule.related('schedules:participants') !== 'undefined') {
                    if (_.isObject(schedule.related('schedules:participants').models[0])) {
                        var Event_Name = (schedule.related('schedules:participants').models[0].has('event_name')) ? schedule.related('schedules:participants').models[0].get('event_name') : " ";
                        Job_Number = (schedule.has('job_number')) ? " [" + schedule.get('job_number') + "] " : " ";
                        event.text = Event_Name.concat(Job_Number, Booked_For);
                        var resourceIDs = [];
                        $.each(schedule.related('schedules:participants').models, function(index, item) {
                            if (typeof item.related('participants:resource').get('id') !== "undefined") {
                                resourceIDs.push(item.related('participants:resource').get('id'));
                            }
                        });
                        event.resource_id = resourceIDs.join(',');
                        if (_.isString(schedule.related('schedules:participants').models[0].related('participants:role').get('colour_bg_rgbvalue'))) {
                            //Gets last colour
                            event.color = "rgb(" + schedule.related('schedules:participants').models.slice(-1).pop().related('participants:role').get('colour_bg_rgbvalue') + ")";
                            event.textColor = "rgb(" + schedule.related('schedules:participants').models.slice(-1).pop().related('participants:role').get('colour_text_rgbvalue') + ")";
                        }
                    } else {
                        var Job_Description = (schedule.related('schedules:job').has('description')) ? schedule.related('schedules:job').get('description') : " ";
                        Job_Number = (schedule.has('job_number')) ? " TEST [" + schedule.get('job_number') + "] " : " ";
                        event.text = Booked_For.concat(Job_Description, Job_Number);
                    }
                }
            }, this);


            scheduler.attachEvent('onTemplatesReady', _.bind(this.prepareTemplates, this));
            scheduler.attachEvent('onViewChange', _.bind(this.onViewChange, this));

            scheduler.showLightbox = _.bind(function(id) {
                this.freeze = 0;
                var event = scheduler.getEvent(id);
                var popupForm = new PopUpView({
                    'event': event,
                    'jobs': this.app.jobs,
                    'clients': this.app.clients,
                    'schedules': this.schedules,
                    'allresources': this.app.resources,
                    'newEvent': false
                });
                this.$el.append(popupForm.$el);
                popupForm.on('scheduler:reloadAndRemove', _.bind(function() {
                    scheduler.deleteEvent(event.id);
                    this.loadEvents(true);
                    this.freeze = 1;
                }, this));
                scheduler.startLightbox(id, $('#form')[0]);
            }, this);

             if(typeof this.currentResource !== "undefined"){
                this.$el.dhx_scheduler({
                    mode: this.currentResource.has('s_default_view') ? this.currentResource.get('s_default_view').toLowerCase() : this.app.baseView
                });
            } else {
                this.$el.dhx_scheduler({
                    mode: this.app.baseView
                });
            }

            this.schedules.on('scheduler:add', _.bind(function(schedule) {
                var event = scheduler.getEvent(schedule.cid);
                this.loader.show();
                schedule.set('scheduled', 1);
                /* Encore Changes */
                schedule.set('start_time', "00:00:00");
                schedule.set('end_time', "23:59:59");
                schedule.set('end_date', schedule.get('start_date'));
                /*
               	OldCode
                if (schedule.get('start_time') == "0:0:0") {
                    schedule.set('start_time', "11:00:00");
                    schedule.set('end_time', "12:30:00");
                    schedule.set('end_date', schedule.get('start_date'));
                }
                */
                schedule.save().done(_.bind(function() {
                    var promises = [];
                    //Checks your on a resource like Brent, any singular item
                    if ((event.resource_id && this.filter.resource.length === 1) || (this.getView() == "unit" || this.getView() == "timeline")) {
                        var participant = new ParticipantModel({
                            resource_id: event.resource_id,
                            group_id: schedule.get('group_id'),
                            schedule_id: schedule.id,
                        });
                        promises.push(participant.save());
                    }
                    if (this.app.contactId) {
                        var scheduleAdditional = new ScheduleAdditionalModel({
                            schedules: schedule.id,
                            client_id: this.app.contactId,
                            client_contact_id: this.app.clientcontactId
                        });
                        promises.push(scheduleAdditional.save());
                    }
                    $.when.apply($, promises).done(_.bind(function() {
                        this.loader.hide();
                        schedule.fetch({
                            data: {
                                fields: '*,schedules_additional.*,schedules_additional.client.*,schedules_additional.client_contact.*,participants.*,participants.resource.*,participants.resource.*'
                            }
                        }).done(_.bind(function(test) {
                            this.freeze = 0;
                            var popupForm = new PopUpView({
                                'event': schedule,
                                'jobs': this.app.jobs,
                                'clients': this.app.clients,
                                'schedules': this.schedules,
                                'allresources': this.app.resources,
                                'newEvent': true
                            });
                            popupForm.on('scheduler:reloadAndRemove', _.bind(function() {
                                this.loadEvents(true);
                                scheduler.addEvent(event);
                                scheduler.deleteEvent(event.id);
                                this.freeze = 1;
                            }, this));
                            this.$el.append(popupForm.$el);
                        }, this));
                    }, this));
                }, this));
            }, this));

            scheduler.attachEvent("onBeforeEventChanged", _.bind(function(updatedEvent, e, isNew, originalEvent) {

                if (isNew) {
                    return true;
                }
                if (updatedEvent.start_date.getTime() != originalEvent.start_date.getTime() || updatedEvent.end_date.getTime() != originalEvent.end_date.getTime() || updatedEvent.resource_id != originalEvent.resource_id) {
                    this.freeze = 0;
                    var confirm = new ConfirmPopup();
                    this.$el.append(confirm.$el);
                    var schedule = this.schedules.get(updatedEvent.id);
                    confirm.on('failed', _.bind(function() {
                        this.loadEvents(true);
                        scheduler.addEvent(updatedEvent);
                        scheduler.deleteEvent(schedule.id);
                        this.freeze = 1;
                    }, this));
                    confirm.on('confirmed', _.bind(function() {
                        var updatedAttributes = {};
                        _.each(updatedEvent, function(value, name) {
                            if (name.indexOf('_') !== 0 && name != 'id') {
                                updatedAttributes[name] = value;
                            }
                        });


                        //We need to delete old participant and add new one....
                        
                        if(updatedEvent.resource_id != originalEvent.resource_id){

                            var participant = new ParticipantCollection();
                                participant.fetch({
                                    data : {
                                        schedule_id : schedule.get('id'),
                                        resource_id : originalEvent.resource_id,
                                    },
                                    success : _.bind(function (collection)
                                    {
                                        collection.models[0].destroy();
                                        var participant = new ParticipantModel({
                                            resource_id: updatedEvent.resource_id,
                                            group_id: schedule.get('group_id'),
                                            schedule_id: schedule.get('id'),
                                        });
                                        participant.save();
                                    }, this)
                                });

                        }

                        schedule.set(updatedAttributes);
                        this.schedules.trigger("scheduler:change", schedule);
                        this.changeSchedule(schedule);
                    }, this));
                }
                return true;
            }, this));


            scheduler.templates.tooltip_text = function(start,end,event) {
				if (typeof event.customerName == 'undefined') {
					return  "<b>Event:</b> "+event.text+"<br/><b>Start date:</b> "+scheduler.templates.tooltip_date_format(start)+"<br/><b>End date:</b> "+scheduler.templates.tooltip_date_format(end);
				}else{


                    if(event.customerName.charAt(0) != ',')
                    {
                        return  "<b>Event:</b> "+event.text+"<br/><b>Customer Name:</b> "+event.customerName+"<br/><b>Address:</b> "+event.customerAddress+"<br/><b>Start date:</b> "+scheduler.templates.tooltip_date_format(start)+"<br/><b>End date:</b> "+scheduler.templates.tooltip_date_format(end);
                    }else{
                        return  "<b>Event:</b> "+event.text+"<br/><b>Address:</b> "+event.customerAddress+"<br/><b>Start date:</b> "+scheduler.templates.tooltip_date_format(start)+"<br/><b>End date:</b> "+scheduler.templates.tooltip_date_format(end);
                    }
					
		       	}
	       	};

            scheduler.backbone(this.schedules);
            this.started = true;


        },

        changeSchedule: function(schedule) {
            var jsonSchedule = schedule.toJSON(),
                resourceIds = [],
                clash = new ScheduleCollection();

            this.freeze = 1;
            //Chech for clashes on save
            _.each(schedule.related('schedules:participants').models, function(participant) {
                resourceIds.push(participant.related('participants:resource').get('id'));
            });
            //search for clash...
            clash.fetch({
                data: {
                    start_date: '<=' + jsonSchedule.end_date,
                    end_date: '>=' + jsonSchedule.start_date,
                    fields: '*,participants.*,participants.resource.*,participants.resource.*',
                    sort: 'start_date',
                    start_time: '<=' + jsonSchedule.end_time,
                    end_time: '>=' + jsonSchedule.start_time,
                    scheduled: 1,
                    id: '!' + schedule.get('id'),
                    'participants.resource.id': resourceIds.join(','),
                },
                success: _.bind(function(model, response) {
                    //There was a clash, produce error report array
                    if (response.total_items > 0) {
                        var errors = clash.models.map(function(model) {
                            var resourceClashsArray = [];
                            _.each(model.related('schedules:participants').models, function(participant) {
                                if ($.inArray(participant.get('resource_id'), resourceIds) > -1) {
                                    // the value is in the array
                                    resourceClashsArray.push(participant.related('participants:resource').get('name') + ' (' + participant.get('event_name') + ') ');
                                }
                            });
                            return {
                                schedule_id: model.get('id'),
                                schedule_start_date: model.get('start_date'),
                                schedule_end_date: model.get('end_date'),
                                resource_clashs: resourceClashsArray
                            };
                        });
                        var clashPopup = new ClashPopUpView({
                            'data': errors,
                        });
                        this.$el.append(clashPopup.$el);
                        //Reload page, maybe best in a call back?
                        this.loadEvents(true);
                    } else {
                        scheduler.deleteEvent(schedule.id);
                        schedule.save(null, {
                            success: _.bind(function(model, response) {
                                this.loadEvents(true);
                            }, this)
                        });
                    }
                }, this),
            });
        },

        prepareTemplates: function() {
            var proxies = {},
                eventText,
                self = this;

            eventText = function(start, end, event) {
                return event.text;
            };

            scheduler.templates.event_text = eventText;
            scheduler.templates.event_bar_text = eventText;
            scheduler.templates.year_tooltip = eventText;
            scheduler.templates.map_text = eventText;
            scheduler.templates.marker_text = eventText;
            proxies.renderEvent = scheduler.render_event;
            proxies.renderTimelineEvent = scheduler.render_timeline_event;

            scheduler.render_event = _.bind(function(event) {
                var eventClone = $.extend(true, {}, event),
                    schedule = this.schedules.get(eventClone.id);
                return proxies.renderEvent.call(scheduler, eventClone);
            }, this);

            scheduler.render_timeline_event = function(event, render) {
                var eventClone = $.extend(true, {}, event);
                if (typeof self.schedules.get(event.id) != 'undefined') {
                    var Models = self.schedules.get(event.id).related('schedules:participants').models;
                    _.each(Models, function(participant) {
                        if (participant.get('resource_id') == event.resource_id) {
                            eventClone.text = participant.get('event_name');
                            eventClone.color = "rgb(" + participant.related('participants:role').get('colour_bg_rgbvalue') + ")";
                            eventClone.textColor = "rgb(" + participant.related('participants:role').get('colour_text_rgbvalue') + ")";
                        }
                    });
                }
                return proxies.renderTimelineEvent.call(this, eventClone, render);
            };
        },

        loadEvents: function(filterChanged, trigger, force) {
            var formatDate = scheduler.date.date_to_str('%Y-%m-%d'),
                data;
            if (!this.startDate || !this.endDate || scheduler._min_date < this.startDate || scheduler._max_date > this.endDate || filterChanged || this.jobID || force) {
                if (!this.startDate || scheduler._min_date < this.startDate) {
                    this.startDate = scheduler._min_date;
                }
                if (!this.endDate || scheduler._max_date > this.endDate) {
                    this.endDate = scheduler._max_date;
                }
                var resourceIds = [];
                if (this.resources) {
                    this.resources.each(function(resource) {
                        resourceIds.push(resource.id);
                    });
                }
                if (_.isEmpty(resourceIds)) {
                    resourceIds = "";
                } else {
                    resourceIds = resourceIds.join(',');
                }
                this.startDateFormat = formatDate(this.startDate);
                this.endDateFormat = formatDate(this.endDate);
                if (this.promise && this.promise.state() == 'pending') {
                    this.promise.abort();
                }
                this.loader.show();
                if (this.jobID === false) {
                    data = {
                        start_date: '<=' + this.endDateFormat,
                        end_date: '>=' + this.startDateFormat,
                        fields: '*,schedules_additional.*,schedules_additional.client.*,schedules_additional.client_contact.*,job.*,job.sales_order.*,job.sales_order.line_items.*,participants.*,participants.role.*,participants.resource.*,participants.resource.resource_category.*',
                        sort: 'start_date',
                        scheduled: 1,
                        'participants.resource.id': resourceIds,
                    };
                } else {
                    data = {
                        start_date: '<=' + this.endDateFormat,
                        end_date: '>=' + this.startDateFormat,
                        fields: '*,schedules_additional.*,schedules_additional.client.*,schedules_additional.client_contact.*,job.*,job.sales_order.*,job.sales_order.line_items.*,participants.*,participants.role.*,participants.resource.*,participants.resource.resource_category.*',
                        sort: 'start_date',
                        scheduled: 1,
                        'participants.resource.id': resourceIds,
                        'job_number': this.jobID
                    };
                }
                this.promise = this.schedules.fetch({
                    reset: false,
                    data: data,
                    success: _.bind(function() {
                        this.app.trigger('finished');
                        if (trigger) {
                            this.trigger('loaded');
                        }
                    }, this)
                });
                this.promise.progress(_.bind(this.loader.hide, this.loader));
                this.promise.done(_.bind(this.loader.hide, this.loader));
            }
        }
    });
});