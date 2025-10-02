"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const User_1 = require("../classes/User");
describe('User Class', () => {
    let user;
    beforeEach(() => {
        user = new User_1.User('1', 'Test User', 'test@example.com', 'password', '1234567890', '123 Main St', 'Has a dog', 'email');
    });
    it('should create an instance of User', () => {
        (0, chai_1.expect)(user).to.be.an.instanceOf(User_1.User);
    });
    it('should have user-specific properties', () => {
        (0, chai_1.expect)(user.address).to.equal('123 Main St');
        (0, chai_1.expect)(user.petOwnership).to.equal('Has a dog');
        (0, chai_1.expect)(user.preferredContact).to.equal('email');
    });
    it('should return the correct role', () => {
        (0, chai_1.expect)(user.getRole()).to.equal('user');
    });
    it('should return user-specific permissions', () => {
        const permissions = user.getPermissions();
        (0, chai_1.expect)(permissions).to.include('create_pets');
        (0, chai_1.expect)(permissions).to.include('rate_appointments');
    });
    it('should validate user-specific fields', () => {
        const validation = user.validate();
        (0, chai_1.expect)(validation.isValid).to.be.true;
        const invalidUser = new User_1.User('2', 'N', 'a@b.c', 'p', 'c', '', '', 'email');
        const invalidValidation = invalidUser.validate();
        (0, chai_1.expect)(invalidValidation.isValid).to.be.false;
        (0, chai_1.expect)(invalidValidation.errors).to.include('Address must be at least 5 characters');
    });
    it('should allow scheduling appointments if verified and not blocked', () => {
        user.isEmailVerified = true;
        user.isBlocked = false;
        (0, chai_1.expect)(user.canScheduleAppointment()).to.be.true;
    });
    it('should not allow scheduling appointments if blocked', () => {
        user.isEmailVerified = true;
        user.isBlocked = true;
        (0, chai_1.expect)(user.canScheduleAppointment()).to.be.false;
    });
    it('should allow canceling an appointment more than 24 hours away', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 2);
        (0, chai_1.expect)(user.canCancelAppointment(futureDate)).to.be.true;
    });
    it('should not allow canceling an appointment less than 24 hours away', () => {
        const soonDate = new Date();
        soonDate.setHours(soonDate.getHours() + 12);
        (0, chai_1.expect)(user.canCancelAppointment(soonDate)).to.be.false;
    });
    it('should return the correct contact preference', () => {
        (0, chai_1.expect)(user.getContactPreference()).to.deep.equal({ method: 'email', value: 'test@example.com' });
        user.preferredContact = 'phone';
        (0, chai_1.expect)(user.getContactPreference()).to.deep.equal({ method: 'phone', value: '1234567890' });
    });
    it('should create a user from the static factory method', () => {
        const newUser = User_1.User.create({
            id: '10',
            name: 'Factory User',
            email: 'factory@test.com',
            password: 'factorypass',
            contact: '5555555555',
            address: '1 Factory Lane'
        });
        (0, chai_1.expect)(newUser).to.be.an.instanceOf(User_1.User);
        (0, chai_1.expect)(newUser.name).to.equal('Factory User');
    });
});
//# sourceMappingURL=User.test.js.map