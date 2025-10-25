---
title: "매장 연동형 로봇 기반 신발 피킹 시스템 Shoepernoma"
startDate: 2025-04-09T00:00:00+09:00
endDate: 2025-05-27T00:00:00+09:00
draft: false
author: "YONMILK"
description: "ROS2 기반 신발 피킹 자동화 시스템"
tags: ["ros2", "robotics", "automation", "picking-system", "database", "tcp-udp"]
categories: ["프로젝트"]
featured: true
type: "팀 프로젝트"
role: "팀장"
---

프로젝트 팀장으로서 ROS2 기반 매장 연동형 신발 피킹 로봇 시스템을 개발했습니다.

<!--more-->

## 프로젝트 개요
- **기간**: 2025.04.09 ~ 2025.05.27 (6주)
- **역할**: 프로젝트 팀장 및 Main Service 개발
- **주요 성과**: 최우수상(1위) 애드인에듀 아카데미 구로가산센터

## 기술 스택
- **플랫폼**: ROS2
- **언어**: Python, C++
- **데이터베이스**: MySQL, ORM
- **통신**: TCP/UDP, Action/Service/Topic
- **하드웨어**: 서보 모터, 랙/카트 시스템

## 주요 담당 업무

### Main Service 아키텍처 설계
- ROS2 Action/Service/Topic 기반 모듈 설계 및 task 처리 로직 개발
- GUI와 연동되는 토픽/서비스 흐름 구성 및 이벤트 통신 처리

### Controller 및 ROS2 패키지 개발
- 랙/카트 제어용 cart_controller, rack_controller 모듈 리팩토링
- 서보 모터 제어 로직 내장한 roscar_arm_controller 개발

### DB 연동 및 ORM 기반 구조 설계
- 시퀀스 다이어그램 기반 쿼리/테이블 구조 정의 및 SSL 설정 적용
- 로그 저장 및 인터페이스 기록을 위한 다중 DB ORM 구성

### 시스템 통합 및 최적화
- TCP/UDP 기반 AI 모듈 연동 및 파일시스템 이벤트 처리
- Monorepo 기반 패키지 구조 재편 및 실행 스크립트 자동화
- 코드 네이밍/디렉토리 통일, 문서화 및 유지보수성 향상

## 핵심 성과
- 매장 재고 관리와 연동된 자동 피킹 시스템 구현
- 실시간 로봇 제어 및 상태 모니터링 시스템 개발
- 확장 가능한 아키텍처 설계로 향후 시스템 확장성 확보