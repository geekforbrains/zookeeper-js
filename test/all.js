var url = require('url');
var prompt = require('prompt');
var expect = require('chai').expect;
var zookeeper = require('../lib/zookeeper');
var config = require('./config');

// Set during tests
var OAUTH_TOKEN = null;
var OAUTH_TOKEN_SECRET = null;
var TOKEN = '';

describe('auth.start', function() {
  it('should return oauth tokens and authorize url', function(done) {
    var zk = zookeeper({
      consumerKey: config.consumerKey,
      consumerSecret: config.consumerSecret
    });

    zk.auth.start('http://localhost', function(err, authData) {
      expect(authData).to.have.property('oauthToken');
      expect(authData).to.have.property('oauthTokenSecret');
      expect(authData).to.have.property('authorizeUrl');
      OAUTH_TOKEN = authData.oauthToken;
      OAUTH_TOKEN_SECRET = authData.oauthTokenSecret;
      console.log('Visit: ' + authData.authorizeUrl);
      done();
    });
  });
});

describe('auth.finish', function() {
  it('should return access token and secret', function(done) {
    this.timeout(0); // Disable Mocha timeout so prompt can wait for user input

    var zk = zookeeper({
      consumerKey: config.consumerKey,
      consumerSecret: config.consumerSecret
    });

    prompt.start();
    prompt.get('callbackUrl', function(err, promptData) {
      var query = url.parse(promptData.callbackUrl, true).query;
      zk.auth.finish(OAUTH_TOKEN, OAUTH_TOKEN_SECRET, query.oauth_verifier, function(err, authData) {
        expect(authData).to.have.property('token');
        expect(authData).to.have.property('tokenSecret');
        TOKEN = authData.token;
        console.log('Access Token: ' + TOKEN);
        done();
      });
    });
  });
});

describe('user.info', function() {
  it('should return an evernote user object', function(done) {
    var zk = zookeeper({token: TOKEN});

    zk.user.info(function(err, info) {
      expect(info).to.have.property('id');
      expect(info).to.have.property('username');
      done();
    });
  });
});

describe('user.notebooks', function() {
  it('should return an array of zookeeper notebook objects', function(done) {
    var zk = zookeeper({token: TOKEN});

    zk.notebooks.all(function(err, notebooks) {
      expect(notebooks[0]).to.have.property('guid');
      done();
    });
  });
});

describe('user.notes', function() {
  it('should return an array of note objects', function(done) {
    var zk = zookeeper({token: TOKEN});

    zk.notes.all(function(err, notes) {
      console.log(notes);
      done();
    });
  });
});
