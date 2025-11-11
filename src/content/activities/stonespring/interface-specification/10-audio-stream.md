---
title: 
---

# 실시간 오디오 스트림 전송 (마이크 입력) 명세서

---

## 개요

| 항목 | 내용 |
|------|------|
| 구분 | 실시간 오디오 스트림 전송 (마이크 입력) |
| 목적 | 클라이언트 요청에 따라 오디오 스트림 전송 |
| 데이터 형식 | 요청/응답: JSON, 스트림: Binary (PCM/MP3) |
| 사용 프로토콜 | UDP |

---

## 요청 명세

### 1. 스트림 시작 요청

```json
{
  "command": "get_audio_stream",
  "audioId": 201,
  "codec": "pcm",
  "sampleRate": 16000,
  "channels": 1,
  "chunkSize": 1024
}
````

| 필드명        | 타입     | 필수 | 설명                          |
| ---------- | ------ | -- | --------------------------- |
| command    | STRING | 예  | `"get_audio_stream"` 명령     |
| audioId    | INT    | 예  | 오디오 스트림 고유 ID               |
| codec      | STRING | 예  | 오디오 코덱 (`"pcm"`, `"mp3"`)   |
| sampleRate | INT    | 예  | 샘플링 레이트 (Hz)                |
| channels   | INT    | 예  | 채널 수 (1 = mono, 2 = stereo) |
| chunkSize  | INT    | 예  | 오디오 버퍼 크기 (byte 단위)         |

---

### 2. 스트림 종료 요청

```json
{
  "command": "stop_stream",
  "audioId": 201
}
```

| 필드명     | 타입     | 필수 | 설명                 |
| ------- | ------ | -- | ------------------ |
| command | STRING | 예  | `"stop_stream"` 명령 |
| audioId | INT    | 예  | 종료할 오디오 ID         |

---

## 응답 명세 (스트림 시작 시)

```json
{
  "resultCode": 1000,
  "resultMsg": "SUCCESS",
  "data": {
    "streamPort": 5010,
    "protocol": "UDP",
    "codec": "pcm",
    "sampleRate": 16000,
    "channels": 1,
    "chunkSize": 1024
  }
}
```

| 필드명        | 타입     | 설명               |
| ---------- | ------ | ---------------- |
| streamPort | INT    | 오디오 스트림 전송 포트    |
| protocol   | STRING | `"UDP"` 고정       |
| codec      | STRING | 설정된 오디오 코덱       |
| sampleRate | INT    | 설정된 샘플링 레이트 (Hz) |
| channels   | INT    | 설정된 채널 수         |
| chunkSize  | INT    | 설정된 오디오 버퍼 크기    |

---

## 데이터 전송 (UDP 스트림)

| 항목 | 내용                       |
| -- | ------------------------ |
| 포맷 | PCM 버퍼 또는 MP3 프레임        |
| 예시 | `data = mic.read(1024)`  |
| 전송 | 설정된 `streamPort`로 UDP 전송 |

---

## DB 컬럼 매핑

| 필드명                 | 매핑 DB 컬럼                   |
| ------------------- | -------------------------- |
| audioId             | Chat.voice_id              |
| voicePath           | Chat.voice_path            |
| voiceStartTimestamp | Chat.voice_start_timestamp |
| voiceEndTimestamp   | Chat.voice_end_timestamp   |

---

## 참고 사항

* **PCM**: 압축되지 않은 원시(raw) 오디오, 지연이 적고 실시간 재생에 적합
* **MP3**: 압축률이 높으나 디코딩 과정 필요
* `stop_stream` 명령 수신 시 해당 스트림 즉시 종료
* UDP 특성상 일부 패킷 손실 가능 (복구 불가)
* 클라이언트는 수신 데이터를 **실시간 재생 또는 저장** 가능
