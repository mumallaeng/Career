---
title: 
---

# 사용자 맞춤형 펫 성격 설정 명세서

---

## 개요

| 항목 | 내용 |
|------|------|
| 구분 | 사용자 맞춤형 펫 성격 설정 |
| 목적 | 펫의 말투, 성격, 응답 참고 정보 설정 및 조회 |
| 데이터 형식 | JSON |
| 사용 프로토콜 | TCP · UDP · CoAP · MQTT |

---

## 공통 메시지 구조

```json
{
  "command": "set_character",
  "payload": {
    "userId": 1,
    "speech": "존댓말",
    "character": "내향적",
    "resSetting": "땅콩 알레르기 있음"
  }
}
````

또는

```json
{
  "command": "get_character",
  "payload": {
    "userId": 1
  }
}
```

---

## 요청 명세

### 공통 필드

| 필드명     | 타입     | 필수 | 설명                                     | 매핑 DB 컬럼 |
| ------- | ------ | -- | -------------------------------------- | -------- |
| command | STRING | 예  | `"set_character"` 또는 `"get_character"` | -        |

---

### payload – set_character

| 필드명        | 타입     | 필수 | 설명          | 매핑 DB 컬럼    |
| ---------- | ------ | -- | ----------- | ----------- |
| userId     | INT    | 예  | 사용자 고유 ID   | user_id     |
| speech     | STRING | 예  | 펫 말투 설정     | speech      |
| character  | STRING | 예  | 펫 성격 설정     | character   |
| resSetting | STRING | 예  | 응답 시 참고할 정보 | res_setting |

---

### payload – get_character

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
    "characterId": 1001,
    "speech": "존댓말",
    "character": "내향적",
    "resSetting": "땅콩 알레르기 있음"
  }
}
```

---

### data 필드

| 필드명         | 타입     | 설명          | 매핑 DB 컬럼     |
| ----------- | ------ | ----------- | ------------ |
| characterId | INT    | 성격 설정 고유 ID | character_id |
| speech      | STRING | 말투 설정       | speech       |
| character   | STRING | 성격 설정       | character    |
| resSetting  | STRING | 응답 참고 정보    | res_setting  |

---

## 응답 코드 정의

| 코드   | 메시지            | 설명               |
| ---- | -------------- | ---------------- |
| 1000 | SUCCESS        | 처리 성공            |
| 2001 | USER_NOT_FOUND | 사용자 ID 없음        |
| 2002 | INVALID_INPUT  | 필수값 누락 또는 잘못된 요청 |
| 5000 | INTERNAL_ERROR | 서버 내부 오류         |

---

## 프로토콜별 전송 방식 예시

### TCP · UDP

* JSON 그대로 전송 (구분자 또는 길이 기반 메시지 처리)

---

### MQTT

| 항목      | 값             |
| ------- | ------------- |
| Topic   | pet/character |
| Payload | 위 JSON 메시지    |

---

### CoAP

| 항목      | 값                         |
| ------- | ------------------------- |
| Method  | POST                      |
| URI     | coap://host/pet/character |
| Payload | 위 JSON 메시지                |
