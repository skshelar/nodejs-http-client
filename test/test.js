var assert = require('chai').assert
var nock = require('nock')
var fs = require('fs')

var TEST_HOST = 'https://api.test.com'

var Client = require('../lib/client.js').Client
var globalRequest = require('../lib/client.js').emptyRequest
globalRequest.host = 'api.test.com'

describe('Client', function () {
  var client = new Client(globalRequest)
  // Make sure the URL path is correctly formed when adding query parameters
  describe('#buildPath()', function () {
    it('should create a properly encoded URL', function (done) {
      nock(TEST_HOST)
        .get('/test')
        .query({limit: 100, offset: 0})
        .reply(200, {
          message: 'Success'
        })

      var requestGet = client.emptyRequest()
      requestGet.method = 'GET'
      requestGet.path = '/test'
      requestGet.queryParams['limit'] = 100
      requestGet.queryParams['offset'] = 0
      client.API(requestGet, function (response) {
        assert.equal(response.statusCode, '200', 'response.StatusCode equal 200')
        assert.equal(response.body,
          '{"message":"Success"}', 'response.body equal {"message":"Success"}')
        assert.equal(JSON.stringify(response.headers),
          '{"content-type":"application/json"}',
          'response.headers equal {"content-type": "application/json"}')
        done()
      })
    })
  })

  // Make ure the request object is created correctly when using all request parameters
  describe('#buildRequest()', function () {
    it('should create a valid request object', function (done) {
      nock(TEST_HOST)
        .post('/test')
        .query({limit: 100, offset: 0})
        .reply(201, function (uri, requestBody) {
          var response = {}
          response.path = this.req.path
          response.headers = this.req.headers
          return response
        })

      var requestBody = {
        'test': 'Test Body'
      }
      var requestPost = client.emptyRequest()
      requestPost.method = 'POST'
      requestPost.path = '/test'
      requestPost.body = requestBody
      requestPost.queryParams['limit'] = 100
      requestPost.queryParams['offset'] = 0
      requestPost.headers['X-Test'] = 'test'
      client.API(requestPost, function (response) {
        assert.equal(response.statusCode, '201', 'response.StatusCode equal 200')
        assert.equal(JSON.parse(response.body).path,
          '/test?limit=100&offset=0',
          'path equal to /test?limit=100&offset=0')
        assert.equal(JSON.stringify(JSON.parse(response.body).headers),
          '{"x-test":"test","content-length":20,"content-type":"application/json","host":"api.test.com"}',
            'headers equal {"x-test":"test","content-length":20,"content-type":"application/json","host":"api.test.com"}')
        assert.equal(JSON.stringify(response.headers),
          '{"content-type":"application/json"}',
          'response.headers equal {"content-type":"application/json"}')
        done()
      })
    })
  })

  // Make sure all HTTP verbs are working
  describe('#API()', function () {
    it('should create a valid API call', function (done) {
      nock(TEST_HOST)
        .get('/test')
        .reply(200, {
          message: 'Success'
        })
      var requestGet = client.emptyRequest()
      requestGet.method = 'GET'
      requestGet.path = '/test'
      client.API(requestGet, function (response) {
        assert.equal(response.statusCode, '200', 'response.StatusCode equal 200')
        assert.equal(response.body, '{"message":"Success"}',
          'response.body equal {"message":"Success"}')
        assert.equal(JSON.stringify(response.headers),
          '{"content-type":"application/json"}',
          'response.headers equal {"content-type":"application/json"}')
      })

      nock(TEST_HOST)
        .post('/test')
        .reply(201, {
          message: 'Success'
        })
      var requestBody = {
        'test': 'Test Body'
      }
      var requestPost = client.emptyRequest()
      requestPost.body = requestBody
      requestPost.method = 'POST'
      requestPost.path = '/test'
      client.API(requestPost, function (response) {
        assert.equal(response.statusCode, '201', 'response.StatusCode equal 201')
        assert.equal(response.body, '{"message":"Success"}',
          'response.body equal {"message":"Success"}')
        assert.equal(JSON.stringify(response.headers),
          '{"content-type":"application/json"}',
          'response.headers equal {"content-type":"application/json"}')
      })
      nock(TEST_HOST)
        .patch('/test')
        .reply(200, {
          message: 'Success'
        })
      var requestPatch = client.emptyRequest()
      requestPatch.body = requestBody
      requestPatch.method = 'PATCH'
      requestPatch.path = '/test'
      client.API(requestPatch, function (response) {
        assert.equal(response.statusCode, '200', 'response.StatusCode equal 200')
        assert.equal(response.body, '{"message":"Success"}',
          'response.body equal {"message":"Success"}')
        assert.equal(JSON.stringify(response.headers),
          '{"content-type":"application/json"}',
          'response.headers equal {"content-type":"application/json"}')
      })

      nock(TEST_HOST)
        .put('/test')
        .reply(200, {
          message: 'Success'
        })
      var requestPut = client.emptyRequest()
      requestPut.body = requestBody
      requestPut.method = 'PUT'
      requestPut.path = '/test'
      client.API(requestPut, function (response) {
        assert.equal(response.statusCode, '200', 'response.StatusCode equal 200')
        assert.equal(response.body, '{"message":"Success"}',
          'response.body equal {"message":"Success"}')
        assert.equal(JSON.stringify(response.headers),
          '{"content-type":"application/json"}',
          'response.headers equal {"content-type":"application/json"}')
      })

      nock(TEST_HOST)
        .delete('/test')
        .reply(204, {
          message: 'Success'
        })
      var requestDelete = client.emptyRequest()
      requestDelete.method = 'DELETE'
      requestDelete.path = '/test'
      client.API(requestDelete, function (response) {
        assert.equal(response.statusCode, '204', 'response.StatusCode equal 204')
        assert.equal(response.body, '{"message":"Success"}',
          'response.body equal {"message":"Success"}')
        assert.equal(JSON.stringify(response.headers),
          '{"content-type":"application/json"}',
          'response.headers equal {"content-type":"application/json"}')
      })
      done()
    })

    it('should consider non-HTTP-200 repsonses to be valid', function (done) {
      nock(TEST_HOST)
        .get('/test')
        .delay(100) // it('should wait for the response before invoking the callback')
        .reply(503)
      var requestGet = client.emptyRequest()
      requestGet.method = 'GET'
      requestGet.path = '/test'
      client.API(requestGet, function (response) {
        assert.equal(response.statusCode, '503', 'response.StatusCode equal 503')
        assert.equal(response.body, '',
          'response.body blank')
        assert.equal(JSON.stringify(response.headers),
          '{}',
          'response.headers blank')
        done()
      })
    })

    it('should respond with a mock HTTP 500 response upon Error', function (done) {
      nock(TEST_HOST)
        .get('/test')
        .replyWithError('ERROR')
      var requestGet = client.emptyRequest()
      requestGet.method = 'GET'
      requestGet.path = '/test'
      client.API(requestGet, function (response) {
        assert.equal(response.statusCode, '500', 'response.StatusCode equal 500')
        var body = JSON.parse(response.body)
        assert.equal(body.message, 'ERROR', 'response.body.message equal ERROR')
        assert.equal(body.name, Error.name, 'response.body.name equal Error.name')
        assert.equal(typeof body.stack, 'string', 'response.body.stack is a String')
        assert.equal(JSON.stringify(response.headers),
          '{}',
          'response.headers blank')
        done()
      })
    })
  })

  // limit maxSockets
  describe('#API()', function () {
    it('should limit maxSockets', function (done) {
      var expectedSockets = 10
      var maxSocketsClient = new Client(globalRequest, expectedSockets)
      
      nock(TEST_HOST)
        .get('/testMax')
        .reply(200)
      
      // monkey patch the http.request
      var http = require('http')
      var originalRequest = http.request
      http.request = function(options, callback){
        assert.isDefined(options.agent, 'the request should use a custom agent');
        assert.equal(options.agent.maxSockets, expectedSockets, 'agent.maxSockets should equal expectedSockets')
        return originalRequest(options, callback)
      }

      var requestGet = maxSocketsClient.emptyRequest()
      requestGet.method = 'GET'
      requestGet.test = true
      requestGet.path = '/testMax'
      maxSocketsClient.API(requestGet, function (response) {
        //restore the opriginal request
        http.request = originalRequest
        done()
      })
    })
  })

  describe('Project files', function () {
    it('should have ./Docker file', function (done) {
      checkFileOrDirectory('Docker')
      done()
    })

    it('should have ./docker-compose.yml file', function (done) {
      checkFileOrDirectory('docker-compose.yml')
      done()
    })

    it('should have ./.env_sample file', function (done) {
      checkFileOrDirectory('.env_sample')
      done()
    })

    it('should have ./.gitignore file', function (done) {
      checkFileOrDirectory('.gitignore')
      done()
    })

    it('should have ./.travis.yml file', function (done) {
      checkFileOrDirectory('.travis.yml')
      done()
    })

    it('should have ./.codeclimate.yml file', function (done) {
      checkFileOrDirectory('.codeclimate.yml')
      done()
    })

    it('should have ./CHANGELOG.md file', function (done) {
      checkFileOrDirectory('CHANGELOG.md')
      done()
    })

    it('should have ./CODE_OF_CONDUCT.md file', function (done) {
      checkFileOrDirectory('CODE_OF_CONDUCT.md')
      done()
    })

    it('should have ./CONTRIBUTING.md file', function (done) {
      checkFileOrDirectory('CONTRIBUTING.md')
      done()
    })

    it('should have ./.github/ISSUE_TEMPLATE file', function (done) {
      checkFileOrDirectory('.github/ISSUE_TEMPLATE')
      done()
    })

    it('should have ./LICENSE.md file', function (done) {
      checkFileOrDirectory('LICENSE.md')
      done()
    })

    it('should have ./.github/PULL_REQUEST_TEMPLATE file', function (done) {
      checkFileOrDirectory('.github/PULL_REQUEST_TEMPLATE')
      done()
    })

    it('should have ./README.md file', function (done) {
      checkFileOrDirectory('README.md')
      done()
    })
    
    it('should have ./TROUBLESHOOTING.md file', function (done) {
      checkFileOrDirectory('TROUBLESHOOTING.md')
      done()
    })
    
    it('should have ./USAGE.md file', function (done) {
      checkFileOrDirectory('USAGE.md')
      done()
    })
    
    it('should have ./USE_CASES.md file', function (done) {
      checkFileOrDirectory('USE_CASES.md')
      done()
    })

    function checkFileOrDirectory(fileOrDirectory) {  
      try {
        fs.statSync(fileOrDirectory);
      } catch(e) {
        assert.isNull(e, 'file or folder doesn\'t exist. '+e);
      }
    }
  })
})
