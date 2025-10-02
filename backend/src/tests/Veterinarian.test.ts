
import { expect } from 'chai';
import { Veterinarian } from '../classes/Veterinarian';

describe('Veterinarian Class', () => {
  let vet: Veterinarian;

  beforeEach(() => {
    vet = new Veterinarian(
      'vet1',
      'Dr. Dolittle',
      'dolittle@vet.com',
      'securepass',
      '0987654321',
      'General Practice',
      '10 years',
      { min: 50, max: 150 },
      'City Vet Clinic',
      'VET12345'
    );
  });

  it('should create an instance of Veterinarian', () => {
    expect(vet).to.be.an.instanceOf(Veterinarian);
  });

  it('should have veterinarian-specific properties', () => {
    expect(vet.specialization).to.equal('General Practice');
    expect(vet.experience).to.equal('10 years');
    expect(vet.isApproved).to.be.false;
    expect(vet.approvalStatus).to.equal('pending');
  });

  it('should return the correct role', () => {
    expect(vet.getRole()).to.equal('veterinarian');
  });

  it('should have base permissions when not approved', () => {
    const permissions = vet.getPermissions();
    expect(permissions).to.not.include('accept_appointments');
    expect(permissions).to.include('view_own_profile');
  });

  it('should have extended permissions when approved', () => {
    vet.isApproved = true;
    const permissions = vet.getPermissions();
    expect(permissions).to.include('accept_appointments');
    expect(permissions).to.include('prescribe_medications');
  });

  it('should validate veterinarian-specific fields', () => {
    const validation = vet.validate();
    expect(validation.isValid).to.be.true;

    const invalidVet = new Veterinarian('vet2', 'N', 'a@b.c', 'p', 'c', '', '', { min: 0, max: 0 });
    const invalidValidation = invalidVet.validate();
    expect(invalidValidation.isValid).to.be.false;
    expect(invalidValidation.errors).to.include('Specialization is required');
    expect(invalidValidation.errors).to.include('Experience is required');
    expect(invalidValidation.errors).to.include('Valid consultation fee range is required');
  });

  it('should update the rating correctly', () => {
    vet.updateRating(5);
    expect(vet.rating).to.equal(5);
    expect(vet.totalReviews).to.equal(1);

    vet.updateRating(3);
    expect(vet.rating).to.equal(4);
    expect(vet.totalReviews).to.equal(2);
  });

  it('should throw an error for an invalid rating', () => {
    expect(() => vet.updateRating(6)).to.throw('Rating must be between 0 and 5');
  });

  it('should manage certifications', () => {
    vet.addCertification('Certified Vet Tech');
    expect(vet.certifications).to.include('Certified Vet Tech');
    vet.removeCertification('Certified Vet Tech');
    expect(vet.certifications).to.not.include('Certified Vet Tech');
  });

  it('should not be able to accept appointments if not approved', () => {
    vet.isEmailVerified = true;
    vet.isApproved = false;
    expect(vet.canAcceptAppointments()).to.be.false;
  });

  it('should be able to accept appointments if approved and verified', () => {
    vet.isEmailVerified = true;
    vet.isApproved = true;
    expect(vet.canAcceptAppointments()).to.be.true;
  });

  it('should return available time slots for a given day', () => {
    const mondaySlots = vet.getAvailableTimesForDay('Monday');
    expect(mondaySlots).to.have.lengthOf(16); // 8 hours * 2 slots/hour
    expect(mondaySlots).to.include('09:00');
    expect(mondaySlots).to.include('16:30');

    const saturdaySlots = vet.getAvailableTimesForDay('Saturday');
    expect(saturdaySlots).to.be.empty;
  });
});
