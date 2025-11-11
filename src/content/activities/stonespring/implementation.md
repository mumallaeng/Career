---
title: 
---

# Dolbom 시스템 구조 명세서 (v0.2.0 기준)

---

## 개요

Dolbom 시스템은 **PyQt 클라이언트 + 로컬 TCP/UDP 서버 통합 실행 구조**로 설계되었다.  
이때 ‘서버’는 외부 네트워크 접속이 불가능한 **로컬 전용(Private) TCP 서버**를 의미한다.

- `tcp_server.py`는 **서버 역할**을 수행하는 로컬 TCP 서버
- PyQt GUI는 **클라이언트 역할**을 수행하며, TCP를 통해 메시지를 주고받음
- 모든 구성요소는 **동일한 로컬 PC 내부에서 실행**됨  
  → 즉, 클라이언트와 서버가 물리적으로 분리되지 않음
- 외부 네트워크 접속 불가, 로컬 내부 통신만 수행

---

## 시스템 구조 요약

### 기본 흐름

```

[PyQt GUI 사용자 입력]
↓
controller.py
↓
socket_client.py (TCP 클라이언트)
↓
localhost:9000 로 메시지 전송
↓
tcp_server.py (TCP 서버 수신)
↓
dispatcher.py
↓
interface/*.py 핸들러 처리
↓
DB 연동 및 처리
↓
결과 응답 반환
↓
PyQt로 다시 전송 및 화면 출력

```

---

### 비디오 / 오디오 스트리밍 흐름

- **프로토콜:** UDP  
- **구조:**
  - `video_streamer.py`, `audio_streamer.py` → UDP 클라이언트 역할
  - `udp_stream.py` → UDP 서버 역할

---

## 코드 구성 및 역할 정리

| 구성 요소 | 역할 | 관련 모듈 경로 |
|------------|------|----------------|
| **PyQt GUI** | 사용자 입력 / 출력 UI | `views/`, `main.py` |
| **controller.py** | PyQt 이벤트를 TCP 요청으로 변환 | `core/controller.py` |
| **socket_client.py** | TCP 클라이언트 (127.0.0.1:9000 연결) | `core/socket_client.py` |
| **tcp_server.py** | TCP 서버, 모든 요청 수신 및 응답 처리 | `network/tcp_server.py` |
| **dispatcher.py** | 명령 라우팅 및 요청 분기 처리 | `core/dispatcher.py` |
| **interface/*.py** | 개별 명령별 처리 로직 구현 | `interface/` |
| **query.py / models.py** | DB 연동 ORM (MySQL 등) | `db/` |
| **udp_stream.py** | UDP 서버 (비디오/오디오 수신) | `network/udp_stream.py` |
| **audio_streamer.py / video_streamer.py** | UDP 클라이언트 (비디오/오디오 전송) | `network/` |

---

## 주요 특징

- **로컬 통신 전용 구조**
  - TCP: 명령 및 제어 메시지 처리 (`localhost:9000`)
  - UDP: 실시간 오디오/비디오 스트리밍 처리
- **서버-클라이언트 통합 실행**
  - PyQt GUI 실행 시 내부적으로 로컬 서버가 함께 구동
  - 외부 연결 불가, 보안성이 높은 개인 환경 구조
- **모듈화 설계**
  - UI, 통신, 데이터 처리, 감정 분석 로직이 파일 단위로 명확히 분리
- **향후 확장성**
  - 필요 시 서버를 외부 분리형 구조로 변경 가능 (포트 및 IP 설정 확장 예정)
