#!/bin/bash
set -euo pipefail
project_dir="$(cd "$(dirname "$0")/.." && pwd)"
build_dir="$(mktemp -d /private/tmp/audiodrop-build.XXXXXX)"
export MACOSX_DEPLOYMENT_TARGET=13.0
export PATH=/usr/bin:/bin:/usr/sbin:/sbin
mkdir -p "$project_dir/runtime/sources"
curl --fail --location --retry 2 'https://downloads.sourceforge.net/project/lame/lame/3.100/lame-3.100.tar.gz' -o "$project_dir/runtime/sources/lame-3.100.tar.gz"
curl --fail --location --retry 2 'https://ffmpeg.org/releases/ffmpeg-8.1.tar.xz' -o "$project_dir/runtime/sources/ffmpeg-8.1.tar.xz"
tar -xzf "$project_dir/runtime/sources/lame-3.100.tar.gz" -C "$build_dir"
tar -xJf "$project_dir/runtime/sources/ffmpeg-8.1.tar.xz" -C "$build_dir"
cd "$build_dir/lame-3.100"
./configure --prefix="$build_dir/deps" --disable-shared --enable-static --disable-frontend --disable-dependency-tracking CFLAGS='-O2 -mmacosx-version-min=13.0' > "$build_dir/lame-config.log" 2>&1
make -j4 > "$build_dir/lame-build.log" 2>&1
make install >> "$build_dir/lame-build.log" 2>&1
cd "$build_dir/ffmpeg-8.1"
./configure --prefix="$build_dir/output" --cc=clang --arch=arm64 --target-os=darwin --disable-autodetect --disable-everything --disable-doc --disable-debug --disable-shared --enable-static --disable-ffplay --enable-ffmpeg --enable-ffprobe --enable-libmp3lame --enable-protocol=file,pipe --enable-demuxer=mov,matroska,ogg,mp3,aac,wav,flac --enable-decoder=aac,opus,vorbis,mp3,mp3float,flac,pcm_s16le,pcm_s24le,pcm_s32le,pcm_f32le --enable-encoder=libmp3lame,pcm_s16le --enable-muxer=mp3,wav --enable-parser=aac,mpegaudio,opus,vorbis,flac --enable-filter=aresample,aformat,anull,atrim,asetpts --extra-cflags="-I$build_dir/deps/include -mmacosx-version-min=13.0" --extra-ldflags="-L$build_dir/deps/lib -mmacosx-version-min=13.0" > "$build_dir/ffmpeg-config.log" 2>&1
make -j4 > "$build_dir/ffmpeg-build.log" 2>&1
cp ffmpeg "$project_dir/runtime/ffmpeg-audio"
cp ffprobe "$project_dir/runtime/"
cp "$project_dir/scripts/ffmpeg-wrapper.sh" "$project_dir/runtime/ffmpeg"
chmod +x "$project_dir/runtime/ffmpeg"
cp COPYING.LGPLv2.1 "$project_dir/runtime/FFmpeg-LICENSE.txt"
cp "$build_dir/lame-3.100/COPYING" "$project_dir/runtime/LAME-LICENSE.txt"
./ffmpeg -version > "$project_dir/runtime/FFmpeg-BUILD.txt" 2>&1
cp "$project_dir/scripts/build-audio.sh" "$project_dir/runtime/sources/build-audio.sh"
echo "Audio tools built successfully. Logs: $build_dir"
