---
title: Pseudo Code
---


# ---------------------------------------------
# 1. 데이터 클래스 정의
# ---------------------------------------------

클래스 RobotState:
    초기화(roscar_id, battery, is_charging, is_busy, x, y)

클래스 TaskRequest:
    초기화(task_id, SR_ID, pickup_x, pickup_y, deadline=None)
    priority = 0


# ---------------------------------------------
# 2. 현재 상태 입력 수집
# ---------------------------------------------

함수 get_robot_states():
    로봇 상태 토픽을 잠시 구독해 아래와 같은 리스트 반환:
        - roscar_id, battery(%), is_charging(bool), is_busy(bool), 위치(x,y)
    반환: List[RobotState]

함수 get_task_requests():
    작업 요청 서비스 호출
    각 요청에는 task_id, SR_ID, 위치(x,y), deadline(선택)
    반환: List[TaskRequest]


# ---------------------------------------------
# 3. 우선순위 계산
# ---------------------------------------------

상수 PRIORITY_MAP = {
    SR_ID: base_priority,  # 서비스 요청 ID에 따른 우선순위 맵
}

함수 compute_priority(task):
    base = PRIORITY_MAP에서 task.SR_ID의 값 (없으면 0)
    만약 deadline이 있다면:
        남은 시간에 반비례하는 값을 추가 가중치로 더함
    반환: 최종 priority (정수)

모든 task에 대해 compute_priority 적용
tasks 리스트를 priority 기준 내림차순 정렬


# ---------------------------------------------
# 4. 후보 로봇 필터링
# ---------------------------------------------

함수 filter_candidates(robots):
    배터리 < 20%, 충전 중, 작업 중 로봇은 제외
    반환: 사용 가능한 로봇 리스트


# ---------------------------------------------
# 5. 가장 가까운 로봇 선택
# ---------------------------------------------

함수 select_best_robot(candidates, task):
    각 로봇에 대해 거리 = sqrt((x - tx)^2 + (y - ty)^2)
    가장 가까운 로봇 반환


# ---------------------------------------------
# 6. 명령 생성 및 전송
# ---------------------------------------------

함수 make_command(robot, task):
    NavigationGoal 메시지 생성
    - roscar_id = robot.roscar_id
    - goal_x/y = task.pickup_x/y
    반환: 메시지 객체

함수 send_command(cmd_msg):
    /roscar/navigation/goal 토픽에 메시지 발행


# ---------------------------------------------
# 7. 전체 작업 할당 로직
# ---------------------------------------------

robots = get_robot_states()
tasks  = get_task_requests()

각 task에 대해:
    candidates = filter_candidates(robots)
    후보가 없다면 스킵

    sel = select_best_robot(candidates, task)
    cmd = make_command(sel, task)
    send_command(cmd)

    콘솔에 "Task 할당 완료" 출력
