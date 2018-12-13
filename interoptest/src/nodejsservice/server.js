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

const path = require('path');
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const testService = require('./src/testservice/grpc-receiver');
const client = require('./src/testservice/grpc-sender');
const {CoreTracer, logger, ConsoleExporter} = require('@opencensus/core');
const tracing = require('@opencensus/nodejs');
const jaeger = require('@opencensus/exporter-jaeger');
const {plugin} = require('@opencensus/instrumentation-grpc');

const PROTO_PATH = path.join(__dirname, 'proto/interoperability_test.proto');
const PROTO_OPTIONS = {keepCase: true, longs: String, enums: String, defaults: true, oneofs: true};

const packageDefinition = protoLoader.loadSync(PROTO_PATH, PROTO_OPTIONS);
const interopProto = grpc.loadPackageDefinition(packageDefinition).interop;

/**
 * Unable to read enum value from proto:
 * https://github.com/grpc/grpc/issues/8595
 */ 
const NODEJS_GRPC_BINARY_PROPAGATION_PORT = 10301;

/**
 * Register the Jaeger exporter to be able to retrieve
 * the collected spans.
 */
function registerJaegerExporter () {
  const jaegerOptions = {
    serviceName: 'nodejsservice1', // name of this application
    host: 'localhost',
    port: 6832,
    bufferTimeout: 10, // time in milliseconds
    logger: logger.logger('debug'),
    maxPacketSize: 1000
  };

  const defaultBufferConfig = {
    bufferSize: 1,
    bufferTimeout: 20000  // time in milliseconds
  };

  const exporter = new jaeger.JaegerTraceExporter(jaegerOptions);
  //const exporter = new ConsoleExporter(defaultBufferConfig);
  
  return tracing.registerExporter(exporter).start({samplingRate: 1.0}).tracer;
  //return exporter;
}

function main () {
  // setup Jaeger exporter
  const tracer = registerJaegerExporter();

  //const tracer = new CoreTracer();

  const basedir = path.dirname(require.resolve('grpc'));
  const version = require(path.join(basedir, 'package.json')).version;
  plugin.enable(grpc, tracer, version, basedir);
  //tracer.registerSpanEventListener(exporter);

  testService.newGRPCReciever(grpc, NODEJS_GRPC_BINARY_PROPAGATION_PORT, interopProto);
  
  // const span = tracer.startRootSpan({name: 'main'});
  // span.start();

  // for(let i = 0;i < 100; i++) {
  //   client.send(grpc, interopProto);
  // }
  // span.end();

  // tracer.startRootSpan({name: 'main'}, rootSpan => {
  //   for (let i = 0; i < 10; i++) {
  //     client.send(grpc, interopProto);
  //   }
  
  //   rootSpan.end();
  // });

  for (let i = 0; i < 10; i++) {
    client.send(grpc, interopProto);
  }

}

function doWork(tracer) {
  // 5. Start another span. In this example, the main method already started a span,
  // so that'll be the parent span, and this will be a child span.
  const span = tracer.startChildSpan('doWork');
  span.start();

  console.log('doing busy work');
  for (let i = 0; i <= 40000000; i++) {} // short delay

  // 6. Annotate our span to capture metadata about our operation
  span.addAnnotation('invoking doWork')
  for (let i = 0; i <= 20000000; i++) {} // short delay

  span.end();
}

main();
