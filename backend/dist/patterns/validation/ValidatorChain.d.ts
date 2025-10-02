export type ValidationContext = {
    [key: string]: any;
};
export interface Validator {
    setNext(next: Validator): Validator;
    handle(ctx: ValidationContext): Promise<void>;
}
export declare abstract class AbstractValidator implements Validator {
    private next?;
    setNext(next: Validator): Validator;
    handle(ctx: ValidationContext): Promise<void>;
    protected abstract validate(ctx: ValidationContext): Promise<void>;
}
export declare class RequireFieldsValidator extends AbstractValidator {
    private fields;
    constructor(fields: string[]);
    protected validate(ctx: ValidationContext): Promise<void>;
}
export declare class ObjectIdValidator extends AbstractValidator {
    private fieldNames;
    private mongoose;
    constructor(fieldNames: string[], mongoose: any);
    protected validate(ctx: ValidationContext): Promise<void>;
}
export declare class PetOwnershipValidator extends AbstractValidator {
    private userId;
    constructor(userId: string);
    protected validate(ctx: ValidationContext): Promise<void>;
}
export declare class VetApprovalValidator extends AbstractValidator {
    protected validate(ctx: ValidationContext): Promise<void>;
}
export declare class FutureDateValidator extends AbstractValidator {
    protected validate(ctx: ValidationContext): Promise<void>;
}
export declare class TimeFormatValidator extends AbstractValidator {
    private fieldPath;
    constructor(fieldPath: string);
    protected validate(ctx: ValidationContext): Promise<void>;
}
//# sourceMappingURL=ValidatorChain.d.ts.map