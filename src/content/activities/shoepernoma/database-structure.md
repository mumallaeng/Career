---
title: Database Structure
---

## 1. RosCars

### RosCars

| 필드명 | 타입 | 설명 |
|------|------|------|
| roscar_id | integer (PK) | 로스카 고유 식별자 |
| roscar_namespace | varchar(255, unique) | ROS 네임스페이스 |
| roscar_domain_id | integer | ROS_DOMAIN_ID 값 |
| battery_percentage | integer | 배터리 잔량 (%) |
| operational_status | operational_status_enum | 운영 상태 |
| roscar_ip_v4 | varchar(15) | 로스카 IPv4 주소 |
| cart_id | varchar(255, unique) | 연결된 카트 ID |
| cart_ip_v4 | varchar(15) | 카트 IPv4 주소 |

#### enum: operational_status_enum
- STANDBY  
- DRIVING  
- CHARGING  
- ERROR  
- EMERGENCY_STOP

---

## 2. RosCarDrivingPhase


### RosCarDrivingPhase

| 필드명 | 타입 | 설명 |
|------|------|------|
| driving_phase_id | integer (PK) | 주행 단계 고유 ID |
| roscar_id | integer (FK) | RosCars 참조 |
| status_type | driving_phase_enum | 주행 단계 |
| is_enabled | boolean | 활성 여부 |

#### enum: driving_phase_enum
- PICKUP  
- DELIVERY  
- RETURN  
- PRECISION_STOP  
- DISCONNECT


---

## 3. User


### User

| 필드명 | 타입 | 설명 |
|------|------|------|
| user_id | integer (PK) | 사용자 ID |
| user_name | varchar(255) | 사용자 이름 |
| user_role | user_role_enum | 역할 |
| password | varchar(60) | 비밀번호 (해시) |

#### enum: user_role_enum
- Staff  
- Manager


---

## 4. Delivery


### Delivery

| 필드명 | 타입 | 설명 |
|------|------|------|
| delivery_id | integer (PK) | 배송 ID |
| roscar_id | integer (FK) | RosCars 참조 |
| user_id | integer (FK) | User 참조 |
| driving_phase_id | integer (FK) | RosCarDrivingPhase 참조 |
| delivery_status | delivery_status_enum | 배송 상태 |
| destination | destination_enum | 목적지 |
| pickup_time | timestamp | 픽업 시간 |
| dropoff_time | timestamp | 하차 시간 |

#### enum: delivery_status_enum
- TO_DO  
- IN_PROGRESS  
- DONE  

#### enum: destination_enum
- G1, G2, G3, G4, G5, G6, G7, G8


---

## 5. ShoesModel


### ShoesModel

| 필드명 | 타입 | 설명 |
|------|------|------|
| shoes_model_id | integer (PK) | 신발 모델 ID |
| name | varchar(255) | 신발명 |
| size | integer | 신발 사이즈 (mm) |
| color | color_enum | 색상 |

#### enum: color_enum
black, white, snow, salmon, hotpink, raspberry, orange, chocolate,  
skyblue, cyan, blue, navy, violet, indigo, Hyperlink Blue-Flame Flicker-Gum


---

## 6. RackLocation


### RackLocation

| 필드명 | 타입 | 설명 |
|------|------|------|
| location_id | integer (PK) | 랙 위치 ID |
| name | varchar(255) | 위치 이름 |
| floor_level | integer | 층 번호 |
| zone_number | integer | 구역 번호 |
| map_x | float | 지도 X 좌표 |
| map_y | float | 지도 Y 좌표 |
| aruco_id | integer | 아루코 ID |
| timestamp | timestamp | 기록 시간 (기본값 now) |


---

## 7. Task


### Task

| 필드명 | 타입 | 설명 |
|------|------|------|
| task_id | integer (PK) | 작업 ID |
| delivery_id | integer (FK) | Delivery 참조 |
| shoes_model_id | integer (FK) | ShoesModel 참조 |
| status | task_status_enum | 작업 상태 |
| start_time | timestamp | 작업 시작 시간 |
| end_time | timestamp | 작업 종료 시간 |
| location_id | integer (FK) | RackLocation 참조 |

#### enum: task_status_enum
- TO_DO  
- IN_PROGRESS  
- DONE


---

## 8. ShoesInventory


### ShoesInventory

| 필드명 | 타입 | 설명 |
|------|------|------|
| inventory_id | integer (PK) | 재고 ID |
| location_id | integer (FK) | RackLocation 참조 |
| shoes_model_id | integer (FK) | ShoesModel 참조 |
| quantity | integer | 수량 |
| timestamp | timestamp | 등록 시간 (기본값 now) |


---

## 9. QRCode


### QRCode

| 필드명 | 타입 | 설명 |
|------|------|------|
| qrcode_id | integer (PK) | QR 코드 ID |
| inventory_id | integer (FK) | ShoesInventory 참조 |
| qr_code_value | varchar(255) | QR 문자열 |


---
---
---

# 📊 RosCarsLog 데이터베이스 스키마

---

## 1. SensorFusionRawLog


### SensorFusionRawLog

| 필드명 | 타입 | 설명 |
|------|------|------|
| sensor_log_id | integer (PK) | 센서 로그 ID |
| roscar_id | integer | 로스카 ID |
| lidar_raw | json | LiDAR 원본 데이터 |
| imu_data | json | IMU 데이터 |
| ultrasonic_data | json | 초음파 데이터 |
| camera_frame_id | varchar(255) | 카메라 프레임 ID |
| timestamp | timestamp | 기록 시간 (기본값 now) |


---

## 2. RoscarTrajectoryLog


### RoscarTrajectoryLog

| 필드명 | 타입 | 설명 |
|------|------|------|
| trajectory_id | integer (PK) | 궤적 로그 ID |
| roscar_id | integer | 로스카 ID |
| task_id | integer | 작업 ID |
| position_x | float | X 좌표 |
| position_y | float | Y 좌표 |
| velocity | float | 속도 |
| heading_angle | float | 헤딩 각도 |
| timestamp | timestamp | 기록 시간 |


---

## 3. RosCarEventLog


### RosCarEventLog

| 필드명 | 타입 | 설명 |
|------|------|------|
| event_id | integer (PK) | 이벤트 ID |
| roscar_id | integer | 로스카 ID |
| task_id | integer | 작업 ID |
| event_type | roscar_event_type_enum | 이벤트 유형 |
| camera_angle | integer (nullable) | 카메라 각도 |
| timestamp | timestamp | 기록 시간 |

#### enum: roscar_event_type_enum
TASK_START, TASK_DONE, OBJECT_DETECTED_PERSON, OBJECT_DETECTED_ROSCAR,  
PATH_MODIFIED, EMERGENCY_STOP, COLLISION, CHARGING_START, CHARGING_DONE


---

## 4. RosCarDrivingEventLog


### RosCarDrivingEventLog

| 필드명 | 타입 | 설명 |
|------|------|------|
| event_id | integer (PK) | 주행 이벤트 ID |
| roscar_id | integer | 로스카 ID |
| driving_event | driving_event_enum | 주행 이벤트 |
| timestamp | timestamp | 기록 시간 |

#### enum: driving_event_enum
- GO_TO_STANDBY_ZONE  
- GO_TO_CHARGING_ZONE  
- DISCONNECT


---

## 5. ControlCommandLog


### ControlCommandLog

| 필드명 | 타입 | 설명 |
|------|------|------|
| command_id | integer (PK) | 명령 로그 ID |
| roscar_id | integer | 로스카 ID |
| linear_velocity | float | 선속도 |
| angular_velocity | float | 각속도 |
| control_source | control_source_enum | 명령 발생 출처 |
| timestamp | timestamp | 기록 시간 |

#### enum: control_source_enum
- OBSTACLE_AVOIDANCE  
- EMERGENCY_HANDLER  
- PATH_PLANNER


---

## 6. PrecisionStopLog


### PrecisionStopLog

| 필드명 | 타입 | 설명 |
|------|------|------|
| log_id | integer (PK) | 로그 ID |
| roscar_id | integer | 로스카 ID |
| task_id | integer | 작업 ID |
| is_success | boolean | 성공 여부 |
| deviation_cm | float | 오차 (cm) |
| timestamp | timestamp | 기록 시간 |


---

## 7. DeliveryEventLog


### DeliveryEventLog

| 필드명 | 타입 | 설명 |
|------|------|------|
| event_id | integer (PK) | 이벤트 ID |
| delivery_id | integer | 배송 ID |
| previous_event | default_event_type_enum | 이전 이벤트 |
| new_event | default_event_type_enum | 새 이벤트 |
| user_id | integer | 사용자 ID |
| timestamp | timestamp | 기록 시간 |


---

## 8. TaskEventLog


### TaskEventLog

| 필드명 | 타입 | 설명 |
|------|------|------|
| event_id | integer (PK) | 이벤트 ID |
| task_id | integer | 작업 ID |
| previous_event | default_event_type_enum | 이전 상태 |
| current_event | default_event_type_enum | 현재 상태 |
| changed_at | timestamp | 변경 시간 |

#### enum: default_event_type_enum
WAIT, PROGRESS_START, COMPLET, CANCEL, FAILE


---

## 9. RackSensorLog


### RackSensorLog

| 필드명 | 타입 | 설명 |
|------|------|------|
| sensor_log_id | integer (PK) | 센서 로그 ID |
| roscar_id | integer | 로스카 ID |
| rack_id | integer | 랙 ID |
| rack_status | varchar(255) | 랙 상태 |
| rack_position_x | float | X 좌표 |
| rack_position_y | float | Y 좌표 |
| rack_position_z | float | Z 좌표 |
| timestamp | timestamp | 기록 시간 |


---

## 10. file_system_log


### file_system_log

| 필드명 | 타입 | 설명 |
|------|------|------|
| log_id | integer (PK) | 로그 ID |
| roscar_id | integer (nullable) | 로스카 ID |
| file_path | varchar(255) | 파일 경로 |
| timestamp | timestamp | 기록 시간 |

