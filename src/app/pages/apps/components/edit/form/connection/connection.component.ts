import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map, mergeMap, filter, mergeAll, flatMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { ISerFormResponse } from '../../../../api/ser-form.response.interface';

import { FormService } from '@smc/modules/form-helper';
import { IApp } from '@smc/modules/qrs';
import { IApp as ISerApp } from '@smc/modules/ser';

@Component({
    selector: 'smc-apps--edit-form-connection',
    templateUrl: 'connection.component.html'
})
export class ConnectionComponent implements OnInit, OnDestroy {

    public connectionForm: FormGroup;
    public apps: IApp[];
    public currentApp: ISerApp;

    private formBuilder: FormBuilder;
    private formService: FormService<ISerApp, ISerFormResponse>;
    private updateHook: Observable<any>;

    constructor(
        formBuilder: FormBuilder,
        formService: FormService<ISerApp, ISerFormResponse>
    ) {
        this.formBuilder = formBuilder;
        this.formService = formService;
    }

    /**
     * on component get destroyed
     *
     * @memberof ConnectionComponent
     */
    ngOnDestroy() {
        // @todo implement
        this.formService.unRegisterHook(FormService.HOOK_UPDATE, this.updateHook);
    }

    /**
     * on component will be initialized
     *
     * @memberof ConnectionComponent
     */
    ngOnInit() {

        /** create / register update hook if form should be updated */
        this.updateHook = this.buildUpdateHook();
        this.formService.registerHook(FormService.HOOK_UPDATE, this.updateHook);

        /** register on app has been loaded */
        this.formService.editModel()
        .pipe(
            mergeMap( (app: ISerApp) => {
                return this.loadAvailableApps(app);
            })
        )
        .subscribe ((result) => {
            this.currentApp = result.app;
            this.apps       = result.apps;

            if ( this.currentApp ) {
                /** @todo should only update form fields and not create every time a new form group */
                this.connectionForm = this.buildFormGroup();
            }
        });
    }

    /**
     * load all available apps which can used as connection
     *
     * @private
     * @param {ISerApp} app
     * @returns {Observable<{app: ISerApp, apps: IApp[]}>}
     * @memberof ConnectionComponent
     *
     * @todo load specific amount of apps not that much
     * @todo add filter we want to remove appId from apps
     */
    private loadAvailableApps(app: ISerApp): Observable<any> {

        /*
        return this.appManager.loadApps()
        .pipe(
            map( (apps: IApp[]) => {
                return apps.filter( (qapp: IApp) => {
                    return app !== null && qapp.id !== app.appId;
                });
            }),
            map( (apps: IApp[]) => {
                return {app, apps};
            })
        );
        */

        return of([]);
    }

    /**
     * build a form group for connection
     *
     * @private
     * @returns {FormGroup}
     * @memberof ConnectionComponent
     */
    private buildFormGroup(): FormGroup {

        const formGroup = this.formBuilder.group({
            app: this.formBuilder.control(this.currentApp.report.connections.app, Validators.required)
        });

        return formGroup;
    }

    /**
     * create hook for form should updated
     *
     * @private
     * @returns {Observable<string>}
     * @memberof ConnectionComponent
     */
    private buildUpdateHook(): Observable<ISerFormResponse> {

        const observer = new Observable<ISerFormResponse>((obs) => {
            obs.next({
                data: [{
                    fields: this.connectionForm.getRawValue(),
                    group: 'connections',
                    path: ''
                }],
                errors: [],
                valid: this.connectionForm.valid,
            });
        });

        return observer;
    }
}