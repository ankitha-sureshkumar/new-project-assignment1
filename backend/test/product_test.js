const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');
const app = require('../server'); 
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Product = require('../models/Product');
const { updateProduct, getProducts, addProduct, deleteProduct } = require('../controllers/productController');
const { expect } = chai;

chai.use(chaiHttp);
let server;
let port;

// AddProduct 
describe('AddProduct Function Test', () => {

  it('should create a new product successfully', async () => {
    const req = {
      body: { name: "Apple AirPods Pro", description: "Wireless earbuds by Apple", price: 109.99 }
    };

    const createdProduct = { _id: new mongoose.Types.ObjectId(), ...req.body };

    const createStub = sinon.stub(Product, 'create').resolves(createdProduct);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await addProduct(req, res);

    expect(createStub.calledOnceWith(req.body)).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdProduct)).to.be.true;

    createStub.restore();
  });

  it('should return 500 if an error occurs', async () => {

    const createStub = sinon.stub(Product, 'create').throws(new Error('DB Error'));

    const req = {
      body: { name: "Apple AirPods Pro", description: "Wireless earbuds by Apple", price: 109.99 }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await addProduct(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    createStub.restore();
  });

});

// UpdateProduct
describe('UpdateProduct Function Test', () => {

  it('should update product successfully', async () => {
    const productId = new mongoose.Types.ObjectId();
    const existingProduct = {
      _id: productId,
      name: "Old Name",
      description: "Old Description",
      price: 100,
      save: sinon.stub().resolvesThis(),
    };

    const findByIdStub = sinon.stub(Product, 'findById').resolves(existingProduct);

    const req = {
      params: { id: productId },
      body: { name: "Apple AirPods Pro", description: "Wireless earbuds by Apple", price: 109.99 }
    };
    const res = {
      json: sinon.spy(), 
      status: sinon.stub().returnsThis()
    };

    await updateProduct(req, res);

    expect(existingProduct.name).to.equal("Apple AirPods Pro");
    expect(existingProduct.description).to.equal("Wireless earbuds by Apple");
    expect(existingProduct.price).to.equal(109.99);
    expect(res.status.called).to.be.false;
    expect(res.json.calledOnce).to.be.true;

    findByIdStub.restore();
  });

  it('should return 404 if product is not found', async () => {
    const findByIdStub = sinon.stub(Product, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateProduct(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Product not found' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 500 on error', async () => {
    const findByIdStub = sinon.stub(Product, 'findById').throws(new Error('DB Error'));

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateProduct(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.called).to.be.true;

    findByIdStub.restore();
  });

});

// GetProducts
describe('GetProducts Function Test', () => {

  it('should return list of products', async () => {
    const products = [
      { name: "Apple AirPods Pro", description: "Wireless earbuds by Apple", price: 109.99 },
      { name: "Iphone 15", description: "Smartphones developed by Apple", price: 699 }
    ];

    const findStub = sinon.stub(Product, 'find').resolves(products);

    const req = {};
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await getProducts(req, res);

    expect(findStub.calledOnce).to.be.true;
    expect(res.json.calledWith(products)).to.be.true;
    expect(res.status.called).to.be.false;

    findStub.restore();
  });

  it('should return 500 on error', async () => {
    const findStub = sinon.stub(Product, 'find').throws(new Error('DB Error'));

    const req = {};
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await getProducts(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    findStub.restore();
  });

});

// DeleteProduct
describe('DeleteProduct Function Test', () => {

  it('should delete product successfully', async () => {
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
   
    const product = { remove: sinon.stub().resolves() };

    const findByIdStub = sinon.stub(Product, 'findById').resolves(product);
   
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteProduct(req, res);

    expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
    expect(product.remove.calledOnce).to.be.true;
    expect(res.json.calledWith({ message: 'Product deleted' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 404 if product not found', async () => {
    
    const findByIdStub = sinon.stub(Product, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
    
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteProduct(req, res);

    expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Product not found' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    const findByIdStub = sinon.stub(Product, 'findById').throws(new Error('DB Error'));

    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
    
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteProduct(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    findByIdStub.restore();
  });

});
