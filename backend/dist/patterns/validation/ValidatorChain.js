"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeFormatValidator = exports.FutureDateValidator = exports.VetApprovalValidator = exports.PetOwnershipValidator = exports.ObjectIdValidator = exports.RequireFieldsValidator = exports.AbstractValidator = void 0;
class AbstractValidator {
    setNext(next) {
        this.next = next;
        return next;
    }
    async handle(ctx) {
        await this.validate(ctx);
        if (this.next)
            await this.next.handle(ctx);
    }
}
exports.AbstractValidator = AbstractValidator;
class RequireFieldsValidator extends AbstractValidator {
    constructor(fields) {
        super();
        this.fields = fields;
    }
    async validate(ctx) {
        const missing = this.fields.filter(f => ctx[f] === undefined || ctx[f] === null || ctx[f] === '');
        if (missing.length)
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
}
exports.RequireFieldsValidator = RequireFieldsValidator;
class ObjectIdValidator extends AbstractValidator {
    constructor(fieldNames, mongoose) {
        super();
        this.fieldNames = fieldNames;
        this.mongoose = mongoose;
    }
    async validate(ctx) {
        for (const f of this.fieldNames) {
            if (!this.mongoose.Types.ObjectId.isValid(ctx[f])) {
                throw new Error(`Invalid id for ${f}`);
            }
        }
    }
}
exports.ObjectIdValidator = ObjectIdValidator;
class PetOwnershipValidator extends AbstractValidator {
    constructor(userId) {
        super();
        this.userId = userId;
    }
    async validate(ctx) {
        const Pet = (await Promise.resolve().then(() => __importStar(require('../../models/Pet')))).default;
        const pet = await Pet.findOne({ _id: ctx.petId, owner: this.userId, isActive: true });
        if (!pet) {
            throw new Error('Pet not found or does not belong to you');
        }
    }
}
exports.PetOwnershipValidator = PetOwnershipValidator;
class VetApprovalValidator extends AbstractValidator {
    async validate(ctx) {
        const Veterinarian = (await Promise.resolve().then(() => __importStar(require('../../models/Veterinarian')))).default;
        const vet = await Veterinarian.findOne({ _id: ctx.veterinarianId, isApproved: true });
        if (!vet) {
            throw new Error('Veterinarian not found or not available');
        }
    }
}
exports.VetApprovalValidator = VetApprovalValidator;
class FutureDateValidator extends AbstractValidator {
    async validate(ctx) {
        const d = new Date(ctx.date);
        const now = new Date();
        if (!(d instanceof Date) || isNaN(d.getTime()) || d < now) {
            throw new Error('Appointment date must be in the future');
        }
    }
}
exports.FutureDateValidator = FutureDateValidator;
class TimeFormatValidator extends AbstractValidator {
    constructor(fieldPath) {
        super();
        this.fieldPath = fieldPath;
    }
    async validate(ctx) {
        const path = this.fieldPath.split('.');
        let value = ctx;
        for (const p of path)
            value = value?.[p];
        const re = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!value || !re.test(value)) {
            throw new Error('Please enter a valid time in HH:MM format');
        }
    }
}
exports.TimeFormatValidator = TimeFormatValidator;
//# sourceMappingURL=ValidatorChain.js.map