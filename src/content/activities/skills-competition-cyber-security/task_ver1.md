### 1과제: 토폴로지 구성 (5시간)

#### 과제 개요
㈜경기닷컴의 보안팀 신입 보안 엔지니어로서 사내 사이버 보안 시뮬레이션을 위한 시스템 구축 과업을 수행합니다. 테스트 도메인 kg.com을 기반으로 완전한 네트워크 인프라를 구성해야 합니다.

#### 주요 구성 요소

##### 1. 운영체제 설치 및 구성
- **Windows 10 Enterprise (HOST)**
  - HOST-01, HOST-02: 파티션 C:\ (60GB이상), D:\ (400GB 이상)
  - 추가 사용자: user

- **Windows 10 Enterprise (Guest)**
  - CB-W-01, CB-W-02: DHCP를 통한 자동 IP 할당
  - Ex-Win: External 네트워크 DHCP 클라이언트

- **GNU·Linux CentOS**
  - CB-L-01: 4GB RAM, GNOME Desktop 설치
  - ns1, www: 2GB RAM, 최소 설치
  - Ex-ns: 2GB RAM, 최소 설치
  - 관리자 계정: secu2019

- **Windows Server 2019 Standard GUI**
  - DC 서버: Active Directory 도메인 컨트롤러
  - 추가 사용자: remote

##### 2. 네트워크 구성

**VLAN 구성**:
- VLAN 10 (Web): 172.30.10.0/24 - Fa0·1~Fa0·2
- VLAN 20 (System): 172.30.20.0/24 - Fa0·3~Fa0·4  
- VLAN 30 (Security): 172.30.30.0/24 - Fa0·5~Fa0·6
- VLAN 80 (DMZ): 192.168.150.0/25 - Fa0·11~Fa0·14
- VLAN 99 (Native): 사용하지 않는 모든 인터페이스
- VLAN 100 (External): 69.123.44.0/27 - Fa0·15~Fa0·18

**Trunk Port 설정**:
- Fa0·19: Internal VLAN만 허용
- Fa0·21: DMZ VLAN만 허용
- Fa0·23: External VLAN만 허용

##### 3. 스위치 설정 (CB-SW)
- 호스트 이름: CB-SW
- 모든 암호 MD5 암호화 저장
- 콘솔 접속: swAdmin 계정으로 프리빌리지드 모드 직접 접속
- SSHv2 구성: 도메인 kg.com, sshUser 계정 생성
- 원격 로그 전송: ns1 서버로 syslog 전송

##### 4. UTM 보안 장비 설정 (CB-UTM)
- 관리자 계정: utmAdmin1
- 관리자 페이지: CB-L-01, CB-W-02 네트워크에서만 접속 가능
- SSH 포트: 22202
- 영역 설정: 내부망(eth1), DMZ(eth2), 외부망(eth3)
- 통신 방향: 내부 → 전체, DMZ → 외부

##### 5. DNS 서버 구성 (ns1)
- kg.com 도메인 DNS 서비스 제공
- 정방향 존: kg.zone
- 역방향 존: kg.re.zone
- DNS 레코드:
  - ns1.kg.com: 192.168.150.1
  - log.kg.com: 192.168.150.1
  - www.kg.com: 192.168.150.5
  - ftp.kg.com: www의 별칭(CNAME)
  - sw.kg.com: 172.30.30.100
  - terminal.kg.com: 192.168.150.10

##### 6. 웹·FTP 서버 구성 (www)
- 웹 서비스: www.kg.com 또는 kg.com 접속 시 홈페이지 표시
- 기본 디렉토리: /var/www/kg.com
- 사용자 홈페이지: web001~web005 (www.kg.com/~userid)
- FTP 서비스:
  - webAdmin: /var/www/kg.com 접속
  - web001~web005: 각자 홈디렉토리 접속
  - chroot 설정으로 상위 디렉토리 이동 제한

##### 7. Active Directory 도메인 서비스 (DC)
- 도메인: KG.LOCAL
- DHCP 서비스:
  - Web: 172.30.10.100부터 100개
  - System: 172.30.20.100부터 100개
  - CB-W-02 예약 주소: 172.30.20.150
- 원격 데스크톱 서비스 구성
- 도메인 사용자 OU 구성: Web, Secu, Sys

### 2과제: 보안 구성 및 분석 (5시간)

#### 과제 개요
1과제에서 구축한 토폴로지에 내·외부 보안 위협에 대한 추가 설정 및 시스템·네트워크·어플리케이션 보안 취약점을 탐지하고 대응 정책을 마련합니다.

#### 주요 보안 설정

##### 1. 리눅스 시스템 보안

**명령어 관리**:
- 실행 명령어에 타임스탬프 추가: "년-월-일_시:분:초" 형식
- 사용자별 명령어 기록: 최근 20개만 저장
- root 명령어 로깅: /var/log/cmd.log에 저장 (root만 확인 가능)

**세션 및 계정 보안**:
- 세션 타임아웃: 1분 동안 미사용 시 자동 로그아웃
- root 직접 로그인 차단 (모든 경로)
- 패스워드 정책:
  - 영문, 숫자, 특수문자 포함 최소 8자리
  - 최소 사용 기간: 1일
  - 변경 주기: 90일
  - 만료 경고: 30일 전
  - 이전 패스워드 5개 재사용 방지
- 계정 잠금: 3회 로그인 실패 시 잠금
- su 명령어: secu2019, kgAdmin 계정만 사용 가능
- su 사용 로그: /var/log/sulog에 기록

##### 2. Windows 서버 보안 및 그룹정책

**계정 관리**:
- Administrator → kgAdmin2019로 변경
- Guest 계정 비활성화
- 하드디스크 기본 공유 차단 (AD 가입 모든 OS)
- RDP 포트: 2019로 변경

**암호 정책**:
- 복잡성 만족
- 최소 사용 기간: 1일
- 변경 주기: 30일
- 암호 해독 불가능하도록 저장
- 최근 암호 24개 기억

**계정 잠금 정책**:
- 3회 실패 시 1시간 잠금

**도메인 사용자 정책**:
- 문서 폴더 리디렉션: \\DC\users (C:\kg\user)
- 로그인·로그아웃 로깅:
  - 형식: Login·Logout,날짜,시간,사용자명,접속서버이름
  - 저장: C:\UsersLog\사용자명.log

##### 3. 어플리케이션 보안

**터미널 보안 (SSH)**:
- DMZ 리눅스 서버에 인증키를 통한 자동 접속
- Puttygen으로 생성된 개인키 사용
- 인증키 위치: 바탕화면\비번호_서버명_id_rsa
- Private key: 바탕화면\선수번호-ns1.ppk, 선수번호-www.ppk
- SSH 계정: kgAdmin
- Putty 세션: ns1-ssh, www-ssh로 저장
- CB-W-02의 secu001 계정에서 사용

**웹 서비스 보안**:
- Basic 인증: web001~web005 계정
- 접근 로그: /var/log/httpd/kg.com/access.log
- 로그 형식: 접근시간:접근IP:인증사용자:"URL":클라이언트요청정보:"브라우저정보":상태코드

##### 4. 네트워크 보안

**스위치 보안**:
- AAA 설정: www 서버 RADIUS 인증
- RADIUS 계정:
  - ciscoAdmin (레벨 15)
  - ciscoUser (레벨 1)
- RADIUS 실패 시 로컬 계정 사용
- 원격 접속: Security 네트워크에서만 허용

**UTM 보안 정책**:
- 트래픽 기본 흐름: Internal → 모든 방향, DMZ → External
- 과제 제시 서비스만 허용 (External 목적지는 모든 서비스 허용)
- 네트워크 객체명: VLAN name과 동일하게 설정

##### 5. 취약점 분석 및 대응

**공격 시뮬레이션**:
- Attacker 서버 구성 (Kali Linux 2019.1)
  - HOST-01에 추가 설치
  - CB-W-01과 같은 네트워크 사용
  - DC 서버 DHCP를 통한 IP 할당

**취약점 분석 작업**:
1. 192.168.150.0/25 네트워크 IP 스캔
   - 결과: attacker 바탕화면에 192hosts.txt 저장

2. TestSRV 서버 취약점 분석 (nmap 사용)
   - OS·프로토콜, 버전, 포트, 취약점 파악
   - 사용자 계정 발견
   - 분석 결과 문서화 (비번호.docx)

3. TestSRV 보안 강화
   - root 패스워드 크래킹 후 cyberP@ss12#$로 변경
   - 불필요한 서비스 제거 (ssh, http, ftp만 유지)
   - 불필요한 접속 허용 및 공유 제거
