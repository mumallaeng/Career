# Use Case Diagram(기능 중심 사용자 상호작용)

사용자-시스템 기능 관계 관점

```
@startuml
left to right direction
actor User
actor Pet as "펫 (Dolbom)"

rectangle "돌봄 챗봇 시스템" {
  User --> (로그인)
  User --> (회원가입)
  User --> (펫 연동)
  User --> (건강 상태 확인)
  User --> (펫 상태 확인)
  User --> (채팅하기)
  User --> (제스처 보내기)
  User --> (음성으로 말하기)
  User --> (설정 변경)

  (펫 상태 확인) --> (기본 정보 보기)
  (펫 상태 확인) --> (성격 및 말투 설정)
  (펫 상태 확인) --> (펫 훈련 시키기)

  (채팅하기) --> (STT 전송)
  (채팅하기) --> (TTS 수신)
  (채팅하기) --> (감정 이모티콘 응답)

  Pet --> (TTS 수신)
  Pet --> (이모티콘 반응)
}
@enduml
```



# Status Diagram(화면 상태 전이 흐름)

화면 흐름 관점

```
@startuml
' 상태 다이어그램임을 명시
skinparam state {
  BackgroundColor White
  BorderColor Black
}

[*] --> 로그인_화면

로그인_화면 --> 연동_화면 : 로그인 성공
연동_화면 --> 사용자_Main : 펫 연동 완료
사용자_Main --> 건강_상태_패널
사용자_Main --> 펫_상태_패널
사용자_Main --> 채팅_패널
사용자_Main --> 설정_패널

채팅_패널 --> 채팅_패널 : STT 모드 활성화
채팅_패널 --> 채팅_패널 : 제스처 인식
채팅_패널 --> 채팅_패널 : TTS 응답 출력

설정_패널 --> 설정_패널 : 텍스트 크기 조정

[*] --> 회원가입_화면
회원가입_화면 --> 로그인_화면 : 회원가입 완료
@enduml
```

# Activity Diagram (행동 흐름 - 사용자 기준)
사용자 행동 절차 흐름 관점

```
@startuml
start

:앱 실행;
:로그인 시도;
if (로그인 성공?) then (Yes)
  :펫 연동 여부 확인;
  if (연동 완료?) then (Yes)
    :사용자 Main 화면 이동;
  else (No)
    :펫 연동 화면으로 이동;
    :펫 ID 입력 → 연동 완료;
    :Main 화면 이동;
  endif
else (No)
  :회원가입 또는 재시도;
  stop
endif

:건강 상태 확인;
:펫 상태 확인;
:채팅 시작;
:STT로 음성 입력;
:제스처 입력 → 반응;
:TTS로 펫 응답;
:설정 변경 (예: 텍스트 크기);

stop
@enduml

```