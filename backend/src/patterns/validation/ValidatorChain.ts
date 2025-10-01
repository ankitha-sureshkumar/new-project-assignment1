export type ValidationContext = { [key: string]: any };

export interface Validator {
  setNext(next: Validator): Validator;
  handle(ctx: ValidationContext): Promise<void>;
}

export abstract class AbstractValidator implements Validator {
  private next?: Validator;
  setNext(next: Validator): Validator {
    this.next = next;
    return next;
  }
  async handle(ctx: ValidationContext): Promise<void> {
    await this.validate(ctx);
    if (this.next) await this.next.handle(ctx);
  }
  protected abstract validate(ctx: ValidationContext): Promise<void>;
}

// Concrete validators
export class RequireFieldsValidator extends AbstractValidator {
  constructor(private fields: string[]) { super(); }
  protected async validate(ctx: ValidationContext): Promise<void> {
    const missing = this.fields.filter(f => ctx[f] === undefined || ctx[f] === null || ctx[f] === '');
    if (missing.length) throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

export class ObjectIdValidator extends AbstractValidator {
  constructor(private fieldNames: string[], private mongoose: any) { super(); }
  protected async validate(ctx: ValidationContext): Promise<void> {
    for (const f of this.fieldNames) {
      if (!this.mongoose.Types.ObjectId.isValid(ctx[f])) {
        throw new Error(`Invalid id for ${f}`);
      }
    }
  }
}

// Domain-specific validators
export class PetOwnershipValidator extends AbstractValidator {
  constructor(private userId: string) { super(); }
  protected async validate(ctx: ValidationContext): Promise<void> {
    const Pet = (await import('../../models/Pet')).default;
    const pet = await Pet.findOne({ _id: ctx.petId, owner: this.userId, isActive: true });
    if (!pet) {
      throw new Error('Pet not found or does not belong to you');
    }
  }
}

export class VetApprovalValidator extends AbstractValidator {
  protected async validate(ctx: ValidationContext): Promise<void> {
    const Veterinarian = (await import('../../models/Veterinarian')).default;
    const vet = await Veterinarian.findOne({ _id: ctx.veterinarianId, isApproved: true });
    if (!vet) {
      throw new Error('Veterinarian not found or not available');
    }
  }
}

export class FutureDateValidator extends AbstractValidator {
  protected async validate(ctx: ValidationContext): Promise<void> {
    const d = new Date(ctx.date);
    const now = new Date();
    if (!(d instanceof Date) || isNaN(d.getTime()) || d < now) {
      throw new Error('Appointment date must be in the future');
    }
  }
}

export class TimeFormatValidator extends AbstractValidator {
  constructor(private fieldPath: string) { super(); }
  protected async validate(ctx: ValidationContext): Promise<void> {
    // Supports ctx.time or ctx.timeSlot.startTime depending on fieldPath
    const path = this.fieldPath.split('.');
    let value: any = ctx;
    for (const p of path) value = value?.[p];
    const re = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!value || !re.test(value)) {
      throw new Error('Please enter a valid time in HH:MM format');
    }
  }
}
