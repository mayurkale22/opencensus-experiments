/*
 * Copyright 2018, OpenCensus Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package io.opencensus.demo.logcorrelation.stackdriver.javautillogging;

import io.opencensus.common.Scope;
import io.opencensus.exporter.trace.stackdriver.StackdriverTraceConfiguration;
import io.opencensus.exporter.trace.stackdriver.StackdriverTraceExporter;
import io.opencensus.trace.Sampler;
import io.opencensus.trace.Tracer;
import io.opencensus.trace.Tracing;
import io.opencensus.trace.samplers.Samplers;
import java.io.IOException;
import java.util.logging.Logger;

/** Demo for {@code OpenCensusTraceLoggingEnhancer} using {@code java.util.logging}. */
public final class OpenCensusTraceLoggingEnhancerDemo {

  private static final Logger logger =
      Logger.getLogger(OpenCensusTraceLoggingEnhancerDemo.class.getName());

  private static final Tracer tracer = Tracing.getTracer();

  private OpenCensusTraceLoggingEnhancerDemo() {}

  /**
   * Runs the demo. It creates a sampled and a non-sampled trace to demonstrate how log correlation
   * handles both cases.
   */
  public static void main(String[] args) throws IOException {
    StackdriverTraceExporter.createAndRegister(StackdriverTraceConfiguration.builder().build());
    createSampledTrace();
    createNonSampledTrace();
    Tracing.getExportComponent().shutdown();
  }

  private static void createSampledTrace() {
    doWork(Samplers.alwaysSample());
  }

  private static void createNonSampledTrace() {
    doWork(Samplers.neverSample());
  }

  private static void doWork(Sampler sampler) {
    try (Scope scope = tracer.spanBuilder("ParentSpan").setSampler(sampler).startScopedSpan()) {
      pause();
      logger.warning("parent span log message 1");
      pause();
      doMoreWork();
      pause();
      logger.info("parent span log message 2");
      pause();
    }
  }

  private static void doMoreWork() {
    try (Scope scope = tracer.spanBuilder("ChildSpan").startScopedSpan()) {
      pause();
      logger.info("child span log message 1");
      pause();
      logger.severe("child span log message 2");
      pause();
    }
  }

  /** Sleeps for 500 ms to spread out the events on the trace. */
  private static void pause() {
    try {
      Thread.sleep(500);
    } catch (InterruptedException e) {
      // ignore
    }
  }
}