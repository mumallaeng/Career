---
title: System Requirements (SR)
---


- 시나리오 ver
- 구현 ver

| SR_ID | 기능 설명 | PRIORITY |
|---|---|:---:|
| SR-101 | 대기장소로 이동 | R |
| SR-102 | 호출받은 목적지로 이동 | R |
| SR-103 | 지정한 섹션(Rack)으로 이동 | R |
| SR-104 | 객체 탐지 후 회피 | R |
| SR-105 | 객체 탐지 후 정지 | R |
| SR-106 | 지정 위치 정밀 정차 (예: ±5cm 정밀도 목표) | R |
| SR-201 | 요청 받은 제품이 수레에 있는지 확인 | O1 |
| SR-202 | 작업 분담 기반 스케줄링으로 협업 운송 | O1 |
| SR-203 | 배터리 상태 확인 | O1 |
| SR-301 | 사람 탐지 | R |
| SR-302 | 장애물 탐지 | R |
| SR-303 | 협업 Roscar 탐지 | R |
| SR-401 | Path Planning | R |
| SR-402 | Local Planner : 실시간 장애물 회피 경로 수정 | R |
| SR-501 | Staff, Manager가 물품 재고 확인 가능 | O1 |
| SR-502 | 작업 요청 목록 확인 | R |
| SR-503 | 필요한 작업을 전송 | R |
| SR-504 | 작업 취소 요청 | R |
| SR-505 | 픽업 단계에서 취소 시 Standby 구역으로 이동 | R |
| SR-506 | 배송 단계에선 취소 불가 | R |
| SR-507 | QR로 신발상자 재고 파악 (모델, 색, 사이즈) | R |
| SR-601 | Roscar의 동작 상태 확인 및 표시 | R |
| SR-602 | 작업 대기 / 진행 / 완료 상태 구분 | R |
| SR-603 | Roscar 이벤트 로그 확인 | O1 |
| SR-604 | 작업 이벤트 로그 확인 | O1 |

---

## 시나리오에는 존재하나 SR 목록에 없는 기능  
*(출처: https://mldl.atlassian.net/wiki/spaces/UnderRos/pages/26020911)*

| 구분 | 기능 설명 |
|---|---|
| 대기 큐 관리 | FIFO + 경과시간 가중치 기반 큐 관리, 예상 대기시간 계산 |
| 장기 대기 알림 | 10분 초과 대기 시 Manager GUI 경고 |
| Global Replan 트리거 | 로컬 회피 3회 실패 시 Global Replan 수행 |
| 정체 경보 | 20초 이상 정지 시 Manager GUI 알림 |
