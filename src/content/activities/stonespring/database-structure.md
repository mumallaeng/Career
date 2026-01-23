---
title: 
---

# 두 번째 자료

---

## 1. User

| 컬럼명 | 데이터 타입 | 설명 |
|--------|--------------|------|
| user_id | INT (PK) | 사용자 고유 ID |
| name | VARCHAR(50) | 사용자 이름 |
| nickname | VARCHAR(50) | 닉네임 |
| email | VARCHAR(100) | 이메일 주소 |
| password | VARCHAR(255) | 암호화된 비밀번호 |

---

## 2. PetEmoticon

| 필드명 | 타입 | 설명 |
|--------|------|------|
| e_id | INT (PK) | 이모티콘 고유 ID |
| emoticon | TEXT | 예시: ´︶`)ﾉ" |
| text | TEXT | 예시: 행복해요 |

---

## 3. Chat

| 필드명 | 타입 | 설명 |
|--------|------|------|
| chat_id | INT (PK) | 사용자 요청과 펫의 응답 채팅 한 세트에 대한 ID |
| user_id | INT (FK) | 사용자 ID (User 테이블 참조) |
| message_id | INT | 채팅 메시지 고유 ID |
| message | TEXT | 보낸 채팅 내용 |
| timestamp | DATETIME | 메시지 전송 시간 |
| video_id | INT | 카메라로 녹화된 사용자 동영상 고유 ID |
| video_path | TEXT | 동영상이 저장된 File system 경로 |
| video_start_timestamp | TEXT | 이전 채팅 종료 시간을 기준으로한 동영상의 timestamp |
| video_end_timestamp | TEXT | 이번 메시지 전송 시간을 기준으로한 동영상의 timestamp |
| voice_id | INT | 채팅 메시지 고유 ID |
| voice_path | TEXT | 음성파일이 저장된 File system 경로 |
| voice_start_timestamp | TEXT | 이전 채팅 종료 시간을 기준으로한 음성파일의 timestamp |
| voice_end_timestamp | TEXT | 이번 메시지 전송 시간을 기준으로한 음성파일의 timestamp |
| e_id | INT (FK) | 응답한 펫 감정 ID (PetEmoticon 테이블 참조) |
| pet_emotion | TEXT | 분석된 펫 감정 |
| reply_message | TEXT | 펫 메시지 응답 |

---

## 4. UserEmotionAnalysis

| 필드명 | 타입 | 설명 |
|--------|------|------|
| emotion_analysis_id | INT (PK) | 감정 분석 고유 ID |
| user_id | INT (FK) | 사용자 ID (User 테이블 참조) |
| chat_id | INT (FK) | 사용자 요청과 펫의 응답 채팅 한 세트에 대한 ID (Chat 테이블 참조)<br/>video_path, voice_path, message 데이터를 분석하여 face_emotion, voice_emotion, text_emotion 도출 |
| face_emotion | VARCHAR(50) | 얼굴 표정 감정 분석 (예: happy) |
| voice_emotion | VARCHAR(50) | 목소리 감정 |
| text_emotion | VARCHAR(50) | 텍스트 감정 분석 |
| summary | TEXT | 감정 요약 |
| time | TEXT | 분석 시각 |

---

## 5. PetCharacterSetting

| 필드명 | 타입 | 설명 |
|--------|------|------|
| character_id | INT (PK) | 성격 고유 ID |
| user_id | INT (FK) | 사용자 ID |
| speech | TEXT | 말투: 반말·존댓말 등 |
| character | TEXT | 외향적·내향적 |
| res_setting | TEXT | 응답할 때 참고해야하는 기본 설정 내용 (예시: 땅콩 알레르기가 있어 등) |

---

## 6. PetTrainingSetting

| 필드명 | 타입 | 설명 |
|--------|------|------|
| training_setting_id | INT (PK) | 고유 ID |
| user_id | INT (FK) | 사용자 ID |
| training_text | TEXT | 훈련시킬 명령 |
| keyword_text | TEXT | 훈련에 매칭되는 키워드 |
| gesture_video_path | TEXT | 훈련에 매칭되는 제스처 비디오 파일 경로 |
| gesture_recognition_id | INT | 연동된 제스처 인식 결과 ID (인식 DB 참조) |
| recognized_gesture | TEXT | 인식된 제스처 이름 또는 설명 |

---

## 7. UserSetting

| 컬럼명 | 데이터 타입 | 설명 |
|--------|--------------|------|
| setting_id | INT (PK) | 설정 고유 ID |
| user_id | INT (FK) | 유저 ID |
| font_size | INTEGER | 글자 크기 |

---

## 8. Log (로그)

| 필드명 | 타입 | 설명 |
|--------|------|------|
| log_id | INT (PK) | 로그 고유 ID |
| user_id | INT (FK) | 사용자 고유 ID |
| log_type | VARCHAR(100) | 로그 유형 (예: login, error 등) |
| timestamp | DATETIME | 로그 발생 시각 |
| detail | TEXT | 로그 상세 메시지 |
| location | VARCHAR(100) | 로그 발생 위치 (예: web, mobile_app 등) |
| device_info | TEXT | 사용된 디바이스 정보 |
| error_code | VARCHAR(50) | 오류 발생 시의 에러 코드 (null 가능) |
| ip_address | VARCHAR(45) | 사용자 또는 디바이스의 IP 주소 (IPv6 대응) |
