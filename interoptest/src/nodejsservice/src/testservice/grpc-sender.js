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

function main () {
  var client = new interopProto.TestExecutionService('localhost:50051',
    grpc.credentials.createInsecure());
  client.test({name: 'mayur', id: 2211}, function (err, response) {
    if (err) {
      console.log(err);
    }
    console.log('Greeting:', response.id);
  });
}

main();
