2019년 경기도 기능경기대회 사이버보안 직종에서,
1과제는 중소기업 규모의 사내 네트워크와 서버 인프라를 5시간 안에 처음부터 설계·구축하는 과제였고,
2과제는 그 인프라 위에 운영체제 보안, 계정·로그 보안, AD·그룹정책, 네트워크·장비 보안, 기초 취약점 분석·대응까지 한 번에 다루는 종합 보안 실습 과제였습니다.
저는 1과제는 대부분 완수했고, 2과제는 네트워크 보안(RADIUS·AAA·UTM)과 취약점 분석·대응 일부를 제외하고 OS·계정·로그·AD·그룹정책, 응용 보안의 상당 부분까지 구현했습니다.

## 1과제 – 중소기업 수준 사내 네트워크 + 서버 인프라 5시간 구축

### (1) 전체 그림

**시나리오**

* 가상 회사 **㈜경기닷컴 보안팀 신입 보안 엔지니어**가 되어,
* 테스트 도메인 `kg.com` 환경에서
* 내부망(Internal), DMZ, 외부망(External)을 모두 포함하는 사내 인프라를 직접 설계·구축하는 과제. 

**환경 구성(요약)**

* **Hypervisor**: VMware Workstation
* **OS**

  * Windows 10 Enterprise: HOST-01, HOST-02 (관리 및 클라이언트)
  * Windows Server 2019: DC (AD + DNS + DHCP + RDS)
  * CentOS 7: CB-L-01, `ns1`, `www`, `Ex-ns` (Linux 서버 + 클라이언트)
* **네트워크 장비**

  * L2 스위치(Cisco 계열 가정): VLAN 10·20·30·80·99·100 구성
  * UTM 장비: Internal·DMZ·External 3-zone 방화벽 구성

### (2) 네트워크·서버 인프라 구성

**네트워크 설계 포인트**

* Internal:

  * VLAN 10 – Web(172.30.10.0/24, DHCP)
  * VLAN 20 – System(172.30.20.0/24, DHCP, 특정 IP 예약)
  * VLAN 30 – Security(172.30.30.0/24, 서버 및 장비 관리망)
* DMZ: VLAN 80 – 192.168.150.0/25 (DNS, Web, AD 서버 배치)
* External: VLAN 100 – 69.123.44.0/27 (외부 DNS Ex-ns, 외부 클라이언트 Ex-Win)
* 스위치

  * VLAN 10·20·30·80·100 및 native VLAN 99 구성
  * 콘솔·SSH 로컬 계정, MD5 암호화, SSHv2 + `sshUser` 계정, 관리 VLAN 분리
* UTM

  * 인터페이스: Internal(eth1) · DMZ(eth2) · External(eth3)
  * 정책: **Internal → 모든 구간 허용, DMZ → External만 허용** 식으로 기본 보안 정책 설계 

**서버 역할 분담**

* `ns1` (CentOS, DMZ)

  * 사내 도메인 `kg.com` DNS (정방향·역방향 zone: `kg.zone`, `kg.re.zone`)
  * A, PTR, CNAME 레코드(ns1·log·www·ftp·sw·terminal)
  * **스위치 로그 수집 서버**: `/var/log/CB-SW.log`로 syslog 수신
* `www` (CentOS, DMZ)

  * Web 서버: `www.kg.com`, `kg.com` → 회사 홈페이지 루트 `/var/www/kg.com`
  * 사용자 개인 홈페이지: `web001~web005` 계정, `www.kg.com/~userid` 제공
  * FTP 서버:

    * `webAdmin` → `/var/www/kg.com` 으로 chroot
    * 일반 사용자(web001~web005) → 개인 홈 디렉토리, 상위 디렉토리 접근 차단 
* `Ex-ns` (CentOS, External)

  * 외부 DNS `ex.com` (ex.zone · ex.re.zone)
  * 외부망 DHCP 서버: Ex-Win에 5개 IP 풀 제공
* `DC` (Windows Server 2019, DMZ)

  * AD 도메인 `KG.LOCAL`
  * 내부·DMZ의 Windows·Linus를 AD에 가입
  * DHCP 범위(Web, System), 원격 데스크톱 서비스(RDS), 도메인 사용자(web001, secu001, sys001)

**보안 설정 포인트 (1과제 기준)**

* 리눅스 공통

  * SELinux Enforcing 유지, 기본 방화벽 유지 (disable 시 실격)
  * SSH:

    * root 직접 로그인 금지
    * 포트 22202 사용
    * `kgAdmin` 계정만 SSH 허용 (CB-W-02, CB-L-01에서 DMZ 서버에 접속)
* 스위치 SSH

  * SSHv2, 도메인 `kg.com`, `sshUser` 계정, VLAN 30(Security)에서 관리
* 원격 데스크톱

  * DC 서버 RDS + RD Web Access, sys001 사용자 원격 접속 구성

---

## 2과제 – OS 보안 + 네트워크·장비 보안 + 취약점 분석 종합 실습

### (1) 전체 그림

1과제에서 만든 동일한 인프라를 전제로,
**리눅스·윈도우 OS 보안, 그룹 정책, SSH·웹·로그 보안, 스위치·UTM 보안, Kali 기반 취약점 분석과 대응을 한 번에 수행**하는 과제야.

### (2) 운영체제 보안 (리눅스 + 윈도우)

**리눅스 시스템 보안**

* **명령어 이력 보안**

  * 모든 사용자 명령어에 `YYYY-MM-DD_HH:MM:SS` 타임스탬프 포함되도록 설정
  * 사용자별 history는 **최근 20개 명령만 저장**
  * root 명령어는 `/var/log/cmd.log`에 별도 저장, root만 읽기 가능
* **세션 관리**

  * **1분 동안 입력 없으면 자동 로그아웃** 설정 (TMOUT 등)
* **root 계정 보안**

  * 콘솔·원격 전체에서 root 직접 로그인 금지, `su`를 통한 전환만 허용
  * `su` 사용은 `secu2019`, `kgAdmin`으로 제한, `/var/log/sulog`에 기록
* **패스워드 정책**

  * 최소 8자리 이상, 영문·숫자·특수문자 포함
  * 최소 사용 기간 1일, 90일마다 변경, 만료 30일 전 경고
  * 최근 5개 암호 기억, 재사용 방지
  * 로그인 3회 실패 시 계정 잠금, 관리자 해제 전까지 로그인 불가

**Windows Server 보안·그룹 정책** 

* Administrator → `kgAdmin2019`로 이름 변경, Guest 계정 비활성
* 도메인 가입 Windows의 로컬 드라이브 기본 공유 제거
* RDP 포트 3389 → 2019로 변경, 서비스는 동일하게 유지
* 계정 암호 정책

  * 복잡성 강제
  * 최소 사용 일수 1일, 30일마다 변경, 암호는 해독 불가능한 형태로 저장
  * 최근 24개 암호 기억 (재사용 방지)
* 계정 잠금 정책

  * 로그인 3회 실패 시 1시간 계정 잠금
* 도메인 사용자 정책

  * 사용자 “문서” 폴더를 DC 서버 공유(`C:\kg\user`)로 리디렉션
  * OU별(Web·Sys·Secu) 권한 설정
  * 로그인·로그아웃 시

    * `Login,날짜,시간,사용자명,서버이름`
    * `Logout,날짜,시간,사용자명,서버이름`
    * `C:\UsersLog\사용자명.log`에 기록 

### (3) 응용·서비스 보안

**SSH 터미널 보안 (키 기반 인증)** 

* DMZ 리눅스 서버(ns1, www)에 대한 SSH 접속을 **PuTTY + 공개키·개인키 기반 자동 로그인**으로 구성
* `puttygen`으로 키 생성,

  * 서버 측: `~/.ssh/authorized_keys` 등록 (kgAdmin 계정)
  * 클라이언트(HOST-02 · CB-W-02 secu001 계정)에서 `.ppk` 파일 이용 자동 접속
* 접속 세션 이름: `ns1-ssh`, `www-ssh` 로 저장

**웹 서비스 보안** 

* `http://www.kg.com` 접근 시 `web001~web005` 계정으로 Basic Authentication 요구
* 웹 접근 로그를 `/var/log/httpd/kg.com/access.log`에

  * `접근시간 : 접근IP : 인증사용자 : "URL" : 요청 정보 : "브라우저 정보" : 상태코드`
    형식으로 남기도록 커스터마이징 (로그 포맷 튜닝)

### (4) 네트워크·장비 보안 + 취약점 분석

**스위치 보안 (AAA + RADIUS)** 

* 스위치 콘솔·SSH 로그인 시 **AAA(RADIUS) 기반 중앙 인증** 구성

  * 인증 서버: `www` 서버에 RADIUS 서비스 구성
  * 계정: `ciscoAdmin`(priv 15), `ciscoUser`(priv 1)
  * RADIUS 실패 시 스위치 로컬 계정으로 fallback
  * 스위치 원격 접속은 Security VLAN(30)에서만 허용

**UTM 보안 정책** 

* 기본 흐름: Internal → 모든 방향 허용, DMZ → External만 허용
* 허용 서비스·네트워크를 과제에서 제시된 것만 사용
* 내부 네트워크 객체 이름은 VLAN 이름과 동일, External·DMZ는 Zone 이름과 동일하게 설계

**Kali 기반 취약점 분석 및 대응**

* `kali-linux`(attacker) VM을 내부망에 추가
* `192.168.150.0/25` 네트워크 스캔, 사용 중 IP 리스트(192hosts.txt) 생성
* `TestSRV` 서버에 대해 `nmap`으로 OS·서비스·포트 기반 취약점 분석, 보고서 작성
* 해킹 툴로 `TestSRV` root 패스워드 크래킹 → 침투 후

  * root 포함 사용자 암호 변경
  * ssh·http·ftp 외 불필요한 서비스·공유 제거

> **본인 수행 범위**
>
> * 2과제에서 **리눅스·윈도우 OS 보안, 계정·로그 정책, SSH 키 기반 접속, 웹 인증·로그 보안** 쪽은 대부분 수행
> * **스위치 AAA + RADIUS, UTM 세부 정책, Kali nmap 및 root 크래킹·취약점 조치** 부분은 시간 부족으로 미완료
