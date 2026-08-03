"""Model license audit (PRD §4 / §8).

The PRD is explicit: "A licence review must gate the build, not follow it."
Several of the strongest open models are commercially unusable. Encoding that
as data — rather than tribal knowledge — means the pipeline can refuse to wire
in a non-shippable model instead of discovering the problem in production.

``shippable`` is the single machine-checked gate. It is False whenever a model
cannot be shipped in a commercial SaaS/on-prem product without extra legal work
(non-commercial license, territorial restriction, or an unreviewed revenue cap).

> Cutoff caveat (PRD §4): this reflects the landscape to ~May 2026 and must be
> re-verified before any build commitment.
"""
from __future__ import annotations

import enum
from dataclasses import dataclass


class LicenseClass(str, enum.Enum):
    PERMISSIVE = "permissive"          # Apache-2.0 / MIT — ship freely
    OPEN_OTHER = "open_other"          # open but bespoke terms — read carefully
    NON_COMMERCIAL = "non_commercial"  # do not ship
    TERRITORIAL = "territorial"        # geographic restrictions — legal review
    REVENUE_CAPPED = "revenue_capped"  # ok under a threshold — verify


class Role(str, enum.Enum):
    LIPSYNC = "lipsync"
    TTS = "tts"
    VIDEO = "video"          # generative B-roll (secondary, PRD §4.3)
    IMAGE = "image"
    UPSCALE = "upscale"
    INTERPOLATION = "interpolation"
    ASR = "asr"
    MATTING = "matting"


@dataclass(frozen=True)
class ModelEntry:
    key: str
    name: str
    role: Role
    origin: str
    license: str
    license_class: LicenseClass
    shippable: bool
    notes: str = ""


# The catalog mirrors the PRD §4 tables. Where the PRD flags a trap, the entry
# is marked shippable=False with the reason in ``notes``.
CATALOG: dict[str, ModelEntry] = {
    e.key: e
    for e in [
        # ---- 4.1 lip-sync / avatar (core) ----
        ModelEntry("latentsync", "LatentSync", Role.LIPSYNC, "ByteDance",
                   "Open", LicenseClass.OPEN_OTHER, True,
                   "Strongest open lip-sync. Primary candidate."),
        ModelEntry("musetalk", "MuseTalk", Role.LIPSYNC, "Tencent",
                   "MIT", LicenseClass.PERMISSIVE, True,
                   "Real-time capable, lower fidelity. Low-latency tier."),
        ModelEntry("liveportrait", "LivePortrait", Role.LIPSYNC, "Kuaishou",
                   "Open", LicenseClass.OPEN_OTHER, True,
                   "Portrait animation, expression transfer."),
        ModelEntry("echomimic", "EchoMimic", Role.LIPSYNC, "Ant Group",
                   "Apache-2.0", LicenseClass.PERMISSIVE, True,
                   "Audio-driven, good for stills."),

        # ---- 4.2 voice / TTS ----
        ModelEntry("kokoro_82m", "Kokoro-82M", Role.TTS, "—",
                   "Apache-2.0", LicenseClass.PERMISSIVE, True,
                   "Clean, very light. Stock voices, no cloning."),
        ModelEntry("f5_tts", "F5-TTS", Role.TTS, "—",
                   "MIT", LicenseClass.PERMISSIVE, True,
                   "Zero-shot cloning. Cloning primary."),
        ModelEntry("cosyvoice2", "CosyVoice 2", Role.TTS, "Alibaba",
                   "Apache-2.0", LicenseClass.PERMISSIVE, True,
                   "Strong multilingual."),
        ModelEntry("chatterbox", "Chatterbox", Role.TTS, "—",
                   "MIT", LicenseClass.PERMISSIVE, True,
                   "Clean, good prosody."),
        ModelEntry("xtts_v2", "XTTS-v2", Role.TTS, "Coqui",
                   "CPML", LicenseClass.NON_COMMERCIAL, False,
                   "TRAP: non-commercial (CPML). Obvious-looking, do not ship."),

        # ---- 4.3 generative video (secondary, B-roll only) ----
        ModelEntry("wan22", "Wan 2.2", Role.VIDEO, "Alibaba",
                   "Apache-2.0", LicenseClass.PERMISSIVE, True,
                   "Strongest open T2V/I2V. 14B and 1.3B variants."),
        ModelEntry("ltx_video", "LTX-Video", Role.VIDEO, "Lightricks",
                   "Open", LicenseClass.OPEN_OTHER, True,
                   "Fastest. Near-real-time at lower res."),
        ModelEntry("hunyuanvideo", "HunyuanVideo", Role.VIDEO, "Tencent",
                   "Custom", LicenseClass.TERRITORIAL, False,
                   "TRAP: territorial restrictions. Legal review required."),
        ModelEntry("mochi1", "Mochi 1", Role.VIDEO, "Genmo",
                   "Apache-2.0", LicenseClass.PERMISSIVE, True,
                   "Apache-clean fallback."),

        # ---- 4.4 image / thumbnails ----
        ModelEntry("flux1_schnell", "FLUX.1 [schnell]", Role.IMAGE, "Black Forest Labs",
                   "Apache-2.0", LicenseClass.PERMISSIVE, True, "Ship this."),
        ModelEntry("flux1_dev", "FLUX.1 [dev]", Role.IMAGE, "Black Forest Labs",
                   "Non-commercial", LicenseClass.NON_COMMERCIAL, False,
                   "TRAP: non-commercial. Do not ship without a BFL license."),
        ModelEntry("sdxl", "SDXL / SD3.5", Role.IMAGE, "Stability AI",
                   "Community", LicenseClass.REVENUE_CAPPED, False,
                   "Revenue-capped community license. Verify thresholds before shipping."),

        # ---- 4.5 supporting ----
        ModelEntry("real_esrgan", "Real-ESRGAN", Role.UPSCALE, "—",
                   "BSD-3-Clause", LicenseClass.PERMISSIVE, True, "Upscaling."),
        ModelEntry("rife", "RIFE", Role.INTERPOLATION, "—",
                   "MIT", LicenseClass.PERMISSIVE, True, "Frame interpolation."),
        ModelEntry("whisperx", "WhisperX", Role.ASR, "—",
                   "BSD-4-Clause", LicenseClass.PERMISSIVE, True, "Diarisation / alignment."),
        ModelEntry("birefnet", "RMBG / BiRefNet", Role.MATTING, "—",
                   "MIT", LicenseClass.PERMISSIVE, True, "Background removal."),
    ]
}
