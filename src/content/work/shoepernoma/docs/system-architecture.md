---
title: System Architecture
---

# 여기에 draw.io 다이어그램 삽입

## 시스템 구성요소 및 관계

### Roscars

#### 장치 목록
- **LCD, DC Motor Driver, Buzzer**
- **Pi Camera, LiDAR, Force Sensing Resistor (FSR)**
- **IR Sensor, IMU Sensor, Ultrasonic Sensor, Battery**

- Pi Camera는 **Video Sender 프로세스**를 통해 지속적으로 카메라 영상을 **AI Server**로 전송
- Battery는 전압 및 잔량 상태를 **Mobile Controller**에서 감지하며, 주기적으로 **Main Server**에 보고됨

---

### Mobile Controller 프로세스
- 각종 센서 및 엑추에이터와 **직접 연결**
- **AI Server – Object Detector**와 UDP *(단방향)* 통신  
  - 미디어 데이터(영상 프레임 등) 전송
- **Main Server – Main Service**와 ROS2 *(DDS 기반, 양방향)* 통신

---

### Video Sender
- Pi Camera에서 수집한 영상 데이터를 **AI Server로 UDP 전송**
- 영상 스트리밍 전담 프로세스

---

## AI Server

### 역할
- AI 처리 전담 서버
- 객체 탐지 결과를 **Main Server**로 전달
- 상황에 따라 **정지, 회피 등 제어 명령** 트리거

### File System
- AI Module에서 이벤트 감지 시 미디어 저장
- 저장 데이터는 **향후 재학습용 데이터셋**으로 활용 예정

### Object Detector 모듈
- 미디어 데이터 기반 **객체 검출**
- 결과를 각 AI 모듈 및 Main Server로 전달

### AI Modules
- Docker 기반 **확장 가능한 모듈 구조**
- 확정 모듈: **Computer Vision**
- 향후 Control 외 **자율주행 관련 모듈 추가 예정**
- 이벤트 감지 시 File System에 미디어 저장 신호 전송
- **Main Server와 TCP (양방향) 통신**
- ROS2 미설치 환경으로 TCP 사용

---

## Main Server

### Main Service 프로세스
- **ROS2 기반 로봇 통신 제어**
- Worker · 관리자와의 중앙 통신 처리
- **스케줄 기반 동작 전환 로직**
  - 가동 · 대기 · 순찰 등 시간 조건 처리
- 데이터베이스 요청 및 처리
- 기타 시스템 상태 및 이벤트 관리

### Path & Control Algorithm
- 로봇의 **경로 계획 및 회피 동작 계산**
- Main Service 내부 모듈로 동작

---

## 통신 구성

| 통신 대상 | 프로토콜 |
|---|---|
| Mobile Controller ↔ Main Service | ROS2 |
| Object Detector ↔ Main Service | TCP |
| User GUI ↔ Main Service | TCP |
| Admin GUI ↔ Main Service | ROS2 |

---

## User · Admin GUI

### User GUI (PyQt 기반, 일반 사용자용)
- 작업 요청 생성
- 요청 상태 확인
- 작업 이력 조회
- **Main Service와 TCP (양방향) 통신**

### Admin GUI (PyQt 기반, 관리자용)
- 로봇 등록 · 삭제
- 실시간 상태 확인
- 로그 및 통계 분석
- **Main Service와 ROS2 (양방향) 통신**

> 보안상의 이유로 User GUI와 Admin GUI는 **각각 독립 실행 프로그램**으로 구동됨

---

## Hardware Specifications

### Pinky Violet Specifications
- **Width:** 126 mm  
- **Depth:** 109 mm  
- **Height:** 145 mm  
- **Weight:** 675 g  

### 주요 컴포넌트 사양

| Component | Specification · Details |
|---|---|
| Main Processor | Raspberry Pi 5, 8GB RAM |
| Camera | Pi Camera, 5MP |
| LCD Display | 2.4-inch, Driver: ST7789 |
| EMS (Emergency Stop) | 지원 |
| LiDAR | SLAMTEC RPLiDAR C1 |
| IMU Sensor | ICM-20948 (9-axis), Pinky Board 내장 |
| Ultrasonic Sensor | HC-SR04 |
| IR Sensor | TCRT5000 |
| Motor Driver | TB6612FNG × 2 |
| Battery | Lithium-Ion 18650 × 2 |
| Buzzer | Pinky Board 내장 |

---

## Pin Map – Connected Devices

### LCD (SPI)

| Pin Name | GPIO Pin | Direction | Description |
|---|---:|:---:|---|
| MOSI | 10 | OUT | SPI master out (to LCD) |
| MISO | 9 | IN | SPI master in (from LCD) |
| SCL (CLK) | 11 | OUT | SPI Clock |
| CS | 8 | OUT | SPI Chip Select |
| DC | 7 | OUT | Data · Command switch |
| RST | 1 | OUT | LCD Reset |
| BL (PWM) | 12 | OUT | LCD backlight control |

---

### LiDAR (UART)

| Pin Name | GPIO Pin | Direction | Description |
|---|---:|:---:|---|
| RX | 14 | OUT | RPi TX → LiDAR RX |
| TX | 15 | IN | RPi RX ← LiDAR TX |

---

### IMU Sensor (I2C)

| Pin Name | GPIO Pin | Direction | Description |
|---|---:|:---:|---|
| SDA | 2 | IO | I2C Data |
| SCL | 3 | IO | I2C Clock |

---

### Ultrasonic Sensor

| Pin Name | GPIO Pin | Direction | Description |
|---|---:|:---:|---|
| TRIG | 23 | OUT | Trigger signal |
| ECHO | 24 | IN | Echo response |

---

### IR Sensor

| Pin Name | GPIO Pin | Direction |
|---|---:|:---:|
| IR1 | 16 | IN |
| IR2 | 20 | IN |
| IR3 | 21 | IN |

---

### DC Motor Driver

**Motor Left**

| Pin Name | GPIO Pin | Direction | Description |
|---|---:|:---:|---|
| AIN1 | 17 | OUT | Direction control |
| AIN2 | 27 | OUT | Direction control |
| PWMA | 18 | OUT | PWM speed control |

**Motor Right**

| Pin Name | GPIO Pin | Direction | Description |
|---|---:|:---:|---|
| BIN1 | 5 | OUT | Direction control |
| BIN2 | 6 | OUT | Direction control |
| PWMB | 13 | OUT | PWM speed control |

| Pin Name | GPIO Pin | Direction | Description |
|---|---:|:---:|---|
| STBY | 25 | OUT | Motor standby enable |

---

### Buzzer

| Pin Name | GPIO Pin | Direction | Description |
|---|---:|:---:|---|
| BUZZER | 22 | OUT | Digital output to buzzer |

---

## 시스템 개요 요약
본 시스템은 로봇에 탑재된 **Mobile Controller**, 이를 지원하는 **Main Server**, **AI Server**, 그리고 사용자 인터페이스로 구성된다.  
다양한 센서 및 엑추에이터를 통해 데이터를 수집·제어하며, **UDP, TCP, ROS2(DDS)** 기반 통신을 통해 각 구성 요소가 유기적으로 상호작용한다.
