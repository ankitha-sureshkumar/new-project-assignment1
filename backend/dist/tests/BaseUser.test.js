"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const BaseUser_1 = require("../classes/BaseUser");
class TestUser extends BaseUser_1.BaseUser {
    constructor(id, name, email, password, contact, profilePicture) {
        super(id, name, email, password, contact, profilePicture);
    }
    getRole() {
        return 'user';
    }
    async getDashboardData() {
        return { testData: 'data' };
    }
    getPermissions() {
        return ['read', 'write'];
    }
}
describe('BaseUser Class', () => {
    let user;
    beforeEach(() => {
        user = new TestUser('1', 'John Doe', 'john.doe@example.com', 'password123', '1234567890');
    });
    it('should create an instance of BaseUser', () => {
        (0, chai_1.expect)(user).to.be.an.instanceOf(TestUser);
        (0, chai_1.expect)(user).to.be.an.instanceOf(BaseUser_1.BaseUser);
    });
    it('should correctly initialize properties', () => {
        (0, chai_1.expect)(user.id).to.equal('1');
        (0, chai_1.expect)(user.name).to.equal('John Doe');
        (0, chai_1.expect)(user.email).to.equal('john.doe@example.com');
        (0, chai_1.expect)(user.contact).to.equal('1234567890');
        (0, chai_1.expect)(user.isEmailVerified).to.be.false;
        (0, chai_1.expect)(user.isBlocked).to.be.false;
    });
    it('should update the name using the setter', () => {
        user.name = 'Jane Doe';
        (0, chai_1.expect)(user.name).to.equal('Jane Doe');
    });
    it('should throw an error for an invalid name', () => {
        (0, chai_1.expect)(() => { user.name = 'J'; }).to.throw('Name must be at least 2 characters');
    });
    it('should update the email using the setter', () => {
        user.email = 'jane.doe@example.com';
        (0, chai_1.expect)(user.email).to.equal('jane.doe@example.com');
    });
    it('should throw an error for an invalid email', () => {
        (0, chai_1.expect)(() => { user.email = 'invalid-email'; }).to.throw('Invalid email format');
    });
    it('should correctly validate a valid user', () => {
        const validation = user.validate();
        (0, chai_1.expect)(validation.isValid).to.be.true;
        (0, chai_1.expect)(validation.errors).to.be.empty;
    });
    it('should return errors for an invalid user', () => {
        const invalidUser = new TestUser('2', '', '', '', '');
        const validation = invalidUser.validate();
        (0, chai_1.expect)(validation.isValid).to.be.false;
        (0, chai_1.expect)(validation.errors).to.have.lengthOf(3);
        (0, chai_1.expect)(validation.errors).to.include('Name must be at least 2 characters');
        (0, chai_1.expect)(validation.errors).to.include('Valid email is required');
        (0, chai_1.expect)(validation.errors).to.include('Contact number is required');
    });
    it('should return a safe object without the password', () => {
        const safeObject = user.toSafeObject();
        (0, chai_1.expect)(safeObject).to.have.property('name', 'John Doe');
        (0, chai_1.expect)(safeObject).to.not.have.property('password');
    });
    it('should return a document object with the password', () => {
        const docObject = user.toDocument();
        (0, chai_1.expect)(docObject).to.have.property('password', 'password123');
    });
    it('should have a formatted display name', () => {
        const userWithWeirdName = new TestUser('3', 'jAnE dOE', 'jane@test.com', 'pass', '123');
        (0, chai_1.expect)(userWithWeirdName.displayName).to.equal('Jane Doe');
    });
    it('should compare passwords correctly', async () => {
        const userWithHashedPass = new TestUser('4', 'Test', 'test@test.com', '', '123');
        await userWithHashedPass.updatePassword('newPassword');
        const isMatch = await userWithHashedPass.comparePassword('newPassword');
        const isNotMatch = await userWithHashedPass.comparePassword('wrongPassword');
        (0, chai_1.expect)(isMatch).to.be.true;
        (0, chai_1.expect)(isNotMatch).to.be.false;
    });
    it('should not allow passwords shorter than 6 characters', async () => {
        try {
            await user.updatePassword('123');
            chai_1.expect.fail('Password update should have failed.');
        }
        catch (error) {
            (0, chai_1.expect)(error.message).to.equal('Password must be at least 6 characters');
        }
    });
});
//# sourceMappingURL=BaseUser.test.js.map