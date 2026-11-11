# AudioDrop

유튜브 영상 링크를 MP3 또는 WAV로 저장하는 macOS 앱입니다. 영상 한 개씩 처리하며, 별도의 서버나 계정 설정 없이 실행합니다.

## 사용 방법

1. 빌드한 `AudioDrop.app`을 응용 프로그램 폴더로 복사해 실행합니다.
2. 유튜브 링크를 붙여 넣고 MP3 또는 WAV를 선택합니다.
3. 추출을 누릅니다. 기본 저장 위치는 `~/Downloads/AudioDrop`이며 앱에서 변경할 수 있습니다.

변환 취소를 지원하며, 같은 이름의 파일은 번호를 붙여 기존 파일을 보존합니다. WAV 변환은 원본 음질을 복원하지 않습니다. 다운로드 권한이 있는 콘텐츠에 사용하세요.

## 개발 및 빌드

Apple Silicon Mac, macOS 13 이상, Node.js/npm, Xcode Command Line Tools가 필요합니다.

```sh
npm ci
node scripts/fetch-runtime.mjs
bash scripts/build-audio.sh
npm start
```

`fetch-runtime.mjs`는 공식 yt-dlp 실행 파일을 다운로드하고 고정된 SHA-256 해시를 검증합니다. `build-audio.sh`는 FFmpeg/FFprobe와 LAME를 소스에서 빌드하므로 인터넷 연결과 컴파일 시간이 필요합니다.

```sh
npm run package
```

결과는 `dist-portable/AudioDrop-darwin-arm64/AudioDrop.app`입니다. 앱은 yt-dlp, FFmpeg, FFprobe를 포함하고 Electron의 Node 런타임을 사용하므로 설치 후 Python이나 Homebrew에 의존하지 않습니다. 배포용 ZIP은 `npm run release`로 생성합니다. 자체 서명 빌드이며 Apple 공증은 포함하지 않습니다.

## 확인 방법

```sh
node_modules/.bin/electron test/smoke.cjs
node_modules/.bin/electron test/conversion.cjs
```

변환 검사는 인터넷에 연결해 테스트 영상의 MP3·WAV를 임시 폴더에 생성하고 FFprobe로 코덱을 확인합니다. YouTube 측 제한이나 변경에 따라 일부 영상은 실패할 수 있습니다.

## 1.0.1

- yt-dlp를 2026.10.26으로 업데이트했습니다.
- 잘못된 링크에 대한 한국어 안내를 개선했습니다.
- yt-dlp가 추가하는 MOV faststart 옵션을 MP3/WAV 전용 FFmpeg 호환 래퍼에서 제외해 변환 오류를 수정했습니다. 실제 바이너리는 `runtime/ffmpeg-audio`입니다.
- 실제 MP3 및 WAV 다운로드·변환과 결과 코덱 검사를 통과했습니다.

외부 프로그램의 라이선스는 [THIRD-PARTY-NOTICES.txt](THIRD-PARTY-NOTICES.txt)를 참고하세요. 빌드 산출물, 의존성, 음원, 개인 설정은 저장소에 포함하지 않습니다.
