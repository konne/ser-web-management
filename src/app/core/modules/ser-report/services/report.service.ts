import { Injectable } from '@angular/core';
import { ISerGeneral, ISerTemplate, ISerConnection, IMailSettings, ISerSenseSelection, DistributeMode, IDeliverySettings } from 'ser.api';
import {
    DeliveryModel,
    EmailModel,
    FileModel,
    MailServerSettingsModel,
    HubModel,
    ReportModel,
    TemplateModel,
    GeneralSettingsModel,
    ConnectionModel
} from '../model';
import { ISerDelivery } from '../api/ser-delivery.interface';
import { ISerReport } from '../api/ser-report.interface';
import { SelectionModel } from '@core/modules/ser-report/model/selection.model';

@Injectable()
export class ReportService {

    /**
     *
     *
     * @param {ISerReport} data
     * @returns {ReportModel}
     * @memberof ReportService
     */
    public createReport(modelData: ISerReport): ReportModel {
        const data         = modelData || {general: null, distribute: null, connections: null, template: null};
        const report       = new ReportModel();
        report.general     = this.createGeneralData(data.general);
        report.distribute  = this.createDistributeData(data.distribute);
        report.connections = this.createConnectionData(data.connections);
        report.template    = this.createTemplateData(data.template);
        return report;
    }

    /**
     * update report data
     *
     * @param {*} report
     * @param {string} name
     * @param {string[]} path
     * @param {*} updateData
     * @memberof ReportService
     */
    public updateReport(report: ISerReport, name: string, path: string[], updateData: any): ISerReport {

        let model: any = report;

        /** get first correct model which is defined by path */
        path.concat([name]).forEach( (modelName: string) => {
            if ( ! model[modelName] ) {
                throw new Error('not not find correct model to update.');
            }
            model = model[modelName];
        });

        // template is a bit specific since we have an array of selections and not one selection

        /** set fields on model */
        Object.keys(model.raw).forEach( (property) => {
            if ( ! updateData[property] ) {
                return;
            }
            model[property] = updateData[property];
        });

        return report;
    }

    /**
     * clean report
     *
     * @param {*} report
     * @returns
     * @memberof ReportService
     */
    public cleanReport(report: any) {
        const data = report;
        for (const key in data) {
            if ( ! data.hasOwnProperty(key) ) {
                continue;
            }
            const value = data[key];
            if ( value && Object.prototype.toString.apply(value).slice(8, -1) === 'Object') {
                const cleaned = this.cleanReport(data[key]);
                if ( Object.keys(cleaned).length === 0 ) {
                    delete data[key];
                }
            } else {
                if ( data[key] === undefined ) {
                    delete data[key];
                }
            }
        }
        return data;
    }

    /**
     * create template model
     *
     * @private
     * @param {ISerTemplate} data
     * @returns {ISerTemplate}
     * @memberof ReportService
     */
    private createTemplateData(data: ISerTemplate): ISerTemplate  {

        const templateModel  = this.createModel<TemplateModel>(new TemplateModel(), data);
        const selections: SelectionModel[] = [];

        if (data && data.selections) {
            data.selections.forEach((selection: ISerSenseSelection) => {
                selections.push(this.createModel<SelectionModel>(new SelectionModel(), selection));
            });
        }

        templateModel.selections = selections;
        return templateModel;
    }

    /**
     *
     *
     * @private
     * @param {ISerGeneral} data
     * @returns {ISerGeneral}
     * @memberof ReportService
     */
    private createGeneralData(data: ISerGeneral): ISerGeneral  {
        const model = new GeneralSettingsModel();
        return this.createModel<GeneralSettingsModel>(model, data);
    }

    /**
     *
     *
     * @private
     * @param {ISerConnection} data
     * @returns {ISerConnection}
     * @memberof ReportService
     */
    private createConnectionData(data: ISerConnection): ISerConnection  {
        const model = new ConnectionModel();
        return this.createModel<ConnectionModel>(model, data);
    }

    /**
     *
     *
     * @private
     * @param {ISerDelivery} modelData
     * @returns {ISerDelivery}
     * @memberof ReportService
     */
    private createDistributeData(modelData: ISerDelivery): ISerDelivery  {
        const delivery = new DeliveryModel();
        const data     = modelData || {file: null, mail: null, hub: null};
        delivery.file  = this.createDeliveryModel(new FileModel(), data.file || {});
        delivery.hub   = this.createDeliveryModel(new HubModel(), data.hub || {});
        delivery.mail  = this.createMailData(data.mail);

        return delivery;
    }

    /**
     * create delivery model and add default mode
     *
     * @private
     * @param {IDeliverySettings} model
     * @param {*} data
     * @returns {IDeliverySettings}
     * @memberof ReportService
     */
    private createDeliveryModel(model: IDeliverySettings, data): IDeliverySettings {
        const createdModel: IDeliverySettings =  this.createModel<IDeliverySettings>(model, data);
        /** get default mode for delivery this is string value */
        const defaultMode: string = DistributeMode[DistributeMode.DELETEALLFIRST];
        /** get current mode for delivery, sanitize both to be a numeric value */
        const currentMode: string = data && data.mode ? DistributeMode[data.mode.toUpperCase()] : DistributeMode[defaultMode];
        /** set mode for model, convert numeric value (0, 1 or 2) into string value again */
        createdModel.mode = DistributeMode[currentMode];
        return createdModel;
    }

    /**
     *
     *
     * @private
     * @param {IMailSettings} mailData
     * @returns {IMailSettings}
     * @memberof ReportService
     */
    private createMailData(mailData: IMailSettings): IMailSettings {

        const mailModel = new EmailModel();
        const mailServer = new MailServerSettingsModel();
        const email = this.createModel<EmailModel>(mailModel, mailData);
        const server = this.createModel<MailServerSettingsModel>(mailServer, mailData.mailServer || {});

        email.mailServer = server;

        return email;
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
    private createModel<T>(model, modelData): T {

        const rawData = model.raw;
        const data    = modelData || {};

        Object.keys(rawData).forEach(property => {
            model[property] = data[property] || undefined;
        });
        return model;
    }
}
