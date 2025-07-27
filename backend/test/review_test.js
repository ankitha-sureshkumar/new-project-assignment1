const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');
const app = require('../server'); 
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Review = require('../models/Review');
const { updateReview, getReviews, addReview, deleteReview } = require('../controllers/reviewController');
const { expect } = chai;

chai.use(chaiHttp);
let server;
let port;

// AddReview
describe('AddReview Function Test', () => {

  it('should create a new review successfully', async () => {
    const req = {
      body: { productId: 'a14798', userId: 'b45624', comment: "This product is cheap and durable!" }
    };

    const createdReview = { _id: new mongoose.Types.ObjectId(), ...req.body };

    const createStub = sinon.stub(Review, 'create').resolves(createdReview);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await addReview(req, res);

    expect(createStub.calledOnceWith(req.body)).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdReview)).to.be.true;

    createStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
   
    const createStub = sinon.stub(Review, 'create').throws(new Error('DB Error'));

    const req = { body: { productId: 'a14798', userId: 'b45624', comment: "This product is cheap and durable!" } };
   
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await addReview(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    createStub.restore();
  });

});

// UpdateReview
describe('UpdateReview Function Test', () => {

  it('should update review successfully', async () => {
    const reviewId = new mongoose.Types.ObjectId();
    const existingReview = {
      _id: reviewId,
      productId: "oldProductId",
      userId: "oldUserId",
      save: sinon.stub().resolvesThis()
    };

    const findByIdStub = sinon.stub(Review, 'findById').resolves(existingReview);

    const req = {
      params: { id: reviewId },
      body: { productId: "newproductId", userId: "newUserId" }
    };

    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await updateReview(req, res);

    expect(existingReview.productId).to.equal("newP");
    expect(existingReview.userId).to.equal("newU");
    expect(res.status.called).to.be.false;
    expect(res.json.calledOnce).to.be.true;

    findByIdStub.restore();
  });

  it('should return 404 if review is not found', async () => {
    const findByIdStub = sinon.stub(Review, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = {
         status: sinon.stub().returnsThis(), 
         json: sinon.spy()
     };

    await updateReview(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Review not found' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 500 on error', async () => {
    const findByIdStub = sinon.stub(Review, 'findById').throws(new Error('DB Error'));

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = { 
        status: sinon.stub().returnsThis(), 
        json: sinon.spy() 
    };

    await updateReview(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.called).to.be.true;

    findByIdStub.restore();
  });

});

// GetReviews
describe('GetReviews Function Test', () => {

  it('should return reviews for user', async () => {
    const reviews = [
      { productId: 'a14798', userId: 'b45624', comment: "This product is cheap and durable!" },
      { productId: 'a12354', userId: 'b41242', comment: "This product has a low cost performance." }
    ];

    const findStub = sinon.stub(Review, 'find').resolves(reviews);

    const req = {};
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await getReviews(req, res);

    expect(findStub.calledOnce).to.be.true;
    expect(res.json.calledWith(reviews)).to.be.true;

    findStub.restore();
  });

  it('should return 500 on error', async () => {
    const findStub = sinon.stub(Review, 'find').throws(new Error('DB Error'));

    const req = {};
    const res = { 
        json: sinon.spy(), 
        status: sinon.stub().returnsThis() 
    };

    await getReviews(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    findStub.restore();
  });

});

// DeleteReview
describe('DeleteReview Function Test', () => {

  it('should delete review successfully', async () => {
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
   
    const review = { remove: sinon.stub().resolves() };

    const findByIdStub = sinon.stub(Review, 'findById').resolves(review);
   
    const res = { 
        status: sinon.stub().returnsThis(), 
        json: sinon.spy() 
    };

    await deleteReview(req, res);

    expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
    expect(review.remove.calledOnce).to.be.true;
    expect(res.json.calledWith({ message: 'Review deleted' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 404 if review is not found', async () => {
   
    const findByIdStub = sinon.stub(Review, 'findById').throws(new Error('DB Error'));

    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
    
    const res = {
         status: sinon.stub().returnsThis(), 
         json: sinon.spy() 
        };

    await deleteReview(req, res);

    expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Review not found' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    
    const findByIdStub = sinon.stub(Review, 'findById').throws(new Error('DB Error'));

    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
    const res = { 
        status: sinon.stub().returnsThis(), 
        json: sinon.spy()
     };

    await deleteReview(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Review not found' })).to.be.true;

    findByIdStub.restore();
  });
  
});

