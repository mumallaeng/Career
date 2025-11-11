---
title: 
---

# Emotion Result (사용자 감정 분석 결과) 명세서

---

## 개요

| 항목 | 내용 |
|------|------|
| 구분 | Emotion Result (사용자 감정 분석 결과) |
| 목적 | 채팅 데이터를 기반으로 사용자 감정(얼굴/음성/텍스트) 분석 요청 |
| 데이터 형식 | JSON |
| 사용 프로토콜 | TCP / UDP / CoAP / MQTT |

---

## 공통 메시지 구조

```json
{
  "command": "analyze_emotion",
  "payload": {
    "userId": 1,
    "chatId": 3001,
    "videoPath": "/video/101.mp4",
    "voicePath": "/voice/201.wav",
    "message": "괜찮을까?"
  }
}
````

---

## 요청 명세

### 공통 필드

| 필드명     | 타입     | 필수 | 설명                     | 매핑 DB 컬럼 |
| ------- | ------ | -- | ---------------------- | -------- |
| command | STRING | 예  | `"analyze_emotion"` 명령 | -        |

---

### payload 필드

| 필드명       | 타입     | 필수 | 설명         | 매핑 DB 컬럼           |
| --------- | ------ | -- | ---------- | ------------------ |
| userId    | INT    | 예  | 사용자 고유 ID  | user_id            |
| chatId    | INT    | 예  | 채팅 세트 ID   | chat_id            |
| videoPath | STRING | 예  | 사용자 영상 경로  | video_path (참조 용도) |
| voicePath | STRING | 예  | 사용자 음성 경로  | voice_path (참조 용도) |
| message   | STRING | 예  | 사용자 채팅 텍스트 | message (참조 용도)    |

---

## 응답 명세

```json
{
  "resultCode": 1000,
  "resultMsg": "SUCCESS",
  "data": {
    "emotionId": 5001,
    "faceEmotion": "happy",
    "voiceEmotion": "calm",
    "textEmotion": "worried",
    "summary": "조금 걱정되지만 침착함",
    "time": "2025-03-23 14:26:00"
  }
}
```

---

### data 필드

| 필드명          | 타입       | 설명          | 매핑 DB 컬럼            |
| ------------ | -------- | ----------- | ------------------- |
| emotionId    | INT      | 감정 분석 고유 ID | emotion_analysis_id |
| faceEmotion  | STRING   | 얼굴 표정 기반 감정 | face_emotion        |
| voiceEmotion | STRING   | 음성 기반 감정    | voice_emotion       |
| textEmotion  | STRING   | 텍스트 기반 감정   | text_emotion        |
| summary      | STRING   | 통합 감정 해석    | summary             |
| time         | DATETIME | 감정 분석 시각    | time                |

---

## 응답 코드 정의

| 코드   | 메시지            | 설명                   |
| ---- | -------------- | -------------------- |
| 1000 | SUCCESS        | 감정 분석 성공             |
| 2001 | USER_NOT_FOUND | 사용자 ID 없음            |
| 2002 | CHAT_NOT_FOUND | 채팅 ID 없음             |
| 2003 | INVALID_INPUT  | message, 영상 또는 음성 누락 |
| 5000 | INTERNAL_ERROR | 서버 내부 오류             |

---

## 프로토콜별 전송 방식 예시

### TCP / UDP

* JSON 메시지 그대로 전송

---

### MQTT

| 항목      | 값               |
| ------- | --------------- |
| Topic   | emotion/analyze |
| Payload | 위 JSON 메시지      |

---

### CoAP

| 항목      | 값                           |
| ------- | --------------------------- |
| Method  | POST                        |
| URI     | coap://host/emotion/analyze |
| Payload | 위 JSON 메시지                  |

