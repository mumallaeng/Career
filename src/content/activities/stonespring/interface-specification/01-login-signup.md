---
title: Login · SignUp
---

## 개요

| 항목 | 내용 |
|------|------|
| 구분 | 로그인 · 회원가입 |
| 목적 | 사용자 인증 또는 계정 생성 요청·응답 |
| 데이터 형식 | JSON |
| 사용 프로토콜 | TCP · UDP · CoAP · MQTT (공통 포맷 사용) |

---

## 공통 메시지 구조

```json
{
  "command": "signup",
  "payload": {
    "userNm": "admin",
    "userNickNm": "관리자",
    "userEmail": "abc@xyz.com",
    "userPassword": "hashed_password"
  }
}
````

* **command**: `"login"` 또는 `"signup"`
* **payload**: 실제 데이터 영역

---

## 요청 명세

### 공통 필드

| 필드명     | 타입     | 필수 | 설명                      | 매핑되는 DB 컬럼 (User) |
| ------- | ------ | -- | ----------------------- | ----------------- |
| command | STRING | 예  | `"login"` 또는 `"signup"` | -                 |

---

### signup 명령 시 payload

| 필드명          | 타입          | 필수 | 설명        | 매핑 DB 컬럼 |
| ------------ | ----------- | -- | --------- | -------- |
| userNm       | STRING      | 예  | 사용자 계정명   | name     |
| userNickNm   | STRING      | 예  | 사용자 표시 이름 | nickname |
| userEmail    | STRING(100) | 예  | 이메일 주소    | email    |
| userPassword | STRING      | 예  | 해시된 비밀번호  | password |

---

### login 명령 시 payload

| 필드명          | 타입          | 필수 | 설명       | 매핑 DB 컬럼 |
| ------------ | ----------- | -- | -------- | -------- |
| userEmail    | STRING(100) | 예  | 이메일 주소   | email    |
| userPassword | STRING      | 예  | 해시된 비밀번호 | password |

---

## 응답 명세

### 공통 응답 형식

```json
{
  "resultCode": 1000,
  "resultMsg": "SUCCESS",
  "data": {
    "userId": 1,
    "token": "abc.def.ghi"
  }
}
```

---

### 응답 필드

| 필드명        | 타입     | 설명                  |
| ---------- | ------ | ------------------- |
| resultCode | INT    | 처리 결과 코드 (아래 참조)    |
| resultMsg  | STRING | 처리 결과 메시지           |
| data       | OBJECT | 성공 시 사용자 정보 및 토큰 포함 |

---

### data 필드 (성공 시)

| 필드명    | 타입     | 설명           | 매핑 DB 컬럼 |
| ------ | ------ | ------------ | -------- |
| userId | INT    | 사용자 고유 ID    | user_id  |
| token  | STRING | 로그인 토큰 (세션용) | -        |

---

## 응답 코드 정의

| 코드   | 메시지              | 설명            |
| ---- | ---------------- | ------------- |
| 1000 | SUCCESS          | 요청 성공         |
| 2001 | EMAIL_EXISTS     | 회원가입 시 이메일 중복 |
| 2002 | USER_NOT_FOUND   | 로그인 시 이메일 없음  |
| 2003 | INVALID_PASSWORD | 비밀번호 불일치      |
| 5000 | INTERNAL_ERROR   | 서버 내부 오류      |

---

## 프로토콜별 전송 방식 예시

### TCP · UDP

* 소켓 통신으로 JSON 그대로 전송
* 구분자: 개행(`\n`) 또는 길이 프레임

---

### MQTT

| 항목      | 값          |
| ------- | ---------- |
| Topic   | user/auth  |
| Payload | 위 JSON 메시지 |

---

### CoAP

| 항목      | 값                                     |
| ------- | ------------------------------------- |
| Method  | POST                                  |
| URI     | coap://host/user/signup or user·login |
| Payload | 위 JSON 메시지                            |
