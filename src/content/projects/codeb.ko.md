---
title: "인공지능 교육을 위한 Python 비주얼 프로그래밍 플랫폼 DIY/CodeB"
date: 2022-02-28T00:00:00+09:00
draft: false
author: "YONMILK"
description: "Pyodide 기반 웹 Python 비주얼 프로그래밍 교육 플랫폼"
tags: ["python", "education", "visual-programming", "pyodide", "webassembly", "ai-education"]
categories: ["프로젝트"]
translationKey: "codeb"
featured: true
type: "팀 프로젝트"
role: "팀원"
---

Pyodide 기반 WebAssembly 실행 환경에서 동작하는 AI 교육용 Python 비주얼 프로그래밍 플랫폼을 개발했습니다.

<!--more-->

## 프로젝트 개요
- **기간**: 2021.08 ~ 2022.02 (7개월)
- **역할**: 플랫폼 유지보수 및 교육 콘텐츠 개발
- **목표**: AI/데이터 과학 교육을 위한 직관적인 프로그래밍 환경 제공

## 기술 스택
- **기반 기술**: Pyodide, WebAssembly
- **언어**: Python, JavaScript
- **라이브러리**: pandas, matplotlib, scikit-image, BioPython
- **교육 도구**: 블록 코딩, 시각화
- **플랫폼**: 웹 브라우저

## 주요 담당 업무

### 라이브러리 블록 구현
- pandas, matplotlib, scikit-image, BioPython 등 데이터 과학/AI 라이브러리 기능을 블록 형태로 구현
- 복잡한 라이브러리 기능을 직관적인 블록 인터페이스로 추상화

### 입출력 블록 기능 설계
- CSV, Pickle, PIL, URL 등 다양한 입출력 소스를 처리하는 블록 기능 설계
- 파일 형식별 최적화된 데이터 처리 로직 구현

### 교육용 예제 블록 개발
- 결정트리, 유사도 분석, 시각화 그래프 등 교육용 예제 블록 직접 구현
- 반복 활용 기능 추가로 학습 효율성 향상

### 사용자 경험 개선
- matplotlib 한글 폰트 렌더링 오류 해결
- 구버전 XML 호환성 복구로 사용자 경험 개선
- 브라우저 환경에서의 안정적인 Python 코드 실행 환경 구축

## 핵심 성과
- 브라우저만으로 Python AI/데이터 과학 교육이 가능한 환경 구축
- 코딩 초보자도 쉽게 접근할 수 있는 직관적인 블록 기반 인터페이스 제공
- 다양한 데이터 형식과 AI 라이브러리를 지원하는 확장 가능한 플랫폼 개발
- 교육 현장에서 실제 활용 가능한 실습 예제 및 콘텐츠 제작