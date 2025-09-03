---
title: "Rust기반 Python 인터프리터 RustPython"
date: 2022-10-14T00:00:00+09:00
draft: false
author: "YONMILK"
description: "오픈소스 Python 인터프리터 개발 및 기여"
tags: ["rust", "python", "interpreter", "open-source", "compiler", "rustpython"]
categories: ["프로젝트"]
translationKey: "rustpython"
featured: true
---

Rust로 구현된 Python 인터프리터 RustPython 오픈소스 프로젝트에 기여했습니다.

<!--more-->

## 프로젝트 개요
- **기간**: 2022.07 ~ 2022.10 (5개월)
- **역할**: 오픈소스 컨트리뷰터
- **성과**: 2022 오픈소스컨트리뷰션아카데미 대상(1위) 과학기술정보통신부장관
- **교육기관**: 오픈소스 컨트리뷰션 아카데미

## 기술 스택
- **언어**: Rust, Python
- **도구**: Git, GitHub, Cargo
- **플랫폼**: 크로스 플랫폼 (Linux, macOS, Windows)
- **개념**: 인터프리터, 컴파일러, AST

## 주요 기여 내용

### itertools 모듈 개선
- itertools.count에서 PyNumber를 지원하도록 개선하여 정수 외 수치 타입에 대한 유연한 처리 구현
- Python 표준 라이브러리와의 호환성 강화

### repr() 출력 형식 개선
- repr() 출력 형식을 개선하여 함수 객체, union 타입 등에서 보다 정확하고 가독성 높은 표현 제공
- Python 객체의 속성(_fields, __qualname__, StopIteration)을 내부 구조에 반영하여 표준 호환성 강화

### 객체 비교 연산 확장
- mappingproxy, weakproxy 객체에 대한 rich comparison(비교 연산) 기능 확장
- Python의 표준 동작과 일치하도록 구현

### warning 모듈 로직 수정
- warning 모듈 로직 전반 수정(warn_explicit, setup_context 등)
- 메타클래스 관련 버그 수정으로 안정성 향상

## 핵심 성과
- Python 표준 라이브러리와의 호환성 크게 향상
- Rust 기반 고성능 Python 인터프리터 개발에 기여
- 오픈소스 생태계에 실질적인 기여를 통한 개발자 커뮤니티 참여
- 인터프리터 내부 구조에 대한 깊은 이해 습득