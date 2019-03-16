import { AbstractLicense } from './license';
import { IValidationResult, LicenseType } from '../api';
import { licenseBrokenError } from '../validators/validation.tokens';

export class BrokenLicense extends AbstractLicense {

    public get licenseType(): LicenseType {
        return LicenseType.BROKEN;
    }

    public validate(): IValidationResult {
        return {
            isValid: false,
            errors: new WeakSet([licenseBrokenError])
        };
    }
}
