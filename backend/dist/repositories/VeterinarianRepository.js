"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeterinarianRepository = void 0;
const Veterinarian_1 = __importDefault(require("../models/Veterinarian"));
class VeterinarianRepository {
    async findById(id) {
        return Veterinarian_1.default.findById(id).select('-password');
    }
    async listApproved() {
        return Veterinarian_1.default.find({ approvalStatus: 'approved', isBlocked: false }).select('-password').sort({ createdAt: -1 });
    }
}
exports.VeterinarianRepository = VeterinarianRepository;
//# sourceMappingURL=VeterinarianRepository.js.map