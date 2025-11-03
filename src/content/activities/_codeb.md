---
title: "AI 교육용 Python 블록 프로그래밍 웹 플랫폼"
startDate: 2021-08-01T00:00:00+09:00
endDate: 2022-02-28T00:00:00+09:00
draft: false

tags: ["python", "education", "visual-programming", "pyodide", "webassembly", "ai-education"]
categories: ["프로젝트"]
featured: true
type: "팀 프로젝트"
content_type: "project"
---

*상업용으로 사용되어 **코드 공개가 불가능**합니다.*

인하공업전문대학 전공 동아리 USAMO에서 진행한 프로젝트입니다.
기존에 선배님들께서 개발해오신 플랫폼을 유지보수하고, 새로운 기능을 개발하는 역할을 맡았습니다.
해당 플랫폼은 목적에 따라 DIY, CodeB, PyoT 등 여러 버전이 존재합니다. 
교내 과목뿐만 아니라 K-MOOC, 인천시 교육청 교사연수 등의 실제 교육에 사용되었습니다. 

<!--more-->
 
## 프로젝트 개요
- **기간**: 2021.08 ~ 2022.02 (7개월)
- **역할**: 플랫폼 유지보수 및 기능 개발

## 사용 도구
- **언어**: Python, HTML, CSS, JavaScript
- **런타임**: **Node.js**
- **라이브러리**: Pyodide, Blockly 등
- **데이터베이스**: Oracle RDBMS
- **버전관리**: Git, GitHub
- **협업**: Notion, Discord 등



## 주요 작업 내용

- Pyodide(Python 웹 인터프리터) 버전 업그레이드에 따른 호환성 개선
- 강의 콘텐츠에 필요한 블록 개발 및 수정
- **실시간 콘솔 출력 기능 개선**: Console이 Python 코드가 모두 실행된 후에 출력되어 인터프리터처럼 동작하지 않는 문제 해결(반복문 출력은 불가능)
- 로컬에서 파일 업로드 및 다운로드 기능 버그 수정 및 개선
  - 파일 크기 제한 및 경로 확인 등 예외 처리
  - 바이너리로 저장되는 파일에 대한 인코딩 처리
- Matplotlib 한글 깨짐 현상을 초기 설정 시에 한글 폰트로 자동 설정되도록 개선
  - koreanize-matplotlib 라이브러리는 2022년 5월에 발표되어 사용하지 못함
- statsmodels, biopython, keras 등 외부 라이브러리 추가
- 그외 기타 버그 수정 및 개선

## 프로젝트 관련 자료

**DIY** Python 입문용

**CodeB** AI 교육용

**PyoT** IoT 교육용

강의 자료 제작 및 조교(보조강사) 활동

서버 운영

