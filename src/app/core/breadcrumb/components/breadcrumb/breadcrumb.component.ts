import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from '../../provider/breadcrumb.service';
import { IBreadCrumb } from '../../api/breadcrumb.interface';

@Component({
  selector: 'smc-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent implements OnInit {

  private breadcrumbService: BreadcrumbService;

  public breadcrumbs: Array<IBreadCrumb>;

  constructor(
    breadcrumbService: BreadcrumbService,
  ) {
    this.breadcrumbService = breadcrumbService;
    this.breadcrumbs = [];
  }

  ngOnInit() {
    this.breadcrumbService.breadcrumbs
      .subscribe( (breadcrumbs: Array<IBreadCrumb>) => {
        this.breadcrumbs = breadcrumbs;
      });
  }
}
