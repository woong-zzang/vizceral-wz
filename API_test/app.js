const express = require('express');
const app = express();
const cors = require('cors'); // cors 미들웨어 추가
const port = 3000;  // 사용할 포트 번호
const Vizceral_data = require('./test-OTEL');
const dice = require('./dice')
const opentelemetry = require('@opentelemetry/api');

const myMeter = opentelemetry.metrics.getMeter('my-service-meter');

app.use(cors()); // 모든 요청에 대해 CORS 허용

// 미들웨어: CORS 설정
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// 미들웨어: Nginx 트래픽 데이터 엔드포인트
app.get('/nginx', async (req, res) => {
  // 여기에 실제 Nginx 트래픽 데이터 로직을 구현
  // 로그를 읽어와 적절한 형식으로 가공한 데이터를 반환
  const results = await Vizceral_data.Vizceral_data();
  console.log(results)
  res.json(results);
});

app.get('/roll', async (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  res.send(JSON.stringify(dice.rollTheDice(rolls, 1, 6)));
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
})
