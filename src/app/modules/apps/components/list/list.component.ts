import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IQlikApp } from '@apps/api/app.interface';
import { SerAppManagerService } from '@core/modules//ser-app/provider/ser-app-manager.service';
import { SelectionModel } from '@angular/cdk/collections';
import { Subscription } from 'rxjs';
import { ListHeaderService } from '@core/modules/list-header/services/list-header.service';

@Component({
    selector: 'app-list',
    templateUrl: 'list.component.html',
    styleUrls: ['./list.component.scss'],
    viewProviders: [ListHeaderService]
})
export class AppListComponent implements OnInit {

    public qlikApps: IQlikApp[] = [];

    public tableHeaders: string[] = ['name', 'id'];

    public isLoading = true;

    public selection: SelectionModel<IQlikApp>;

    private serAppsSub: Subscription;

    private appManager: SerAppManagerService;

    private router: Router;

    private route: ActivatedRoute;

    private listHeaderService: ListHeaderService;

    constructor(
        route: ActivatedRoute,
        routerProvider: Router,
        appManager: SerAppManagerService,
        listHeaderService: ListHeaderService
    ) {
        this.route      = route;
        this.router     = routerProvider;
        this.appManager = appManager;
        this.selection  = new SelectionModel<IQlikApp>();
        this.listHeaderService = listHeaderService;
     }

    public async ngOnInit() {

        this.serAppsSub = this.appManager.loadSerApps()
            .subscribe( (apps) => {
                this.isLoading = false;
                this.qlikApps = apps;

                this.listHeaderService.updateData({
                    total: apps.length, showing: apps.length, selected: 0
                });
            });
    }

    /**
     * delete existing app
     *
     * @param {IQlikApp} app
     * @memberof AppListComponent
     */
    public deleteApp(app: IQlikApp) {
    }

    /**
     * edit existing app
     *
     * @param {IQlikApp} app
     * @memberof AppListComponent
     */
    public editApp() {
        this.appManager.selectApps(this.selection.selected);
        this.router.navigate([`edit/${this.selection.selected[0].qDocId}`], { relativeTo: this.route});
    }

    /**
     * select app in list
     *
     * @param {IQlikApp} app
     * @memberof AppListComponent
     */
    public selectApp(app: IQlikApp) {
        this.selection.select(app);

        this.listHeaderService.updateData({
            total: this.qlikApps.length,
            showing: this.qlikApps.length,
            selected: this.selection.selected.length
        });
    }

    /**
     *
     *
     * @memberof AppListComponent
     */
    public createApp() {
        this.router.navigate([`new`], { relativeTo: this.route});
    }

    /**
     *
     *
     * @memberof AppListComponent
     */
    public reloadList() {
        this.isLoading = true;

        this.selection.clear();
        this.serAppsSub.unsubscribe();
        this.serAppsSub = this.appManager.loadSerApps(true)
            .subscribe( (apps: IQlikApp[]) => {
                this.isLoading = false;
                this.qlikApps = apps;

                this.listHeaderService.updateData({
                    total: apps.length, showing: apps.length, selected: 0
                });
            });
    }
}
