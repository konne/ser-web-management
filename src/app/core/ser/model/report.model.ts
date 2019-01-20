import { ISerGeneral, ISerTemplate, ISerConnection } from 'ser.api';
import { ISerReport } from '../api/report.interface';
import { ISerDelivery } from '../api/ser-delivery.interface';
import {
    GeneralSettingsModel,
    TemplateModel,
    ConnectionModel,
    DeliveryModel
} from './';

export class ReportModel implements ISerReport {

    private reportGeneral: ISerGeneral;

    private reportTemplate: ISerTemplate;

    private reportConnections: ISerConnection;

    private reportDistribute: ISerDelivery;

    public set connections(connections: ISerConnection) {
        this.reportConnections = connections;
    }

    public set distribute(delivery: ISerDelivery) {
        this.reportDistribute = delivery;
    }

    public set general(value: ISerGeneral) {
        this.reportGeneral = value;
    }

    public set template(template: ISerTemplate) {
        this.reportTemplate = template;
    }

    public get connections(): ISerConnection {
        return this.reportConnections;
    }

    public get distribute(): ISerDelivery {
        return this.reportDistribute;
    }

    public get general(): ISerGeneral {
        return this.reportGeneral;
    }

    public get template(): ISerTemplate {
        return this.reportTemplate;
    }

    public get raw(): ISerReport {

        const general     = this.reportGeneral     as GeneralSettingsModel;
        const template    = this.reportTemplate    as TemplateModel;
        const connections = this.reportConnections as ConnectionModel;
        const distribute  = this.reportDistribute  as DeliveryModel;

        return {
            general    : general.raw,
            template   : template.raw,
            connections: connections.raw,
            distribute : distribute.raw
        };
    }
}
