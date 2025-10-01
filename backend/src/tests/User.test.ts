
import { expect } from 'chai';
import { User } from '../classes/User';

describe('User Class', () => {
  let user: User;

  beforeEach(() => {
    user = new User(
      '1',
      'Test User',
      'test@example.com',
      'password',
      '1234567890',
      '123 Main St',
      'Has a dog',
      'email'
    );
  });

  it('should create an instance of User', () => {
    expect(user).to.be.an.instanceOf(User);
  });

  it('should have user-specific properties', () => {
    expect(user.address).to.equal('123 Main St');
    expect(user.petOwnership).to.equal('Has a dog');
    expect(user.preferredContact).to.equal('email');
  });

  it('should return the correct role', () => {
    expect(user.getRole()).to.equal('user');
  });

  it('should return user-specific permissions', () => {
    const permissions = user.getPermissions();
    expect(permissions).to.include('create_pets');
    expect(permissions).to.include('rate_appointments');
  });

  it('should validate user-specific fields', () => {
    const validation = user.validate();
    expect(validation.isValid).to.be.true;

    const invalidUser = new User('2', 'N', 'a@b.c', 'p', 'c', '', '', 'email');
    const invalidValidation = invalidUser.validate();
    expect(invalidValidation.isValid).to.be.false;
    expect(invalidValidation.errors).to.include('Address must be at least 5 characters');
  });

  it('should allow scheduling appointments if verified and not blocked', () => {
    user.isEmailVerified = true;
    user.isBlocked = false;
    expect(user.canScheduleAppointment()).to.be.true;
  });

  it('should not allow scheduling appointments if blocked', () => {
    user.isEmailVerified = true;
    user.isBlocked = true;
    expect(user.canScheduleAppointment()).to.be.false;
  });

  it('should allow canceling an appointment more than 24 hours away', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);
    expect(user.canCancelAppointment(futureDate)).to.be.true;
  });

  it('should not allow canceling an appointment less than 24 hours away', () => {
    const soonDate = new Date();
    soonDate.setHours(soonDate.getHours() + 12);
    expect(user.canCancelAppointment(soonDate)).to.be.false;
  });

  it('should return the correct contact preference', () => {
    expect(user.getContactPreference()).to.deep.equal({ method: 'email', value: 'test@example.com' });
    user.preferredContact = 'phone';
    expect(user.getContactPreference()).to.deep.equal({ method: 'phone', value: '1234567890' });
  });

  it('should create a user from the static factory method', () => {
    const newUser = User.create({
      id: '10',
      name: 'Factory User',
      email: 'factory@test.com',
      password: 'factorypass',
      contact: '5555555555',
      address: '1 Factory Lane'
    });
    expect(newUser).to.be.an.instanceOf(User);
    expect(newUser.name).to.equal('Factory User');
  });
});
