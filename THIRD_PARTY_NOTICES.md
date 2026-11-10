# Third-party notices

The original source in this repository is distributed under the MIT license in `LICENSE`. The following tools and optional dependencies are installed separately; their software and model weights are not relicensed by this repository.

| Component | Use | Source |
| --- | --- | --- |
| Apple Foundation, Network, Security, CryptoKit | Native transport and Keychain | Apple platform SDKs |
| Python and SQLite | Local client and cache | Python standard library |
| Whisper.cpp | Optional local transcription | https://github.com/ggml-org/whisper.cpp |
| FFmpeg | Optional local audio conversion | https://ffmpeg.org/ |
| sherpa-onnx and sherpa-onnx-core | Optional speaker diarization | https://github.com/k2-fsa/sherpa-onnx |
| NumPy and SoundFile | Optional audio input and numerical processing | https://numpy.org/ and https://github.com/bastibe/python-soundfile |
| llama.cpp | Optional local semantic embedding runtime | https://github.com/ggml-org/llama.cpp |
| EmbeddingGemma | Optional semantic retrieval model, subject to Gemma terms | https://huggingface.co/ggml-org/embeddinggemma-300M-GGUF and https://ai.google.dev/gemma/terms |
| uv and Python Build Standalone | Private first-run package manager and Python runtime | https://github.com/astral-sh/uv and https://github.com/astral-sh/python-build-standalone |
| CMake | Isolated Whisper.cpp build tool | https://cmake.org/ |
| imageio-ffmpeg | Isolated FFmpeg distribution | https://github.com/imageio/imageio-ffmpeg |

Optional Python package versions and distribution hashes are pinned in `scripts/uv.lock`. FFmpeg licensing depends on the selected build. Speaker segmentation, embedding, and speech-recognition weights have their own licenses and access conditions; review those at the source before use.

First-run downloads are not bundled in this repository. Runtime archives are
pinned in `scripts/runtime-assets.tsv`; audio sources, weights, hashes, and model
licenses are recorded in `scripts/audio-assets.json`. Whisper.cpp and Whisper
weights use MIT; the selected public segmentation export uses MIT and CAMPPlus
uses Apache-2.0. The imageio-ffmpeg wrapper uses BSD-2-Clause. Its selected macOS
FFmpeg binary is a GPL-enabled build; the audited arm64 wheel reports
GPL-2.0-or-later. Preserve and consult the installed wheel's license files.

No Auday app source, third-party application logos, model weights, personal recordings, or private datasets are bundled. Tests generate synthetic data locally.

## DSH adapter

The browser artifact bundles selected Zod 4.4.3 validators and Typert metadata
from DeepSeek Harness 0.2.2-rc.1. React and Cordis are supplied by the host.
The build setup is adapted from dsh-kaitu-fortune.

The following components use the MIT license reproduced below:

| Component | Copyright | Source |
| --- | --- | --- |
| Zod | Copyright (c) 2025 Colin McDonnell | https://github.com/colinhacks/zod |
| DeepSeek Harness | Copyright (c) 2026 DeepSeek | https://github.com/deepseek-ai/deepseek-harness |
| dsh-kaitu-fortune | Copyright (c) 2026 Guo Yihong | https://github.com/Stahl-G/dsh-kaitu-fortune |

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
