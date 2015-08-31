/* jshint camelcase: false */
var app = require('../server/server');
var request = require('supertest');
var assert = require('assert');
var loopback = require('loopback');

function json(verb, url) {
    return request(app)[verb](url)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/);
  }

describe('REST API request', function() {

  before(function(done) {
    require('./start-server');
    done();
  })
  

  after(function(done) {
    app.removeAllListeners('started');
    app.removeAllListeners('loaded');
    done();
  });
  
  it('should not allow access without access token', function(done){
    json('get', '/api/projects')
      .expect(401, done);
  })

  it('should login a team member and get the balance for project1', function(done) {
    json('post', '/api/users/login')
      .send({
        username: "Jane",
        password: "opensesame"
      })
      .expect(200, function(err, res) {
        assert(typeof res.body === 'object');
        assert(res.body.id, 'must have an access token');
        assert.equal(res.body.userId, 2);
        accessToken = res.body.id;
        json('get', '/api/projects/' + 1 + '?access_token=' + accessToken)
          .expect(200, function(err, res){
            var projects = res.body;
            assert(typeof res.body === 'object');
            assert(res.body.balance);
            assert.equal(res.body.balance, 100); 
          })
        done();
      });
  });

  it('should login the admin user and get all projects', function(done) {
    json('post', '/api/users/login')
      .send({
        username: "Bob",
        password: "opensesame"
      })
      .expect(200, function(err, res) {
        assert(typeof res.body === 'object');
        assert(res.body.id, 'must have an access token');
        assert.equal(res.body.userId, 3);
        accessToken = res.body.id;
        json('get', '/api/projects?access_token=' + accessToken)
          .expect(200, function(err, res){
            var projects = res.body;
            assert(Array.isArray(res.body));
            assert.equal(res.body.length, 2);
          })
        done();
      });
  });

  it('should donate money to project1', function(done) {
        json('post', '/api/projects/donate?access_token=' + accessToken)
          .send({
            id: 2,
            amount: 10
          })
          .expect(200, function(err, res){            
            assert(typeof res.body === 'object');
            assert(res.body.success)
            assert.equal(res.body.success, true)
          })
        done();
  });

});
