---
title: Interface Specification
---


# Interface Specifications

## 1. TCP Binary 통신

### 인터페이스 목록

| 인터페이스 ID | 이름               | 방향                   | 설명                         |
|----------------|--------------------|------------------------|------------------------------|
| AU             | 로그인 인증 요청     | Staff GUI → Main Service | 사용자 로그인 요청              |
| IS             | 상품 정보 조회 요청   | Staff GUI → Main Service | QR코드 기반 상품 조회           |
| IR             | 상품 요청           | Staff GUI → Main Service | 장바구니 기반 재고 요청         |
| CD             | 작업 취소 요청       | Staff GUI → Main Service | 진행 중 작업 중단              |
| TR             | 작업 상태 확인 요청   | Staff GUI → Main Service | 특정 작업의 완료 여부 확인      |
| TR_NOTIFY      | 작업 상태 변경 알림   | Main Service → Staff GUI | 작업 상태가 변경될 때 푸시되는 알림 메시지 |
| IN             | AI 인식 결과 수신    | AI Server → Main Service | 객체 인식 결과 보고            |

---

### [AU] 로그인 인증 요청

**방향:** Staff GUI → Main Service
**설명:** 사용자 로그인을 위해 인증 요청을 전송

**Request**

| Offset | Length | Name       | Type     | Description       |
|--------|--------|------------|----------|-------------------|
| 0      | 2      | cmd        | char[2]  | "AU"              |
| 2      | 32     | user_name  | char[32] | 사용자 이름       |
| 34     | 32     | password   | char[32] | 비밀번호          |

**Response**

| Offset | Length | Name       | Type     | Description                 |
|--------|--------|------------|----------|-----------------------------|
| 0      | 2      | cmd        | char[2]  | "AU"                        |
| 2      | 1      | status     | uint8    | 0x00 성공 · 0x01 실패       |
| 3      | 4      | user_id    | uint32   | 사용자 ID (Big Endian)      |
| 7      | 1      | user_role  | uint8    | 사용자 역할(STAFF·MANAGER)  |

---

### [IS] 상품 정보 조회 요청

**방향:** Staff GUI → Main Service
**설명:** QR코드를 기반으로 상품 정보를 조회

**Request**

| Offset | Length | Name         | Type     | Description        |
|--------|--------|--------------|----------|--------------------|
| 0      | 2      | cmd          | char[2]  | "IS"               |
| 2      | 16     | qr_code_value| char[16] | QR코드 데이터       |

**Response**

| Offset | Length | Name       | Type     | Description                |
|--------|--------|------------|----------|----------------------------|
| 0      | 2      | cmd        | char[2]  | "IS"                       |
| 2      | 1      | status     | uint8    | 0x00 성공 · 0x01 실패      |
| 3      | 32     | name       | char[32] | 상품 이름 (UTF-8)          |
| 35     | 4      | size       | uint32   | 사이즈 (Little Endian)     |
| 39     | 16     | color      | char[16] | 색상 이름 (UTF-8)          |
| 55     | 4      | quantity   | uint32   | 재고 수량 (Little Endian)  |
| 59     | 16     | location   | char[16] | 위치 코드 (UTF-8)          |

**총 크기:** 75 bytes

---

### [IR] 장바구니 기반 상품 요청

**방향:** Staff GUI → Main Service
**설명:** 장바구니의 상품들로 Delivery 및 Task들을 생성하고 목적지를 설정

**Request**

| Offset | Length     | Name         | Type      | Description                   |
|--------|------------|--------------|-----------|-------------------------------|
| 0      | 2          | cmd          | char[2]   | "IR"                          |
| 2      | 4          | user_id      | uint32    | 사용자 ID                     |
| 6      | 2          | item_count   | uint16    | 장바구니 항목 수 N            |
| 8      | 2          | destination  | char[2]   | 배송 목적지 ("G1"~"G8")       |
| 10     | N × 12     | items[N]     | struct[]  | 장바구니 항목 목록            |

**Item 구조 (items[])**

| Offset | Length | Name           | Type    | Description            |
|--------|--------|----------------|---------|------------------------|
| 0      | 4      | shoes_model_id | uint32  | 신발 모델 ID           |
| 4      | 4      | location_id    | uint32  | 출발 위치 (랙 ID)      |
| 8      | 4      | quantity       | uint32  | 요청 수량 (=Task 수)   |

**Response**

| Offset | Length | Name         | Type     | Description                   |
|--------|--------|--------------|----------|-------------------------------|
| 0      | 2      | cmd          | char[2]  | "IR"                          |
| 2      | 1      | status       | uint8    | 0x00 성공 · 0x01 실패         |
| 3      | 4      | delivery_id  | uint32   | 생성된 Delivery ID            |
| 7      | 4      | first_task_id| uint32   | 첫 번째 Task ID               |

**총 크기:** 11 bytes

---

### [CD] 배송 취소 요청

**방향:** Staff GUI → Main Service
**설명:** 첫 Task가 TO_DO 또는 IN_PROGRESS 상태일 경우만 취소 가능

**Request**

| Offset | Length | Name         | Type     | Description             |
|--------|--------|--------------|----------|-------------------------|
| 0      | 2      | cmd          | char[2]  | "CD"                    |
| 2      | 4      | user_id      | uint32   | 사용자 ID               |
| 6      | 4      | delivery_id  | uint32   | 취소할 Delivery ID       |

**Response**

| Offset | Length | Name         | Type     | Description                 |
|--------|--------|--------------|----------|-----------------------------|
| 0      | 2      | cmd          | char[2]  | "CD"                        |
| 2      | 1      | status       | uint8    | 0x00 성공 · 0x01 실패       |
| 3      | 4      | delivery_id  | uint32   | 요청된 Delivery ID (Big Endian) |

**총 크기:** 7 bytes

---

### [TR] 작업 상태 확인 요청

**방향:** Staff GUI → Main Service
**설명:** 로그인 후 남은 작업 상태 확인 (진행 중·완료 Task)

**Request**

| Offset | Length | Name     | Type     | Description      |
|--------|--------|----------|----------|------------------|
| 0      | 2      | cmd      | char[2]  | "TR"             |
| 2      | 4      | user_id  | uint32   | 사용자 ID        |

**Response**

| Offset | Length              | Name              | Type        | Description                   |
|--------|---------------------|-------------------|-------------|-------------------------------|
| 0      | 2                   | cmd               | char[2]     | "TR"                          |
| 2      | 1                   | status            | uint8       | 0x00 성공 · 0x01 실패         |
| 3      | 2                   | done_count        | uint16      | 완료된 Task 수 (Big Endian)   |
| 5      | 1                   | in_progress_count | uint8       | 진행 중 Task 수               |
| 6      | N × 36              | in_progress_items | struct[]    | 진행 중인 Task 목록           |

**In Progress Item 구조 (in_progress_items[])**

| Offset | Length | Name        | Type     | Description                  |
|--------|--------|-------------|----------|------------------------------|
| 0      | 4      | delivery_id | uint32   | Delivery ID (Big Endian)     |
| 4      | 32     | model_name  | char[32] | 신발 모델명 (UTF-8)          |

**총 크기:** 최소 6 bytes + (in_progress_count × 36) bytes

**예시 응답:**
```json
{
  "cmd": "TR",
  "status": 0,
  "done_count": 2,
  "in_progress_count": 1,
  "in_progress_items": [
    {
      "delivery_id": 1001,
      "model_name": "Nike Air Zoom"
    }
  ]
}
```

---

### [TR_NOTIFY] 작업 상태 변경 알림

**방향:** Main Service → Staff GUI
**설명:** 작업 상태가 변경될 때 Staff GUI에 비동기적으로 푸시되는 알림 메시지
**형태:** PUSH (비동기)

**Push Message**

| Offset | Length | Name               | Type      | Description                      |
|--------|--------|--------------------|-----------|----------------------------------|
| 0      | 2      | cmd                | char[2]   | "TR"                             |
| 2      | 4      | delivery_id        | uint32    | 작업이 속한 Delivery ID          |
| 6      | 4      | task_id            | uint32    | 변경된 Task ID                   |
| 10     | 1      | task_status        | uint8     | Task 상태 (enum)                 |
| 11     | 32     | shoes_model_name   | char[32]  | 신발 모델명 (UTF-8)              |
| 43     | 8      | timestamp          | uint64    | 상태 변경 시각 (UNIX Epoch ms)   |

**총 크기:** 51 bytes

**상태 코드 (`task_status`)**

| 값    | 의미           |
|-------|----------------|
| 0x00  | TO_DO          |
| 0x01  | IN_PROGRESS    |
| 0x02  | DONE           |
| 0x03  | CANCELLED      |
| 0xFF  | UNKNOWN        |

**예시:**

| 필드               | 값                   |
|--------------------|----------------------|
| cmd                | "TR"                 |
| delivery_id        | 1001                 |
| task_id            | 2005                 |
| task_status        | 0x01 (IN_PROGRESS)   |
| shoes_model_name   | "Nike Air Zoom"      |
| timestamp          | 1716003600000        |

---

### [IN] AI 인식 결과 수신

**방향:** AI Server → Main Service
**설명:** 객체 인식 결과 보고. Main Service는 수신 즉시 처리

**Push Message**

| Offset | Length | Name        | Type     | Description                |
|--------|--------|-------------|----------|----------------------------|
| 0      | 2      | cmd         | char[2]  | "IN"                       |
| 2      | 1      | roscar_id   | uint8    | 로봇 ID                    |
| 3      | 1      | result_code | uint8    | 0x00=Person, 0x01=Roscar   |

**Response**

| Offset | Length | Name    | Type    | Description              |
|--------|--------|---------|---------|--------------------------|
| 0      | 2      | cmd     | char[2] | "IN"                     |
| 2      | 1      | status  | uint8   | 0x00 성공 · 0x01 실패    |

**result_code 매핑**

| 코드   | 객체 유형       |
|--------|-----------------|
| 0x00   | Person          |
| 0x01   | Roscar          |
| 0xFF   | 기타·알 수 없음 |

---

## 2. UDP 통신

### 인터페이스 목록

| 인터페이스 ID | 이름             | 방향                       | 설명                         |
|----------------|------------------|----------------------------|------------------------------|
| VF             | 영상 프레임 전송   | Video Sender → AI Server   | Pi Camera 영상 전송          |

---

### [VF] 영상 프레임 전송

**방향:** Video Sender → AI Server
**설명:** 로봇이 수집한 영상 데이터를 실시간 전송

**Packet**

| Offset | Length      | Name        | Type      | Description          |
|--------|-------------|-------------|-----------|----------------------|
| 0      | 1           | roscar_id   | uint8     | 송신 로봇 ID         |
| 1      | 4           | frame_size  | uint32    | 이미지 바이트 길이   |
| 5      | frame_size  | image_bytes | bytes[]   | 이미지 바이너리 데이터 |

---

## 3. ROS2 Topic (.msg)

### Topic 목록

| Topic 이름                    | 메시지 타입             | 설명                              |
|-------------------------------|-------------------------|-----------------------------------|
| `/battery_status`             | BatteryStatus           | 로봇 배터리 상태 (SSID, 충전 여부) |
| `/roscar_status`              | RoscarStatus            | 로봇 전체 상태 (Manager GUI 용)   |
| `/roscar_pose_update`         | RoscarPoseUpdate        | 로봇 위치 업데이트                |
| `/roscar_status_log`          | RoscarStatusLog         | 로봇 상태 로그                    |
| `/task_progress`              | TaskProgress            | Task 진행 상태                    |
| `/task_complete`              | TaskComplete            | Task 완료 알림                    |
| `/log_event`                  | LogEvent                | 시스템 이벤트 로그                |
| `/roscar_register`            | RoscarRegister          | 로봇 등록·상태 공유               |
| `/start_task`                 | StartTask               | Task 시작 명령                    |
| `/lidar_scan`                 | LidarScan               | Lidar 스캔 데이터                 |
| `/imu_status`                 | ImuStatus               | IMU 센서 데이터                   |
| `/ultra_status`               | UltraStatus             | 초음파 센서 거리 데이터           |
| `/obstacle_avoidance_cmd`     | ObstacleAvoidanceCmd    | 장애물 회피 명령                  |
| `/obstacle_response`          | ObstacleResponse        | 장애물 회피 응답                  |
| `/precision_stop_result`      | PrecisionStopResult     | 정밀 정지 결과                    |

---

### BatteryStatus.msg

```
string roscar_namespace                # SSID (e.g., pinky_07db)
float32 battery_percent                # 배터리 잔량 (%)
bool is_charging                       # 충전 중 여부
builtin_interfaces/Time stamp          # 타임스탬프
```

**설명:** 로봇의 배터리 상태를 실시간으로 전송. SSID를 통해 로봇 식별.

---

### RoscarStatus.msg

```
string roscar_namespace                # 로봇 SSID
uint8 battery_percentage               # 배터리 잔량 (%)
string operational_status              # 작동 상태 (예: READY, CHARGING, FAULT)
```

**설명:** Manager GUI에서 사용하는 로봇 전체 상태 정보.

---

### RoscarPoseUpdate.msg

```
uint8 roscar_id                        # 로봇 ID
float32 pos_x                          # X 좌표 (m)
float32 pos_y                          # Y 좌표 (m)
float32 heading_theta                  # 방향각 (rad)
builtin_interfaces/Time stamp          # 타임스탬프
```

**설명:** 로봇의 현재 위치와 방향을 업데이트.

---

### RoscarStatusLog.msg

```
uint8 roscar_id                        # 로봇 ID
uint8 log_type                         # 로그 타입
string message                         # 로그 메시지
builtin_interfaces/Time stamp          # 타임스탬프
```

**설명:** 로봇의 상태 로그를 기록.

---

### TaskProgress.msg

```
uint8 roscar_id                        # 로봇 ID
uint32 task_id                         # Task ID
uint8 progress_percent                 # 진행률 (%)
string phase_description               # 진행 단계 설명
builtin_interfaces/Time stamp          # 타임스탬프
```

**설명:** Task의 현재 진행 상태를 전송.

---

### TaskComplete.msg

```
uint8 roscar_id                        # 로봇 ID
uint32 task_id                         # Task ID
bool is_success                        # 성공 여부
string result_code                     # 결과 코드
builtin_interfaces/Time stamp          # 타임스탬프
```

**설명:** Task 완료 시 결과를 전송.

---

### LogEvent.msg

```
uint32 event_id                        # 이벤트 ID
uint8 event_type                       # 이벤트 타입 (0x00=EMERGENCY_STOP, 0x01=DELIVERY_START 등)
string event_data                      # JSON 직렬화된 상세 내용
builtin_interfaces/Time stamp          # 타임스탬프
```

**설명:** 시스템 이벤트를 기록하고 전파.

---

### RoscarRegister.msg

```
string roscar_namespace                # 네임스페이스 겸 SSID
int32 battery_percentage               # 실시간 배터리 상태
string operational_status              # 작동 상태 (예: READY, CHARGING, FAULT)
string roscar_ip_v4                    # IP 주소
uint8 from_domain_id                   # 로봇 도메인 ID
uint8 to_domain_id                     # 서버 도메인 ID
```

**설명:** 로봇이 서버에 등록하고 실시간 상태를 공유.

---

### StartTask.msg

```
uint32 task_id                         # Task ID
uint32 shoes_model_id                  # 신발 모델 ID
uint32 location_id                     # 위치 ID
```

**설명:** Task 시작 명령을 로봇에 전송.

---

### LidarScan.msg

```
string roscar_name                     # 로봇 이름
std_msgs/Header header                 # 헤더 (타임스탬프, frame_id)
float32 angle_min                      # 스캔 시작 각도 (rad)
float32 angle_max                      # 스캔 종료 각도 (rad)
float32 angle_increment                # 각도 증분 (rad)
float32 time_increment                 # 측정 간 시간 (sec)
float32 scan_time                      # 스캔 주기 (sec)
float32 range_min                      # 최소 거리 (m)
float32 range_max                      # 최대 거리 (m)
float32[] ranges                       # 거리 데이터 배열 (m)
float32[] intensities                  # 강도 데이터 배열
```

**설명:** Lidar 센서의 스캔 데이터.

---

### ImuStatus.msg

```
string roscar_name                     # 로봇 이름
# 가속도 (Acceleration) - m/s²
float32 accel_x
float32 accel_y
float32 accel_z
# 자이로 (Gyroscope) - rad/s
float32 gyro_x
float32 gyro_y
float32 gyro_z
# 자기장 (Magnetometer) - µT
float32 mag_x
float32 mag_y
float32 mag_z
```

**설명:** IMU 센서의 가속도, 자이로, 자기장 데이터.

---

### UltraStatus.msg

```
string roscar_name                     # 로봇 이름
float32 distance                       # 측정 거리 (m)
```

**설명:** 초음파 센서의 거리 측정 데이터.

---

### ObstacleAvoidanceCmd.msg

```
uint8 roscar_id                        # 로봇 ID
float32 direction                      # 회피 방향 (각도, rad)
float32 speed                          # 회피 속도 (m/s)
builtin_interfaces/Time stamp          # 타임스탬프
```

**설명:** 장애물 회피 명령.

---

### ObstacleResponse.msg

```
uint8 roscar_id                        # 로봇 ID
uint8 command                          # 명령 (0x00=정지, 0x01=회피)
builtin_interfaces/Time stamp          # 타임스탬프
```

**설명:** 장애물 회피 응답.

---

### PrecisionStopResult.msg

```
uint8 roscar_id                        # 로봇 ID
bool success                           # 성공 여부
float32 deviation                      # 오차 (cm)
builtin_interfaces/Time stamp          # 타임스탬프
```

**설명:** 정밀 정지 결과.

---

## 4. ROS2 Service (.srv)

### Service 목록

| Service 이름           | 서비스 타입             | 설명                              |
|------------------------|-------------------------|-----------------------------------|
| `/login`               | Login                   | 사용자 로그인                     |
| `/log_query`           | LogQuery                | 로그 데이터 조회                  |
| `/query_roscar_status` | QueryRoscarStatus       | 모든 로봇 상태 조회               |

---

### Login.srv

**Request:**
```
string user_name                       # 사용자 이름
string password                        # 비밀번호
```

**Response:**
```
bool success                           # 로그인 성공 여부
string role                            # 사용자 역할 (STAFF/MANAGER)
uint32 user_id                         # 사용자 ID
```

**설명:** ROS2 서비스를 통한 사용자 인증.

---

### LogQuery.srv

**Request:**
```
string query_type                      # 조회 타입 (예: "recent", "error")
```

**Response:**
```
string json_result                     # JSON 형식의 로그 데이터
```

**설명:** 로그 데이터를 조회하고 JSON 형식으로 반환.

---

### QueryRoscarStatus.srv

**Request:**
```
# 요청에는 필드 없음
```

**Response:**
```
RoscarStatus[] ros_cars                # 모든 로봇 상태 배열
```

**설명:** 현재 등록된 모든 로봇의 상태를 조회.

---

## 5. ROS2 Action (.action)

### Action 목록

| Action 이름        | 액션 타입       | 설명                              |
|--------------------|-----------------|-----------------------------------|
| `/start_delivery`  | StartDelivery   | 배송 시작                         |
| `/move_to_goal`    | MoveToGoal      | 목표 위치로 이동                  |

---

### StartDelivery.action

**Goal:**
```
uint32 delivery_id                     # Delivery ID
StartTask[] tasks                      # Task 목록 (task_id, shoes_model_id, location_id)
```

**Result:**
```
bool success                           # 성공 여부
```

**Feedback:**
```
string phase                           # 진행 단계 ("PICKUP", "DELIVER", ...)
```

**설명:** 배송을 시작하고 여러 Task를 순차적으로 수행. Feedback으로 현재 단계를 전송.

---

### MoveToGoal.action

**Goal:**
```
uint8 roscar_id                        # 로봇 ID
string goal_position                   # 목표 위치 이름
float32 goal_x                         # 목표 X 좌표 (m)
float32 goal_y                         # 목표 Y 좌표 (m)
float32 theta                          # 목표 방향각 (rad)
```

**Result:**
```
bool success                           # 성공 여부
string message                         # 결과 메시지
```

**Feedback:**
```
uint8 progress                         # 진행률 (%)
float32 current_x                      # 현재 X 좌표 (m)
float32 current_y                      # 현재 Y 좌표 (m)
```

**설명:** 로봇을 특정 목표 위치로 이동. Feedback으로 현재 위치와 진행률을 전송.

---

## 참고 사항

### Endianness
- **TCP 통신:**
  - `user_id`, `delivery_id` 등 4바이트 정수는 **Big Endian** 사용
  - `size`, `quantity` 등 일부 필드는 **Little Endian** 사용 (코드 분석 결과)
- **ROS2 통신:** 기본적으로 시스템 Endian 따름

### 문자열 인코딩
- 모든 문자열은 **UTF-8** 인코딩
- Null-terminated 형식 (char 배열의 끝은 `\x00`)

### 타임스탬프
- ROS2 메시지: `builtin_interfaces/Time` 사용
- TCP 메시지: `uint64` UNIX Epoch (밀리초)
