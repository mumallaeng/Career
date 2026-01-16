프로젝트 코드 구성 요소별 주요 파일 목록:

- Cartographer: `roscars/pinky_cartographer/params/*.lua`
- ArUco 기반 초기 위치 보정: `roscars/aruco_mapper/aruco_mapper/initialpose_custom.py`
- ArUco 마커 위치 퍼블리시: `roscars/aruco_mapper/aruco_mapper/aruco_localizer_node.py`
- Cartographer 초기 위치 반영: `roscars/pinky_navigation/pinky_navigation/initialpose.py`
- Nav2 설정: `roscars/pinky_navigation/params/nav2_params.yaml`
- Nav2 Launch: `roscars/pinky_navigation/launch/*.xml`
- Waypoint follower: `roscars/mobile_controller/nav_drive/waypoint_follower.cpp`
- A* 구현: `roscars/mobile_controller/nav_drive/astar.cpp`, `roscars/mobile_controller/include/mobile_controller/astar.hpp`
- RViz 설정: `roscars/pinky_cartographer/rviz/map_building.rviz`, `roscars/pinky_navigation/rviz/nav2_view.rviz`


# 1. SLAM/Map (Cartographer)

- Cartographer: `roscars/pinky_cartographer/params/*.lua`
- Cartographer 초기 위치 반영: `roscars/pinky_navigation/pinky_navigation/initialpose.py`


# 2. Localization / Initial Pose (ArUco)

- ArUco 기반 초기 위치 보정: `roscars/aruco_mapper/aruco_mapper/initialpose_custom.py`
- ArUco 마커 위치 퍼블리시: `roscars/aruco_mapper/aruco_mapper/aruco_localizer_node.py`



# 3. Global/Local Planning (Nav2)

- Nav2 설정: `roscars/pinky_navigation/params/nav2_params.yaml`
- Nav2 Launch: `roscars/pinky_navigation/launch/*.xml`


# 4. Waypoint 주행

- Waypoint follower: `roscars/mobile_controller/nav_drive/waypoint_follower.cpp`
- A* 구현: `roscars/mobile_controller/nav_drive/astar.cpp`, `roscars/mobile_controller/include/mobile_controller/astar.hpp`



# 5. RViz 시각화 구성

- RViz 설정: `roscars/pinky_cartographer/rviz/map_building.rviz`, `roscars/pinky_navigation/rviz/nav2_view.rviz`





