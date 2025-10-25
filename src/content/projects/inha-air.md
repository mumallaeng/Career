---
title: "INHA AIR"
startDate: 2021-05-13T00:00:00+09:00
endDate: 2021-07-15T00:00:00+09:00
draft: false
author: "yonmilk"
description: "항공 예매 시스템 GUI 애플리케이션"
tags: ["java", "gui", "booking-system", "calendar", "database"]
categories: ["프로젝트"]
translationKey: "inha-air"
featured: false
type: "팀 프로젝트"
---

[yonmilk/INHA_AIR](https://github.com/yonmilk/INHA_AIR)


<!--more-->

인하공업 전문대학 컴퓨터시스템과 2학년 1학기 [Java 프로그래밍 응용] 과제 팀 프로젝트로, 
항공 예매 시스템에서 항공 예매 기능을 주로 구현했습니다.

## 프로젝트 개요
**기간**: 2021.05.13 ~ 2021.07.15 (2개월)

### 목표
#### 사용자
  - 간편한 항공 스케줄 조회
  - 직관적인 UI로 탑승일 선택 지원
  - 빠르고 편리한 항공권 예약/발권 시스템
#### 관리자
  - 항공편 스케줄 관리
  - 예약 현황 조회 및 관리

### 팀원 및 역할
이름 | github | 역할
--------|------------|------
김연우 | [@yonmilk](https://github.com/yonmilk) | 항공권 예매(예매정보입력) 및 로그인, 회원가입, 아이디/비밀번호 찾기 UI 개발 및 구현
김민주 | [@MinJu-A](https://github.com/MinJu-A) | 데이터베이스 및 관리자 메뉴 UI 개발 및 구현
노예원 | [@yewon-Noh](https://github.com/yewon-Noh) | 데이터베이스 및 항공권 예매(탑승정보입력, 결제) 관련 UI 개발 및 구현
민보현 | [@bhmin45](https://github.com/bhmin45) | 프로젝트 기획, 항공 스케줄 조회 및 항공권 예매(좌석선택) 관련 UI 개발 및 구현

### 사용 도구
- **언어**: Java
- **GUI**: Java Swing
- **데이터베이스**: MySQL, SQLite
- **개발 도구**: Git, Discord

### 담당 업무 주요 내용

- 사용자 세션 유지를 위한 전역 변수 관리
- **정규 표현식**으로 입력값 검증 분기 처리(로그인, 회원가입 등)
- 아이디/비밀번호 찾기 등 예외 상황 대응 UI 구성
- 출발지와 도착지 선택을 위해 항공 스케줄을 테이블로 표시하는 UI 구현
- 탑승일 선택을 위한 달력 UI 개발 (마우스클릭/키보드로 날짜 입력 가능)
- 탑승 인원 수 선택 UI 구현 및 나이 계산기(성인/소아/유아 구분)


<br>

# 프로젝트 결과 및 자료

## 구현 결과

<style>
  .image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
    padding: 10px;
  }
  
  .image-grid img {
    width: 100%;
    height: auto;
    object-fit: cover;
  }
</style>

<img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1dNbzRkUFRlFK85t83hm5XlqVKDOyfwyd" name="start">

<div class="image-grid">    
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1W3uTisglJD07sBNfSZSSpLCWVnfSZ8IV" name="start">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1yWwvyJXIesM0nrNqSDZftihP_rAlYJow" name="menu">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1flFgBbYWoKjmkpf2e8ClDT8ISc59Akdt" name="user_journey">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=16tHRwO-1PqRqIvmU4sjJkoziLVhTD7RA" name="reservation">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1_Sj6X8udB9_pcaXGbDH2Aj5z_cwu1B-L" name="payment">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1ETJO-MRfQ6to-EIZveVpj7OlR4Dd1tek" name="login">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=11mYnvZ4LTsgewt2corrjqkw48Q5urfpH" name="logout">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1xZRAin6WFhIpTo030r-rmOQ5JZgNePJV" name="signup">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1cbgEU80dB7VuoqinXxp4WDSJI9JHul9s" name="image1">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1omwDCxBnc9MVkHwTNHDrqtUgfDCRRp7J" name="image2">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1ZJUpI2sHrVJRQ_8FYCb6qMAlbtvgQjEL" name="image3">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=195OnuocaAEA46OMDA10Oe3FJni2uPZUy" name="image4">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1oxID5EIgmSVdiRfW6Trfrilird4IeNx1" name="image5">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1msN5mJ1C3qi-iQft2R0ot5iWr-qEV2Vy" name="image6">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1L1X8K7BETB0zLgvlPR04BF8qxJyKiUda" name="image7">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=18yLaQqJ7YHDkpb_Btjx6RVM5WOlk5Uct" name="image8">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1XDQz3tPVIFQFLZuTZfQ0hUwsqJ7FQEtu" name="image9">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1JREKkAn9FYk04-COAi1TbXtbD9c8dgrO" name="image10">
<img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1mIxbeC-cRuT3G2tgs0CsrZiFzFr1cAIX">
<img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1KmpklNOM562pjpHwFFhv3vGAJq5qbA-K">
</div>

## 구조도

<div class="image-grid">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1S6y0iOPoA_eXcCaYAG5B_7WBLwV4ioVy" name="information_architecture_user">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1NaDzUyO83XwcGebzRfeadkQSjiOueRPP">
</div>


## 순서도

<div class="image-grid">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1RfkcVe0waqq2WKPShMIBwppOOaCoABDL">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1CIHP2HJK36pYJYnEzrLkeyNOcsTwKhk-">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1IOa4mZlFAYvk11yqc-gcf4TTCirtyA9q">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1eM90AYk5JwFT9QFjL32L3EgeWIRLv2PG">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1cUD5wyA1LK3ulpnYUlIMNwd1r7I24vas">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1hpr8bh9KBj0WJwCghOmhViDvBCMqyAL6">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=19ZZDfIX0inkkscjPNKwd7I0bJXmHh8Nf">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1m1wfjc6lUFBRStPEK8cgLMxvdHRZYJSF">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=126o4jhM7knoWNeX6rTULEIjz5mv1MbSP">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1D9y9jyryDc5VCOmZnfRrytHrVScKdXHL">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1BDwQF5R0IZtEMSGlyh-eSjyEESJvHhz9">
</div>

## 데이터베이스

**데이터베이스 테이블 정보**

| 테이블명       | 설명                     |
| -------------- | ------------------------ |
| airport        | 공항정보                 |
| airplane       | 항공기 편명              |
| airSchedule    | 항공 스케줄              |
| seat           | 항공 스케줄 별 잔여 좌석  |
| user         | 회원 정보                |
| reservation    | 예매 내역                |
| reservationDetail          | 예매 상세 내역              |
| payment        | 결제                |
| login         | 로그인 정보                 |


<div class="image-grid">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=19ohm7rvbV6FCsueKJA5JMTzj4UyYbxbG">
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=1o070AZduiid4qwcEncJUE8q-qMHFHheR">
</div>
