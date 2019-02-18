import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReportModel } from '@smc/modules/ser';
import { Observable, Subject } from 'rxjs';
import { FormService } from '@smc/modules/form-helper';
import { takeUntil } from 'rxjs/operators';
import { ISerSenseSelection } from 'ser.api';

@Component({
    selector: 'smc-edit-form-selections',
    templateUrl: 'selection.component.html'
})
export class SelectionComponent implements OnInit, OnDestroy {

    public selections: ISerSenseSelection[] = [];

    /**
     * emits true if component gets destroyed
     *
     * @private
     * @type {Subject<boolean>}
     * @memberof SelectionComponent
     */
    private onDestroyed$: Subject<boolean> = new Subject();

    /**
     * update hook stream, will called if app save or preview is called
     *
     * @private
     * @type {Observable<boolean>}
     * @memberof SelectionComponent
     */
    private updateHook: Observable<boolean>;

    /**
     * loaded report model
     *
     * @private
     * @type {ReportModel}
     * @memberof SelectionComponent
     */
    private report: ReportModel;

    /**
     * Creates an instance of SelectionComponent.
     * @param {AppConnector} appConnector
     * @param {FormBuilder} formBuilder
     * @param {FormService<ReportModel, boolean>} formService
     * @memberof SelectionComponent
     */
    constructor(
        private formService: FormService<ReportModel, boolean>
    ) {
    }

    /**
     * component gets initialized
     *
     * @memberof SelectionComponent
     */
    ngOnInit() {
        /** create / register update hook if form should be updated */
        this.updateHook = this.buildUpdateHook();
        this.formService.registerHook(FormService.HOOK_UPDATE, this.updateHook);

        this.registerFormService();
    }

    /**
     * component gets destroyed
     *
     * @memberof SelectionComponent
     */
    ngOnDestroy(): void {
        this.onDestroyed$.next(true);
        this.onDestroyed$.complete();
    }

    /**
     * register to form service to get notified if a model has
     * been loaded
     *
     * @private
     * @memberof SelectionComponent
     */
    private registerFormService() {
        /** register on app has been loaded and model has been loaded to edit*/
        this.formService.editModel()
            .pipe(takeUntil(this.onDestroyed$))
            .subscribe((report: ReportModel) => {
                const s = report.template.selections;
                this.report = report;
                console.log('das sollte erstmal volle kanne failen');
                if (this.report) {
                    this.selections = this.report.template.selections || [];
                }
            });
    }

    /**
     * create hook for form should updated
     *
     * @private
     * @returns {Observable<string>}
     * @memberof ConnectionComponent
     */
    private buildUpdateHook(): Observable<boolean> {
        const observer = new Observable<boolean>((obs) => {

            /*
            this.report.template.selections = [{
                name: this.selectionName.length ? this.selectionName : undefined,
                values: this.valueNames.length ? this.valueNames : undefined,
                objectType, type: formData.type
            }];
            */
            obs.next(true);

            this.onDestroyed$.subscribe(() => obs.complete());
        });
        return observer;
    }
}
