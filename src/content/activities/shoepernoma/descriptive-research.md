---
title: Descriptive Research
---


## Use Case 목록

| Use Case ID | 시나리오 명 | 설명 | 사용 기술 |
|-------------|-------------|------|-----------|
| UC_01 | 자율 주행 기반의 창고 내 물류 이동 | 경로를 따라 이동하며 장애물과 사람을 회피, 비상 상황 대응 포함 | Raspberry Pi 5를 중심 제어기로 사용하여 IMU로 자세 보정, LiDAR·초음파로 장애물 감지, IR 센서·카메라(YOLO)로 사람·로봇 인식 및 회피 경로 계산. DC 모터로 이동하며 부저와 LCD로 상태·경고 표시 |
| UC_02 | 물품 배송 요청에 따른 A → B 운송 | 지정된 출발지에서 도착지까지 자동 배송 수행 | LiDAR와 카메라로 실시간 경로 인식 및 위치 추정, IMU와 연동한 방향 제어, DC 모터 기반 자율 이동. Raspberry Pi가 경로 탐색 알고리즘 및 전체 로직 제어 |
| UC_03 | 복수 로봇 간 협업 기반 동시 물류 처리 | 작업량에 따라 역할 분담 및 충돌 방지, 협업 운송 | Raspberry Pi 무선 통신으로 로봇 간 상태·작업 정보 공유, 카메라(YOLO)로 주변 물체 및 타 로봇 인식, 협업 알고리즘 기반 작업 분담 |
| UC_04 | QR Mapping을 통한 위치 식별 및 보정 | QR 코드 기반 현재 위치 파악 및 정밀 정차 수행 | 카메라(OpenCV)로 QR 코드 인식, Raspberry Pi에서 위치 보정 알고리즘 적용 후 정밀 정차 |
| UC_05 | 로봇 물류 처리 중 재고 파악 및 로깅 | 로봇이 물건을 처리하면서 재고 상태 감지 및 기록 | 카메라(YOLO)로 물체 분류, Load Cell로 무게 변화 측정 후 재고 상태 판단 및 Raspberry Pi에서 로깅 |
| UC_06 | 사람이 인한 물건 제거 후 재고 감지 | 사람이 물건을 집었을 때 재고 변화 자동 감지 및 반영 | IR 센서로 근접 감지, Load Cell로 무게 변화 감지, 카메라(YOLO)로 시각적 보조 후 Raspberry Pi에서 재고 변동 처리 |
| UC_07 | 로봇 상태 모니터링 및 사용자 표시 | 배터리 상태 및 동작 상태를 UI·LED로 사용자에게 표시 | 배터리 잔량 실시간 측정, LCD·LED로 상태 표시, Raspberry Pi가 부저로 경고음 출력 |
| UC_08 | 로봇 배터리 부족 시 자동 충전 도킹 | 배터리 임계 도달 시 충전소로 자율 이동하여 충전 | 배터리 측정 회로로 잔량 모니터링, QR 코드 인식으로 충전소 위치 파악 후 도킹 알고리즘 수행 |
| UC_09 | 운영 중 장애 발생 시 자동 정지 및 보고 | 긴급 정지 및 자가 진단, 오류 상황 서버·사용자 전송 | LiDAR·초음파·IR 센서로 장애 감지, DC 모터 차단, 부저·디스플레이 경고 및 무선 통신으로 서버 보고 |
| UC_10 | 사용자 호출 후 인터페이스 제어 | 사용자가 로봇을 호출하고 명령을 입력 | 무선 통신으로 사용자 요청 수신, 버튼 입력 또는 음성 인식 기반 명령 처리 |
| UC_11 | 교대 근무 로봇 스케줄 자동화 | 교대 시간 또는 업무량에 따라 로봇 자동 전환 | Raspberry Pi 시간 관리 로직과 스케줄링 알고리즘을 이용한 자동 운용 전환 |
| UC_12 | 야간 순찰 및 실내 보안 기능 수행 | 순찰 중 이상 감지 시 관리자 알림 전송 | LiDAR·카메라·초음파 센서로 환경 감시, Raspberry Pi와 알림 모듈 연동 |

---

## 기능 리스트 (System Requirement)

| SR_ID | 기능 명 | 사용 하드웨어 | 소프트웨어 기술 | 비고 |
|-------|---------|---------------|-----------------|------|
| SR_01 | 지정된 경로 또는 목적지로 자율 이동 | LiDAR (SLAMTEC RPLiDAR C1), IMU (ICM-20948), 모터 드라이버 | SLAM, Path Planning (Dijkstra, A*), ROS2 Navigation Stack | 지도 기반 경로 탐색 및 제어 |
| SR_02 | 실시간 장애물 감지 및 회피 경로 탐색 | 초음파 센서(HC-SR04), IR 센서(TCRT5000), LiDAR | Obstacle Avoidance, Costmap, Sensor Fusion | Depth 센싱 기반 회피 알고리즘 |
| SR_03 | 사람 인식 및 안전거리 유지 | Pi 카메라, LiDAR | OpenCV, CNN 기반 Object Detection, YOLO, 거리 계산 | 사람 위치 추정 및 충돌 방지 |
| SR_04 | 긴급 정지 | IR 센서, Buzzer, Motor Driver | 인터럽트 처리, 이벤트 감지 루틴 | 조건 만족 시 모터 중단 및 경고 |
| SR_05 | 재고 파악 기능 | Pi 카메라 | QR 코드 인식(OpenCV), OCR(Tesseract) | 물품 인식 및 위치 정보 파악 |
| SR_06 | 물건 배송 | 모터 시스템, IMU, LiDAR | Waypoint 기반 자율 주행, FSM(상태 머신) | 목적지 기반 정밀 정차 포함 |
| SR_07 | 복수 로봇 간 충돌 방지 협업 기능 | Wi-Fi, IMU, LiDAR | ROS2 Multirobot 통신, Topic 공유, TF 전송 | ID 기반 충돌 방지 |
| SR_08 | 사용자 요청에 따른 협업 운반 | Wi-Fi, 모터, 카메라 | Task Scheduling, Command Interface, GUI 연동 | 명령 기반 유연 대응 |
| SR_09 | QR Mapping 기반 위치 확인 | 카메라, QR Code | OpenCV, QR Mapping 데이터베이스 | 정밀 위치 보정 |
| SR_10 | 장애 자가 진단 및 오류 자동 보고 | 모든 센서 | ROS2 Diagnostics, 로그 분석 | 상태 리포트 전송 |
| SR_11 | 배터리 잔량 감지 및 알림 | 배터리 전압 센서 | Voltage Monitoring Script, ROS2 상태 전송 | 임계치 이하 경고 |
| SR_12 | 자동 충전 도킹 기능 | IR 센서, 초음파 센서 | Line Tracking, Docking 알고리즘 | 충전소 정렬 후 도킹 |
| SR_13 | LED·디스플레이 상태 표시 | 2.4” LCD, LED 모듈 | ST7789 LCD 드라이버, SPI, UI 구현 | 상태 시각화 |
| SR_14 | 작업 기록 저장 및 전송 | SD 저장장치, Wi-Fi | ROS2 Logging, CSV, MQTT·HTTP | 로컬·클라우드 선택 |
| SR_15 | 협업 스케줄링 | 내부 시계, Wi-Fi | ROS2 Task Scheduler, Timer | 로봇 간 동기화 |
| SR_16 | 지정 위치 정밀 정차 | LiDAR, IMU, 휠 인코더 | Pose Estimation, EKF, PID 제어 | ±5cm 이내 정차 |

