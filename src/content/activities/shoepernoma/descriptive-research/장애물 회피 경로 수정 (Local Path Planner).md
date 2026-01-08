## 확인 목적

로봇이 주행 중 예기치 못한 장애물을 실시간으로 감지했을 때 기존 전역 경로(Global Plan)를 유지한 채 로컬 회피 경로(Local Plan)를 동적으로 수정하여 안전하고 연속적인 경로 주행을 보장할 수 있도록 Local Planner의 동작 구조와 회피 조건을 정의한다.

---

## 주요 조사 항목

| 항목명              | 조사 내용                                                                                                                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local Planner 역할 | 전역 경로(/roscar/navigation/global_plan)를 기준으로 동작<br>실시간 장애물 상황을 반영하여 동적 회피 경로 생성<br>주요 Planner: DWB, TebLocalPlanner, RegulatedPurePursuit                                                  |
| 입력 정보            | /roscar/navigation/global_plan: 기준 경로<br>/local_costmap: 인플레이션 포함 장애물 맵<br>/odom: 로봇 위치 및 속도<br>/roscar/sensor/fusion 또는 /roscar/obstacle/detected: 실시간 장애물 인식                            |
| 동작 방식 및 회피 조건    | 경로 상 장애물 감지 시 Local Planner가 전역 경로를 기준으로 우회 경로 생성<br>회피 가능성 판단 기준:<br>장애물까지의 거리<br>회피 가능 공간 폭<br>가속도 및 속도 제약<br>생성된 회피 경로는 /roscar/navigation/local_plan 토픽으로 퍼블리시                        |
| 회피 실패 조건         | 회피 불가 조건:<br>① 통로 폭이 충분하지 않은 경우<br>② 양측 장애물로 경로가 완전히 차단된 경우<br>실패 시 처리:<br>cmd_vel = 0<br>status = ABORTED<br>/roscar/status/log 로그 출력<br>[controller_server]: Failed to find valid path. |
| 테스트 시나리오         | RViz에서 2D Nav Goal 설정 후 주행 시작<br>이동 중 장애물 임의 배치 후 /roscar/navigation/local_plan 수정 여부 확인<br>로봇이 회피 동작으로 우회 주행하는지 시각 검증<br>장애물 제거 시 전역 경로로 재수렴하는지 확인<br>회피 실패 시 로봇 정지 및 경고 로그 출력 여부 확인     |
| 로컬 경로 파라미터       | path_distance_bias: 전역 경로 선호도(값이 클수록 원 경로 유지)<br>goal_distance_bias: 목표 지점 선호도<br>obstacle_cost_scale: 장애물 비용 민감도 조정<br>inflation_radius: 회피 여유 폭 설정(비용맵 확장 범위)                           |
