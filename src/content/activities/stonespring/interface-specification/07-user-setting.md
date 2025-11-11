---
title: 
---

# 사용자 접근성/환경 설정 명세서

---

## 개요

| 항목 | 내용 |
|------|------|
| 구분 | 사용자 접근성/환경 설정 |
| 목적 | 사용자 글자 크기 등 설정 저장 및 조회 |
| 데이터 형식 | JSON |
| 사용 프로토콜 | TCP / UDP / CoAP / MQTT |

---

## 공통 메시지 구조

```json
{
  "command": "set_setting",
  "payload": {
    "userId": 1,
    "fontSize": 18
  }
}
````

또는

```json
{
  "command": "get_setting",
  "payload": {
    "userId": 1
  }
}
```

---

## 요청 명세

### 공통 필드

| 필드명     | 타입     | 필수 | 설명                                 | 매핑 DB 컬럼 |
| ------- | ------ | -- | ---------------------------------- | -------- |
| command | STRING | 예  | `"set_setting"` 또는 `"get_setting"` | -        |

---

### payload – set_setting

| 필드명      | 타입  | 필수 | 설명        | 매핑 DB 컬럼  |
| -------- | --- | -- | --------- | --------- |
| userId   | INT | 예  | 사용자 고유 ID | user_id   |
| fontSize | INT | 예  | 글자 크기 설정  | font_size |

---

### payload – get_setting

| 필드명    | 타입  | 필수 | 설명        | 매핑 DB 컬럼 |
| ------ | --- | -- | --------- | -------- |
| userId | INT | 예  | 사용자 고유 ID | user_id  |

---

## 응답 명세

```json
{
  "resultCode": 1000,
  "resultMsg": "SUCCESS",
  "data": {
    "settingId": 9001,
    "fontSize": 18
  }
}
```

---

### data 필드

| 필드명       | 타입  | 설명        | 매핑 DB 컬럼   |
| --------- | --- | --------- | ---------- |
| settingId | INT | 설정 고유 ID  | setting_id |
| fontSize  | INT | 설정된 글자 크기 | font_size  |

---

## 응답 코드 정의

| 코드   | 메시지            | 설명                |
| ---- | -------------- | ----------------- |
| 1000 | SUCCESS        | 설정 저장/조회 성공       |
| 2001 | USER_NOT_FOUND | 사용자 ID 없음         |
| 2002 | INVALID_INPUT  | 필수 항목 누락 또는 형식 오류 |
| 5000 | INTERNAL_ERROR | 서버 내부 오류          |

---

## 프로토콜별 전송 방식 예시

### TCP / UDP

* JSON 메시지 그대로 전송

---

### MQTT

| 항목      | 값            |
| ------- | ------------ |
| Topic   | user/setting |
| Payload | 위 JSON 메시지   |

---

### CoAP

| 항목      | 값                        |
| ------- | ------------------------ |
| Method  | POST                     |
| URI     | coap://host/user/setting |
| Payload | 위 JSON 메시지               |
