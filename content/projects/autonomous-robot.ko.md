---
title: "자율 주행 로봇 개발"
date: 2023-12-01T00:00:00+09:00
draft: false
author: "YONMILK"
description: "LiDAR와 카메라를 활용한 자율 주행 로봇 개발 프로젝트"
tags: ["자율주행", "ROS2", "OpenCV", "TensorFlow"]
categories: ["프로젝트"]
translationKey: "autonomous-robot"
---

LiDAR와 카메라 센서를 융합하여 실내 환경에서 자율주행이 가능한 로봇을 개발했습니다.

<!--more-->

## 프로젝트 개요
- **기간**: 2023년 3월 - 2023년 12월
- **팀 구성**: 4명 (로봇공학 2명, AI 개발 2명)
- **역할**: 센서 융합 및 경로 계획 알고리즘 개발

## 기술 스택
- **플랫폼**: ROS2 Humble
- **언어**: Python, C++
- **센서**: Velodyne LiDAR, Intel RealSense 카메라
- **AI/ML**: TensorFlow, OpenCV

## 주요 기능
1. **SLAM (동시 위치 추정 및 지도 작성)**
   - LiDAR 기반 2D 지도 생성
   - 실시간 위치 추정

2. **객체 검출 및 회피**
   - YOLO 기반 실시간 객체 검출
   - 동적 장애물 회피 알고리즘

3. **경로 계획**
   - A* 알고리즘 기반 글로벌 경로 계획
   - DWA 기반 로컬 경로 계획

## 성과
- 실내 환경에서 95% 이상의 내비게이션 성공률 달성
- 로봇공학회 최우수상 수상
- 관련 논문 1편 게재