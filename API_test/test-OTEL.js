const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { SemanticAttributes } = require('@opentelemetry/semantic-conventions');
const opentelemetry = require('@opentelemetry/api');

const Meter = opentelemetry.metrics.getMeter('metrics_get', '0.1.0');
const tracer = opentelemetry.trace.getTracer('trace_get', '0.1.0');


let result_data = {
        renderer: 'global',
        name: 'Application',
        nodes: [
          {
            renderer: 'region',
            name: 'INTERNET',
            class: 'normal'
          },
          {
            renderer: 'region',
            name: 'Application 1',
            maxVolume: 500,
            class: 'warning',
            updated: 1466838546805,
            nodes: [
                {
                    name: 'INTERNET',
                    renderer: 'focusedChild',
                    class: 'normal'
                },
                {
                    name: 'nginx1',
                    renderer: 'focusedChild',
                    class: 'warning'
                },
                {
                    name: 'nginx2',
                    renderer: 'focusedChild',
                    class: 'danger'
                }
            ],
            connections: [
                {
                    source: 'INTERNET', 
                    target: 'nginx1', 
                    metrics: { 
                        normal: 1000,
                        danger: 200
                        }
                },
                {
                    source: 'nginx1', 
                    target: 'nginx2', 
                    metrics: { 
                        normal: 500,
                        danger: 100
                        }
                },
            ]
          }
        ], 
        connections: [
          { 
            source: 'INTERNET', 
            target: 'Application 1', 
            metrics: { 
                normal: 40000 ,
                danger: 10400
            } 
        },
        ]
      };

// const directoryPath = '/home/ec2-user/fluentd/docker_log/';
const directoryPath = '/Users/woongzzang/study/vizceral/example/docker_log/';

function Vizceral_data() {
    /* 
    Vizceral_data 에서 추가된 부분 
    span 생성 구문
    */
    return tracer.startActiveSpan('Vizceral_data', (span) => {
        return new Promise(async (resolve, reject) => {
            /*
            span Tag값에 추가되는 항목
            */
            span.setAttribute('plus.tag', '2563lontra');
            //span.setAttribute(SemanticAttributes)
            fs.readdir(directoryPath, (err, files) => {
                if (err) {
                    console.error('Error reading directory:', err);
                    return;
                }
                const jsonFiles = files.filter(file => path.extname(file) === '.log');
                
                jsonFiles.forEach(jsonFile => {
                const filePath = path.join(directoryPath, jsonFile);

                const readStream = readline.createInterface({
                    input: fs.createReadStream(filePath),
                    output: process.stdout,
                    terminal: false
                });

                // 200 => OK else => Not_OK
                let count_Not_OK = 0;
                let count_OK = 0;

                readStream.on('line', (line) => {
                    // 각 줄에 대한 처리를 여기에 추가합니다.
                    const del = line.split(/\s+/);
                    const log_message = del.slice(2).join('');
                    try {
                        outerJson = JSON.parse(log_message);

                        if (outerJson.log.trim().startsWith('{')) {
                            log_result = JSON.parse(outerJson.log)
                            let source = log_result.remote_addr;
                            let target = outerJson.container_name;
                            if (log_result.status == '200'){
                                count_OK += 10;
                            }
                            else {
                                count_Not_OK += 10
                            }
                            const New_source_focusedChild = {
                                name: source,
                                renderer: 'focusedChild',
                                class: 'normal'
                            }
                            const New_target_focusedChild = {
                                name: target,
                                renderer: 'focusedChild',
                                class: 'normal'
                            }
                            const New_Connection = {
                                source: source, 
                                target: target, 
                                metrics: { 
                                    normal: count_OK,
                                    danger: count_Not_OK
                                }
                            }
                            
                            // result_data에 노드가 없는 경우
                            const existingTargetIndex = result_data.nodes[1].nodes.findIndex(existingItem => 
                                existingItem.name === New_target_focusedChild.name && existingItem.renderer === New_target_focusedChild.renderer
                            );
                            
                            if (existingTargetIndex == -1) {
                                // 기존에 이미 있는 경우 노드 업데이트
                                result_data.nodes[1].nodes.push(New_target_focusedChild);
                            } else {
                                // 없는 경우 새로운 데이터 추가
                                console.log("node is ready")
                            }
                            // source 노드가 없는 경우
                            const existingSourceIndex = result_data.nodes[1].nodes.findIndex(existingItem => 
                                existingItem.name === New_source_focusedChild.name && existingItem.renderer === New_source_focusedChild.renderer
                            );
                            
                            if (existingSourceIndex == -1) {
                                // 기존에 이미 있는 경우 노드 업데이트
                                result_data.nodes[1].nodes.push(New_source_focusedChild);
                            } else {
                                // 없는 경우 새로운 데이터 추가
                                console.log("node is ready")
                            }

                            // 같은 이름의 커넥션이 있는지 확인 없으면 -1 있으면 인덱스 번호를 알려준다.
                            const existingConnetionIndex = result_data.nodes[1].connections.findIndex(existingItem => 
                                existingItem.source === New_Connection.source && existingItem.target === New_Connection.target
                            );
                            
                            if (existingConnetionIndex !== -1) {
                                // 기존에 이미 있는 경우 metrics 업데이트
                                result_data.nodes[1].connections[existingConnetionIndex].metrics = New_Connection.metrics;
                            } else {
                                // 없는 경우 새로운 데이터 추가
                                result_data.nodes[1].connections.push(New_Connection);
                            }
                        }
                    }
                    catch (error){
                        console.log(error)
                        reject(error);
                    }
                    });
                
                // 로그 데이터 초기화
                count_Not_OK, count_OK = 0;
                
                readStream.on('close', () => {
                        /* 
                        Vizceral_data 에서 추가된 부분 
                        span 생성 구문
                        */
                    span.end();
                    resolve(result_data);
                });
            });
            })
        });
    }) 
};

module.exports = {
    Vizceral_data: Vizceral_data,
};
