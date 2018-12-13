// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var path = require('path');
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
var testservice = require('./src/testservice/grpc-receiver');
var core = require('@opencensus/core');
var tracing = require('@opencensus/nodejs');
var jaeger = require('@opencensus/exporter-jaeger');

var PROTO_PATH = path.join(__dirname, 'proto/interoperability_test.proto');

var packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  {keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });
var interopProto = grpc.loadPackageDefinition(packageDefinition).interop;

/**
 * Register the Jaeger exporter to be able to retrieve
 * the collected spans.
 */
function registerJaegerExporter () {
  var jaegerOptions = {
    serviceName: 'nodejsservice',
    host: 'localhost',
    port: 6832,
    bufferTimeout: 10, // time in milliseconds
    logger: core.logger.logger('debug'),
    maxPacketSize: 1000
  };

  var exporter = new jaeger.JaegerTraceExporter(jaegerOptions);
  tracing.registerExporter(exporter).start();
}

function main () {
  registerJaegerExporter();

  // Unable to read enum value from proto:
  // https://github.com/grpc/grpc/issues/8595
  testservice.newGRPCReciever(10031);
}

main();
