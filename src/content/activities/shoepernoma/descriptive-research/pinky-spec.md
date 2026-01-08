## Pinky Violet – Physical Dimensions


### Pinky Violet Support Dimensions

- **Width:** 126 mm  
- **Depth:** 109 mm  
- **Height:** 145 mm  
- **Weight:** 675 g


---

## Pinky Violet – Specifications


### Pinky Violet Specifications

| Component | Specification / Details |
|---------|--------------------------|
| Main Processor | Raspberry Pi 5, 8GB RAM |
| Camera | Pi Camera, Resolution: 5 MP |
| LCD Display | 2.4-inch LCD, Driver: ST7789 |
| LiDAR | SLAMTEC RPLiDAR C1 |
| IMU Sensor | ICM-20948 (9-axis), integrated on Pinky Board |
| Ultrasonic Sensor | HC-SR04 |
| IR Sensor | TCRT5000 |
| Motor Driver | TB6612FNG × 2 |
| Battery | Lithium-Ion 18650 × 2 |
| Buzzer | Integrated on Pinky Board |


---

## Pin Map – Connected Devices


### Pin Map – Connected Devices

| Device | Pin Name | GPIO Pin | Direction | Description |
|------|---------|----------|-----------|-------------|
| LiDAR | RX | 14 | OUT | RPi TX → LiDAR RX |
|  | TX | 15 | IN | RPi RX ← LiDAR TX |
| LCD | MOSI | 10 | OUT | SPI Master Out |
|  | MISO | 9 | IN | SPI Master In |
|  | SCL (CLK) | 11 | OUT | SPI Clock |
|  | CS | 8 | OUT | SPI Chip Select |
|  | DC | 7 | OUT | Data / Command Select |
|  | RST | 1 | OUT | LCD Reset |
|  | BL (PWM) | 12 | OUT | Backlight PWM Control |
| IMU Sensor | SDA | 2 | IO | I2C Data |
|  | SCL | 3 | IO | I2C Clock |
| Ultrasonic Sensor | TRIG | 23 | OUT | Trigger Signal |
|  | ECHO | 24 | IN | Echo Response |
| IR Sensor | IR1 | 16 | IN | Digital Input |
|  | IR2 | 20 | IN | Digital Input |
|  | IR3 | 21 | IN | Digital Input |
| DC Motor Driver (Left) | AIN1 | 17 | OUT | Direction Control |
|  | AIN2 | 27 | OUT | Direction Control |
|  | PWMA | 18 | OUT | PWM Speed Control |
| DC Motor Driver (Right) | BIN1 | 5 | OUT | Direction Control |
|  | BIN2 | 6 | OUT | Direction Control |
|  | PWMB | 13 | OUT | PWM Speed Control |
| Motor Driver | STBY | 25 | OUT | Standby Enable |
| Buzzer | BUZZER | 22 | OUT | Buzzer Control |


---
---
---
---
---

# Pinky Violet – 한글 버전 (업데이트 정리본)

## 외형 및 치수


### Pinky Violet 지원 사양

- 가로(Width): 126 mm  
- 세로(Depth): 109 mm  
- 높이(Height): 145 mm  
- 무게(Weight): 675 g


---

## Pinky Violet 스펙


### Pinky Violet 스펙

| 구성 요소 | 사양 |
|----------|------|
| 메인 프로세서 | Raspberry Pi 5 (8GB RAM) |
| 카메라 | Pi 카메라, 해상도 5MP |
| LCD 디스플레이 | 2.4인치 LCD, 드라이버 ST7789 |
| LiDAR | SLAMTEC RPLiDAR C1 |
| IMU 센서 | ICM-20948 (9축), 핑키 보드 내장 |
| 초음파 센서 | HC-SR04 |
| IR 센서 | TCRT5000 |
| DC 모터 드라이버 | TB6612FNG × 2 |
| 배터리 | 리튬 이온 18650 × 2 |
| 부저 | 핑키 보드 내장 |


---

## Pin Map (GPIO 연결)


### Pin Map

| 연결 장치 | 핀 이름 | GPIO 번호 | 설명 |
|----------|--------|-----------|------|
| LiDAR | RX / TX | 14 / 15 | 라이다 송·수신 |
| LCD | MOSI / MISO / SCL / CS / DC / RST | 10 / 9 / 11 / 8 / 7 / 1 | SPI 통신 |
| LCD Backlight | BL | 12 | LCD 밝기(PWM 제어) |
| IMU 센서 | SDA / SCL | 2 / 3 | I2C 통신 |
| 초음파 센서 | TRIG / ECHO | 23 / 24 | 거리 측정 신호 |
| IR 센서 | IR1 / IR2 / IR3 | 16 / 20 / 21 | IR 감지 입력 |
| DC 모터 (좌) | AIN1 / AIN2 / PWMA | 17 / 27 / 18 | 좌측 모터 방향·속도 제어 |
| DC 모터 (우) | BIN1 / BIN2 / PWMB | 5 / 6 / 13 | 우측 모터 방향·속도 제어 |
| 모터 드라이버 | STBY | 25 | 모터 대기 모드 |
| 부저 | BUZZER | 22 | 부저 제어 |

