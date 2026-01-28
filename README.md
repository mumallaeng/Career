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

# 1.5) GIF/MP4 최적화 후 dev-storage 업로드 (선택)
npm run optimize:videos

# 2) 로컬 dev-storage 산출물을 Vercel Blob에 업로드
npm run upload:dev-storage
```

### 경로 규칙
- 기본 이미지: `Photos/dev-storage/{filename}`
- 썸네일(필요 항목만): `Photos/dev-storage/thumb/{filename}`

### 썸네일 사용 기준
- **리스트/카드/미리보기**에만 썸네일을 사용합니다.
- **상세 페이지**는 기본 `dev-storage` 이미지만 사용합니다.

### GIF/MP4 최적화 정책
아래는 dev-storage 생성 단계에서 사용하는 실행 예시입니다. 기준은 **Hobby 1GB** 한도를 고려해
개별 자산을 10MB 내외로 유지하는 것을 목표로 합니다.

**GIF 리사이즈 (GIF 유지, 용량 절감용)**
```bash
ffmpeg -i input.gif \
  -vf "fps=15,scale='min(1600,iw)':-2:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=diff:max_colors=128[p];[s1][p]paletteuse=dither=bayer:bayer_scale=4" \
  -gifflags -offsetting \
  output.gif
```

**MP4 재인코딩 (해상도/프레임/용량 상한 적용)**
```bash
ffmpeg -i input.mp4 \
  -vf "scale='min(1600,iw)':-2,fps=30" \
  -movflags +faststart -pix_fmt yuv420p \
  -c:a aac -b:a 128k -crf 24 -preset medium \
  output.mp4
```

**썸네일 추출 (필요 항목만, 480px)**
```bash
ffmpeg -i input.mp4 \
  -vf "scale=480:-2" -frames:v 1 \
  output.jpg
```

**용량 상한 점검 (예: 10MB)**
```bash
stat -f%z output.mp4
```

**자동화 스크립트**
```bash
npm run optimize:videos
```
- 대상: `src/data/onedrive-assets.ts`에 등록된 `.gif`, `.mp4`, `.webm`
- 기본 출력: `.dev-storage-media/{filename}`
- 업로드: `Photos/dev-storage/{filename}`
- 환경 변수:
  - `DEV_STORAGE_VIDEO_MAX_DIMENSION` (기본 1600)
  - `DEV_STORAGE_VIDEO_FALLBACK_MAX_DIMENSION` (기본 1280, 상한 초과 시 추가 다운스케일)
  - `DEV_STORAGE_VIDEO_MAX_FPS` (기본 30)
  - `DEV_STORAGE_VIDEO_MAX_MB` (기본 10)
  - `DEV_STORAGE_VIDEO_MIN_CRF` (기본 24)
  - `DEV_STORAGE_VIDEO_MAX_CRF` (기본 34)
  - `DEV_STORAGE_GIF_MAX_FPS` (기본 15)
  - `DEV_STORAGE_GIF_FALLBACK_MAX_DIMENSION` (기본 960)
  - `DRY_RUN=1` 또는 `DEV_STORAGE_DRY_RUN=1` (명령 출력만, 실제 변환/업로드 없음)
  - `DEV_STORAGE_FAIL_ON_VIDEO_MAX=1` (상한 초과 시 실패)
  - `SKIP_ONEDRIVE_UPLOAD=1` (업로드 스킵)

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
   - `SKIP_ONEDRIVE_DOWNLOAD=1`: 원격 복사를 강제로 건너뜁니다(로컬 루트가 있을 때 테스트 용도).
   - `SKIP_ONEDRIVE_UPLOAD=1`: 파생본 업로드를 건너뜁니다.
   - `ONEDRIVE_REMOTE_BASE`: rclone remote prefix(기본 `oow214-onedrive:`).
   - `RCLONE_BINARY`: 커스텀 rclone 경로.

이 플로우를 따르면 필요한 이미지(Manifest에 정의된 항목)만 로컬/배포 환경에 노출되고, `<img src="/import-data/...">` 경로가 항상 빠른 정적 자산을 가리키게 됩니다.
