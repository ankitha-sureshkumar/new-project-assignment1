const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');
const app = require('../server');
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Rating = require('../models/Rating');
const { addRating, updateRating, getRatings, deleteRating } = require('../controllers/ratingController');
const { expect } = chai;

chai.use(chaiHttp);

// AddRating

describe('AddRating Function Test', () => {
  it('should create a new rating successfully', async () => {
    const req = {
      body: { score: 4.8, star: 5 }
    };

    const createdRating = { _id: new mongoose.Types.ObjectId(),...req.body};

    const createStub = sinon.stub(Rating, 'create').resolves(createdRating);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await addRating(req, res);

    expect(createStub.calledOnceWith(req.body)).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdRating)).to.be.true;

    createStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    const createStub = sinon.stub(Rating, 'create').throws(new Error('DB Error'));

    const req = {
      body: {
        score: 3.4,
        star: 3
      }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await addRating(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    createStub.restore();
  });

});

// UpdateRating

describe('UpdateRating Function Test', () => {
  it('should update rating successfully', async () => {
    const ratingId = new mongoose.Types.ObjectId();
    const existingRating = {
      _id: ratingId,
      score: 3.6,
      star: 4,
      save: sinon.stub().resolvesThis()
    };

    const findByIdStub = sinon.stub(Rating, 'findById').resolves(existingRating);

    const req = {
      params: { id: ratingId },
      body: { score: 2.0, star:2 }
    };

    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await updateRating(req, res);

    expect(existingRating.score).to.equal(2.0);
    expect(existingRating.star).to.equal(2);
    expect(res.status.called).to.be.false;
    expect(res.json.calledWith(existingRating)).to.be.true;

    findByIdStub.restore();
  });

  it('should return 404 if rating is not found', async () => {
    const findByIdStub = sinon.stub(Rating, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateRating(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Rating not found' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 500 on error', async () => {
    const findByIdStub = sinon.stub(Rating, 'findById').throws(new Error('DB Error'));

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateRating(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.called).to.be.true;

    findByIdStub.restore();
  });

});

// GetRating

describe('GetRatings Function Test', () => {
  it('should return all ratings', async () => {
    const ratings = [
      { _id: new mongoose.Types.ObjectId(), score: 3, star: 3 },
      { _id: new mongoose.Types.ObjectId(), score: 2, star: 2 }
    ];

    const findStub = sinon.stub(Rating, 'find').resolves(ratings);

    const req = {};
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await getRatings(req, res);

    expect(findStub.calledOnce).to.be.true;
    expect(res.json.calledWith(ratings)).to.be.true;
    expect(res.status.called).to.be.false;

    findStub.restore();
  });

  it('should return 500 on error', async () => {
    const findStub = sinon.stub(Rating, 'find').throws(new Error('DB Error'));

    const req = {};
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await getRatings(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    findStub.restore();
  });

});

// DeleteRating

describe('DeleteRating Function Test', () => {
  it('should delete a rating successfully', async () => {
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    const rating = { remove: sinon.stub().resolves() };

    const findByIdStub = sinon.stub(Rating, 'findById').resolves(rating);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteRating(req, res);

    expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
    expect(rating.remove.calledOnce).to.be.true;
    expect(res.json.calledWith({ message: 'Rating deleted' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 404 if rating is not found', async () => {

    const findByIdStub = sinon.stub(Rating, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
    
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteRating(req, res);

    expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Rating not found' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    const findByIdStub = sinon.stub(Rating, 'findById').throws(new Error('DB Error'));

    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
    
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteRating(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    findByIdStub.restore();
  });
});
