import { Injectable, Inject } from '@angular/core';
import { AppRepository } from './app.repository';
import { switchMap, mergeMap, reduce, map, combineAll, catchError, bufferCount, concatMap } from 'rxjs/operators';
import { from, of, Observable, forkJoin } from 'rxjs';
import { ITask, IApp, TaskRepository as QrsTaskRepository, FilterFactory, IQrsFilter, IQrsFilterGroup } from '@smc/modules/qrs';
import { SMC_SESSION } from '@smc/modules/smc-common/model/session.model';
import { ISettings } from '@smc/modules/smc-common/api';

@Injectable()
export class TaskRepository {

    constructor(
        @Inject(SMC_SESSION) private session: ISettings,
        private appRepository: AppRepository,
        private qrsTaskRepository: QrsTaskRepository,
        private filterFactory: FilterFactory
    ) { }

    public fetchTasks(filter?: IQrsFilter): Observable<ITask[]> {
        const filters: IQrsFilterGroup = this.filterFactory.createFilterGroup();

        if (this.session.serTag) {
            const serTagFilter: IQrsFilter = this.filterFactory.createFilter('tags.id', this.session.serTag.id);
            filters.addFilter(serTagFilter);
        }

        if (filter) {
            filters.addFilter(filter);
        }

        let task$: Observable<ITask[]> = this.qrsTaskRepository.fetchTasks(filters);

        if (!this.session.serTag) {
            task$ = task$.pipe(
                mergeMap((tasks: ITask[]) => this.filterTasks(tasks))
            );
        }
        return task$;
    }

    /**
     * sync tasks and add SER tag
     * have to return a number
     *
     * @memberof SerTaskService
     */
    public synchronizeTasks() {

        return this.appRepository.fetchApps().pipe(
            switchMap((apps) => {
                if (apps.length === 0) {
                    throw new Error('no apps found');
                }

                return from(apps).pipe(
                    mergeMap((app: IApp) => {
                        const filter = this.filterFactory.createFilter('app.id', app.id);
                        return this.qrsTaskRepository.fetchTasks(filter);
                    })
                );
            }),
            reduce((appTasks: ITask[], allTasks: ITask[]) => {
                return allTasks.concat(appTasks);
            }),
            switchMap((tasks) => {
                if (tasks.length === 0) {
                    throw new Error('no tasks found');
                }
                return from(tasks).pipe(
                    map(task => {
                        task.tags.push(this.session.serTag);
                        return this.qrsTaskRepository.updateTask(task);
                    })
                );
            }),
            combineAll(),
            catchError((error) => {
                return of([]);
            })
        );
    }

    /**
     * filter tasks for valid apps, app which has been validated
     * means the app contains a SER Script should be shown
     *
     * @private
     * @param {ITask[]} tasks
     * @returns {Observable<ITask[]>}
     * @memberof TaskRepository
     */
    private filterTasks(tasks: ITask[]): Observable<ITask[]> {
        return from(tasks).pipe(
            concatMap(task => forkJoin(of(task), this.appRepository.filterApps([task.app]))),
            map((response: [ITask, IApp[]]) => {
                const [task, app] = response;
                if (!app[0]) {
                    return null;
                }
                return task;
            }),
            bufferCount(tasks.length),
            map((response) => response.filter((task) => !!task))
        );
    }
}
