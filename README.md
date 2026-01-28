# yeonwoofolio

## dev-storage + Vercel Blob 파이프라인 (초안)

이 섹션은 기존 OneDrive 동기화 흐름을 대체하는 **서비스용 파이프라인** 초안입니다.

### 개요
- **원본 보관:** OneDrive는 원본 아카이브용으로만 유지합니다.
- **로컬 파생본:** 로컬에서 `dev-storage` 리사이즈(정적 이미지 기본 1600px) 및 필요한 경우 썸네일(480px)을 생성합니다.
- **배포 저장소:** `dev-storage` 산출물을 Vercel Blob에 업로드합니다.
- **서비스 렌더링:** 앱은 Blob URL만 렌더링합니다(OneDrive 직접 참조 금지).

### 필수 환경 변수
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob 업로드 토큰.
- `NEXT_PUBLIC_DEV_STORAGE_BASE_URL`: Blob public base URL (예: `https://<store>.public.blob.vercel-storage.com`).
- `DEV_STORAGE_OUTPUT_ROOT`: 로컬 dev-storage 출력 경로(기본 `.dev-storage-media`).

### 로컬 → OneDrive → Blob 업로드 플로우 (요약)
```bash
# 1) 로컬에서 dev-storage 리사이즈 생성 + OneDrive 업로드
export ONEDRIVE_LOCAL_ROOT="/Users/yonmilk/Library/CloudStorage/OneDrive-Personal"
npm run derive:onedrive

# 2) 로컬 dev-storage 산출물을 Vercel Blob에 업로드
npm run upload:dev-storage
```

### 경로 규칙
- 기본 이미지: `Photos/dev-storage/{filename}`
- 썸네일(필요 항목만): `Photos/dev-storage/thumb/{filename}`

### 썸네일 사용 기준
- **리스트/카드/미리보기**에만 썸네일을 사용합니다.
- **상세 페이지**는 기본 `dev-storage` 이미지만 사용합니다.

### GIF/MP4 최적화 정책 (TODO)
- 별도 정책 수립 후 반영 예정 (Hobby 1GB 제한 고려).

---

## OneDrive 자산 동기화 (Manifest 기반)

1. **필요한 파일만 정의**  
   - `src/data/onedrive-assets.ts`가 블로그에서 쓰일 이미지 목록(OneDrive 상대 경로, 퍼블릭 경로, alt 등)을 단일 소스로 관리합니다.
   - MDX/TS 컴포넌트에서는 `import { getOneDriveAssetUrl, onedriveAssetMap } from '@/data/onedrive-assets'` 후 `getOneDriveAssetUrl(onedriveAssetMap['asset-id'])`를 사용하면 `<img>`에 경로를 하드코딩할 필요가 없습니다.

2. **동기화 스크립트 실행**  
   ```bash
   npm run sync:onedrive   # 수동 실행 (dev 서버 실행 전 등)
   ```
   - `package.json`의 `prebuild`가 `npm run build` 전에 자동으로 실행됩니다.
   - `NEXT_PUBLIC_DEV_STORAGE_BASE_URL`가 설정되어 있으면 동기화를 건너뜁니다.
   - `public/import-data/*`는 `.gitignore`로 제외되어 저장소에는 사진이 남지 않고, 빌드 아티팩트에만 포함됩니다.

3. **리사이즈 파생본 생성 (권장)**  
   - 원본 대신 리사이즈된 이미지(default 1600px)를 OneDrive에 업로드합니다.
   - 썸네일이 필요한 항목만 `dev-storage/thumb`에 480px 버전을 생성합니다.
   - 빌드 시에는 dev-storage 이미지를 우선 내려받고, 없으면 원본으로 폴백합니다.
   ```bash
   export ONEDRIVE_LOCAL_ROOT="/Users/yonmilk/Library/CloudStorage/OneDrive-Personal"
   npm run derive:onedrive
   ```
   - OneDrive 경로: `Photos/dev-storage/{filename}` 및 `Photos/dev-storage/thumb/{filename}`
   - 퍼블릭 경로: `/import-data/dev-storage/{filename}` 및 `/import-data/dev-storage/thumb/{filename}`

4. **로컬 개발 (복사 없이 사용)**  
   - OneDrive 클라이언트가 `/Users/<you>/Library/CloudStorage/OneDrive-Personal`에 모든 파일을 동기화한다고 가정합니다.
   - `.zshrc` 등에 아래 환경 변수를 추가하면, 스크립트가 필요한 파일만 심볼릭 링크로 노출하고 복사하지 않습니다.
     ```bash
     export ONEDRIVE_LOCAL_ROOT="/Users/yonmilk/Library/CloudStorage/OneDrive-Personal"
     ```
- 이후 `npm run sync:onedrive`를 실행하면 `public/import-data/...` 경로가 지정된 파일을 그대로 가리킵니다.

5. **Vercel 배포**  
   - rclone remote는 기본으로 `oow214-onedrive:`를 사용합니다. 다른 remote를 쓰면 `ONEDRIVE_REMOTE_BASE`를 덮어쓰세요.
   - 빌드 머신에 rclone 설정을 주입하려면 로컬에서 `base64 < ~/.config/rclone/rclone.conf | pbcopy` 후, Vercel 환경 변수 `RCLONE_CONFIG_BASE64`에 붙여 넣습니다. (`RCLONE_CONFIG_CONTENTS`에 원본을 그대로 넣어도 됩니다.)
   - 빌드 커맨드는 `npm run build`를 사용하면 `prebuild → sync-onedrive → next build` 순서로 실행됩니다. rclone 이진이 없을 경우 스크립트가 알아서 포터블 버전을 내려받습니다.
   - Blob URL을 사용하는 환경에서는 `NEXT_PUBLIC_DEV_STORAGE_BASE_URL`를 설정해 동기화를 스킵합니다.

6. **유틸 환경 변수**  
   - `ONEDRIVE_LOCAL_ROOT`: 로컬 OneDrive 루트. 지정 시 rclone 복사 대신 심볼릭 링크를 생성합니다.
   - `DEV_STORAGE_OUTPUT_ROOT`: dev-storage 로컬 출력 경로(기본 `.dev-storage-media`).
   - `ONEDRIVE_DEV_STORAGE_OUTPUT_ROOT`: 이전 호환용 (동일 역할).
   - `NEXT_PUBLIC_DEV_STORAGE_BASE_URL`: Blob base URL 설정 시 OneDrive 동기화가 자동으로 비활성화됩니다.
   - `SKIP_ONEDRIVE_SYNC=1`: OneDrive 동기화를 강제로 비활성화합니다.
   - `ENABLE_ONEDRIVE_NFC=1`: OneDrive 원본 파일명을 NFC로 정규화합니다(기본 비활성).
   - `SKIP_ONEDRIVE_DOWNLOAD=1`: 원격 복사를 강제로 건너뜁니다(로컬 루트가 있을 때 테스트 용도).
   - `SKIP_ONEDRIVE_UPLOAD=1`: 파생본 업로드를 건너뜁니다.
   - `ONEDRIVE_REMOTE_BASE`: rclone remote prefix(기본 `oow214-onedrive:`).
   - `RCLONE_BINARY`: 커스텀 rclone 경로.

이 플로우를 따르면 필요한 이미지(Manifest에 정의된 항목)만 로컬/배포 환경에 노출되고, `<img src="/import-data/...">` 경로가 항상 빠른 정적 자산을 가리키게 됩니다.
