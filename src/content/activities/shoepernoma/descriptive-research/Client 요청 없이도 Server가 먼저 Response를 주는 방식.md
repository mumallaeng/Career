## 구현 상황

Roscar의 작업 현황을 Client가 요청하지 않더라도, 상태가 갱신될 때마다 Server가 Client에게 자동 전송하는 구조이다.

---

## 필요한 방식

Client의 요청 없이도 Server가 먼저 Response를 전달하는 방식이 필요하다.

---

## 구조 정의

**Persistent TCP + Push 메시지 모델**

* Persistent TCP 연결을 통해 Main Service → GUI 방향의 서버 푸시(Push) 통신
* GUI는 요청 없이 실시간 수신 대기 상태 유지
* Main Service는 ROS2 이벤트 발생 시 즉시 `sendall()`을 통해 메시지 전송

---

## 기술적 개념

| 용어                       | 설명                                    |
| ------------------------ | ------------------------------------- |
| Persistent TCP           | 연결을 유지한 상태에서 서버와 클라이언트가 자유롭게 메시지를 송수신 |
| Server Push              | Client 요청 없이 Server가 먼저 메시지를 전송       |
| Custom Protocol over TCP | TCP 상에서 자체 정의한 메시지 구조 사용              |
| Stream-based Dispatching | TCP를 스트림처럼 사용하여 실시간 메시지 전달            |

---

## 구현하려는 부분과 구조의 적합성

* GUI는 `recv()`만 유지해도 실시간 반응 가능
* Main Service는 ROS2 이벤트 발생 즉시 메시지 전송 가능
* PyQt GUI + Python TCP Server 환경에 매우 적합한 구조

---

## 고려 및 권장 사항

| 항목        | 권장 또는 주의사항                             |
| --------- | -------------------------------------- |
| 메시지 식별 방식 | `Cmd` 필드로 메시지 종류 구분 (예: `TS`)          |
| 수신 처리 구조  | Receiver Thread 또는 Event Loop 기반 처리    |
| 메시지 파싱 방식 | MessageUtils 또는 전용 디코더 사용              |
| 예외 상황 대비  | 연결 끊김, 비정상 상태 감지 및 멀티 사용자/멀티 스레드 처리 필요 |

---

## 대표적 활용 사례

* 게임 서버: 플레이어 위치 및 상태 실시간 푸시
* 거래소 클라이언트: 시세 및 가격 알림
* IoT 시스템: 장비 상태 실시간 보고

---

## 대안 기술 (참고)

| 기술             | 특징                             |
| -------------- | ------------------------------ |
| WebSocket      | HTTP Handshake 후 TCP 기반 양방향 통신 |
| gRPC Streaming | HTTP/2 기반 스트리밍, RPC와 실시간성 결합   |
| MQTT           | 경량 Pub/Sub 구조, IoT 환경에 적합      |

현재 구조에서는 위 대안 기술이 필수는 아니며, 적용 필요성도 낮다.

---

## 결론

현재 구조는 **Persistent TCP 기반 Server Push 통신 모델**로 설계 목적에 정확히 부합한다.
TS 메시지와 같은 Push 전용 인터페이스는 안정적이며, 명세서에 그대로 포함해도 문제없이 운용 가능하다.
