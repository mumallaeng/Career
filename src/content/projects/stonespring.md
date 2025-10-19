---
title: "돌봄 챗봇 시스템 StoneSpring"
date: 2025-04-07T00:00:00+09:00
draft: false
author: "YONMILK"
description: "OpenAI GPT-4o-mini 기반 실시간 돌봄 챗봇 시스템"
tags: ["chatbot", "openai", "gpt", "stt", "tts", "tcp-udp", "caregiving"]
categories: ["프로젝트"]
translationKey: "stonespring"
featured: true
type: "팀 프로젝트"
role: "팀장"
---

프로젝트 팀장으로서 OpenAI API를 활용한 실시간 돌봄 챗봇 시스템을 개발했습니다.

<!--more-->

## 프로젝트 개요
- **기간**: 2025.02.27 ~ 2025.04.07 (5주)
- **역할**: 프로젝트 팀장 및 채팅 시스템 개발
- **목표**: 케어 상황에 특화된 대화형 AI 시스템 구축

## 기술 스택
- **AI**: OpenAI GPT-4o-mini
- **음성 인식**: Whisper.cpp (Large-v2)
- **음성 합성**: Google TTS (gTTS)
- **통신**: TCP/UDP
- **언어**: Python
- **기타**: Markdown 지원, 실시간 스트리밍

## 주요 담당 업무

### AI 채팅 시스템 개발
- OpenAI API 기반 GPT-4o-mini 모델 스트리밍 출력 구현
- 마크다운 지원 응답 처리 로직 개발
- 케어 상황에 맞는 답변 시나리오 강화 및 학습 데이터 정제

### 실시간 통신 시스템 구축
- TCP/UDP 양방향 통신 기반 실시간 챗봇 메시지 송수신 구성
- 채팅 UI/UX 개선을 위한 통신 최적화

### 음성 인터페이스 개발
- Whisper.cpp 기반 STT 모델(Large-v2) 연동
- 실시간 음성 인식 처리 시스템 구현
- Google TTS(gTTS)를 활용한 감성 대화용 음성 안내 기능 구성

### 프로젝트 관리 및 인프라
- 초기 프로젝트 구조 설계 및 모듈 분담
- 실행 자동화 스크립트(run.sh) 구성으로 팀원 간 로컬 테스트 환경 통일
- 프로젝트 전반에 대한 리팩토링 및 릴리즈 관리

## 핵심 성과
- 자연스러운 대화 흐름을 지원하는 실시간 채팅 시스템 구현
- 음성 입출력을 통한 직관적인 사용자 인터페이스 제공
- 돌봄 상황에 특화된 맞춤형 AI 응답 시스템 개발
- 안정적인 실시간 통신 및 스트리밍 처리 시스템 구축