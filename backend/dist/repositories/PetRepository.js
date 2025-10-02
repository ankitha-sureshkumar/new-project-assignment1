"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PetRepository = void 0;
const Pet_1 = __importDefault(require("../models/Pet"));
class PetRepository {
    async listByOwner(ownerId) {
        return Pet_1.default.find({ owner: ownerId, isActive: true }).sort({ createdAt: -1 });
    }
}
exports.PetRepository = PetRepository;
//# sourceMappingURL=PetRepository.js.map