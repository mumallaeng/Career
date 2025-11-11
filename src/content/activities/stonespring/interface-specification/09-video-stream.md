---
title: 
---

# 실시간 영상 스트림 전송 명세서

---

## 개요

| 항목 | 내용 |
|------|------|
| 구분 | 실시간 영상 스트림 전송 |
| 목적 | 클라이언트가 요청한 영상 스트림을 서버가 전송 |
| 데이터 형식 | 요청/응답: JSON, 스트림: Binary (JPEG) |
| 사용 프로토콜 | UDP |

---

## 요청 명세

### 1. 스트림 시작 요청

```json
{
  "command": "get_video_stream",
  "videoId": 101,
  "quality": "high",
  "fps": 15
}
````

| 필드명     | 타입     | 필수 | 설명                                |
| ------- | ------ | -- | --------------------------------- |
| command | STRING | 예  | `"get_video_stream"` 명령           |
| videoId | INT    | 예  | 영상 고유 ID                          |
| quality | STRING | 예  | 영상 품질 (`low` / `medium` / `high`) |
| fps     | INT    | 예  | 초당 프레임 수                          |

---

### 2. 스트림 종료 요청

```json
{
  "command": "stop_stream",
  "videoId": 101
}
```

| 필드명     | 타입     | 필수 | 설명                 |
| ------- | ------ | -- | ------------------ |
| command | STRING | 예  | `"stop_stream"` 명령 |
| videoId | INT    | 예  | 종료할 영상 ID          |

---

## 응답 명세 (스트림 시작 시)

```json
{
  "resultCode": 1000,
  "resultMsg": "SUCCESS",
  "data": {
    "streamPort": 5005,
    "protocol": "UDP",
    "format": "JPEG",
    "quality": "high",
    "fps": 15
  }
}
```

| 필드명        | 타입     | 설명           |
| ---------- | ------ | ------------ |
| streamPort | INT    | 영상 스트림 전송 포트 |
| protocol   | STRING | `"UDP"` 고정   |
| format     | STRING | `"JPEG"` 고정  |
| quality    | STRING | 요청된 품질 수준    |
| fps        | INT    | 초당 프레임 수     |

---

## 데이터 전송 (UDP 스트림)

| 항목 | 내용                                         |
| -- | ------------------------------------------ |
| 포맷 | JPEG 인코딩된 이미지 바이너리                         |
| 예시 | `cv2.imencode('.jpg', frame)[1].tobytes()` |
| 전송 | 설정된 `streamPort`로 UDP 전송                   |

---

## DB 컬럼 매핑

| 필드명                 | 매핑 DB 컬럼                   |
| ------------------- | -------------------------- |
| videoId             | Chat.video_id              |
| videoPath           | Chat.video_path            |
| videoStartTimestamp | Chat.video_start_timestamp |
| videoEndTimestamp   | Chat.video_end_timestamp   |

---

## 참고 사항

* **quality**에 따라 JPEG 압축률 및 해상도 조절됨

  * `low`: 320x240 (저해상도, 빠른 전송)
  * `medium`: 640x480 (중간 품질)
  * `high`: 1280x720 이상 (고화질)
* `stop_stream` 명령 수신 시 스트리밍 중단
* UDP 특성상 일부 프레임 손실 가능 (복구 불가)
