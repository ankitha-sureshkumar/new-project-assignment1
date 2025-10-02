
import { expect } from 'chai';
import { BaseUser } from '../classes/BaseUser';

// A concrete class for testing the abstract BaseUser
class TestUser extends BaseUser {
  constructor(
    id: string,
    name: string,
    email: string,
    password: string,
    contact: string,
    profilePicture?: string
  ) {
    super(id, name, email, password, contact, profilePicture);
  }

  getRole(): 'user' | 'veterinarian' {
    return 'user';
  }

  async getDashboardData(): Promise<any> {
    return { testData: 'data' };
  }

  getPermissions(): string[] {
    return ['read', 'write'];
  }
}

describe('BaseUser Class', () => {
  let user: TestUser;

  beforeEach(() => {
    user = new TestUser(
      '1',
      'John Doe',
      'john.doe@example.com',
      'password123',
      '1234567890'
    );
  });

  it('should create an instance of BaseUser', () => {
    expect(user).to.be.an.instanceOf(TestUser);
    expect(user).to.be.an.instanceOf(BaseUser);
  });

  it('should correctly initialize properties', () => {
    expect(user.id).to.equal('1');
    expect(user.name).to.equal('John Doe');
    expect(user.email).to.equal('john.doe@example.com');
    expect(user.contact).to.equal('1234567890');
    expect(user.isEmailVerified).to.be.false;
    expect(user.isBlocked).to.be.false;
  });

  it('should update the name using the setter', () => {
    user.name = 'Jane Doe';
    expect(user.name).to.equal('Jane Doe');
  });

  it('should throw an error for an invalid name', () => {
    expect(() => { user.name = 'J'; }).to.throw('Name must be at least 2 characters');
  });

  it('should update the email using the setter', () => {
    user.email = 'jane.doe@example.com';
    expect(user.email).to.equal('jane.doe@example.com');
  });

  it('should throw an error for an invalid email', () => {
    expect(() => { user.email = 'invalid-email'; }).to.throw('Invalid email format');
  });

  it('should correctly validate a valid user', () => {
    const validation = user.validate();
    expect(validation.isValid).to.be.true;
    expect(validation.errors).to.be.empty;
  });

  it('should return errors for an invalid user', () => {
    const invalidUser = new TestUser('2', '', '', '', '');
    const validation = invalidUser.validate();
    expect(validation.isValid).to.be.false;
    expect(validation.errors).to.have.lengthOf(3);
    expect(validation.errors).to.include('Name must be at least 2 characters');
    expect(validation.errors).to.include('Valid email is required');
    expect(validation.errors).to.include('Contact number is required');
  });

  it('should return a safe object without the password', () => {
    const safeObject = user.toSafeObject();
    expect(safeObject).to.have.property('name', 'John Doe');
    expect(safeObject).to.not.have.property('password');
  });

  it('should return a document object with the password', () => {
    const docObject = user.toDocument();
    expect(docObject).to.have.property('password', 'password123');
  });

  it('should have a formatted display name', () => {
    const userWithWeirdName = new TestUser('3', 'jAnE dOE', 'jane@test.com', 'pass', '123');
    expect(userWithWeirdName.displayName).to.equal('Jane Doe');
  });

  it('should compare passwords correctly', async () => {
    const userWithHashedPass = new TestUser('4', 'Test', 'test@test.com', '', '123');
    await userWithHashedPass.updatePassword('newPassword');
    
    const isMatch = await userWithHashedPass.comparePassword('newPassword');
    const isNotMatch = await userWithHashedPass.comparePassword('wrongPassword');

    expect(isMatch).to.be.true;
    expect(isNotMatch).to.be.false;
  });

  it('should not allow passwords shorter than 6 characters', async () => {
    try {
      await user.updatePassword('123');
      // Should not reach here
      expect.fail('Password update should have failed.');
    } catch (error: any) {
      expect(error.message).to.equal('Password must be at least 6 characters');
    }
  });

});
