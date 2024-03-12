/*instrumentation.js*/
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-proto');
const { Resource } = require('@opentelemetry/resources');
const {
  SemanticResourceAttributes,
} = require('@opentelemetry/semantic-conventions');
const { MeterProvider } = require('@opentelemetry/metrics');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');

const prometheusExporter = new PrometheusExporter({ startServer: true });

// // MeterProvider 설정
// const meterProvider = new MeterProvider({
//   exporter: prometheusExporter,
//   interval: 1000, // 메트릭 업데이트 간격 (1초마다 업데이트)
// });

// // 측정기(Meter) 생성
// const meter = meterProvider.getMeter('example-meter');

// // 메트릭 생성
// const counter = meter.createCounter('example_counter', {
//   description: 'Example counter',
// });

// 어플리케이션에서 메트릭 업데이트
// setInterval(() => {
//   counter.add(1, { labelKey: 'labelValue' });
// }, 1000);

const sdk = new opentelemetry.NodeSDK({
  // 서비스 이름 지정
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'test-server',
    [SemanticResourceAttributes.SERVICE_VERSION]: '0.1.0',
    [SemanticResourceAttributes.HOST_NAME]: 'Lontra1234',
  }),
  // metricExporter: prometheusExporter,
  traceExporter: new OTLPTraceExporter({
    // optional - default url is http://localhost:4318/v1/traces
    // localhost 4318 -> OtelCol port
    url: 'http://localhost:4318/v1/traces',
    // optional - collection of custom headers to be sent with each request, empty by default
    headers: {},
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();


