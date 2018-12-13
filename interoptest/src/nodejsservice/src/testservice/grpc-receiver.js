/**
 * Copyright 2018, OpenCensus Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var path = require('path');
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');

var PROTO_PATH = path.join(__dirname, '../../proto/interoperability_test.proto');

var packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  {keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });
var interopProto = grpc.loadPackageDefinition(packageDefinition).interop;

// Implements the test RPC method.
function test (call, callback) {
  callback(null, {id: call.request.id});
}

/**
 * Starts an RPC server that receives requests for the TestExecutionService
 * service at the (NODEJS_GRPC_BINARY_PROPAGATION_PORT) server port
 */
exports.newGRPCReciever = function (grpcPort) {
  var server = new grpc.Server();
  // Define server with the methods and start it
  server.addService(interopProto.TestExecutionService.service, {test: test});
  server.bind('0.0.0.0:' + grpcPort, grpc.ServerCredentials.createInsecure());
  server.start();
};
