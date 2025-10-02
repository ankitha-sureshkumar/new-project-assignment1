"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildUserContext = buildUserContext;
const AccessProxy_1 = require("./AccessProxy");
function buildUserContext(req) {
    const role = req.userRole || 'user';
    const isBlocked = req.user?.isBlocked || false;
    const isApproved = req.user?.isApproved || false;
    const base = [];
    if (role === 'user') {
        base.push(AccessProxy_1.Permission.READ_OWN_DATA, AccessProxy_1.Permission.WRITE_OWN_DATA, AccessProxy_1.Permission.DELETE_OWN_DATA);
    }
    if (role === 'veterinarian') {
        base.push(AccessProxy_1.Permission.READ_ALL_DATA, AccessProxy_1.Permission.ACCESS_MEDICAL_RECORDS, AccessProxy_1.Permission.APPROVE_APPOINTMENTS);
    }
    if (role === 'admin') {
        base.push(AccessProxy_1.Permission.READ_ALL_DATA, AccessProxy_1.Permission.WRITE_ALL_DATA, AccessProxy_1.Permission.DELETE_ALL_DATA, AccessProxy_1.Permission.MANAGE_USERS, AccessProxy_1.Permission.MANAGE_VETERINARIANS, AccessProxy_1.Permission.VIEW_SENSITIVE_DATA);
    }
    return {
        userId: req.userId || '',
        role,
        permissions: base,
        isBlocked,
        isApproved
    };
}
//# sourceMappingURL=AccessContext.js.map