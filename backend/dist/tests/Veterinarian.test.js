"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Veterinarian_1 = require("../classes/Veterinarian");
describe('Veterinarian Class', () => {
    let vet;
    beforeEach(() => {
        vet = new Veterinarian_1.Veterinarian('vet1', 'Dr. Dolittle', 'dolittle@vet.com', 'securepass', '0987654321', 'General Practice', '10 years', { min: 50, max: 150 }, 'City Vet Clinic', 'VET12345');
    });
    it('should create an instance of Veterinarian', () => {
        (0, chai_1.expect)(vet).to.be.an.instanceOf(Veterinarian_1.Veterinarian);
    });
    it('should have veterinarian-specific properties', () => {
        (0, chai_1.expect)(vet.specialization).to.equal('General Practice');
        (0, chai_1.expect)(vet.experience).to.equal('10 years');
        (0, chai_1.expect)(vet.isApproved).to.be.false;
        (0, chai_1.expect)(vet.approvalStatus).to.equal('pending');
    });
    it('should return the correct role', () => {
        (0, chai_1.expect)(vet.getRole()).to.equal('veterinarian');
    });
    it('should have base permissions when not approved', () => {
        const permissions = vet.getPermissions();
        (0, chai_1.expect)(permissions).to.not.include('accept_appointments');
        (0, chai_1.expect)(permissions).to.include('view_own_profile');
    });
    it('should have extended permissions when approved', () => {
        vet.isApproved = true;
        const permissions = vet.getPermissions();
        (0, chai_1.expect)(permissions).to.include('accept_appointments');
        (0, chai_1.expect)(permissions).to.include('prescribe_medications');
    });
    it('should validate veterinarian-specific fields', () => {
        const validation = vet.validate();
        (0, chai_1.expect)(validation.isValid).to.be.true;
        const invalidVet = new Veterinarian_1.Veterinarian('vet2', 'N', 'a@b.c', 'p', 'c', '', '', { min: 0, max: 0 });
        const invalidValidation = invalidVet.validate();
        (0, chai_1.expect)(invalidValidation.isValid).to.be.false;
        (0, chai_1.expect)(invalidValidation.errors).to.include('Specialization is required');
        (0, chai_1.expect)(invalidValidation.errors).to.include('Experience is required');
        (0, chai_1.expect)(invalidValidation.errors).to.include('Valid consultation fee range is required');
    });
    it('should update the rating correctly', () => {
        vet.updateRating(5);
        (0, chai_1.expect)(vet.rating).to.equal(5);
        (0, chai_1.expect)(vet.totalReviews).to.equal(1);
        vet.updateRating(3);
        (0, chai_1.expect)(vet.rating).to.equal(4);
        (0, chai_1.expect)(vet.totalReviews).to.equal(2);
    });
    it('should throw an error for an invalid rating', () => {
        (0, chai_1.expect)(() => vet.updateRating(6)).to.throw('Rating must be between 0 and 5');
    });
    it('should manage certifications', () => {
        vet.addCertification('Certified Vet Tech');
        (0, chai_1.expect)(vet.certifications).to.include('Certified Vet Tech');
        vet.removeCertification('Certified Vet Tech');
        (0, chai_1.expect)(vet.certifications).to.not.include('Certified Vet Tech');
    });
    it('should not be able to accept appointments if not approved', () => {
        vet.isEmailVerified = true;
        vet.isApproved = false;
        (0, chai_1.expect)(vet.canAcceptAppointments()).to.be.false;
    });
    it('should be able to accept appointments if approved and verified', () => {
        vet.isEmailVerified = true;
        vet.isApproved = true;
        (0, chai_1.expect)(vet.canAcceptAppointments()).to.be.true;
    });
    it('should return available time slots for a given day', () => {
        const mondaySlots = vet.getAvailableTimesForDay('Monday');
        (0, chai_1.expect)(mondaySlots).to.have.lengthOf(16);
        (0, chai_1.expect)(mondaySlots).to.include('09:00');
        (0, chai_1.expect)(mondaySlots).to.include('16:30');
        const saturdaySlots = vet.getAvailableTimesForDay('Saturday');
        (0, chai_1.expect)(saturdaySlots).to.be.empty;
    });
});
//# sourceMappingURL=Veterinarian.test.js.map