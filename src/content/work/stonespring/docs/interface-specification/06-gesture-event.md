---
title: 
---

# Gesture Event (제스처 이벤트) 명세서

---

## 개요

| 항목 | 내용 |
|------|------|
| 구분 | Gesture Event (제스처 이벤트) |
| 목적 | 감지된 제스처 정보를 서버에 전달 |
| 데이터 형식 | JSON 또는 단문 문자열 |
| 사용 프로토콜 | UDP |

---

## 메시지 형식

### 1. JSON 메시지 예시

```json
{
  "event": "gesture",
  "userId": "qpzja",
  "gesture": "wave",
  "trainingSettingId": 5001
}
````

---

### 2. 단문 문자열 예시 (옵션)

```
gesture|qpzja|wave|5001
```

* 순서: **이벤트명 | 유저ID | 제스처명 | 훈련ID**
* 서버에서는 구분자(`|`) 기준으로 파싱

---

## 요청 필드 명세

| 필드명               | 타입     | 필수 | 설명                                       | 매핑 DB 컬럼            |
| ----------------- | ------ | -- | ---------------------------------------- | ------------------- |
| event             | STRING | 예  | `"gesture"` 고정                           | -                   |
| userId            | STRING | 예  | 사용자 식별자<br/>(User의 외부 식별자에 매핑 예정 시 고려 필요) | -                   |
| gesture           | STRING | 예  | 감지된 제스처 이름                               | recognized_gesture  |
| trainingSettingId | INT    | 예  | 훈련 설정 ID                                 | training_setting_id |
