"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const User_1 = __importDefault(require("../models/User"));
class UserRepository {
    async findById(id) {
        return User_1.default.findById(id).select('-password');
    }
    async findByEmail(email) {
        return User_1.default.findOne({ email: email.toLowerCase() }).select('-password');
    }
    async list(limit = 50) {
        return User_1.default.find().select('-password').sort({ createdAt: -1 }).limit(limit);
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=UserRepository.js.map