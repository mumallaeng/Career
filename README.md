# intro

## Drive1 자산 동기화 (Manifest 기반)

1. **필요한 파일만 정의**  
   - `src/data/drive1-assets.ts`가 블로그에서 쓰일 이미지 목록(Drive1 상대 경로, 퍼블릭 경로, alt 등)을 단일 소스로 관리합니다.
   - MDX/TS 컴포넌트에서는 `import { drive1AssetMap } from '@/data/drive1-assets'` 후 `drive1AssetMap['asset-id'].publicPath`를 사용하면 `<img>`에 경로를 하드코딩할 필요가 없습니다.

2. **동기화 스크립트 실행**  
   ```bash
   npm run sync:drive1   # 수동 실행 (dev 서버 실행 전 등)
   ```
   - `package.json`의 `prebuild`가 `npm run build` 전에 자동으로 실행하므로, Vercel·CI에서도 동일한 자산이 준비됩니다.
   - `public/import-data/*`는 `.gitignore`로 제외되어 저장소에는 사진이 남지 않고, 빌드 아티팩트에만 포함됩니다.

3. **로컬 개발 (복사 없이 사용)**  
   - Drive1 클라이언트가 `/Users/<you>/Library/CloudStorage/Drive1-Personal`에 모든 파일을 동기화한다고 가정합니다.
   - `.zshrc` 등에 아래 환경 변수를 추가하면, 스크립트가 필요한 파일만 심볼릭 링크로 노출하고 복사하지 않습니다.
     ```bash
     export DRIVE1_LOCAL_ROOT="/Users/yonmilk/Library/CloudStorage/Drive1-Personal"
     ```
- 이후 `npm run sync:drive1`를 실행하면 `public/import-data/...` 경로가 지정된 파일을 그대로 가리킵니다.

4. **Vercel 배포**  
   - rclone remote는 기본으로 `oow214-1drive:`를 사용합니다. 다른 remote를 쓰면 `DRIVE1_REMOTE_BASE`를 덮어쓰세요.
   - 빌드 머신에 rclone 설정을 주입하려면 로컬에서 `base64 < ~/.config/rclone/rclone.conf | pbcopy` 후, Vercel 환경 변수 `RCLONE_CONFIG_BASE64`에 붙여 넣습니다. (`RCLONE_CONFIG_CONTENTS`에 원본을 그대로 넣어도 됩니다.)
   - 빌드 커맨드는 그대로 `npm run build`를 사용하면 `prebuild → sync-drive1 → next build` 순서로 실행됩니다. rclone 이진이 없을 경우 스크립트가 알아서 포터블 버전을 내려받습니다.

5. **유틸 환경 변수**  
   - `DRIVE1_LOCAL_ROOT`: 로컬 Drive1 루트. 지정 시 rclone 복사 대신 심볼릭 링크를 생성합니다.
   - `SKIP_DRIVE1_DOWNLOAD=1`: 원격 복사를 강제로 건너뜁니다(로컬 루트가 있을 때 테스트 용도).
   - `DRIVE1_REMOTE_BASE`: rclone remote prefix(기본 `oow214-1drive:`).
   - `RCLONE_BINARY`: 커스텀 rclone 경로.

이 플로우를 따르면 필요한 이미지(Manifest에 정의된 항목)만 로컬/배포 환경에 노출되고, `<img src="/import-data/...">` 경로가 항상 빠른 정적 자산을 가리키게 됩니다.
