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

// const path = require('path');
// const grpc = require('grpc');
// const protoLoader = require('@grpc/proto-loader');

// const PROTO_PATH = path.join(__dirname, '../../proto/interoperability_test.proto');
// const PROTO_OPTIONS = {keepCase: true, longs: String, enums: String, defaults: true, oneofs: true};

// const packageDefinition = protoLoader.loadSync(PROTO_PATH, PROTO_OPTIONS);
// const interopProto = grpc.loadPackageDefinition(packageDefinition).interop;

// // Send sends gRPC request to a server specified by serviceHop.
// function send () {
//   const client = new interopProto.TestExecutionService('localhost:10301',
//     grpc.credentials.createInsecure());
//   client.test({name: 'mayur', id: 2211}, function (err, response) {
//     if (err) {
//       console.log(err);
//     }
//     console.log('Greeting:', response.id);
//   });
// };

// send();

// Send sends gRPC request to a server specified by serviceHop.
exports.send = function (grpc, interopProto) {
  const client = new interopProto.TestExecutionService('localhost:10301',
    grpc.credentials.createInsecure());
  client.test({name: 'mayur', id: 2211}, function (err, response) {
    if (err) {
      console.log(err);
    }
    console.log('Greeting:', response.id);
  });
};
