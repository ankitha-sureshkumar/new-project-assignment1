// test/clinicController.test.js
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

const clinicController = require('../controllers/clinicController');
const Pet = require('../models/Pet');
const Appointment = require('../models/Appointment');

describe('Clinic Controller Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  // -------------------- PETS -------------------- //
  it('should get all pets successfully', async () => {
    const pets = [{ name: 'Max', type: 'Cat' }, { name: 'Buddy', type: 'Dog' }];
    sinon.stub(Pet, 'find').resolves(pets);

    await clinicController.getPets(req, res);

    expect(res.json.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0]).to.deep.equal(pets);
  });

  it('should add a new pet successfully', async () => {
    req.body = { name: 'Max', type: 'Cat' };

    sinon.stub(Pet.prototype, 'save').resolves({
      name: req.body.name,
      type: req.body.type
    });

    await clinicController.addPet(req, res);

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0]).to.include({ name: 'Max', type: 'Cat' });
  });

  it('should return 400 if pet name or type is missing', async () => {
    req.body = { name: '' }; // missing type
    await clinicController.addPet(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0]).to.have.property('message');
  });

  // -------------------- APPOINTMENTS -------------------- //
  it('should get all appointments successfully', async () => {
    const appointments = [
      { petId: '', petName: 'Max', date: '2025-08-16', hospital: 'Vet Clinic' }
    ];
    sinon.stub(Appointment, 'find').resolves(appointments);

    await clinicController.getAppointments(req, res);

    expect(res.json.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0]).to.deep.equal(appointments);
  });

  it('should add an appointment successfully', async () => {
    req.body = {
      petId: '689ef7bff31a708e112b8468',
      petName: 'Max',
      petAge: 3,
      date: '2025-08-16',
      hospital: 'Vet Clinic'
    };

    sinon.stub(Appointment.prototype, 'save').resolves({
      petId: req.body.petId,
      petName: req.body.petName,
      petAge: req.body.petAge,
      date: req.body.date,
      hospital: req.body.hospital
    });

    await clinicController.addAppointment(req, res);

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0]).to.include({
      petId: '689ef7bff31a708e112b8468',
      petName: 'Max',
      petAge: 3,
      date: '2025-08-16',
      hospital: 'Vet Clinic'
    });
  });

  it('should return 400 if appointment fields are missing', async () => {
    req.body = { petId: '' }; // missing required fields
    await clinicController.addAppointment(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0]).to.have.property('message');
  });

  it('should delete an appointment successfully', async () => {
    req.params = { id: '1' };
    sinon.stub(Appointment, 'findById').resolves({
      remove: sinon.stub().resolves()
    });

    await clinicController.deleteAppointment(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0]).to.have.property('message', 'Appointment deleted successfully');
  });

  it('should return 404 if appointment to delete not found', async () => {
    req.params = { id: '2' };
    sinon.stub(Appointment, 'findById').resolves(null);

    await clinicController.deleteAppointment(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0]).to.have.property('message', 'Appointment not found');
  });
});
