## 확인 목적

로봇이 출발지에서 목적지까지 효율적인 경로를 계산하고 지도 기반으로 전역(Global) 이동 경로를 생성할 수 있도록 Global Planner의 동작 알고리즘, 구성 방식, 실패 조건을 사전에 정의한다.
이를 통해 지도 기반 내비게이션의 신뢰성과 경로 정확성 확보를 목표로 한다.

---

## 주요 조사 항목

| 항목명                 | 조사 내용                                                                                                                                                                |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 사용 알고리즘 및 경로 생성 방식  | 대표 Planner: NavFn, SmacPlanner2D, GridBasedPlanner 등<br>목표 좌표(/roscar/navigation/goal) 입력 시 map 프레임 기준 글로벌 경로 생성<br>생성된 경로는 /roscar/navigation/global_plan 토픽으로 퍼블리시 |
| 입력 조건 및 경로 출력 기준    | 입력값: start_pose, goal_pose (PoseStamped)<br>출력값: waypoints 리스트 (PoseStamped[])<br>지도 내 free space 영역을 따라 경로가 생성되어야 하며 장애물 영역 위로는 경로 생성 불가                            |
| 지도 정보 기반 경로 계산      | 맵 구성: .pgm + .yaml → /map 토픽 제공<br>경로 생성 시 global_costmap 내 장애물(occupied cell)은 회피 대상<br>static_layer, inflation_layer 활성화 필요                                        |
| 테스트 방법 및 확인 절차      | RViz에서 2D Nav Goal 클릭 후 /roscar/navigation/global_plan 확인<br>장애물 주변 경로 우회 여부 확인<br>경로가 목적지까지 연속적으로 연결되는지 시각적으로 검증                                                    |
| 경로 생성 실패 조건 및 처리 방식 | 실패 조건:<br>① start 또는 goal이 장애물 영역에 위치<br>② map 내 단절된 통로 존재<br>③ inflation_radius 값 과대 설정으로 경로 차단<br>실패 시 처리:<br>status: ABORTED 설정 및 /roscar/status/log 경고 로그 출력     |
| 속도 및 성능 관련 고려사항     | 복잡한 맵 환경에서 경로 생성 속도 측정 필요<br>고해상도 맵 사용 시 계산량 증가 → planner_frequency, resolution 등 주요 파라미터 최적화 필요                                                                     |
