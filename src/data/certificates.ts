export interface Certificate {
  id: string;
  name: string;
  organization: string;
  issueDate: string;
  expirationDate: string;
  type: string;
  imageCopyPath: string;
  watermarkImagePath?: string;
}

export const certificates: Certificate[] = [
// 정보기술자격(ITQ) A등급 - 아래한글, 엑셀, 파워포인트
// GTQ(그래픽 기술 자격) 포토샵 2급, 일러스트 2급
// SMAT 서비스경영 3급(실무자)
// 전산회계 2급
// 전자상거래운용사

// COS코딩활용능력평가 2급
// SW코딩자격 3급

// PC정비사 2급
// 2018년 11월 13일
// (사)한국정보통신자격협회


// 네트워크관리사 2급
// 2019년 3월 5일
// 한국정보통신자격협회

// 정보처리기능사

// 정보처리산업기사
// 2023년 6월 9일
// 한국산업인력공단

// CCNA

// 컴퓨터 활용능력 1급
// 2020년 11월 13일
// 대한상공회의소

// 운전면허 1종 보통

  {
    id: 'computer-specialist-1st',
    name: '컴퓨터활용능력 1급',
    organization: '대한상공회의소',
    issueDate: '2020년 11월 13일',
    expirationDate: '없음',
    type: '국가공인 및 국가기술 자격',
    imageCopyPath: '',
    watermarkImagePath: ''
  },
  {
    id: 'pc-technician-2nd',
    name: 'PC정비사 2급',
    organization: '(사)한국정보통신자격협회',
    issueDate: '2018년 11월 13일',
    expirationDate: '없음',
    type: '국가공인자격',
    imageCopyPath: '',
    watermarkImagePath: ''
  },
  {
    id: 'network-administrator-2nd',
    name: '네트워크관리사 2급',
    organization: '(사)한국정보통신자격협회',
    issueDate: '2021년 11월 12일',
    expirationDate: '없음',
    type: '국가공인자격',
    imageCopyPath: '',
    watermarkImagePath: ''
  }
];
