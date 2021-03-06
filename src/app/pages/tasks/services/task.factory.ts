import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, mergeMap } from 'rxjs/operators';
import * as MomentTimezone from 'moment-timezone';
import { IModel, IDataNode } from '@smc/modules/smc-common';
import { ISchemaEvent, ITask, IApp, FilterFactory } from '@smc/modules/qrs';

import { ExecutionModel } from '../model/execution.model';
import { IdentificationModel } from '../model/indetification.model';
import { TaskModel } from '../model/task.model';
import { TriggerModel } from '../model/trigger.model';
import { BehaviorSubject, Observable, of, forkJoin } from 'rxjs';
import { TaskIncomatibleException } from '../api/exceptions/incompatible.exception';

@Injectable()
export class TaskFactory {

    public selectedTasks: BehaviorSubject<ITask[]>;

    public constructor(
        private http: HttpClient,
        private filterFactory: FilterFactory
    ) { }

    /**
     * build task model
     *
     * @param {IDataNode} [data]
     * @returns {TaskModel}
     * @memberof TaskService
     */
    public buildTask(data?: ITask): Observable<TaskModel> {

        return of(new TaskModel())
            .pipe(
                mergeMap((task: TaskModel): Observable<TaskModel> => {

                    return forkJoin([
                        this.createModel(new ExecutionModel(), data || {}),
                        this.createIdentificationModel(data),
                        this.createTriggerModel(data ? data.id : null),
                    ])
                    .pipe(
                        map((models) => {
                            const [exectuion, identification, trigger] = models;
                            task.id             = data ? data.id : null;
                            task.execution      = exectuion as ExecutionModel;
                            task.identification = identification as IdentificationModel;
                            task.trigger        = trigger as TriggerModel;

                            return task;
                        })
                    );
                })
            );
    }

    /**
     * create default task data
     *
     * @param {string} name
     * @param {IApp} app
     * @returns {ITask}
     * @memberof TaskService
     */
    public createDefaultTaskData(name: string, app: IApp): ITask {

        return {
            app: {
                id: app.id,
                name: app.name
            },
            customProperties: [],
            enabled: true,
            isManuallyTriggered: false,
            maxRetries: 0,
            name: name,
            tags: [],
            taskSessionTimeout: 1440,
            taskType: 0
        };
    }

    public createSchemaEvent(startTime: number, task?: ITask): ISchemaEvent {

        const start = MomentTimezone.tz('Europe/Paris');
        const end = MomentTimezone.tz('9999-12-31', 'Europe/Paris');

        if (startTime) {
            start.hour(Number(startTime) + start.utcOffset() / 60 || 12);
            start.minute(0);
            start.second(0);
            start.millisecond(0);
        }

        const eventData: ISchemaEvent = {
            enabled: true,
            expirationDate: end.toISOString(true),
            startDate: start.toISOString(),
            eventType: 0,
            name: 'ser daily schema',
            incrementDescription: '0 0 1 0', // day
            incrementOption: '1', // amount of days
            privileges: ['read', 'update', 'create', 'delete'],
            schemaFilterDescription: ['* * - * * * * *'],
            timeZone: 'Europe/Paris'
        };

        if (task ) {
            eventData.reloadTask = {
                id: task.id,
                name: task.name
            };
        }

        return eventData;
    }

    /**
     * create trigger model
     *
     * @param {*} data
     * @returns {TriggerModel}
     * @memberof TaskFactoryService
     */
    public createTriggerModel(taskId: string): Observable<TriggerModel> {
        const model = new TriggerModel();

        if (taskId) {
            const filter = this.filterFactory.createFilter('reloadTask.id', taskId);
            return this.http.get('/qrs/event/full', {
                params: {
                    filter: this.filterFactory.createFilterQueryString(filter)
                }
            }).pipe(
                map((events: any[]) => {
                    // validate event
                    let isValid = true;
                    isValid = isValid && events.length === 1;
                    isValid = isValid && events[0].incrementDescription === '0 0 1 0';
                    isValid = isValid && events[0].incrementOption === 1;
                    isValid = isValid && events[0].timeZone === 'Europe/Paris';
                    isValid = isValid && events[0].eventType === 0;

                    if (!isValid) {
                        throw new TaskIncomatibleException('task incompatible');
                    }

                    const startDate = MomentTimezone.tz(events[0].startDate, 'Europe/Paris');
                    model.hour = startDate.hour();
                    return model;
                })
            );
        }

        return of(model);
    }

    /**
     * create trigger model
     *
     * @param {*} data
     * @returns {TriggerModel}
     * @memberof TaskFactoryService
     */
    public createIdentificationModel(data: ITask): Observable<IdentificationModel> {
        const model = new IdentificationModel();
        model.app   = data && data.app ? data.app.id : null;
        model.name  = data ? data.name : null;
        return of(model);
    }

    /**
     *
     *
     * @private
     * @template T
     * @param {*} model
     * @param {*} modelData
     * @returns {T}
     * @memberof ReportService
     */
    private createModel(model: IModel<IDataNode>, modelData: IDataNode): Observable<IModel<IDataNode>> {
        const rawData = model.raw;
        const data    = modelData || {};

        Object.keys(rawData).forEach(property => {
            model[property] = data[property] === 'undefined' ? null : data[property];
        });
        return of(model);
    }
}
