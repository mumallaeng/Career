import {
  buildDevStorageRemotePath,
  buildHighlightRemotePath,
  remapLegacyOneDriveRemotePath,
} from './onedrive-paths';

const publicBasePath = '/import-data/highlight/';
const devStoragePublicBasePath = '/import-data/dev-storage/';

type OneDriveAssetBlueprint = {
  /**
   * Unique identifier used by MDX/TS files to look up metadata.
   */
  act_id: string | readonly string[];
  filename: string;

  /**
   * Optional alt text/description for convenient reuse.
   */
  name?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  /**
   * Optional override for OneDrive path (relative to the drive root).
   */
  remotePathOverride?: string;
};

export type OneDriveAssetDefinition = OneDriveAssetBlueprint & {
  /**
   * Path inside OneDrive (relative to the drive root), e.g.
   * "Photos/Highlight/_copy/foo.jpg".
   */
  remotePath: string;

  /**
   * Public path served by Next.js. Must start with "/".
   */
  publicPath: string;

  /**
   * Original remote/public paths for fallback or non-image usage.
   */
  remotePathOriginal: string;
  publicPathOriginal: string;

  /**
   * Dev-storage thumbnail paths for resized images.
   */
  remotePathThumb: string;
  publicPathThumb: string;

  /**
   * Lightweight preview frame for MP4/WebM assets.
   */
  remotePathPoster?: string;
  publicPathPoster?: string;

  /**
   * Whether this asset should be resized into dev-storage variants.
   */
  isResizableImage: boolean;

  /**
   * Whether this asset is a motion format with an optimized dev-storage copy.
   */
  isOptimizedMotion: boolean;

  /**
   * Whether the default public asset is served from dev-storage.
   */
  hasOptimizedDefault: boolean;

  /**
   * Whether the video has a generated WebP poster.
   */
  hasVideoPoster: boolean;
};

function getNormalizationVariants(value: string): string[] {
  const variants = new Set<string>();
  variants.add(value);
  try {
    variants.add(value.normalize('NFC'));
  } catch {
    // ignore
  }
  try {
    variants.add(value.normalize('NFD'));
  } catch {
    // ignore
  }
  return Array.from(variants);
}

function isResizableImageFilename(filename: string): boolean {
  return /\.(jpe?g|png|webp)$/i.test(filename);
}

function isOptimizedMotionFilename(filename: string): boolean {
  return /\.(mp4|webm|gif)$/i.test(filename);
}

function hasVideoPosterFilename(filename: string): boolean {
  return /\.(mp4|webm)$/i.test(filename);
}

function normalizePublicFilename(filename: string): string {
  try {
    return filename.normalize('NFC');
  } catch {
    return filename;
  }
}

export function buildOptimizedImageFilename(filename: string): string {
  return normalizePublicFilename(filename.replace(/\.[^.]+$/, '.webp'));
}

export function buildVideoPosterFilename(filename: string): string {
  return normalizePublicFilename(filename.replace(/\.[^.]+$/, '-poster.webp'));
}

function buildDevStoragePublicPath(size: 'thumb' | 'default', filename: string): string {
  if (size === 'thumb') {
    return `${devStoragePublicBasePath}thumb/${filename}`;
  }
  return `${devStoragePublicBasePath}${filename}`;
}

const onedriveAssetBlueprints = [
  {
    act_id: '프로필',
    filename: '261005-증명사진_copy.jpg',
    name: '김연우 증명사진',
    type: 'profile',
    startDate: '2026-10-05',
  },

  {
    act_id: '네임컴작명연구소',
    filename: '020309-네임컴작명연구소-0_copy.jpg',
    name: '네임컴작명연구소 0',
    type: 'None',
    startDate: '2002-03-09',
  },

  {
    act_id: '네임컴작명연구소',
    filename: '020309-네임컴작명연구소-1_copy.jpg',
    name: '네임컴작명연구소 1',
    type: 'None',
    startDate: '2002-03-09',
  },

  {
    act_id: '네임컴작명연구소',
    filename: '020309-네임컴작명연구소-2_copy.jpg',
    name: '네임컴작명연구소 2',
    type: 'None',
    startDate: '2002-03-09',
  },

  {
    act_id: '네임컴작명연구소',
    filename: '020309-네임컴작명연구소-3_copy.jpg',
    name: '네임컴작명연구소 3',
    type: 'None',
    startDate: '2002-03-09',
  },

  {
    act_id: '네임컴작명연구소',
    filename: '020309-네임컴작명연구소-4_copy.jpg',
    name: '네임컴작명연구소 4',
    type: 'None',
    startDate: '2002-03-09',
  },

  {
    act_id: ['개인', '자격증'],
    filename: '170629-ITQ_copy.jpg',
    name: 'ITQ',
    type: '자격증',
    startDate: '2017-06-29',
    endDate: '2018-11-29',
  },

  {
    act_id: '성일정보고등학교',
    filename: '170714-일본어능력경시대회-최우수상(1위)_copy.jpg',
    name: '일본어능력경시대회 최우수상(1위)',
    type: 'award',
    startDate: '2017-07-14',
  },

  {
    act_id: '성일정보고등학교',
    filename: '170718-과학PPT발표대회-최우수상(1위)_copy.jpg',
    name: '과학PPT발표대회 최우수상(1위)',
    type: 'award',
    startDate: '2017-07-18',
  },

  {
    act_id: '성일정보고등학교',
    filename: '170718-상업경제교과_경제골든벨-최우수상(1위)_copy.jpg',
    name: '상업경제교과 경제골든벨 최우수상(1위)',
    type: 'award',
    startDate: '2017-07-18',
  },

  {
    act_id: '성일정보고등학교',
    filename: '170718-영어UCC대회-1위_copy.jpg',
    name: '영어UCC대회 1위',
    type: 'award',
    startDate: '2017-07-18',
  },

  {
    act_id: '성일정보고등학교',
    filename: '180711-영어UCC-대상(1위)_copy.jpg',
    name: '영어UCC 대상(1위)',
    type: 'award',
    startDate: '2018-07-11',
  },

  {
    act_id: '성일정보고등학교',
    filename: '180711-영어UCC_copy.jpg',
    name: '영어UCC',
    type: 'None',
    startDate: '2018-07-11',
  },

  {
    act_id: '성일정보고등학교',
    filename: '180718-교과우수상(문학)_copy.jpg',
    name: '교과우수상(문학)',
    type: 'award',
    startDate: '2018-07-18',
  },

  {
    act_id: '성일정보고등학교',
    filename: '181030-NCS수리능력경진대회-장려상(3위)_copy.jpg',
    name: 'NCS수리능력경진대회 장려상(3위)',
    type: 'award',
    startDate: '2018-10-30',
  },

  {
    act_id: ['개인', '자격증'],
    filename: '181025-전산회계2급_copy.png',
    name: '전산회계2급',
    type: '자격증',
    startDate: '2018-10-25',
  },

  {
    act_id: ['개인', '자격증'],
    filename: '181111-GTQ-photo_copy.jpg',
    name: 'GTQ 포토샵 1급',
    type: '자격증',
    startDate: '2018-11-11',
  },

  {
    act_id: ['개인', '자격증'],
    filename: '181113-PC정비사2급_copy.jpg',
    name: 'PC정비사 2급',
    type: '자격증',
    startDate: '2018-11-13',
  },

  {
    act_id: '성일정보고등학교',
    filename: '190104-영어UCC-장려상(4위)_copy.jpg',
    name: '영어UCC 장려상(4위)',
    type: 'award',
    startDate: '2019-01-04',
  },

  {
    act_id: '성일정보고등학교',
    filename: '181228-컴퓨터그래픽_포스터만들기대회-최우수상(1위)_copy.jpg',
    name: '컴퓨터그래픽 포스터만들기대회 최우수상(1위)',
    type: 'award',
    startDate: '2018-12-28',
  },

  {
    act_id: '성일정보고등학교',
    filename: '181128-0927-00.JPG',
    name: '컴퓨터그래픽 포스터만들기대회 0',
    type: 'None',
    startDate: '2018-11-28',
  },

  {
    act_id: '성일정보고등학교',
    filename: '181128-2042-00.JPG',
    name: '컴퓨터그래픽 포스터만들기대회 1',
    type: 'None',
    startDate: '2018-11-28',
  },

  {
    act_id: '성일정보고등학교',
    filename: '181128-2230-00.JPG',
    name: '컴퓨터그래픽 포스터만들기대회 2',
    type: 'None',
    startDate: '2018-11-28',
  },

  {
    act_id: '성일정보고등학교',
    filename: '181128-2230-01.JPG',
    name: '컴퓨터그래픽 포스터만들기대회 3',
    type: 'None',
    startDate: '2018-11-28',
  },

  {
    act_id: '성일정보고등학교',
    filename: '181128-2230-02.JPG',
    name: '컴퓨터그래픽 포스터만들기대회 4',
    type: 'None',
    startDate: '2018-11-28',
  },

  {
    act_id: '성일정보고등학교',
    filename: '190107-스크래치대회-최우수상(1위)_copy.jpg',
    name: '스크래치대회 최우수상(1위)',
    type: 'award',
    startDate: '2019-01-07',
  },

  {
    act_id: '성일정보고등학교',
    filename: '190107-스크래치대회_copy.jpg',
    name: '스크래치대회',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '씽크잡스'],
    filename: '181116-1358-00.jpeg',
    name: '드림쉽 콘서트',
    type: 'None',
    startDate: '2018-11-16',
  },

  {
    act_id: ['성일정보고등학교', '씽크잡스'],
    filename: '181116-1437-01.jpeg',
    name: '드림쉽 콘서트',
    type: 'None',
    startDate: '2018-11-16',
  },

  {
    act_id: ['성일정보고등학교', '씽크잡스'],
    filename: '181116-1437-00.jpeg',
    name: '드림쉽 콘서트',
    type: 'None',
    startDate: '2018-11-16',
  },
  
  {
    act_id: ['성일정보고등학교', '씽크잡스'],
    filename: '181116-1711-00.JPG',
    name: '드림쉽 콘서트',
    type: 'None',
    startDate: '2018-11-16',
  },

  {
    act_id: ['성일정보고등학교', '씽크잡스'],
    filename: '181116-1400-00.jpeg',
    name: '드림쉽 콘서트',
    type: 'None',
    startDate: '2018-11-16',
  },

  {
    act_id: ['성일정보고등학교', '씽크잡스'],
    filename: '180817-씽크잡스-수료증_copy.jpg',
    name: '씽크잡스 수료증',
    type: '수료증',
    startDate: '2018-08-17',
  },

  {
    act_id: ['성일정보고등학교', '씽크잡스'],
    filename: '180817-씽크잡스-우수상_copy.jpg',
    name: '씽크잡스 우수상',
    type: 'award',
    startDate: '2018-08-17',
  },

  {
    act_id: ['성일정보고등학교', '씽크잡스'],
    filename: '181116-씽크잡스-콘텐츠리더상_copy.jpg',
    name: '씽크잡스 콘텐츠리더상',
    type: 'award',
    startDate: '2018-11-16',
  },

  // {
  //   act_id: ['성일정보고등학교', '씽크잡스'],
  //   filename: '180817-씽크잡스-포트폴리오_copy.jpg',
  //   name: '씽크잡스 포트폴리오',
  //   type: 'portfolio',
  //   startDate: '2018-08-17',
  // },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '181114-1303-00.JPG',
    name: '항공세미나',
    type: 'None',
    startDate: '2018-11-14',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '181114-1312-00.JPG',
    name: '항공세미나',
    type: 'None',
    startDate: '2018-11-14',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '181114-1622-00.JPG',
    name: '항공세미나',
    type: 'None',
    startDate: '2018-11-14',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '181114-1628-00.JPG',
    name: '항공세미나',
    type: 'None',
    startDate: '2018-11-14',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '181114-1702-00.JPG',
    name: '항공세미나',
    type: 'None',
    startDate: '2018-11-14',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '181114-1702-01 copy.JPG',
    name: '항공세미나',
    type: 'None',
    startDate: '2018-11-14',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '181114-1702-02 copy.JPG',
    name: '항공세미나',
    type: 'None',
    startDate: '2018-11-14',
  },
  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '181114-1741-02.JPG',
    name: '인천국제공항공사 견학',
    type: 'None',
    startDate: '2018-11-14',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '181114-1741-00.JPG',
    name: '인천국제공항공사 견학',
    type: 'None',
    startDate: '2018-11-14',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '181114-1741-01.JPG',
    name: '인천국제공항공사 견학',
    type: 'None',
    startDate: '2018-11-14',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '181114-1747-00.JPG',
    name: '인천국제공항공사 견학',
    type: 'None',
    startDate: '2018-11-14',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-1305-00.jpeg',
    name: '심화1팀1기업 최종 강평회 0',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-1306-00.jpeg',
    name: '심화1팀1기업 최종 강평회 1',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-1309-00.jpeg',
    name: '심화1팀1기업 최종 강평회 2',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-수료증_copy.jpg',
    name: '심화1팀1기업 수료증',
    type: '수료증',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-PPT-0_copy.jpg',
    name: '심화1팀1기업 PPT 0',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-PPT-1_copy.jpg',
    name: '심화1팀1기업 PPT 1',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-PPT-2_copy.jpg',
    name: '심화1팀1기업 PPT 2',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-PPT-3_copy.jpg',
    name: '심화1팀1기업 PPT 3',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-PPT-4_copy.jpg',
    name: '심화1팀1기업 PPT 4',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-PPT-5_copy.jpg',
    name: '심화1팀1기업 PPT 5',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-PPT-6_copy.jpg',
    name: '심화1팀1기업 PPT 6',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-PPT-7_copy.jpg',
    name: '심화1팀1기업 PPT 7',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-0_copy.jpg',
    name: '심화1팀1기업 결과보고서 0',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-10_copy.jpg',
    name: '심화1팀1기업 결과보고서 10',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-11_copy.jpg',
    name: '심화1팀1기업 결과보고서 11',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-12_copy.jpg',
    name: '심화1팀1기업 결과보고서 12',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-13_copy.jpg',
    name: '심화1팀1기업 결과보고서 13',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-14_copy.jpg',
    name: '심화1팀1기업 결과보고서 14',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-15_copy.jpg',
    name: '심화1팀1기업 결과보고서 15',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-16_copy.jpg',
    name: '심화1팀1기업 결과보고서 16',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-17_copy.jpg',
    name: '심화1팀1기업 결과보고서 17',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-18_copy.jpg',
    name: '심화1팀1기업 결과보고서 18',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-19_copy.jpg',
    name: '심화1팀1기업 결과보고서 19',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-1_copy.jpg',
    name: '심화1팀1기업 결과보고서 1',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-20_copy.jpg',
    name: '심화1팀1기업 결과보고서 20',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-21_copy.jpg',
    name: '심화1팀1기업 결과보고서 21',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-22_copy.jpg',
    name: '심화1팀1기업 결과보고서 22',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-23_copy.jpg',
    name: '심화1팀1기업 결과보고서 23',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-24_copy.jpg',
    name: '심화1팀1기업 결과보고서 24',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-25_copy.jpg',
    name: '심화1팀1기업 결과보고서 25',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-26_copy.jpg',
    name: '심화1팀1기업 결과보고서 26',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-27_copy.jpg',
    name: '심화1팀1기업 결과보고서 27',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-28_copy.jpg',
    name: '심화1팀1기업 결과보고서 28',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-29_copy.jpg',
    name: '심화1팀1기업 결과보고서 29',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-2_copy.jpg',
    name: '심화1팀1기업 결과보고서 2',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-30_copy.jpg',
    name: '심화1팀1기업 결과보고서 30',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-31_copy.jpg',
    name: '심화1팀1기업 결과보고서 31',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-32_copy.jpg',
    name: '심화1팀1기업 결과보고서 32',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-33_copy.jpg',
    name: '심화1팀1기업 결과보고서 33',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-34_copy.jpg',
    name: '심화1팀1기업 결과보고서 34',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-35_copy.jpg',
    name: '심화1팀1기업 결과보고서 35',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-36_copy.jpg',
    name: '심화1팀1기업 결과보고서 36',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-37_copy.jpg',
    name: '심화1팀1기업 결과보고서 37',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-3_copy.jpg',
    name: '심화1팀1기업 결과보고서 3',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-4_copy.jpg',
    name: '심화1팀1기업 결과보고서 4',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-5_copy.jpg',
    name: '심화1팀1기업 결과보고서 5',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-6_copy.jpg',
    name: '심화1팀1기업 결과보고서 6',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-7_copy.jpg',
    name: '심화1팀1기업 결과보고서 7',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-8_copy.jpg',
    name: '심화1팀1기업 결과보고서 8',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['성일정보고등학교', '심화1팀1기업'],
    filename: '190107-심화1팀1기업-결과보고서-9_copy.jpg',
    name: '심화1팀1기업 결과보고서 9',
    type: 'None',
    startDate: '2019-01-07',
  },

  {
    act_id: ['개인', '자격증'],
    filename: '190111-SWCD3_copy.jpg',
    name: 'SWCD 3급',
    type: '자격증',
    startDate: '2019-01-11',
  },

  {
    act_id: ['개인', '자격증'],
    filename: '190305-네트워크관리사2급_copy.jpg',
    name: '네트워크관리사 2급',
    type: '자격증',
    startDate: '2019-03-05',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도 지방기능경기대회 과제_사이버보안_요구사항(공개용)_00.jpg',
    name: '2019년 경기도 지방기능경기대회 과제_사이버보안_요구사항(공개용)_00',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도 지방기능경기대회 과제_사이버보안_요구사항(공개용)_00.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도 지방기능경기대회 과제_사이버보안_요구사항(공개용)_01.jpg',
    name: '2019년 경기도 지방기능경기대회 과제_사이버보안_요구사항(공개용)_01',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도 지방기능경기대회 과제_사이버보안_요구사항(공개용)_01.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도 지방기능경기대회 과제_사이버보안_요구사항(공개용)_02.jpg',
    name: '2019년 경기도 지방기능경기대회 과제_사이버보안_요구사항(공개용)_02',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도 지방기능경기대회 과제_사이버보안_요구사항(공개용)_02.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_00.jpg',
    name: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_00',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_00.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_01.jpg',
    name: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_01',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_01.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_02.jpg',
    name: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_02',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_02.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_03.jpg',
    name: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_03',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_03.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_04.jpg',
    name: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_04',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_04.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_05.jpg',
    name: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_05',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_05.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_06.jpg',
    name: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_06',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_06.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_07.jpg',
    name: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_07',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_07.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_08.jpg',
    name: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_08',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_08.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_09.jpg',
    name: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_09',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_09.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_10.jpg',
    name: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_10',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_10.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_11.jpg',
    name: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_11',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_11.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_12.jpg',
    name: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_12',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_12.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_13.jpg',
    name: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_13',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_13.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_14.jpg',
    name: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_14',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_14.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_15.jpg',
    name: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_15',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_15.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_16.jpg',
    name: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_16',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_16.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_17.jpg',
    name: '2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_17',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 1과제 채점기준(사이버보안)_홈페이지게시용0318_17.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 1과제(사이버보안)0318_00.jpg',
    name: '2019년 경기도기능경기대회 1과제(사이버보안)0318_00',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 1과제(사이버보안)0318_00.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 1과제(사이버보안)0318_01.jpg',
    name: '2019년 경기도기능경기대회 1과제(사이버보안)0318_01',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 1과제(사이버보안)0318_01.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 1과제(사이버보안)0318_02.jpg',
    name: '2019년 경기도기능경기대회 1과제(사이버보안)0318_02',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 1과제(사이버보안)0318_02.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 1과제(사이버보안)0318_03.jpg',
    name: '2019년 경기도기능경기대회 1과제(사이버보안)0318_03',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 1과제(사이버보안)0318_03.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 1과제(사이버보안)0318_04.jpg',
    name: '2019년 경기도기능경기대회 1과제(사이버보안)0318_04',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 1과제(사이버보안)0318_04.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 1과제(사이버보안)0318_05.jpg',
    name: '2019년 경기도기능경기대회 1과제(사이버보안)0318_05',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 1과제(사이버보안)0318_05.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_00.jpg',
    name: '2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_00',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_00.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_01.jpg',
    name: '2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_01',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_01.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_02.jpg',
    name: '2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_02',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_02.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_03.jpg',
    name: '2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_03',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_03.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_04.jpg',
    name: '2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_04',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_04.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_05.jpg',
    name: '2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_05',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_05.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_06.jpg',
    name: '2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_06',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_06.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_07.jpg',
    name: '2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_07',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_07.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_08.jpg',
    name: '2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_08',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_08.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_09.jpg',
    name: '2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_09',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_09.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_10.jpg',
    name: '2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_10',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_10.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_11.jpg',
    name: '2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_11',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_11.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_12.jpg',
    name: '2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_12',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 2과제 채점기준(사이버보안)_홈페이지공개용0318_12.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 2과제(사이버보안)_0318_00.jpg',
    name: '2019년 경기도기능경기대회 2과제(사이버보안)_0318_00',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 2과제(사이버보안)_0318_00.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 2과제(사이버보안)_0318_01.jpg',
    name: '2019년 경기도기능경기대회 2과제(사이버보안)_0318_01',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 2과제(사이버보안)_0318_01.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 2과제(사이버보안)_0318_02.jpg',
    name: '2019년 경기도기능경기대회 2과제(사이버보안)_0318_02',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 2과제(사이버보안)_0318_02.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 2과제(사이버보안)_0318_03.jpg',
    name: '2019년 경기도기능경기대회 2과제(사이버보안)_0318_03',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 2과제(사이버보안)_0318_03.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 2과제(사이버보안)_0318_04.jpg',
    name: '2019년 경기도기능경기대회 2과제(사이버보안)_0318_04',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 2과제(사이버보안)_0318_04.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 2과제(사이버보안)_0318_05.jpg',
    name: '2019년 경기도기능경기대회 2과제(사이버보안)_0318_05',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 2과제(사이버보안)_0318_05.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 2과제(사이버보안)_0318_06.jpg',
    name: '2019년 경기도기능경기대회 2과제(사이버보안)_0318_06',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 2과제(사이버보안)_0318_06.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 2과제(사이버보안)_0318_07.jpg',
    name: '2019년 경기도기능경기대회 2과제(사이버보안)_0318_07',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 2과제(사이버보안)_0318_07.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 직종별 세부일정_00.jpg',
    name: '2019년 경기도기능경기대회 직종별 세부일정_00',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 직종별 세부일정_00.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 직종별 세부일정_01.jpg',
    name: '2019년 경기도기능경기대회 직종별 세부일정_01',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 직종별 세부일정_01.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 직종별 세부일정_02.jpg',
    name: '2019년 경기도기능경기대회 직종별 세부일정_02',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 직종별 세부일정_02.jpg',
  },

  {
    act_id: ['기능경기대회', '공개자료'],
    filename: '2019년 경기도기능경기대회 직종별 세부일정_03.jpg',
    name: '2019년 경기도기능경기대회 직종별 세부일정_03',
    type: 'None',
    startDate: '2019-03-18',
    remotePathOverride: 'Photos/Projects/기능경기대회/2019년 경기도기능경기대회 직종별 세부일정_03.jpg',
  },

  {
    act_id: ['공부', '기능경기대회'],
    filename: '190403-기능경기대회-공부-0_copy.jpg',
    name: '기능경기대회 공부 0',
    type: 'None',
    startDate: '2019-04-03',
  },

  {
    act_id: ['공부', '기능경기대회'],
    filename: '190403-기능경기대회-공부-10_copy.jpg',
    name: '기능경기대회 공부 10',
    type: 'None',
    startDate: '2019-04-03',
  },

  {
    act_id: ['공부', '기능경기대회'],
    filename: '190403-기능경기대회-공부-11_copy.jpg',
    name: '기능경기대회 공부 11',
    type: 'None',
    startDate: '2019-04-03',
  },

  {
    act_id: ['공부', '기능경기대회'],
    filename: '190403-기능경기대회-공부-12_copy.jpg',
    name: '기능경기대회 공부 12',
    type: 'None',
    startDate: '2019-04-03',
  },

  {
    act_id: ['공부', '기능경기대회'],
    filename: '190403-기능경기대회-공부-1_copy.jpg',
    name: '기능경기대회 공부 1',
    type: 'None',
    startDate: '2019-04-03',
  },

  {
    act_id: ['공부', '기능경기대회'],
    filename: '190403-기능경기대회-공부-2_copy.jpg',
    name: '기능경기대회 공부 2',
    type: 'None',
    startDate: '2019-04-03',
  },

  {
    act_id: ['공부', '기능경기대회'],
    filename: '190403-기능경기대회-공부-3_copy.jpg',
    name: '기능경기대회 공부 3',
    type: 'None',
    startDate: '2019-04-03',
  },

  {
    act_id: ['공부', '기능경기대회'],
    filename: '190403-기능경기대회-공부-4_copy.jpg',
    name: '기능경기대회 공부 4',
    type: 'None',
    startDate: '2019-04-03',
  },

  {
    act_id: ['공부', '기능경기대회'],
    filename: '190403-기능경기대회-공부-5_copy.jpg',
    name: '기능경기대회 공부 5',
    type: 'None',
    startDate: '2019-04-03',
  },

  {
    act_id: ['공부', '기능경기대회'],
    filename: '190403-기능경기대회-공부-6_copy.jpg',
    name: '기능경기대회 공부 6',
    type: 'None',
    startDate: '2019-04-03',
  },

  {
    act_id: ['공부', '기능경기대회'],
    filename: '190403-기능경기대회-공부-7_copy.jpg',
    name: '기능경기대회 공부 7',
    type: 'None',
    startDate: '2019-04-03',
  },

  {
    act_id: ['공부', '기능경기대회'],
    filename: '190403-기능경기대회-공부-8_copy.jpg',
    name: '기능경기대회 공부 8',
    type: 'None',
    startDate: '2019-04-03',
  },

  {
    act_id: ['공부', '기능경기대회'],
    filename: '190403-기능경기대회-공부-9_copy.jpg',
    name: '기능경기대회 공부 9',
    type: 'None',
    startDate: '2019-04-03',
  },

  {
    act_id: ['성일정보고등학교', '기능경기대회'],
    filename: '190403-기능경기대회-문제-0_copy.jpg',
    name: '기능경기대회 문제 0',
    type: 'None',
    startDate: '2019-04-03',
  },

  {
    act_id: ['성일정보고등학교', '기능경기대회'],
    filename: '190403-기능경기대회-문제-2_copy.jpg',
    name: '기능경기대회 문제 2',
    type: 'None',
    startDate: '2019-04-03',
  },

  {
    act_id: ['성일정보고등학교', '기능경기대회'],
    filename: '190403-기능경기대회-문제-3_copy.jpg',
    name: '기능경기대회 문제 3',
    type: 'None',
    startDate: '2019-04-03',
  },

  {
    act_id: ['성일정보고등학교', '기능경기대회'],
    filename: '190403-기능경기대회-문제-4_copy.jpg',
    name: '기능경기대회 문제 4',
    type: 'None',
    startDate: '2019-04-03',
  },

  {
    act_id: ['성일정보고등학교', '기능경기대회'],
    filename: '190403-기능경기대회-문제-5_copy.jpg',
    name: '기능경기대회 문제 5',
    type: 'None',
    startDate: '2019-04-03',
  },

  {
    act_id: ['성일정보고등학교', '기능경기대회'],
    filename: '190403-기능경기대회-문제-6_copy.jpg',
    name: '기능경기대회 문제 6',
    type: 'None',
    startDate: '2019-04-03',
  },

  {
    act_id: ['성일정보고등학교', '기능경기대회', '사진'],
    filename: '190408-기능경기대회-6 copy.jpg',
    name: '기능경기대회 사진 1',
    type: 'photo',
    startDate: '2019-04-08',
  },

  {
    act_id: ['성일정보고등학교', '기능경기대회', '사진'],
    filename: '190408-기능경기대회-5 copy.jpg',
    name: '기능경기대회 사진 2',
    type: 'photo',
    startDate: '2019-04-08',
  },

  {
    act_id: ['성일정보고등학교', '기능경기대회', '사진'],
    filename: '190408-기능경기대회-4 copy.jpg',
    name: '기능경기대회 사진 3',
    type: 'photo',
    startDate: '2019-04-08',
  },


  {
    act_id: ['성일정보고등학교', '기능경기대회', '사진'],
    filename: '190416-1152-00-기능경기대회-현수막 copy.JPG',
    name: '기능경기대회 사진 5',
    type: 'photo',
    startDate: '2019-04-08',
  },

  {
    act_id: ['성일정보고등학교', '기능경기대회', '사진'],
    filename: '190411(20190507_134101).jpg',
    name: '기능경기대회 사진 4',
    type: 'photo',
    startDate: '2019-04-08',
  },
  
  {
    act_id: '개인',
    filename: '190503-면접공부-0_copy.jpg',
    name: '면접공부 0',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접공부-10_copy.jpg',
    name: '면접공부 10',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접공부-11_copy.jpg',
    name: '면접공부 11',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접공부-12_copy.jpg',
    name: '면접공부 12',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접공부-13_copy.jpg',
    name: '면접공부 13',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접공부-14_copy.jpg',
    name: '면접공부 14',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접공부-15_copy.jpg',
    name: '면접공부 15',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접공부-16_copy.jpg',
    name: '면접공부 16',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접공부-17_copy.jpg',
    name: '면접공부 17',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접공부-18_copy.jpg',
    name: '면접공부 18',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접공부-1_copy.jpg',
    name: '면접공부 1',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접공부-2_copy.jpg',
    name: '면접공부 2',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접공부-3_copy.jpg',
    name: '면접공부 3',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접공부-4_copy.jpg',
    name: '면접공부 4',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접공부-5_copy.jpg',
    name: '면접공부 5',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접공부-6_copy.jpg',
    name: '면접공부 6',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접공부-7_copy.jpg',
    name: '면접공부 7',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접공부-8_copy.jpg',
    name: '면접공부 8',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접공부-9_copy.jpg',
    name: '면접공부 9',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접준비-0_copy.jpg',
    name: '면접준비 0',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접준비-10_copy.jpg',
    name: '면접준비 10',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접준비-11_copy.jpg',
    name: '면접준비 11',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접준비-1_copy.jpg',
    name: '면접준비 1',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접준비-2_copy.jpg',
    name: '면접준비 2',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접준비-3_copy.jpg',
    name: '면접준비 3',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접준비-4_copy.jpg',
    name: '면접준비 4',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접준비-5_copy.jpg',
    name: '면접준비 5',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접준비-6_copy.jpg',
    name: '면접준비 6',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접준비-7_copy.jpg',
    name: '면접준비 7',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접준비-8_copy.jpg',
    name: '면접준비 8',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-면접준비-9_copy.jpg',
    name: '면접준비 9',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-이력서-1-0_copy.jpg',
    name: '이력서 1 0',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-이력서-1-1_copy.jpg',
    name: '이력서 1 1',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-이력서-1-2_copy.jpg',
    name: '이력서 1 2',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-이력서-2-0_copy.jpg',
    name: '이력서 2 0',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-이력서-2-1_copy.jpg',
    name: '이력서 2 1',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-이력서-2-2_copy.jpg',
    name: '이력서 2 2',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-이력서-2-3_copy.jpg',
    name: '이력서 2 3',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-이력서-2-4_copy.jpg',
    name: '이력서 2 4',
    type: 'None',
    startDate: '2019-05-03',
  },

  {
    act_id: ['개인', 'KGITBANK'],
    filename: '190503-케이지아이티뱅크-수료증_copy.jpg',
    name: '케이지아이티뱅크 수료증',
    type: '수료증 ',
    startDate: '2019-05-03',
  },

  {
    act_id: '개인',
    filename: '190503-포트폴리오_copy.jpg',
    name: '포트폴리오',
    type: 'portfolio',
    startDate: '2019-05-03',
  },

  {
    act_id: ['기능경기대회', '1위(금메달)'],
    filename: '190408-기능경기대회-1위(금메달)_copy.jpg',
    name: '기능경기대회 1위(금메달)',
    type: 'award',
    startDate: '2019-04-08',
  },

  {
    act_id: ['성일정보고등학교', '표창장', '기능경기대회', '경기도교육청'],
    filename: '190529-표창장-사이버보안(1위)_copy.jpg',
    name: '표창장 사이버보안(1위)',
    type: 'award',
    startDate: '2019-05-29',
  },

  {
    act_id: ['개인', '자격증'],
    filename: '190605-SMAT3_copy.jpg',
    name: 'SMAT3',
    type: '자격증',
    startDate: '2019-06-05',
  },

  {
    act_id: '성일정보고등학교',
    filename: '190611-1233-00_copy.JPG',
    name: '졸업사진 촬영날',
    type: 'photo',
    startDate: '2019-06-11',
  },

  {
    act_id: '성일정보고등학교',
    filename: '190717-교과우수상-전자상거래실무_copy.jpg',
    name: '교과우수상 전자상거래실무',
    type: 'award',
    startDate: '2019-07-17',
  },

  {
    act_id: ['개인', '자격증'],
    filename: '190718-정보처리기능사_copy.jpg',
    name: '정보처리기능사',
    type: '자격증',
    startDate: '2019-07-18',
  },

  {
    act_id: ['개인', '자격증'],
    filename: '190807-전자상거래운용사_copy.jpg',
    name: '전자상거래운용사',
    type: '자격증',
    startDate: '2019-07-18',
  },

  {
    act_id: ['개인', '자격증'],
    filename: 'CCNA_자격_인증.jpg',
    name: 'CCNA',
    type: '자격증',
    startDate: '2019-08-14',
  },

  {
    act_id: ['성일정보고등학교', '동아리', 'IT네트워크동아리'],
    filename: '190828-1117-00.jpeg',
    name: 'IT네트워크동아리 1',
    type: '활동',
    startDate: '2019-08-28',
  },

  {
    act_id: ['성일정보고등학교', '동아리', 'IT네트워크동아리'],
    filename: '190828-중소기업 기술보호를 위한 모의 해킹 체험(IT네트워크동아리)-2 copy.jpg',
    name: 'IT네트워크동아리 3',
    type: '활동',
    startDate: '2019-08-28',
  },

  {
    act_id: ['성일정보고등학교', '동아리', 'IT네트워크동아리'],
    filename: '190828-중소기업 기술보호를 위한 모의 해킹 체험(IT네트워크동아리)-1 copy.jpg',
    name: 'IT네트워크동아리 2',
    type: '활동',
    startDate: '2019-08-28',
  },

  {
    act_id: ['성일정보고등학교', '동아리', 'IT네트워크동아리'],
    filename: '190828-중소기업 기술보호를 위한 모의 해킹 체험(IT네트워크동아리)-3 copy.jpg',
    name: 'IT네트워크동아리 4',
    type: '활동',
    startDate: '2019-08-28',
  },

  {
    act_id: '성일정보고등학교',
    filename: '191030-정보기술능력경진대회-장려상(3위)_copy.jpg',
    name: '정보기술능력경진대회 장려상(3위)',
    type: 'award',
    startDate: '2019-10-30',
  },

  {
    act_id: '성일정보고등학교',
    filename: '191031-NSC수리능력경진대회-장려상(3위)_copy.jpg',
    name: 'NSC수리능력경진대회 장려상(3위)',
    type: 'award',
    startDate: '2019-10-31',
  },

  {
    act_id: ['성일정보고등학교', '성남일자리센터', '성남시장'],
    filename: '191101-특성화고맞춤형교육-수료증_copy.jpg',
    name: '특성화고맞춤형교육 수료증',
    type: '수료증',
    startDate: '2019-11-01',
  },

  {
    act_id: '성일정보고등학교',
    filename: '200110-개근상_copy.jpg',
    name: '개근상',
    type: 'None',
    startDate: '2020-01-10',
  },

  {
    act_id: '성일정보고등학교',
    filename: '200110-졸업장_copy.jpg',
    name: '졸업장',
    type: '수료증',
    startDate: '2020-01-10',
  },

  {
    act_id: ['성일정보고등학교', '기능경기대회'],
    filename: '200110-기능상_copy.jpg',
    name: '기능상',
    type: 'None',
    startDate: '2020-01-10',
  },

  {
    act_id: ['개인', '자격증'],
    filename: '200117-GTQ-il_copy.jpg',
    name: 'GTQ 일러스트레이터',
    type: '자격증',
    startDate: '2020-01-17',
  },
  {
    act_id: ['인하공업전문대학', '학점은행제'],
    filename: '인하공전_학점은행제.png',
    name: '인하공전 및 학점은행제 로고',
    type: 'thumbnail',
    startDate: '2020-03-02',
  },

  {
    act_id: ['아르바이트', '뉴스킨'],
    filename: '200805-아르바이트-뉴스킨-교육훈련서약서_copy.jpg',
    name: '아르바이트 뉴스킨 교육훈련서약서',
    type: 'None',
    startDate: '2020-08-05',
  },

  {
    act_id: ['아르바이트', '뉴스킨', '근로계약서'],
    filename: '200806-아르바이트-뉴스킨-근로계약서_copy.jpg',
    name: '아르바이트 뉴스킨 근로계약서',
    type: 'None',
    startDate: '2020-08-06',
  },

  {
    act_id: ['개인', '자격증'],
    filename: '201113-컴활1급_copy.jpg',
    name: '컴활1급',
    type: '자격증',
    startDate: '2020-11-13',
  },

  {
    act_id: ['아르바이트', '배스킨라빈스야탑홈플러스점', '근로계약서'],
    filename: '210317-배스킨라빈스야탑홈플러스점-근로계약서_copy.jpg',
    name: '배스킨라빈스야탑홈플러스점 근로계약서',
    type: 'None',
    startDate: '2021-03-17',
  },

  {
    act_id: ['아르바이트', '배스킨라빈스야탑홈플러스점'],
    filename: '210323-배스킨라빈스야탑홈플러스점-0_copy.jpg',
    name: '배스킨라빈스야탑홈플러스점 0',
    type: 'None',
    startDate: '2021-03-23',
  },

  {
    act_id: ['아르바이트', '배스킨라빈스야탑홈플러스점'],
    filename: '210323-배스킨라빈스야탑홈플러스점-1_copy.jpg',
    name: '배스킨라빈스야탑홈플러스점 1',
    type: 'None',
    startDate: '2021-03-23',
  },

  {
    act_id: ['아르바이트', '배스킨라빈스야탑홈플러스점'],
    filename: '210323-배스킨라빈스야탑홈플러스점-2_copy.jpg',
    name: '배스킨라빈스야탑홈플러스점 2',
    type: 'None',
    startDate: '2021-03-23',
  },

  {
    act_id: ['아르바이트', '배스킨라빈스야탑홈플러스점'],
    filename: '210323-배스킨라빈스야탑홈플러스점-3_copy.jpg',
    name: '배스킨라빈스야탑홈플러스점 3',
    type: 'None',
    startDate: '2021-03-23',
  },

  {
    act_id: ['아르바이트', '배스킨라빈스야탑홈플러스점', '근로계약서'],
    filename: '210323-배스킨라빈스야탑홈플러스점-근로계약서_copy.jpg',
    name: '배스킨라빈스야탑홈플러스점 근로계약서',
    type: 'None',
    startDate: '2021-03-23',
  },

  {
    act_id: ['codeit', '대코캠', '대코캠2기'],
    filename: '210331-대코캠2기_copy.jpg',
    name: '대코캠2기',
    type: 'None',
    startDate: '2021-03-31',
  },

  {
    act_id: ['인하공업전문대학', 'USAMO', '유사모'],
    filename: 'USAMO.png',
    name: 'USAMO 로고',
    type: 'None',
    startDate: '2021-06-01',
  },

  {
    act_id: ['인하공업전문대학', 'USAMO', '유사모', '인공지능빅데이터센터', '근로장학생'],
    filename: 'C-AI-D.png',
    name: '인공지능 빅데이터 센터 로고',
    type: 'None',
    startDate: '2021-06-01',
  },

  {
    act_id: ['인하공업전문대학', 'USAMO', '유사모', '프로젝트', '블록코딩'],
    filename: 'block-coding(codeb).png',
    name: 'CodeB',
    type: 'None',
    startDate: '2021-07-01',
  },

  {
    act_id: ['인하공업전문대학', 'USAMO', '유사모', '프로젝트', '블록코딩'],
    filename: 'block-coding(pyot).png',
    name: 'PyoT',
    type: 'None',
    startDate: '2021-08-01',
  },

  {
    act_id: ['인하공업전문대학', 'USAMO', '유사모', '프로젝트', '블록코딩'],
    filename: 'block-coding(DIY).png',
    name: 'DIY',
    type: 'None',
    startDate: '2021-06-01',
  },

  {
    act_id: ['인하공업전문대학', 'USAMO', '유사모', '인공지능빅데이터센터', '근로장학생'],
    filename: '국가근로장학금-근로내역증명서-최종.jpg',
    name: '인공지능 빅데이터 센터 근로장학생 근로내역증명서(주민번호 뒷자리 가림)',
    type: 'None',
    startDate: '2021-06-01',
  },

  // {
  //   act_id: ['산학협력공동교육캠프', '인하공업전문대학', 'USAMO', '유사모'],
  //   filename: '210604-0909-00.JPG',
  //   name: '산학협력공동교육캠프',
  //   type: 'None',
  //   startDate: '2021-06-04',
  // },

  {
    act_id: ['산학협력공동교육캠프', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '210604-0.png',
    name: '산학협력공동교육캠프',
    type: 'None',
    startDate: '2021-06-04',
  },

  {
    act_id: ['산학협력공동교육캠프', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '210604-0902-01.JPG',
    name: '산학협력공동교육캠프',
    type: 'None',
    startDate: '2021-06-04',
  },

  {
    act_id: ['산학협력공동교육캠프', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '210604-0909-01.JPG',
    name: '산학협력공동교육캠프',
    type: 'None',
    startDate: '2021-06-04',
  },

  {
    act_id: ['산학협력공동교육캠프', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '210604.jpg',
    name: '산학협력공동교육캠프',
    type: 'None',
    startDate: '2021-06-04',
  },

  {
    act_id: ['산학협력공동교육캠프', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '210604-1201-00.jpg',
    name: '산학협력공동교육캠프',
    type: 'None',
    startDate: '2021-06-04',
  },

  {
    act_id: ['산학협력공동교육캠프', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '210604-1202-00.jpg',
    name: '산학협력공동교육캠프',
    type: 'None',
    startDate: '2021-06-04',
  },

  // {
  //   act_id: ['산학협력공동교육캠프', '인하공업전문대학', 'USAMO', '유사모'],
  //   filename: '210604-1940-00.jpg',
  //   name: '산학협력공동교육캠프',
  //   type: 'None',
  //   startDate: '2021-06-04',
  // },

  // {
  //   act_id: ['산학협력공동교육캠프', '인하공업전문대학', 'USAMO', '유사모'],
  //   filename: '210604-1940-01.jpg',
  //   name: '산학협력공동교육캠프',
  //   type: 'None',
  //   startDate: '2021-06-04',
  // },

  {
    act_id: ['산학협력공동교육캠프', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '210604-애주일지-1.jpg',
    name: '산학협력공동교육캠프',
    type: 'None',
    startDate: '2021-06-04',
  },

  {
    act_id: ['산학협력공동교육캠프', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '210604-애주일지-2.jpg',
    name: '산학협력공동교육캠프',
    type: 'None',
    startDate: '2021-06-04',
  },


  {
    act_id: ['산학협력공동교육캠프', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '210604-산학협력공동교육캠프-수료증_copy.jpg',
    name: '산학협력공동교육캠프 수료증',
    type: '수료증',
    startDate: '2021-06-04',
  },

  {
    act_id: ['산학협력공동교육캠프', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '210605-0016-00.jpg',
    name: '산학협력공동교육캠프 상장',
    type: 'award',
    startDate: '2021-06-04',
  },

  {
    act_id: ['산학협력공동교육캠프', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '210604-산학협력공동교육캠프-상장.JPG',
    name: '산학협력공동교육캠프 상장',
    type: 'award',
    startDate: '2021-06-04',
  },

  {
    act_id: ['IT4U', '인하공업전문대학', 'USAMO', '유사모', '발표'],
    filename: '210706-1548-00.png',
    name: 'IT4U',
    type: 'None',
    startDate: '2021-07-06',
  },

  {
    act_id: ['IT4U', '인하공업전문대학', 'USAMO', '유사모', '수강'],
    filename: 'USAMO-9.jpeg',
    name: 'IT4U',
    type: 'None',
    startDate: '2021-07-06',
  },

  {
    act_id: ['IT4U', '인하공업전문대학', 'USAMO', '유사모'],
    filename: 'USAMO-10.jpeg',
    name: 'IT4U',
    type: 'None',
    startDate: '2021-07-06',
  },

  {
    act_id: ['인하공업전문대학', 'USAMO', '유사모', '교사연수', '인천시교육청', '인천시교사연수', '인천교사연수21하계'],
    filename: '210726-교사연수-0.png',
    name: '인천시 교육청 교사연수 0',
    type: 'None',
    startDate: '2021-07-26',
  },


  {
    act_id: ['인하공업전문대학', 'USAMO', '유사모', '교사연수', '인천시교육청', '인천시교사연수', '인천교사연수21하계'],
    filename: '210802-0907-00.jpg',
    name: '인천시 교육청 교사연수 1',
    type: 'None',
    startDate: '2021-08-02',
  },

  {
    act_id: ['인천시교육청', '인천과학대제전23회'],
    filename: '211023-인천과학대제전-2.png',
    name: '제 23회 인천과학대제전 0',
    type: 'None',
    startDate: '2021-10-23',
  },

  {
    act_id: ['인천시교육청', '인천과학대제전23회'],
    filename: '211023-인천과학대제전-7.png',
    name: '제 23회 인천과학대제전 0',
    type: 'None',
    startDate: '2021-10-23',
  },

  {
    act_id: ['인천시교육청', '인천과학대제전23회'],
    filename: '211023-인천과학대제전-8.png',
    name: '제 23회 인천과학대제전 0',
    type: 'None',
    startDate: '2021-10-23',
  },

  {
    act_id: ['인천시교육청', '인천과학대제전23회'],
    filename: '211023-인천과학대제전-9.png',
    name: '제 23회 인천과학대제전 0',
    type: 'None',
    startDate: '2021-10-23',
  },

  {
    act_id: ['공학페스티벌', '창의적종합설계경진대회', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '21-공학페스티벌.jpg',
    name: '포스터',
    type: 'None',
    startDate: '2021-11-11',
  },

  {
    act_id: ['공학페스티벌', '창의적종합설계경진대회', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '21-공학페스티벌-3.png',
    name: '온라인 전시회',
    type: 'None',
    startDate: '2021-11-11',
  },

  {
    act_id: ['공학페스티벌', '창의적종합설계경진대회', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '21-공학페스티벌-2.png',
    name: '온라인 전시회',
    type: 'None',
    startDate: '2021-11-11',
  },

  {
    act_id: ['공학페스티벌', '창의적종합설계경진대회', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '21-공학페스티벌-1.png',
    name: '온라인 전시회',
    type: 'None',
    startDate: '2021-11-11',
  },

  {
    act_id: ['공학페스티벌', '창의적종합설계경진대회', '인하공업전문대학', 'USAMO', '유사모'],
    filename: 'USAMO-26.jpeg',
    name: '창의적종합설계경진대회 특별상 목록',
    type: 'award',
    startDate: '2021-11-12',
  },

  {
    act_id: ['공학페스티벌', '창의적종합설계경진대회', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '211112-창의적종합설계경진대회-상장_copy.jpg',
    name: '창의적종합설계경진대회 특별상',
    type: 'award',
    startDate: '2021-11-12',
    description: '대한상공회의소'
  },

  {
    act_id: ['공학페스티벌', '창의적종합설계경진대회', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '211104-창의적종합설계경진대회-동상.png',
    name: '창의적종합설계경진대회 동상',
    type: 'None',
    startDate: '2021-11-04',
  },

  {
    act_id: ['공학페스티벌', '창의적종합설계경진대회', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '21-공학페스티벌-경진대회-참가인증서.jpg',
    name: '창의적종합설계경진대회 참가인증서',
    type: 'award',
    startDate: '2021-11-12',
    description: '대한상공회의소'
  },

  {
    act_id: ['공학페스티벌', '창의적종합설계경진대회', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '창의공학경진대회 시연영상.mp4',
    name: '창의적종합설계경진대회 시연영상',
    type: 'award',
    startDate: '2021-11-12',
    description: '대한상공회의소'
  },

  {
    act_id: ['공학페스티벌', '창의적종합설계경진대회', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '창의공학경진대회 발표영상.mp4',
    name: '창의적종합설계경진대회 발표',
    type: 'award',
    startDate: '2021-11-12',
    description: '대한상공회의소'
  },

  {
    act_id: ['해커톤', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '211029-1232-01.jpg',
    name: '해커톤',
    type: 'None',
    startDate: '2021-10-29',
  },
  
  {
    act_id: ['해커톤', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '211030-0006-01.jpg',
    name: '해커톤',
    type: 'None',
    startDate: '2021-10-30',
  },

  {
    act_id: ['해커톤', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '211030-1932-01.jpg',
    name: '해커톤',
    type: 'None',
    startDate: '2021-10-30',
  },

  {
    act_id: ['해커톤', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '211031-1300-00.jpg',
    name: '해커톤',
    type: 'None',
    startDate: '2021-10-31',
  },

  {
    act_id: ['해커톤', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '211031-1638-00.jpg',
    name: '해커톤',
    type: 'None',
    startDate: '2021-10-31',
  },

  {
    act_id: ['해커톤', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '해커톤-발표.mp4',
    name: '해커톤',
    type: 'None',
    startDate: '2021-10-31',
  },

  {
    act_id: ['해커톤', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '해커톤_PPT_감속기 기어 이상_AYE8Tt.mp4',
    name: '해커톤',
    type: 'None',
    startDate: '2021-10-31',
  },

  {
    act_id: ['해커톤', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '해커톤_PPT_전동기 기어 이상_E5a2ZH.mp4',
    name: '해커톤',
    type: 'None',
    startDate: '2021-10-31',
  },

  {
    act_id: ['해커톤', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '해커톤_PPT_정상_KH2RZq.mp4',
    name: '해커톤',
    type: 'None',
    startDate: '2021-10-31',
  },

  // {
  //   act_id: ['세미나', '인하공업전문대학', 'USAMO', '유사모'],
  //   filename: 'USAMO-15.jpeg',
  //   name: '대학원-세미나',
  //   type: 'None',
  //   startDate: '2021-11-01',
  // },

  // {
  //   act_id: ['세미나', '인하공업전문대학', 'USAMO', '유사모'],
  //   filename: 'USAMO-16.jpeg',
  //   name: '대학원-세미나',
  //   type: 'None',
  //   startDate: '2021-11-01',
  // },

  // {
  //   act_id: ['세미나', '인하공업전문대학', 'USAMO', '유사모'],
  //   filename: 'USAMO-17.jpeg',
  //   name: '대학원-세미나',
  //   type: 'None',
  //   startDate: '2021-11-01',
  // },

  {
    act_id: ['세미나', '인하공업전문대학', 'USAMO', '유사모', '수강'],
    filename: 'USAMO-18.jpeg',
    name: '대학원-세미나',
    type: 'None',
    startDate: '2021-11-01',
  },

  {
    act_id: ['인하공업전문대학', 'USAMO', '유사모', '교사연수', '전라남도교육청', '전라남도교사연수'],
    filename: '211106-전라남도교육청-교사연수.png',
    name: '전라남도 교육청 교사연수',
    type: 'None',
    startDate: '2021-11-06',
  },

  {
    act_id: ['인하공업전문대학', 'USAMO', '유사모', '교사연수', '전라남도교육청', '전라남도교사연수', '전라남도교사연수21동계'],
    filename: '211106-1651-00.jpg',
    name: '전라남도 교육청 교사연수',
    type: 'None',
    startDate: '2021-11-06',
  },

  {
    act_id: ['인하공업전문대학', 'USAMO', '유사모', '교사연수', '전라남도교육청', '전라남도교사연수'],
    filename: 'USAMO-19.jpeg.png',
    name: '전라남도 교육청 교사연수',
    type: 'None',
    startDate: '2021-11-06',
  },

  // {
  //   act_id: ['인하공업전문대학', 'USAMO', '유사모', '서버세미나'],
  //   filename: 'USAMO-23.jpeg',
  //   name: '서버세미나',
  //   type: 'None',
  //   startDate: '2021-11-12',
  // },

  {
    act_id: ['인하공업전문대학', 'USAMO', '유사모', '서버세미나', '발표'],
    filename: 'USAMO-25.jpeg',
    name: '서버세미나',
    type: 'None',
    startDate: '2021-11-12',
  },

  // {
  //   act_id: ['인하공업전문대학', 'USAMO', '유사모', '서버세미나'],
  //   filename: 'USAMO-24.jpeg',
  //   name: '서버세미나',
  //   type: 'None',
  //   startDate: '2021-11-12',
  // },

  {
    act_id: ['인하공업전문대학', 'USAMO', '유사모', '특강', '수강'],
    filename: 'USAMO-20.jpeg',
    name: '교수님_특강',
    type: 'None',
    startDate: '2021-12-06',
  },

  {
    act_id: ['인하공업전문대학', 'USAMO', '유사모', '특강', '수강'],
    filename: 'USAMO-21.jpeg',
    name: '교수님_특강',
    type: 'None',
    startDate: '2021-12-06',
  },

  {
    act_id: ['인하공업전문대학', 'USAMO', '유사모', '특강', 'ABC아카데미'],
    filename: 'USAMO-31.jpeg',
    name: '한백전자 특강',
    type: 'None',
    startDate: '2021-11-17',
  },

  {
    act_id: ['인하공업전문대학', 'USAMO', '유사모', '특강', 'ABC아카데미'],
    filename: 'USAMO-32.jpeg',
    name: '한백전자 특강',
    type: 'None',
    startDate: '2021-11-17',
  },

  // {
  //   act_id: ['인하공업전문대학', 'USAMO', '유사모', '특강', '수강'],
  //   filename: 'USAMO-33.jpeg',
  //   name: '한백전자 특강',
  //   type: 'None',
  //   startDate: '2021-11-17',
  // },
  
  // {
  //   act_id: ['인하공업전문대학', 'USAMO', '유사모', '특강', '수강'],
  //   filename: 'USAMO-34.jpeg',
  //   name: '한백전자 특강',
  //   type: 'None',
  //   startDate: '2021-11-17',
  // },

  // {
  //   act_id: ['인하공업전문대학', 'USAMO', '유사모', '특강', '수강'],
  //   filename: 'USAMO-36.jpeg',
  //   name: '한백전자 특강',
  //   type: 'None',
  //   startDate: '2021-11-17',
  // },
  
  {
    act_id: ['M&A경진대회', '인하공업전문대학'],
    filename: '211213-인하공전-M&A경진대회-은상_copy.jpg',
    name: '인하공전 M&A경진대회 은상',
    type: 'None',
    startDate: '2021-12-13',
  },

  {
    act_id: ['M&A경진대회', '인하공업전문대학'],
    filename: 'M&A경진대회-발표영상.mp4',
    name: 'M&A경진대회',
    type: 'None',
    startDate: '2021-12-13',
  },

  {
    act_id: ['인하공업전문대학', 'USAMO', '유사모', '서비스학부예제'],
    filename: 'USAMO-54.jpeg',
    name: '서비스학부 예제 제작',
    type: 'None',
    startDate: '2022-01-04',
  },

  {
    act_id: ['인하공업전문대학', 'USAMO', '유사모', '인천시교사연수22동계'],
    filename: 'USAMO-50.jpeg',
    name: '인천시교사연수22동계',
    type: 'None',
    startDate: '2022-01-21',
  },

  {
    act_id: ['논문', '인공지능교육학회', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '인공지능 융합 직업 교육을 위한 파이썬 블록과 텍스트 공동 코딩 모듈 설계.mp4',
    name: '인공지능교육학회 2021년 동계학술대회 논문',
    type: 'None',
    startDate: '2022-12-10',
  },

  {
    act_id: ['논문', '한국컴퓨터정보학회', '인하공업전문대학', 'USAMO', '유사모'],
    filename: '직업교육과 인공지능 융합을 위한 파이썬 비주얼 프로그래밍 모듈 설계.mp4',
    name: '한국컴퓨터정보학회 2022년 동계학술대회 논문',
    type: 'None',
    startDate: '2022-01-01',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: 'INHA_AIR.mp4',
    name: 'INHA AIR 시연 영상',
    type: 'None',
    startDate: '2021-06-04',
    remotePathOverride: 'Photos/Projects/INHA_AIR/INHA_AIR.mp4',
  },


  {
    act_id: ['개인', '자격증'],
    filename: '220215-운전면허증1종보통_copy.jpg',
    name: '운전면허증 1종보통',
    type: '자격증',
    startDate: '2022-02-15',
  },

  {
    act_id: '인하공업전문대학',
    filename: '220216-휴학원서_copy.jpg',
    name: '휴학원서',
    type: 'None',
    startDate: '2022-02-16',
  },

  {
    act_id: ['아르바이트', '긱스타PC방', '근로계약서'],
    filename: '220627-긱스타PC방-근로계약서-0_copy.jpg',
    name: '긱스타PC방 근로계약서 0',
    type: 'None',
    startDate: '2022-06-27',
  },

  {
    act_id: ['아르바이트', '긱스타PC방', '근로계약서'],
    filename: '220627-긱스타PC방-근로계약서-1_copy.jpg',
    name: '긱스타PC방 근로계약서 1',
    type: 'None',
    startDate: '2022-06-27',
  },

  {
    act_id: ['아르바이트', '긱스타PC방', '근로계약서'],
    filename: '220627-긱스타PC방-근로계약서-2_copy.jpg',
    name: '긱스타PC방 근로계약서 2',
    type: 'None',
    startDate: '2022-06-27',
  },

  {
    act_id: '2022-OSSCA',
    filename: 'RustPython_photos_07.JPG',
    name: 'RustPython 팀 사진 07',
    type: 'None',
    startDate: '2022-07-09',
  },

  {
    act_id: '2022-OSSCA',
    filename: 'RustPython_photos_13.png',
    name: 'RustPython 팀 사진 13',
    type: 'None',
    startDate: '2022-07-09',
  },

  {
    act_id: '2022-OSSCA',
    filename: 'RustPython_photos_14.png',
    name: 'RustPython 팀 사진 14',
    type: 'None',
    startDate: '2022-07-09',
  },

  {
    act_id: '2022-OSSCA',
    filename: 'RustPython_photos_02.JPG',
    name: 'RustPython 팀 사진 02',
    type: 'None',
    startDate: '2022-07-09',
  },

  {
    act_id: '2022-OSSCA',
    filename: 'RustPython_photos_03.JPG',
    name: 'RustPython 팀 사진 03',
    type: 'None',
    startDate: '2022-07-09',
  },

  {
    act_id: '2022-OSSCA',
    filename: 'RustPython_photos_10.jpg',
    name: 'RustPython 팀 사진 10',
    type: 'None',
    startDate: '2022-07-09',
  },

  {
    act_id: '2022-OSSCA',
    filename: 'RustPython_photos_15.png',
    name: 'RustPython 팀 사진 15',
    type: 'None',
    startDate: '2022-07-09',
  },

  {
    act_id: '2022-OSSCA',
    filename: '22 OSSCA Challenges 수료증_245_김연우_copy.jpg',
    name: 'Challenges 수료증',
    type: '수료증',
    startDate: '2022-08-10',
  },

  {
    act_id: '2022-OSSCA',
    filename: '22 오픈소스 컨트리뷰션 아카데미 수료증_RustPython_김연우_copy.jpg',
    name: '수료증',
    type: '수료증',
    startDate: '2022-10-14',
  },

  {
    act_id: '2022-OSSCA',
    filename: '221014-OSSCA-리드멘티_copy.jpg',
    name: 'OSSCA 리드멘티',
    type: 'None',
    startDate: '2022-10-14',
  },

  {
    act_id: '2022-OSSCA',
    filename: '22 오픈소스 컨트리뷰션 아카데미_상장_대상_RustPython_copy.jpg',
    name: '상장',
    type: 'award',
    startDate: '2022-12-06',
  },

  {
    act_id: '2022-OSSCA',
    filename: '221206-오픈소스컨트리뷰션아카데미-대상_copy.jpg',
    name: '오픈소스컨트리뷰션아카데미 대상',
    type: 'award',
    startDate: '2022-12-06',
  },

  {
    act_id: '인하공업전문대학',
    filename: '230117-자퇴원서_copy.jpg',
    name: '자퇴원서',
    type: 'None',
    startDate: '2023-01-17',
  },

  {
    act_id: ['학점은행제', '학사'],
    filename: '김연우-영문-학위증명서-202512111236.jpg',
    name: '학점은행제 학위증명서(영문)',
    type: 'None',
    startDate: '2023-01-18',
  },

  {
    act_id: ['학점은행제', '학사'],
    filename: '김연우-영문-성적증명서-202512170941.jpg',
    name: '학점은행제 성적증명서(영문)',
    type: 'None',
    startDate: '2023-01-18',
  },

  {
    act_id: ['인하공업전문대학', '학사'],
    filename: 'inha_technical_college_Transcript.jpg',
    name: '인하공업전문대학 성적증명서(영문)',
    type: 'None',
    startDate: '2020-03-02',
  },

  {
    act_id: ['학점은행제', '학사'],
    filename: '김연우-국문-학위증명서-202512111235.jpg',
    name: '학점은행제 학위증명서(국문)',
    type: 'None',
    startDate: '2023-01-18',
  },

  {
    act_id: ['학점은행제', '학사'],
    filename: '김연우-국문-성적증명서-202512111238.jpg',
    name: '학점은행제 성적증명서(국문)',
    type: 'None',
    startDate: '2023-01-18',
  },

  {
    act_id: ['인하공업전문대학', '학사'],
    filename: '인하공업전문대학_성적증명서.jpg',
    name: '인하공업전문대학 성적증명서(국문)',
    type: 'None',
    startDate: '2020-03-02',
  },


  {
    act_id: ['addinedu', 'StoneSpring'],
    filename: '전체동작.mp4',
    name: 'StoneSpring 전체동작 영상',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'Photos/Projects/StoneSpring/전체동작.mp4',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '통합영상.mp4',
    name: '구현',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/통합영상.mp4',
  },
  
  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: 'Shoepernoma_판넬.jpg',
    name: 'Shoepernoma 판넬',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/Shoepernoma_판넬.jpg',
  },
  
  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: 'Shoepernoma_판넬(가로).jpg',
    name: 'Shoepernoma 판넬',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/Shoepernoma_판넬(가로).jpg',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '전체동작-시도.gif',
    name: '구현',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/전체동작-시도.gif',
  },


  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: 'D7.주행LIVE-1.gif',
    name: '구현',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/D7.주행LIVE-1.gif',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: 'D7.주행LIVE-2.gif',
    name: '구현',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/D7.주행LIVE-2.gif',
  },

// /// 여기가 메인 두 개
  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '개발과정-주행시행착오-모음.mp4',
    name: '구현',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/개발과정-주행시행착오-모음.mp4',
  },

//   {
//     act_id: ['addinedu', 'Shoepernoma'],
//     filename: '개발과정-주행시행착오-모음(2배속).gif',
//     name: '구현',
//     type: 'None',
//     startDate: '2025-04-09',
//     remotePathOverride: 'Photos/Projects/Shoepernoma/개발과정-주행시행착오-모음(2배속).gif',
//   },

//   {
//     act_id: ['addinedu', 'Shoepernoma'],
//     filename: '둠칫둠칫(2배속).gif',
//     name: '구현',
//     type: 'None',
//     startDate: '2025-04-09',
//     remotePathOverride: 'Photos/Projects/Shoepernoma/둠칫둠칫(2배속).gif',
//   },

// 아래부터 따로

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '개발과정-주행시행착오-0.gif',
    name: '구현',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/개발과정-주행시행착오-0.gif',
  },


  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '개발과정-주행시행착오-1-중간까지잘감.gif',
    name: '구현',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/개발과정-주행시행착오-1-중간까지잘감.gif',
  },


  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '개발과정-주행시행착오-2.gif',
    name: '구현',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/개발과정-주행시행착오-2.gif',
  },


  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '개발과정-주행시행착오-3.gif',
    name: '구현',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/개발과정-주행시행착오-3.gif',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '개발과정-주행시행착오-5.gif',
    name: '구현',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/개발과정-주행시행착오-5.gif',
  },


  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '개발과정-주행시행착오-6.gif',
    name: '구현',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/개발과정-주행시행착오-6.gif',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '개발과정-주행시행착오-4-중간에벽비빔.gif',
    name: '구현',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/개발과정-주행시행착오-4-중간에벽비빔.gif',
  },

  //// 여기까지 주행 영상
  //// 아래부터는 기술 설명용

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '(판넬)센서퓨전.png',
    name: '설명 참고 사진',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/(판넬)센서퓨전.png',
  },

  
  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '구현설명4-Cartographer.gif',
    name: '구현',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/구현설명4-Cartographer.gif',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '구현설명2-A*알고리즘.jpeg',
    name: '구현',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/구현설명2-A*알고리즘.jpeg',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '구현설명3-A*알고리즘.jpeg',
    name: '구현',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/구현설명3-A*알고리즘.jpeg',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '개발과정-아루코마커.gif',
    name: '구현',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/개발과정-아루코마커.gif',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '구현설명1-초기위치보정.png',
    name: '구현',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/구현설명1-초기위치보정.png',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: 'Overview of pose estimation using multiple ArUco markers(applsci-14-10225-g001).png',
    name: '설명 참고 사진',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/Overview of pose estimation using multiple ArUco markers(applsci-14-10225-g001).png',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '구현설명5-kalman-filter.png',
    name: '구현',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/구현설명5-kalman-filter.png',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: 'System_Flow.png',
    name: '구현', 
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/System_Flow.png',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: 'G1.상품QR코드스캔.png',
    name: '구현',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/G1.상품QR코드스캔.png',
  },


  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: 'G2.스캔결과.png',
    name: '구현',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/G2.스캔결과.png',
  },


  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: 'G3.배송요청.png',
    name: '구현',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/G3.배송요청.png',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: 'gui_manager.png',
    name: '구현',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/gui_manager.png',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '시스템_아키텍처(희망).drawio.png',
    name: 'Shoepernoma 시스템 아키텍처',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/시스템_아키텍처(희망).drawio.png',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '시스템_아키텍처(최종_요약).drawio.png',
    name: 'Shoepernoma 시스템 아키텍처',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/시스템_아키텍처(최종_요약).drawio.png',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: 'Map_Degisn(가로).drawio.png',
    name: 'Map Design(가로)',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/Map_Degisn(가로).drawio.png',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: 'Map_Degisn(세로).png',
    name: 'Map Design(세로)',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/Map_Degisn(세로).png',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '통신(interface)_요약.png',
    name: '통신(interface)',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/통신(interface)_요약.png',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: 'scenario-1(Product information inquiry).png',
    name: 'Scenario 1',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/scenario-1(Product information inquiry).png',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: 'scenario-2(Product request).png',
    name: 'Scenario 2',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/scenario-2(Product request).png',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '1. User_Device Provisioning and User Authentication.drawio.png',
    name: 'Sequence Diagram 1',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/1. User_Device Provisioning and User Authentication.drawio.png',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '2. inventory_verification_mode.png',
    name: 'Sequence Diagram 2',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/2. inventory_verification_mode.png',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '3. task_assignment_flow.drawio.png',
    name: 'Sequence Diagram 3',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/3. task_assignment_flow.drawio.png',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '4. Roscar_monitoring_and_management.png',
    name: 'Sequence Diagram 4',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/4. Roscar_monitoring_and_management.png',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '5. log_and_audit_flow.png',
    name: 'Sequence Diagram 5',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/5. log_and_audit_flow.png',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '6. Roscar_sensor_and_state_reporting.png',
    name: 'Sequence Diagram 6',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/6. Roscar_sensor_and_state_reporting.png',
},

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '7. ai_perception_pipeline.png',
    name: 'Sequence Diagram 7',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/7. ai_perception_pipeline.png',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '8. roscar_control_and_motor_flow.png',
    name: 'Sequence Diagram 8',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/8. roscar_control_and_motor_flow.png',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: '9. inventory-verification-mode.png',
    name: 'Sequence Diagram 9',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/9. inventory-verification-mode.png',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: 'Robot_State_Diagram-Copy of Copy of roscars.drawio.png',
    name: '전체 주행 상태 정의',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/Robot_State_Diagram-Copy of Copy of roscars.drawio.png',
  },


  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: 'roscars_erd.png',
    name: 'roscars erd',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/roscars_erd.png',
  },

  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: 'roscars_log_erd.png',
    name: 'roscars log erd',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/roscars_log_erd.png',
  },
  
  {
    act_id: ['addinedu', 'Shoepernoma'],
    filename: 'pinky-spec-3.png',
    name: 'pinky spec 3',
    type: 'None',
    startDate: '2025-04-09',
    remotePathOverride: 'Photos/Projects/Shoepernoma/pinky-spec-3.png',
  },

{
    act_id: 'kdt-addinedu',
    filename: '250527-애드인에듀-최우수상_copy.jpg',
    name: '최우수상',
    type: 'award',
    startDate: '2025-05-27',
    description: '애드인에듀 아카데미 구로가산센터장',
  },

  {
    act_id: 'kdt-addinedu',
    filename: '250527-애드인에듀-공로상_copy.jpg',
    name: '공로상',
    type: 'award',
    startDate: '2025-05-27',
    description: '애드인에듀 아카데미 구로가산센터장',
  },

  {
    act_id: 'kdt-addinedu',
    filename: '250527-애드인에듀-수료증_copy.jpg',
    name: '수료증',
    type: '수료증',
    startDate: '2025-05-27',
    description: '애드인에듀 아카데미 구로가산센터장',
  },

  {
    act_id: 'kdt-addinedu',
    filename: '250527-1754-00_copy.JPG',
    name: '수료식 단체사진 01',
    type: 'None',
    startDate: '2025-05-27',
  },

  {
    act_id: 'kdt-addinedu',
    filename: '250527-1810-00_copy.JPG',
    name: '수료식 단체사진 02',
    type: 'None',
    startDate: '2025-05-27',
  },

  // {
  //   act_id: 'shoepernoma',
  //   filename: '시스템_아키텍처(희망).drawio.png',
  //   name: 'shoepernoma 시스템 아키텍처',
  //   type: 'None',
  //   startDate: '2025-05-27',
  // },

  // 대한상공회의소 미니 프로젝트 README GIF
  {
    act_id: 'korcham-mini-wardy',
    filename: 'wardy-mobile.gif',
    name: 'Wardy 모바일 화면',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/wardy-mobile.gif',
  },

  {
    act_id: 'korcham-mini-wardy',
    filename: 'wardy-fall.gif',
    name: 'Wardy 눕기·낙상 구분',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/wardy-fall.gif',
  },

  {
    act_id: 'korcham-mini-axi-peripheral',
    filename: 'axi-peripheral-spi.gif',
    name: 'AXI Peripheral SPI 시연',
    type: 'None',
    startDate: '2026-06-30',
    remotePathOverride: 'media/photos/projects/AXI_Peripheral/axi-peripheral-spi.gif',
  },

  {
    act_id: 'korcham-mini-axi-peripheral',
    filename: 'axi-peripheral-iic-test.gif',
    name: 'AXI Peripheral IIC 시연',
    type: 'None',
    startDate: '2026-06-30',
    remotePathOverride: 'media/photos/projects/AXI_Peripheral/axi-peripheral-iic-test.gif',
  },

  {
    act_id: 'korcham-mini-ascii-uart',
    filename: 'ascii-uart-watch.gif',
    name: 'watch 모드 시연',
    type: 'None',
    startDate: '2026-05-06',
    remotePathOverride: 'media/photos/projects/ascii-uart-sensor-pipeline/ascii-uart-watch.gif',
  },

  {
    act_id: 'korcham-mini-ascii-uart',
    filename: 'ascii-uart-stopwatch.gif',
    name: 'stopwatch 모드 시연',
    type: 'None',
    startDate: '2026-05-06',
    remotePathOverride: 'media/photos/projects/ascii-uart-sensor-pipeline/ascii-uart-stopwatch.gif',
  },

  {
    act_id: 'korcham-mini-ascii-uart',
    filename: 'ascii-uart-dht11.gif',
    name: 'DHT11 센서 시연',
    type: 'None',
    startDate: '2026-05-06',
    remotePathOverride: 'media/photos/projects/ascii-uart-sensor-pipeline/ascii-uart-dht11.gif',
  },

  {
    act_id: 'korcham-mini-ascii-uart',
    filename: 'ascii-uart-sr04.gif',
    name: 'SR04 센서 시연',
    type: 'None',
    startDate: '2026-05-06',
    remotePathOverride: 'media/photos/projects/ascii-uart-sensor-pipeline/ascii-uart-sr04.gif',
  },

  {
    act_id: 'korcham-mini-timepiecer',
    filename: 'timepiecer-timepiece.gif',
    name: 'Timepiece 시연',
    type: 'None',
    startDate: '2026-04-20',
    remotePathOverride: 'media/photos/projects/Timepiecer/timepiecer-timepiece.gif',
  },

  {
    act_id: 'korcham-mini-timepiecer',
    filename: 'timepiecer-timer.gif',
    name: 'Timer 시연',
    type: 'None',
    startDate: '2026-04-20',
    remotePathOverride: 'media/photos/projects/Timepiecer/timepiecer-timer.gif',
  },

  {
    act_id: 'korcham-mini-korchamlogis',
    filename: 'korchamlogis-x2.gif',
    name: 'KorchamLogis 주행 시연(2배속)',
    type: 'None',
    startDate: '2026-04-03',
    remotePathOverride: 'media/photos/projects/KorchamLogis/korchamlogis-x2.gif',
  },

  {
    act_id: 'korcham-mini-korchamlogis',
    filename: 'korchamlogis-car-x2.gif',
    name: 'KorchamCar 주행 시연(2배속)',
    type: 'None',
    startDate: '2026-04-03',
    remotePathOverride: 'media/photos/projects/KorchamLogis/korchamlogis-car-x2.gif',
  },

  {
    act_id: 'korcham-fabless-academy',
    filename: 'fabless-academy-thumbnail.png',
    name: '경기도 팹리스 아카데미 썸네일',
    type: 'None',
    startDate: '2026-03-24',
    remotePathOverride: 'media/photos/projects/KorchamFablessAcademy/fabless-academy-thumbnail.png',
  },

  {
    act_id: 'open-source-contributions',
    filename: 'open-source-contributions-thumbnail.png',
    name: '오픈소스 기여 썸네일',
    type: 'None',
    startDate: '2022-06-11',
    remotePathOverride: 'media/photos/projects/OpenSource/open-source-contributions-thumbnail.png',
  },

  {
    act_id: 'korcham-mini-uart-fifo-rtl',
    filename: 'uart-fifo-rtl-loopback-demo.mp4',
    name: 'UART·FIFO loopback 시연',
    type: 'None',
    startDate: '2026-04-27',
    remotePathOverride: 'media/photos/projects/UART_FIFO_RTL/uart-fifo-rtl-loopback-demo.mp4',
  },

  {
    act_id: 'korcham-mini-uvm-spi-i2c',
    filename: 'uvm-spi-i2c-demo-00.gif',
    name: 'UVM SPI·I2C board-to-board 시연',
    type: 'None',
    startDate: '2026-06-18',
    remotePathOverride: 'media/photos/projects/UVM_SPI_I2C/uvm-spi-i2c-demo-00.gif',
  },

  {
    act_id: 'korcham-mini-uvm-spi-i2c',
    filename: 'uvm-spi-i2c-demo-04.gif',
    name: 'UVM SPI·I2C 결과 표시',
    type: 'None',
    startDate: '2026-06-18',
    remotePathOverride: 'media/photos/projects/UVM_SPI_I2C/uvm-spi-i2c-demo-04.gif',
  },

  {
    act_id: 'korcham-mini-testudines',
    filename: 'testudines-full-joint-run-x2.mp4',
    name: 'Testudines 전체 관절 구동(2배속)',
    type: 'None',
    startDate: '2026-07-27',
    remotePathOverride: 'media/photos/projects/testudines/testudines-full-joint-run-x2.mp4',
  },

  {
    act_id: 'korcham-mini-vga-pan-tilt-cctv',
    filename: 'vga-pan-tilt-cctv-demo.mp4',
    name: 'VGA Pan-Tilt CCTV 시연',
    type: 'None',
    startDate: '2026-09-07',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/vga-pan-tilt-cctv-demo.mp4',
  },

  {
    act_id: 'korcham-mini-lightletter',
    filename: 'lightletter-tx-ui.mp4',
    name: 'LightLetter 송신 UI',
    type: 'None',
    startDate: '2026-10-07',
    remotePathOverride: 'media/photos/projects/LightLetter/lightletter-tx-ui.mp4',
  },

  {
    act_id: 'korcham-mini-lightletter',
    filename: 'lightletter-tx-ui-x2.mp4',
    name: 'lightletter-tx-ui-x2 (2배속)',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/x2/lightletter-tx-ui-x2.mp4',
  },

  {
    act_id: 'korcham-mini-vga-pan-tilt-cctv',
    filename: 'vga-pan-tilt-cctv-demo-x2.mp4',
    name: 'vga-pan-tilt-cctv-demo-x2 (2배속)',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/x2/vga-pan-tilt-cctv-demo-x2.mp4',
  },

  {
    act_id: 'korcham-mini-vga-pan-tilt-cctv',
    filename: 'vga-readme-24-x2.mp4',
    name: 'vga-readme-24-x2 (2배속)',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/x2/vga-readme-24-x2.mp4',
  },

  {
    act_id: 'korcham-mini-vga-pan-tilt-cctv',
    filename: 'vga-readme-25-x2.mp4',
    name: 'vga-readme-25-x2 (2배속)',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/x2/vga-readme-25-x2.mp4',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: 'INHA_AIR-x2.mp4',
    name: 'INHA_AIR-x2 (2배속)',
    type: 'None',
    startDate: '2021-06-04',
    remotePathOverride: 'media/photos/projects/INHA_AIR/x2/INHA_AIR-x2.mp4',
  },

  {
    act_id: 'GreenT',
    filename: 'rfid-x2.mp4',
    name: 'rfid-x2 (2배속)',
    type: 'None',
    startDate: '2025-02-27',
    remotePathOverride: 'media/photos/projects/GreenT/x2/rfid-x2.mp4',
  },

  {
    act_id: ['addinedu', 'StoneSpring'],
    filename: '전체동작-x2.mp4',
    name: '전체동작-x2 (2배속)',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/x2/전체동작-x2.mp4',
  },

  {
    act_id: ['addinedu', 'StoneSpring'],
    filename: '전체1-x2.mp4',
    name: '전체1-x2 (2배속)',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/x2/전체1-x2.mp4',
  },

  {
    act_id: ['addinedu', 'StoneSpring'],
    filename: '마채1-x2.mp4',
    name: '마채1-x2 (2배속)',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/x2/마채1-x2.mp4',
  },

  {
    act_id: ['addinedu', 'StoneSpring'],
    filename: '표제-x2.mp4',
    name: '표제-x2 (2배속)',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/x2/표제-x2.mp4',
  },

  {
    act_id: ['addinedu', 'StoneSpring'],
    filename: '제스처1-x2.mp4',
    name: '제스처1-x2 (2배속)',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/x2/제스처1-x2.mp4',
  },

  {
    act_id: ['addinedu', 'StoneSpring'],
    filename: '제스처2-x2.mp4',
    name: '제스처2-x2 (2배속)',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/x2/제스처2-x2.mp4',
  },

  {
    act_id: ['addinedu', 'StoneSpring'],
    filename: '제스처3-x2.mp4',
    name: '제스처3-x2 (2배속)',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/x2/제스처3-x2.mp4',
  },

  {
    act_id: ['addinedu', 'StoneSpring'],
    filename: '제스처4-x2.mp4',
    name: '제스처4-x2 (2배속)',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/x2/제스처4-x2.mp4',
  },

  {
    act_id: ['addinedu', 'StoneSpring'],
    filename: 'voice_emotion-1-x2.mp4',
    name: 'voice_emotion-1-x2 (2배속)',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/x2/voice_emotion-1-x2.mp4',
  },

  {
    act_id: ['addinedu', 'StoneSpring'],
    filename: 'voice_emotion-2-x2.mp4',
    name: 'voice_emotion-2-x2 (2배속)',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/x2/voice_emotion-2-x2.mp4',
  },

  {
    act_id: ['addinedu', 'StoneSpring'],
    filename: 'face_emotion-x2.mp4',
    name: 'face_emotion-x2 (2배속)',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/x2/face_emotion-x2.mp4',
  },

  {
    act_id: ['addinedu', 'StoneSpring'],
    filename: 'gesture-x2.mp4',
    name: 'gesture-x2 (2배속)',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/x2/gesture-x2.mp4',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-33-x2.mp4',
    name: 'wardy-readme-33-x2 (2배속)',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/x2/wardy-readme-33-x2.mp4',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-34-x2.mp4',
    name: 'wardy-readme-34-x2 (2배속)',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/x2/wardy-readme-34-x2.mp4',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-35-x2.mp4',
    name: 'wardy-readme-35-x2 (2배속)',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/x2/wardy-readme-35-x2.mp4',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-36-x2.mp4',
    name: 'wardy-readme-36-x2 (2배속)',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/x2/wardy-readme-36-x2.mp4',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-37-x2.mp4',
    name: 'wardy-readme-37-x2 (2배속)',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/x2/wardy-readme-37-x2.mp4',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-38-x2.mp4',
    name: 'wardy-readme-38-x2 (2배속)',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/x2/wardy-readme-38-x2.mp4',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-39-x2.mp4',
    name: 'wardy-readme-39-x2 (2배속)',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/x2/wardy-readme-39-x2.mp4',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-40-x2.mp4',
    name: 'wardy-readme-40-x2 (2배속)',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/x2/wardy-readme-40-x2.mp4',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-41-x2.mp4',
    name: 'wardy-readme-41-x2 (2배속)',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/x2/wardy-readme-41-x2.mp4',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-42-x2.mp4',
    name: 'wardy-readme-42-x2 (2배속)',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/x2/wardy-readme-42-x2.mp4',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-43-x2.mp4',
    name: 'wardy-readme-43-x2 (2배속)',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/x2/wardy-readme-43-x2.mp4',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-44-x2.mp4',
    name: 'wardy-readme-44-x2 (2배속)',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/x2/wardy-readme-44-x2.mp4',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-45-x2.mp4',
    name: 'wardy-readme-45-x2 (2배속)',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/x2/wardy-readme-45-x2.mp4',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-46-x2.mp4',
    name: 'wardy-readme-46-x2 (2배속)',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/x2/wardy-readme-46-x2.mp4',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-47-x2.mp4',
    name: 'wardy-readme-47-x2 (2배속)',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/x2/wardy-readme-47-x2.mp4',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-48-x2.mp4',
    name: 'wardy-readme-48-x2 (2배속)',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/x2/wardy-readme-48-x2.mp4',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-49-x2.mp4',
    name: 'wardy-readme-49-x2 (2배속)',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/x2/wardy-readme-49-x2.mp4',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-50-x2.mp4',
    name: 'wardy-readme-50-x2 (2배속)',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/x2/wardy-readme-50-x2.mp4',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-02-x2.mp4',
    name: 'wardy-readme-02-x2 (2배속)',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/x2/wardy-readme-02-x2.mp4',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-53-x2.mp4',
    name: 'wardy-readme-53-x2 (2배속)',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/x2/wardy-readme-53-x2.mp4',
  },



  {
    act_id: 'korcham-mini-rv32i',
    filename: 'rv32i-cpu-structure.png',
    name: 'RV32I CPU 구조',
    type: 'None',
    startDate: '2026-05-27',
    remotePathOverride: 'media/photos/projects/RV32I/rv32i-cpu-structure.png',
  },

  {
    act_id: 'korcham-mini-rv32i',
    filename: 'rv32i-sum-counting-waveform.png',
    name: 'RV32I sum_counting 실행 파형',
    type: 'None',
    startDate: '2026-05-27',
    remotePathOverride: 'media/photos/projects/RV32I/rv32i-sum-counting-waveform.png',
  },

  {
    act_id: 'korcham-mini-sv-verification',
    filename: 'sv-verification-testbench.png',
    name: 'SystemVerilog class testbench 구조',
    type: 'None',
    startDate: '2026-05-18',
    remotePathOverride: 'media/photos/projects/SV_Verification/sv-verification-testbench.png',
  },

  {
    act_id: 'korcham-mini-sv-verification',
    filename: 'sv-verification-loopback-waveform.png',
    name: 'UART·FIFO loopback 파형과 PASS 로그',
    type: 'None',
    startDate: '2026-05-18',
    remotePathOverride: 'media/photos/projects/SV_Verification/sv-verification-loopback-waveform.png',
  },

  // GitHub README 첨부 이미지를 옮긴 OneDrive 원본
  {
    act_id: 'StoneSpring',
    filename: '전체1.gif',
    name: 'StoneSpring AI전체',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/전체1.gif',
  },

  {
    act_id: 'StoneSpring',
    filename: '전체동작.gif',
    name: 'StoneSpring 전체동작',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/전체동작.gif',
  },

  {
    act_id: 'StoneSpring',
    filename: '마채1.gif',
    name: 'StoneSpring 마이크+채팅1',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/마채1.gif',
  },

  {
    act_id: 'StoneSpring',
    filename: '표제.gif',
    name: 'StoneSpring 표정',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/표제.gif',
  },

  {
    act_id: 'StoneSpring',
    filename: '제스처1.gif',
    name: 'StoneSpring 제스처1',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/제스처1.gif',
  },

  {
    act_id: 'StoneSpring',
    filename: '제스처2.gif',
    name: 'StoneSpring 제스처2',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/제스처2.gif',
  },

  {
    act_id: 'StoneSpring',
    filename: '제스처3.gif',
    name: 'StoneSpring 제스처3',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/제스처3.gif',
  },

  {
    act_id: 'StoneSpring',
    filename: '제스처4.gif',
    name: 'StoneSpring 제스처4',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/제스처4.gif',
  },

  {
    act_id: 'StoneSpring',
    filename: 'GUI-1.png',
    name: 'StoneSpring GUI-1',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/GUI-1.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'GUI-2.png',
    name: 'StoneSpring GUI-2',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/GUI-2.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'GUI-3.png',
    name: 'StoneSpring GUI-3',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/GUI-3.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'GUI-4.png',
    name: 'StoneSpring GUI-4',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/GUI-4.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'GUI-5.png',
    name: 'StoneSpring GUI-5',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/GUI-5.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'GUI-6.png',
    name: 'StoneSpring GUI-6',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/GUI-6.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'GUI-7.png',
    name: 'StoneSpring GUI-7',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/GUI-7.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'GUI-8.png',
    name: 'StoneSpring GUI-8',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/GUI-8.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'voice_emotion-1.gif',
    name: 'StoneSpring voice_emotion-1',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/voice_emotion-1.gif',
  },

  {
    act_id: 'StoneSpring',
    filename: 'voice_emotion-2.gif',
    name: 'StoneSpring voice_emotion-2',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/voice_emotion-2.gif',
  },

  {
    act_id: 'StoneSpring',
    filename: 'voice_emotion_model-1.png',
    name: 'StoneSpring voice_emotion_model-1',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/voice_emotion_model-1.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'voice_emotion_model-2.png',
    name: 'StoneSpring voice_emotion_model-2',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/voice_emotion_model-2.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'voice_emotion_model-3.png',
    name: 'StoneSpring voice_emotion_model-3',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/voice_emotion_model-3.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'voice_emotion_model-4.png',
    name: 'StoneSpring voice_emotion_model-4',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/voice_emotion_model-4.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'face_emotion.gif',
    name: 'StoneSpring face_emotion',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/face_emotion.gif',
  },

  {
    act_id: 'StoneSpring',
    filename: 'face_emotion_model-1.png',
    name: 'StoneSpring face_emotion_model-1',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/face_emotion_model-1.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'face_emotion_model-2.png',
    name: 'StoneSpring face_emotion_model-2',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/face_emotion_model-2.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'gesture.gif',
    name: 'StoneSpring gesture',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/gesture.gif',
  },

  {
    act_id: 'StoneSpring',
    filename: 'gesture-model.png',
    name: 'StoneSpring gesture-model',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/gesture-model.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'system_architecture.png',
    name: 'StoneSpring system_architecture',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/system_architecture.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'system_architecture_0.1.0.png',
    name: 'StoneSpring system_architecture_0 1 0',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/system_architecture_0.1.0.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'system_architecture_0.2.0.png',
    name: 'StoneSpring system_architecture_0 2 0',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/system_architecture_0.2.0.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'system_architecture_0.3.0.png',
    name: 'StoneSpring system_architecture_0 3 0',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/system_architecture_0.3.0.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'data_structure.png',
    name: 'StoneSpring data_structure',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/data_structure.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'data_structure_1.png',
    name: 'StoneSpring data_structure_1',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/data_structure_1.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'data_structure_2.png',
    name: 'StoneSpring data_structure_2',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/data_structure_2.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'data_structure_3.png',
    name: 'StoneSpring data_structure_3',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/data_structure_3.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'sequence_diagram_1.png',
    name: 'StoneSpring sequence_diagram_1',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/sequence_diagram_1.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'sequence_diagram_2.png',
    name: 'StoneSpring sequence_diagram_2',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/sequence_diagram_2.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'sequence_diagram_3.png',
    name: 'StoneSpring sequence_diagram_3',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/sequence_diagram_3.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'sequence_diagram_4.png',
    name: 'StoneSpring sequence_diagram_4',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/sequence_diagram_4.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'sequence_diagram_5.png',
    name: 'StoneSpring sequence_diagram_5',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/sequence_diagram_5.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'emotion_1.png',
    name: 'StoneSpring emotion_1',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/emotion_1.png',
  },

  {
    act_id: 'StoneSpring',
    filename: 'emotion_2.png',
    name: 'StoneSpring emotion_2',
    type: 'None',
    startDate: '2025-04-07',
    remotePathOverride: 'media/photos/projects/StoneSpring/emotion_2.png',
  },

  {
    act_id: 'pdf_to_question_bank',
    filename: 'preview_1.png',
    name: 'PDF to Question Bank preview_1',
    type: 'None',
    startDate: '2024-10-26',
    remotePathOverride: 'media/photos/projects/pdf_to_question_bank/preview_1.png',
  },

  {
    act_id: 'pdf_to_question_bank',
    filename: 'preview_2.png',
    name: 'PDF to Question Bank preview_2',
    type: 'None',
    startDate: '2024-10-26',
    remotePathOverride: 'media/photos/projects/pdf_to_question_bank/preview_2.png',
  },

  {
    act_id: 'pdf_to_question_bank',
    filename: 'preview_3.png',
    name: 'PDF to Question Bank preview_3',
    type: 'None',
    startDate: '2024-10-26',
    remotePathOverride: 'media/photos/projects/pdf_to_question_bank/preview_3.png',
  },

  {
    act_id: 'pdf_to_question_bank',
    filename: 'preview_4.png',
    name: 'PDF to Question Bank preview_4',
    type: 'None',
    startDate: '2024-10-26',
    remotePathOverride: 'media/photos/projects/pdf_to_question_bank/preview_4.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: 'INHA_AIR_1280px_2x.gif',
    name: 'INHA AIR INHA_AIR_demo',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/INHA_AIR_1280px_2x.gif',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: '00_start.png',
    name: 'INHA AIR 00_start',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/00_start.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: '01_idpw.png',
    name: 'INHA AIR 01_idpw',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/01_idpw.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: '01_signin.png',
    name: 'INHA AIR 01_signin',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/01_signin.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: '01_signup_1.png',
    name: 'INHA AIR 01_signup_1',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/01_signup_1.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: '02_menu.png',
    name: 'INHA AIR 02_menu',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/02_menu.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: '03_search_1.png',
    name: 'INHA AIR 03_search_1',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/03_search_1.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: '04_book_00.png',
    name: 'INHA AIR 04_book_00',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/04_book_00.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: '04_book_01.png',
    name: 'INHA AIR 04_book_01',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/04_book_01.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: '04_book_02.png',
    name: 'INHA AIR 04_book_02',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/04_book_02.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: '04_book_03.png',
    name: 'INHA AIR 04_book_03',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/04_book_03.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: '04_book_04.png',
    name: 'INHA AIR 04_book_04',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/04_book_04.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: '04_book_06.png',
    name: 'INHA AIR 04_book_06',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/04_book_06.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: '04_book_07.png',
    name: 'INHA AIR 04_book_07',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/04_book_07.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: '04_book_08.png',
    name: 'INHA AIR 04_book_08',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/04_book_08.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: '04_book_09.png',
    name: 'INHA AIR 04_book_09',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/04_book_09.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: '04_book_10.png',
    name: 'INHA AIR 04_book_10',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/04_book_10.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: '04_book_11.png',
    name: 'INHA AIR 04_book_11',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/04_book_11.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: '04_book_12.png',
    name: 'INHA AIR 04_book_12',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/04_book_12.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: '05_detail_0.png',
    name: 'INHA AIR 05_detail_0',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/05_detail_0.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: '05_detail_1.png',
    name: 'INHA AIR 05_detail_1',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/05_detail_1.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: '06_management.png',
    name: 'INHA AIR 06_management',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/06_management.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: 'information_architecture_admin.png',
    name: 'INHA AIR information_architecture_admin',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/information_architecture_admin.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: 'information_architecture_user.png',
    name: 'INHA AIR information_architecture_user',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/information_architecture_user.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: 'flow_U01_signin.png',
    name: 'INHA AIR flow_U01_signin',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/flow_U01_signin.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: 'flow_U02_signup.png',
    name: 'INHA AIR flow_U02_signup',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/flow_U02_signup.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: 'flow_U03_book_0.png',
    name: 'INHA AIR flow_U03_book_0',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/flow_U03_book_0.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: 'flow_U03_book_1.png',
    name: 'INHA AIR flow_U03_book_1',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/flow_U03_book_1.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: 'flow_U03_book_2.png',
    name: 'INHA AIR flow_U03_book_2',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/flow_U03_book_2.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: 'flow_U04_book_info_0.png',
    name: 'INHA AIR flow_U04_book_info_0',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/flow_U04_book_info_0.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: 'flow_U04_book_info_1.png',
    name: 'INHA AIR flow_U04_book_info_1',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/flow_U04_book_info_1.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: 'flow_U04_book_info_2.png',
    name: 'INHA AIR flow_U04_book_info_2',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/flow_U04_book_info_2.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: 'flow_U05_detail_0.png',
    name: 'INHA AIR flow_U05_detail_0',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/flow_U05_detail_0.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: 'flow_U05_detail_1.png',
    name: 'INHA AIR flow_U05_detail_1',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/flow_U05_detail_1.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: 'flow_A06_admin_0.png',
    name: 'INHA AIR flow_A06_admin_0',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/flow_A06_admin_0.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: 'databases_1.png',
    name: 'INHA AIR databases_1',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/databases_1.png',
  },

  {
    act_id: ['인하공업전문대학', 'INHA-AIR'],
    filename: 'databases_2.png',
    name: 'INHA AIR databases_2',
    type: 'None',
    startDate: '2021-07-15',
    remotePathOverride: 'media/photos/projects/INHA_AIR/databases_2.png',
  },

  {
    act_id: 'HealthCasting',
    filename: '1-1.장염환자수와검색어트랜드분석.png',
    name: 'HealthCasting 1-1 장염환자수와검색어트랜드분석',
    type: 'None',
    startDate: '2025-01-03',
    remotePathOverride: 'media/photos/projects/HealthCasting/1-1.장염환자수와검색어트랜드분석.png',
  },

  {
    act_id: 'HealthCasting',
    filename: '3-1.기상데이터와_장염환자_상관관계.png',
    name: 'HealthCasting 3-1 기상데이터와_장염환자_상관관계',
    type: 'None',
    startDate: '2025-01-03',
    remotePathOverride: 'media/photos/projects/HealthCasting/3-1.기상데이터와_장염환자_상관관계.png',
  },

  {
    act_id: 'HealthCasting',
    filename: '3-2.기상데이터와_장염환자.png',
    name: 'HealthCasting 3-2 기상데이터와_장염환자',
    type: 'None',
    startDate: '2025-01-03',
    remotePathOverride: 'media/photos/projects/HealthCasting/3-2.기상데이터와_장염환자.png',
  },

  {
    act_id: 'HealthCasting',
    filename: '2-2.연령별_환자분석.png',
    name: 'HealthCasting 2-2 연령별_환자분석',
    type: 'None',
    startDate: '2025-01-03',
    remotePathOverride: 'media/photos/projects/HealthCasting/2-2.연령별_환자분석.png',
  },

  {
    act_id: 'HealthCasting',
    filename: '1-2.장염환자수와네이버검색어트랜드.png',
    name: 'HealthCasting 1-2 장염환자수와네이버검색어트랜드',
    type: 'None',
    startDate: '2025-01-03',
    remotePathOverride: 'media/photos/projects/HealthCasting/1-2.장염환자수와네이버검색어트랜드.png',
  },

  {
    act_id: 'HealthCasting',
    filename: '3-4.장염일교차.png',
    name: 'HealthCasting 3-4 장염일교차',
    type: 'None',
    startDate: '2025-01-03',
    remotePathOverride: 'media/photos/projects/HealthCasting/3-4.장염일교차.png',
  },

  {
    act_id: 'GreenT',
    filename: 'rfid.gif',
    name: 'GreenT rfid_open_door',
    type: 'None',
    startDate: '2025-02-27',
    remotePathOverride: 'media/photos/projects/GreenT/media/rfid.gif',
  },

  {
    act_id: 'GreenT',
    filename: 'FarmProgram-01.png',
    name: 'GreenT 01.start',
    type: 'None',
    startDate: '2025-02-27',
    remotePathOverride: 'media/photos/projects/GreenT/media/FarmProgram-01.png',
  },

  {
    act_id: 'GreenT',
    filename: 'FarmProgram-02-admin.png',
    name: 'GreenT 02.admin_signin',
    type: 'None',
    startDate: '2025-02-27',
    remotePathOverride: 'media/photos/projects/GreenT/media/FarmProgram-02-admin.png',
  },

  {
    act_id: 'GreenT',
    filename: 'FarmProgram-03-admin.png',
    name: 'GreenT 03.admin_main',
    type: 'None',
    startDate: '2025-02-27',
    remotePathOverride: 'media/photos/projects/GreenT/media/FarmProgram-03-admin.png',
  },

  {
    act_id: 'GreenT',
    filename: 'FarmProgram-04-admin.png',
    name: 'GreenT 04.admin_user_info',
    type: 'None',
    startDate: '2025-02-27',
    remotePathOverride: 'media/photos/projects/GreenT/media/FarmProgram-04-admin.png',
  },

  {
    act_id: 'GreenT',
    filename: 'FarmProgram-05-admin.png',
    name: 'GreenT 05.reset_pw',
    type: 'None',
    startDate: '2025-02-27',
    remotePathOverride: 'media/photos/projects/GreenT/media/FarmProgram-05-admin.png',
  },

  {
    act_id: 'GreenT',
    filename: 'FarmProgram-06-admin.png',
    name: 'GreenT 06.admin_kit',
    type: 'None',
    startDate: '2025-02-27',
    remotePathOverride: 'media/photos/projects/GreenT/media/FarmProgram-06-admin.png',
  },

  {
    act_id: 'GreenT',
    filename: 'FarmProgram-07-admin.png',
    name: 'GreenT 07.admin_plant',
    type: 'None',
    startDate: '2025-02-27',
    remotePathOverride: 'media/photos/projects/GreenT/media/FarmProgram-07-admin.png',
  },

  {
    act_id: 'GreenT',
    filename: 'FarmProgram-08-admin.png',
    name: 'GreenT 08.sign_up',
    type: 'None',
    startDate: '2025-02-27',
    remotePathOverride: 'media/photos/projects/GreenT/media/FarmProgram-08-admin.png',
  },

  {
    act_id: 'GreenT',
    filename: 'FarmProgram-09-admin.png',
    name: 'GreenT 09.admin_user_info',
    type: 'None',
    startDate: '2025-02-27',
    remotePathOverride: 'media/photos/projects/GreenT/media/FarmProgram-09-admin.png',
  },

  {
    act_id: 'GreenT',
    filename: 'FarmProgram-10-user.png',
    name: 'GreenT 10.user-register',
    type: 'None',
    startDate: '2025-02-27',
    remotePathOverride: 'media/photos/projects/GreenT/media/FarmProgram-10-user.png',
  },

  {
    act_id: 'GreenT',
    filename: 'FarmProgram-11-user-kit-rental.png',
    name: 'GreenT 11.kit_rental',
    type: 'None',
    startDate: '2025-02-27',
    remotePathOverride: 'media/photos/projects/GreenT/media/FarmProgram-11-user-kit-rental.png',
  },

  {
    act_id: 'GreenT',
    filename: 'FarmProgram-12.png',
    name: 'GreenT 12.kit-rental_detail',
    type: 'None',
    startDate: '2025-02-27',
    remotePathOverride: 'media/photos/projects/GreenT/media/FarmProgram-12.png',
  },

  {
    act_id: 'GreenT',
    filename: 'FarmProgram-13-plant_detail_최종.png',
    name: 'GreenT 13.plant_detail',
    type: 'None',
    startDate: '2025-02-27',
    remotePathOverride: 'media/photos/projects/GreenT/media/FarmProgram-13-plant_detail_최종.png',
  },

  {
    act_id: 'GreenT',
    filename: '1.각_부품이_모여서.png',
    name: 'GreenT 각_부품이_모여서',
    type: 'None',
    startDate: '2025-02-27',
    remotePathOverride: 'media/photos/projects/GreenT/media/1.각_부품이_모여서.png',
  },

  {
    act_id: 'GreenT',
    filename: '2.하나의_키트를_이루고_1.png',
    name: 'GreenT 하나의_키트를_이루고',
    type: 'None',
    startDate: '2025-02-27',
    remotePathOverride: 'media/photos/projects/GreenT/media/2.하나의_키트를_이루고_1.png',
  },

  {
    act_id: 'GreenT',
    filename: '2.하나의_키트를_이루고_2.png',
    name: 'GreenT 각_키트들이_모여',
    type: 'None',
    startDate: '2025-02-27',
    remotePathOverride: 'media/photos/projects/GreenT/media/2.하나의_키트를_이루고_2.png',
  },

  {
    act_id: 'GreenT',
    filename: '3.세트가_되며.png',
    name: 'GreenT 세트가_되며',
    type: 'None',
    startDate: '2025-02-27',
    remotePathOverride: 'media/photos/projects/GreenT/media/3.세트가_되며.png',
  },

  {
    act_id: 'GreenT',
    filename: '4.하나의_스마트팜_완성.png',
    name: 'GreenT 하나의_스마트팜_완성',
    type: 'None',
    startDate: '2025-02-27',
    remotePathOverride: 'media/photos/projects/GreenT/media/4.하나의_스마트팜_완성.png',
  },

  {
    act_id: 'GreenT',
    filename: 'sa_hardware_architecture.png',
    name: 'GreenT sa_hardware_architecture',
    type: 'None',
    startDate: '2025-02-27',
    remotePathOverride: 'media/photos/projects/GreenT/media/sa_hardware_architecture.png',
  },

  {
    act_id: 'GreenT',
    filename: 'sa_software_architecture.png',
    name: 'GreenT sa_software_architecture',
    type: 'None',
    startDate: '2025-02-27',
    remotePathOverride: 'media/photos/projects/GreenT/media/sa_software_architecture.png',
  },

  {
    act_id: 'GreenT',
    filename: '데이터베이스_전체.png',
    name: 'GreenT database_all',
    type: 'None',
    startDate: '2025-02-27',
    remotePathOverride: 'media/photos/projects/GreenT/media/데이터베이스_전체.png',
  },

  {
    act_id: 'GreenT',
    filename: '데이터베이스_개별_1.png',
    name: 'GreenT database-1',
    type: 'None',
    startDate: '2025-02-27',
    remotePathOverride: 'media/photos/projects/GreenT/media/데이터베이스_개별_1.png',
  },

  {
    act_id: 'GreenT',
    filename: '데이터베이스_개별_2.png',
    name: 'GreenT database-2',
    type: 'None',
    startDate: '2025-02-27',
    remotePathOverride: 'media/photos/projects/GreenT/media/데이터베이스_개별_2.png',
  },

  {
    act_id: 'GreenT',
    filename: '데이터베이스_개별_3.png',
    name: 'GreenT database-3',
    type: 'None',
    startDate: '2025-02-27',
    remotePathOverride: 'media/photos/projects/GreenT/media/데이터베이스_개별_3.png',
  },


  // 프로젝트 상세 보고서 그림 (GitHub README·완료보고서 원본)
  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-03.png',
    name: 'Wardy 상세 보고서 그림 3',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-03.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-04.png',
    name: 'Wardy 상세 보고서 그림 4',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-04.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-05.png',
    name: 'Wardy 상세 보고서 그림 5',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-05.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-06.png',
    name: 'Wardy 상세 보고서 그림 6',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-06.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-07.png',
    name: 'Wardy 상세 보고서 그림 7',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-07.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-08.png',
    name: 'Wardy 상세 보고서 그림 8',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-08.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-09.png',
    name: 'Wardy 상세 보고서 그림 9',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-09.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-10.png',
    name: 'Wardy 상세 보고서 그림 10',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-10.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-11.png',
    name: 'Wardy 상세 보고서 그림 11',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-11.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-12.png',
    name: 'Wardy 상세 보고서 그림 12',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-12.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-13.png',
    name: 'Wardy 상세 보고서 그림 13',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-13.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-14.png',
    name: 'Wardy 상세 보고서 그림 14',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-14.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-15.png',
    name: 'Wardy 상세 보고서 그림 15',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-15.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-16.png',
    name: 'Wardy 상세 보고서 그림 16',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-16.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-17.png',
    name: 'Wardy 상세 보고서 그림 17',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-17.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-18.png',
    name: 'Wardy 상세 보고서 그림 18',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-18.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-19.png',
    name: 'Wardy 상세 보고서 그림 19',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-19.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-20.png',
    name: 'Wardy 상세 보고서 그림 20',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-20.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-21.png',
    name: 'Wardy 상세 보고서 그림 21',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-21.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-22.png',
    name: 'Wardy 상세 보고서 그림 22',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-22.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-23.png',
    name: 'Wardy 상세 보고서 그림 23',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-23.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-24.png',
    name: 'Wardy 상세 보고서 그림 24',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-24.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-25.png',
    name: 'Wardy 상세 보고서 그림 25',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-25.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-26.png',
    name: 'Wardy 상세 보고서 그림 26',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-26.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-27.png',
    name: 'Wardy 상세 보고서 그림 27',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-27.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-28.png',
    name: 'Wardy 상세 보고서 그림 28',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-28.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-29.png',
    name: 'Wardy 상세 보고서 그림 29',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-29.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-30.png',
    name: 'Wardy 상세 보고서 그림 30',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-30.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-31.png',
    name: 'Wardy 상세 보고서 그림 31',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-31.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-32.png',
    name: 'Wardy 상세 보고서 그림 32',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-32.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-33.gif',
    name: '0813-11 50 52',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-33.gif',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-34.gif',
    name: '0813-19 05 08-1',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-34.gif',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-35.gif',
    name: '0813-19 05 08-2',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-35.gif',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-36.gif',
    name: '0813-19 05 08-3',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-36.gif',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-37.gif',
    name: '0813-20 28 47-1',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-37.gif',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-38.gif',
    name: '0813-20 28 47-2',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-38.gif',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-39.gif',
    name: '0813-20 28 47-3',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-39.gif',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-40.gif',
    name: '0813-20 28 47-4',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-40.gif',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-41.gif',
    name: '0814-10 17 01',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-41.gif',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-42.gif',
    name: '0814-10 18 17',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-42.gif',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-43.gif',
    name: '0814-10 19 16-1',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-43.gif',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-44.gif',
    name: '0814-10 55 40-1',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-44.gif',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-45.gif',
    name: '0814-10 19 57',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-45.gif',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-46.gif',
    name: '0814-11 35 23-1-성공',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-46.gif',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-47.gif',
    name: '0814-11 37 23-1-오탐',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-47.gif',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-48.gif',
    name: '0814-11 37 23-2-성공',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-48.gif',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-49.gif',
    name: '0814-11 37 23-3-성공',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-49.gif',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-50.gif',
    name: '0817-13 17 11-눕기낙상구분',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-50.gif',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-02.gif',
    name: '0817-13 19 31-눕기낙상구분',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-02.gif',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-51.png',
    name: 'Wardy 상세 보고서 그림 51',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-51.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-52.png',
    name: 'Wardy 상세 보고서 그림 52',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-52.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-53.gif',
    name: '0814-11 35 23-2-event-log',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-53.gif',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-54.png',
    name: 'Wardy 상세 보고서 그림 54',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-54.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-55.png',
    name: 'Wardy 상세 보고서 그림 55',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-55.png',
  },

  {
    act_id: 'detail-report-wardy',
    filename: 'wardy-readme-56.png',
    name: 'Wardy 상세 보고서 그림 56',
    type: 'None',
    startDate: '2026-08-19',
    remotePathOverride: 'media/photos/projects/Wardy/readme/wardy-readme-56.png',
  },

  {
    act_id: 'detail-report-vga-pan-tilt-cctv',
    filename: 'vga-readme-02.png',
    name: 'VGA Pan-Tilt CCTV 상세 보고서 그림 2',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/readme/vga-readme-02.png',
  },

  {
    act_id: 'detail-report-vga-pan-tilt-cctv',
    filename: 'vga-readme-03.png',
    name: 'VGA Pan-Tilt CCTV 상세 보고서 그림 3',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/readme/vga-readme-03.png',
  },

  {
    act_id: 'detail-report-vga-pan-tilt-cctv',
    filename: 'vga-readme-04.png',
    name: 'VGA Pan-Tilt CCTV 상세 보고서 그림 4',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/readme/vga-readme-04.png',
  },

  {
    act_id: 'detail-report-vga-pan-tilt-cctv',
    filename: 'vga-readme-05.png',
    name: 'VGA Pan-Tilt CCTV 상세 보고서 그림 5',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/readme/vga-readme-05.png',
  },

  {
    act_id: 'detail-report-vga-pan-tilt-cctv',
    filename: 'vga-readme-06.png',
    name: 'VGA Pan-Tilt CCTV 상세 보고서 그림 6',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/readme/vga-readme-06.png',
  },

  {
    act_id: 'detail-report-vga-pan-tilt-cctv',
    filename: 'vga-readme-07.png',
    name: 'VGA Pan-Tilt CCTV 상세 보고서 그림 7',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/readme/vga-readme-07.png',
  },

  {
    act_id: 'detail-report-vga-pan-tilt-cctv',
    filename: 'vga-readme-08.png',
    name: 'VGA Pan-Tilt CCTV 상세 보고서 그림 8',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/readme/vga-readme-08.png',
  },

  {
    act_id: 'detail-report-vga-pan-tilt-cctv',
    filename: 'vga-readme-09.png',
    name: 'VGA Pan-Tilt CCTV 상세 보고서 그림 9',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/readme/vga-readme-09.png',
  },

  {
    act_id: 'detail-report-vga-pan-tilt-cctv',
    filename: 'vga-readme-10.png',
    name: 'VGA Pan-Tilt CCTV 상세 보고서 그림 10',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/readme/vga-readme-10.png',
  },

  {
    act_id: 'detail-report-vga-pan-tilt-cctv',
    filename: 'vga-readme-11.png',
    name: 'VGA Pan-Tilt CCTV 상세 보고서 그림 11',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/readme/vga-readme-11.png',
  },

  {
    act_id: 'detail-report-vga-pan-tilt-cctv',
    filename: 'vga-readme-12.png',
    name: 'VGA Pan-Tilt CCTV 상세 보고서 그림 12',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/readme/vga-readme-12.png',
  },

  {
    act_id: 'detail-report-vga-pan-tilt-cctv',
    filename: 'vga-readme-13.png',
    name: 'VGA Pan-Tilt CCTV 상세 보고서 그림 13',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/readme/vga-readme-13.png',
  },

  {
    act_id: 'detail-report-vga-pan-tilt-cctv',
    filename: 'vga-readme-14.png',
    name: 'VGA Pan-Tilt CCTV 상세 보고서 그림 14',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/readme/vga-readme-14.png',
  },

  {
    act_id: 'detail-report-vga-pan-tilt-cctv',
    filename: 'vga-readme-15.png',
    name: 'VGA Pan-Tilt CCTV 상세 보고서 그림 15',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/readme/vga-readme-15.png',
  },

  {
    act_id: 'detail-report-vga-pan-tilt-cctv',
    filename: 'vga-readme-16.png',
    name: 'VGA Pan-Tilt CCTV 상세 보고서 그림 16',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/readme/vga-readme-16.png',
  },

  {
    act_id: 'detail-report-vga-pan-tilt-cctv',
    filename: 'vga-readme-17.png',
    name: 'VGA Pan-Tilt CCTV 상세 보고서 그림 17',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/readme/vga-readme-17.png',
  },

  {
    act_id: 'detail-report-vga-pan-tilt-cctv',
    filename: 'vga-readme-18.png',
    name: 'VGA Pan-Tilt CCTV 상세 보고서 그림 18',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/readme/vga-readme-18.png',
  },

  {
    act_id: 'detail-report-vga-pan-tilt-cctv',
    filename: 'vga-readme-19.png',
    name: 'VGA Pan-Tilt CCTV 상세 보고서 그림 19',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/readme/vga-readme-19.png',
  },

  {
    act_id: 'detail-report-vga-pan-tilt-cctv',
    filename: 'vga-readme-20.png',
    name: 'VGA Pan-Tilt CCTV 상세 보고서 그림 20',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/readme/vga-readme-20.png',
  },

  {
    act_id: 'detail-report-vga-pan-tilt-cctv',
    filename: 'vga-readme-21.png',
    name: 'VGA Pan-Tilt CCTV 상세 보고서 그림 21',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/readme/vga-readme-21.png',
  },

  {
    act_id: 'detail-report-vga-pan-tilt-cctv',
    filename: 'vga-readme-22.png',
    name: 'VGA Pan-Tilt CCTV 상세 보고서 그림 22',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/readme/vga-readme-22.png',
  },

  {
    act_id: 'vga-pan-tilt-cctv-thumbnail',
    filename: 'vga-pan-tilt-cctv-thumbnail.gif',
    name: 'VGA Pan-Tilt CCTV 썸네일',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/vga-pan-tilt-cctv-thumbnail.gif',
  },

  {
    act_id: 'detail-report-vga-pan-tilt-cctv',
    filename: 'vga-readme-23.gif',
    name: '자동 추적과 수동 모드 전환 시연',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/readme/vga-readme-23.gif',
  },

  {
    act_id: 'detail-report-vga-pan-tilt-cctv',
    filename: 'vga-readme-24.gif',
    name: '부호 반전 전 서보 동작',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/readme/vga-readme-24.gif',
  },

  {
    act_id: 'detail-report-vga-pan-tilt-cctv',
    filename: 'vga-readme-25.gif',
    name: '부호 반전 전 모니터 화면 2배속',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/readme/vga-readme-25.gif',
  },

  {
    act_id: 'detail-report-vga-pan-tilt-cctv',
    filename: 'vga-readme-26.png',
    name: 'VGA Pan-Tilt CCTV 상세 보고서 그림 26',
    type: 'None',
    startDate: '2026-09-08',
    remotePathOverride: 'media/photos/projects/VGA-Pan-Tilt-CCTV/readme/vga-readme-26.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-01.gif',
    name: 'LightLetter 상세 보고서 그림 1',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-01.gif',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-02.png',
    name: 'LightLetter 상세 보고서 그림 2',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-02.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-03.gif',
    name: 'LightLetter 상세 보고서 그림 3',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-03.gif',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-04.gif',
    name: 'LightLetter 상세 보고서 그림 4',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-04.gif',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-05.gif',
    name: 'LightLetter 상세 보고서 그림 5',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-05.gif',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-06.gif',
    name: 'LightLetter 상세 보고서 그림 6',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-06.gif',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-07.gif',
    name: 'LightLetter 상세 보고서 그림 7',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-07.gif',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-08.png',
    name: 'LightLetter 상세 보고서 그림 8',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-08.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-09.png',
    name: 'LightLetter 상세 보고서 그림 9',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-09.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-10.png',
    name: 'LightLetter 상세 보고서 그림 10',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-10.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-11.png',
    name: 'LightLetter 상세 보고서 그림 11',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-11.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-12.png',
    name: 'LightLetter 상세 보고서 그림 12',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-12.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-13.png',
    name: 'LightLetter 상세 보고서 그림 13',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-13.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-14.png',
    name: 'LightLetter 상세 보고서 그림 14',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-14.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-15.png',
    name: 'LightLetter 상세 보고서 그림 15',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-15.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-16.gif',
    name: 'LightLetter 상세 보고서 그림 16',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-16.gif',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-17.png',
    name: 'LightLetter 상세 보고서 그림 17',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-17.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-18.png',
    name: 'LightLetter 상세 보고서 그림 18',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-18.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-19.png',
    name: 'LightLetter 상세 보고서 그림 19',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-19.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-20.png',
    name: 'LightLetter 상세 보고서 그림 20',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-20.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-21.png',
    name: 'LightLetter 상세 보고서 그림 21',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-21.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-22.png',
    name: 'LightLetter 상세 보고서 그림 22',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-22.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-23.png',
    name: 'LightLetter 상세 보고서 그림 23',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-23.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-24.png',
    name: 'LightLetter 상세 보고서 그림 24',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-24.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-25.gif',
    name: 'LightLetter 상세 보고서 그림 25',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-25.gif',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-26.png',
    name: 'LightLetter 상세 보고서 그림 26',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-26.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-27.png',
    name: 'LightLetter 상세 보고서 그림 27',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-27.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-28.png',
    name: 'LightLetter 상세 보고서 그림 28',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-28.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-29.png',
    name: 'LightLetter 상세 보고서 그림 29',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-29.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-30.png',
    name: 'LightLetter 상세 보고서 그림 30',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-30.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-31.png',
    name: 'LightLetter 상세 보고서 그림 31',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-31.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-32.gif',
    name: 'LightLetter 상세 보고서 그림 32',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-32.gif',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-33.gif',
    name: 'LightLetter 상세 보고서 그림 33',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-33.gif',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-34.gif',
    name: 'LightLetter 상세 보고서 그림 34',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-34.gif',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-35.png',
    name: 'LightLetter 상세 보고서 그림 35',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-35.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-36.png',
    name: 'LightLetter 상세 보고서 그림 36',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-36.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-37.png',
    name: 'LightLetter 상세 보고서 그림 37',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-37.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-38.png',
    name: 'LightLetter 상세 보고서 그림 38',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-38.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-39.png',
    name: 'LightLetter 상세 보고서 그림 39',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-39.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-40.png',
    name: 'LightLetter 상세 보고서 그림 40',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-40.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-report-41.png',
    name: 'LightLetter 상세 보고서 그림 41',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/report/lightletter-report-41.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-conv-zero-gating.png',
    name: 'LightLetter Convolution Layer와 Zero Gating Array',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/portfolio/lightletter-conv-zero-gating.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-output-stage.png',
    name: 'LightLetter Convolution 출력단 구조',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/portfolio/lightletter-output-stage.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-out-reorder.png',
    name: 'LightLetter Lane Packer와 Out Reorder',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/portfolio/lightletter-out-reorder.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-fc-per-layer.png',
    name: 'LightLetter FC 층별 전용 엔진',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/portfolio/lightletter-fc-per-layer.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-fc-shared.png',
    name: 'LightLetter FC 공유 엔진',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/portfolio/lightletter-fc-shared.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-aruco-detect.png',
    name: 'LightLetter ArUco 마커 검출과 크롭 범위',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/portfolio/lightletter-aruco-detect.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-aruco-frame.png',
    name: 'LightLetter ArUco 크롭 전 촬영 프레임',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/portfolio/lightletter-aruco-frame.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-aruco-crop.png',
    name: 'LightLetter ArUco 크롭 결과',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/portfolio/lightletter-aruco-crop.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-seq-output-buffer-conv2.png',
    name: 'LightLetter Output Buffer conv2 sequence',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/portfolio/lightletter-seq-output-buffer-conv2.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-seq-relu-quant.png',
    name: 'LightLetter ReLU·양자화 sequence',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/portfolio/lightletter-seq-relu-quant.png',
  },

  {
    act_id: 'detail-report-lightletter',
    filename: 'lightletter-seq-fc.png',
    name: 'LightLetter FC 전체 sequence',
    type: 'None',
    startDate: '2026-10-15',
    remotePathOverride: 'media/photos/projects/LightLetter/portfolio/lightletter-seq-fc.png',
  },
] as const satisfies readonly OneDriveAssetBlueprint[];

const buildOneDriveAsset = (asset: OneDriveAssetBlueprint): OneDriveAssetDefinition => {
  const remotePathOriginal = remapLegacyOneDriveRemotePath(
    asset.remotePathOverride ?? buildHighlightRemotePath(asset.filename),
  );
  const publicFilename = normalizePublicFilename(asset.filename);
  const publicPathOriginal = `${publicBasePath}${publicFilename}`;
  const isResizableImage = isResizableImageFilename(asset.filename);
  const isOptimizedMotion = isOptimizedMotionFilename(asset.filename);
  const hasVideoPoster = hasVideoPosterFilename(asset.filename);
  const hasOptimizedDefault = isResizableImage || isOptimizedMotion;
  const optimizedFilename = isResizableImage
    ? buildOptimizedImageFilename(asset.filename)
    : asset.filename;

  const remotePathDefault = hasOptimizedDefault ? buildDevStorageRemotePath('default', optimizedFilename) : remotePathOriginal;
  const publicPathDefault = hasOptimizedDefault
    ? buildDevStoragePublicPath('default', normalizePublicFilename(optimizedFilename))
    : publicPathOriginal;
  const posterFilename = hasVideoPoster ? buildVideoPosterFilename(asset.filename) : undefined;
  const remotePathPoster = posterFilename
    ? buildDevStorageRemotePath('default', posterFilename)
    : undefined;
  const publicPathPoster = posterFilename
    ? buildDevStoragePublicPath('default', posterFilename)
    : undefined;
  // Motion originals are not synced, so preview a GIF by its optimized copy and a video by its poster.
  const remotePathThumb = remotePathPoster ?? (hasOptimizedDefault ? remotePathDefault : remotePathOriginal);
  const publicPathThumb = publicPathPoster ?? (hasOptimizedDefault ? publicPathDefault : publicPathOriginal);

  return {
    ...asset,
    remotePath: remotePathDefault,
    publicPath: publicPathDefault,
    remotePathOriginal,
    publicPathOriginal,
    remotePathThumb,
    publicPathThumb,
    remotePathPoster,
    publicPathPoster,
    isResizableImage,
    isOptimizedMotion,
    hasOptimizedDefault,
    hasVideoPoster,
  };
};

export const onedriveAssets = onedriveAssetBlueprints.map(buildOneDriveAsset) as readonly OneDriveAssetDefinition[];

export const onedriveAssetMap = onedriveAssets.reduce((map, asset) => {
  const ids = Array.isArray(asset.act_id) ? asset.act_id : [asset.act_id];
  ids.forEach(id => {
    map[id] = asset;
  });
  return map;
}, {} as Record<string, OneDriveAssetDefinition>);

const onedriveAssetFilenameMap = onedriveAssets.reduce((map, asset) => {
  getNormalizationVariants(asset.filename).forEach(variant => {
    map[variant.trim().toLowerCase()] = asset;
  });
  return map;
}, {} as Record<string, OneDriveAssetDefinition>);

export function getOneDriveAssetByFilename(filename: string): OneDriveAssetDefinition | undefined {
  const normalized = filename.trim().toLowerCase();
  return onedriveAssetFilenameMap[normalized];
}

export function getOneDriveAssetUrl(
  asset: OneDriveAssetDefinition,
  size: 'thumb' | 'default' | 'original' = 'default',
): string {
  if (size === 'thumb') {
    return asset.publicPathThumb;
  }
  if (size === 'original') return asset.publicPathOriginal;
  return asset.publicPath;
}

export function getOneDriveAssetsByActId(actId: string): readonly OneDriveAssetDefinition[] {
  const normalizedTarget = actId.trim().toLowerCase();
  return onedriveAssets.filter(asset => {
    const ids = Array.isArray(asset.act_id) ? asset.act_id : [asset.act_id];
    return ids.some(id => {
      const normalizedId = id.trim().toLowerCase();
      return (
        normalizedId === normalizedTarget ||
        normalizedId.includes(normalizedTarget) ||
        normalizedTarget.includes(normalizedId)
      );
    });
  });
}
