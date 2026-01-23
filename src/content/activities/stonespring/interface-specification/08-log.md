---
title: 
---

# 사용자 행위 및 시스템 이벤트 로그 기록 명세서

---

## 개요

| 항목 | 내용 |
|------|------|
| 구분 | 사용자 행위 및 시스템 이벤트 로그 기록 |
| 목적 | 사용자 활동, 오류, 시스템 상태 등의 로그 저장 |
| 데이터 형식 | JSON |
| 사용 프로토콜 | TCP · UDP · CoAP · MQTT |

---

## 공통 메시지 구조

```json
{
  "command": "write_log",
  "payload": {
    "userId": 1,
    "logType": "emotion_analysis",
    "timestamp": "2025-03-23 14:30:00",
    "detail": "감정 분석 완료",
    "location": "mobile_app",
    "deviceInfo": "iPhone 14, iOS 17.2",
    "errorCode": "E2001",
    "ipAddress": "192.168.0.15"
  }
}
````

---

## 요청 명세

### 공통 필드

| 필드명     | 타입     | 필수 | 설명            | 매핑 DB 컬럼 |
| ------- | ------ | -- | ------------- | -------- |
| command | STRING | 예  | `"write_log"` | -        |

---

### payload – write_log

| 필드명        | 타입             | 필수  | 설명        | 매핑 DB 컬럼    |
| ---------- | -------------- | --- | --------- | ----------- |
| userId     | INT            | 예   | 사용자 고유 ID | user_id     |
| logType    | STRING         | 예   | 로그 유형     | log_type    |
| timestamp  | DATETIME       | 예   | 로그 발생 시각  | timestamp   |
| detail     | STRING         | 예   | 로그 상세 메시지 | detail      |
| location   | STRING         | 예   | 로그 발생 위치  | location    |
| deviceInfo | STRING         | 예   | 디바이스 정보   | device_info |
| errorCode  | STRING or null | 아니오 | 오류 코드     | error_code  |
| ipAddress  | STRING         | 예   | IP 주소     | ip_address  |

---

## 응답 명세

```json
{
  "resultCode": 1000,
  "resultMsg": "SUCCESS",
  "data": {
    "logId": 8001,
    "errorCode": "E2001",
    "ipAddress": "192.168.0.15",
    "deviceInfo": "iPhone 14, iOS 17.2"
  }
}
```

---

### data 필드

| 필드명        | 타입             | 설명           | 매핑 DB 컬럼    |
| ---------- | -------------- | ------------ | ----------- |
| logId      | INT            | 생성된 로그 고유 ID | log_id      |
| errorCode  | STRING or null | 저장된 오류 코드    | error_code  |
| ipAddress  | STRING         | 저장된 IP 주소    | ip_address  |
| deviceInfo | STRING         | 저장된 디바이스 정보  | device_info |

---

## 응답 코드 정의

| 코드   | 메시지            | 설명           |
| ---- | -------------- | ------------ |
| 1000 | SUCCESS        | 로그 저장 성공     |
| 2001 | USER_NOT_FOUND | 사용자 ID 없음    |
| 2002 | INVALID_INPUT  | 필수값 누락 또는 오류 |
| 5000 | INTERNAL_ERROR | 서버 내부 오류     |

---

## 프로토콜별 전송 방식 예시

### TCP · UDP

* JSON 메시지 전송

---

### MQTT

| 항목      | 값          |
| ------- | ---------- |
| Topic   | system/log |
| Payload | 위 JSON 메시지 |

---

### CoAP

| 항목      | 값                      |
| ------- | ---------------------- |
| Method  | POST                   |
| URI     | coap://host/system/log |
| Payload | 위 JSON 메시지             |
