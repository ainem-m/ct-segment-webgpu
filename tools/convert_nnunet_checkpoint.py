#!/usr/bin/env python3
"""Convert an nnU-Net v2 checkpoint into the WebGPU model package used by web/index.html.

The checkpoint is read without PyTorch: a restricted unpickler only resolves the
tensor-rebuild helpers and maps every other global to an inert stub, so no code
from the checkpoint is executed.

Output (in --out):
  model.json              architecture, preprocessing, labels, tensor table, provenance
  weights.NNN.bin         float16 shards in PyTorch layout (little endian)
  weights.NNN.js          the same shards as base64 for file:// pages (optional)

Usage:
  python3 convert_nnunet_checkpoint.py \
      --checkpoint .../fold_0/checkpoint_final.pth \
      --plans  web/models/dentalsegmentator/source/plans.json \
      --dataset web/models/dentalsegmentator/source/dataset.json \
      --config 3d_fullres --id dentalsegmentator --out web/models/dentalsegmentator
"""
from __future__ import annotations

import argparse
import base64
import collections
import hashlib
import io
import json
import pickle
import sys
import zipfile
from pathlib import Path

import numpy as np

FORMAT = "nnunet-webgpu-v1"
SHARD_BYTES = 16 * 1024 * 1024

_DTYPES = {
    "FloatStorage": np.float32,
    "HalfStorage": np.float16,
    "DoubleStorage": np.float64,
    "LongStorage": np.int64,
    "IntStorage": np.int32,
    "ShortStorage": np.int16,
    "CharStorage": np.int8,
    "ByteStorage": np.uint8,
    "BoolStorage": np.bool_,
    "BFloat16Storage": None,
}


class _StorageType:
    def __init__(self, name: str):
        self.name = name


class _LazyStorage:
    def __init__(self, archive: zipfile.ZipFile, prefix: str, storage_type, key: str):
        name = storage_type.name if isinstance(storage_type, _StorageType) else str(storage_type)
        dtype = _DTYPES.get(name)
        if dtype is None:
            raise ValueError(f"unsupported storage type {name}")
        self.array = np.frombuffer(archive.read(f"{prefix}/data/{key}"), dtype=dtype)


def _rebuild_tensor(storage, offset, size, stride, *_unused):
    base = storage.array
    item = base.itemsize
    view = np.lib.stride_tricks.as_strided(
        base[offset:], shape=tuple(size), strides=tuple(s * item for s in stride)
    )
    return np.ascontiguousarray(view)


def _rebuild_parameter(data, *_unused):
    return data


class _Stub:
    """Inert placeholder for any global the checkpoint references."""

    def __init__(self, *args, **kwargs):
        self.args = args

    def __setstate__(self, state):
        self.state = state

    def __call__(self, *args, **kwargs):
        return _Stub(*args)


def _stub_class(module: str, name: str):
    return type(f"Stub_{module}_{name}".replace(".", "_"), (_Stub,), {"__module__": "stub"})


class _SafeUnpickler(pickle.Unpickler):
    def __init__(self, data: bytes, archive: zipfile.ZipFile, prefix: str):
        super().__init__(io.BytesIO(data))
        self.archive = archive
        self.prefix = prefix

    def find_class(self, module, name):
        if (module, name) == ("torch._utils", "_rebuild_tensor_v2"):
            return _rebuild_tensor
        if (module, name) == ("torch._utils", "_rebuild_parameter"):
            return _rebuild_parameter
        if module == "torch" and name.endswith("Storage"):
            return _StorageType(name)
        if (module, name) == ("collections", "OrderedDict"):
            return collections.OrderedDict
        return _stub_class(module, name)

    def persistent_load(self, pid):
        _kind, storage_type, key, _location, _numel = pid
        return _LazyStorage(self.archive, self.prefix, storage_type, key)


def load_state_dict(path: Path) -> tuple[dict, dict]:
    archive = zipfile.ZipFile(path)
    pkl = next(n for n in archive.namelist() if n.endswith("/data.pkl"))
    prefix = pkl[: -len("/data.pkl")]
    checkpoint = _SafeUnpickler(archive.read(pkl), archive, prefix).load()
    weights = checkpoint["network_weights"]
    extra = {}
    for key in ("trainer_name", "inference_allowed_mirroring_axes"):
        value = checkpoint.get(key)
        if isinstance(value, (str, int, float, list, tuple)) or value is None:
            extra[key] = list(value) if isinstance(value, tuple) else value
    return weights, extra


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()


def plain_conv_unet_spec(config: dict, num_classes: int) -> dict:
    if config.get("UNet_class_name") != "PlainConvUNet":
        raise SystemExit(f"unsupported architecture {config.get('UNet_class_name')}")
    strides = config["pool_op_kernel_sizes"]
    n_stages = len(strides)
    base = config["UNet_base_num_features"]
    cap = config["unet_max_num_features"]
    features = [min(base * 2**i, cap) for i in range(n_stages)]
    kernels = config["conv_kernel_sizes"]
    if any(k != [3, 3, 3] for k in kernels):
        raise SystemExit("only 3x3x3 kernels are supported")
    return {
        "type": "PlainConvUNet",
        "inputChannels": 1,
        "numClasses": num_classes,
        "features": features,
        "strides": strides,
        "kernel": [3, 3, 3],
        "nConvEncoder": config["n_conv_per_stage_encoder"],
        "nConvDecoder": config["n_conv_per_stage_decoder"],
        "norm": {"type": "instance", "eps": 1e-5, "affine": True},
        "nonlin": {"type": "leaky_relu", "slope": 0.01},
    }


def tensor_names(spec: dict) -> list[str]:
    names = []
    for s, n in enumerate(spec["nConvEncoder"]):
        for i in range(n):
            base = f"encoder.stages.{s}.0.convs.{i}"
            names += [f"{base}.conv.weight", f"{base}.conv.bias", f"{base}.norm.weight", f"{base}.norm.bias"]
    for s, n in enumerate(spec["nConvDecoder"]):
        names += [f"decoder.transpconvs.{s}.weight", f"decoder.transpconvs.{s}.bias"]
        for i in range(n):
            base = f"decoder.stages.{s}.convs.{i}"
            names += [f"{base}.conv.weight", f"{base}.conv.bias", f"{base}.norm.weight", f"{base}.norm.bias"]
    last = len(spec["nConvDecoder"]) - 1
    names += [f"decoder.seg_layers.{last}.weight", f"decoder.seg_layers.{last}.bias"]
    return names


def update_registry(models_dir: Path, entry: dict) -> None:
    """models/registry.json lists the model folders the page offers (first = default)."""
    path = models_dir / "registry.json"
    registry = json.loads(path.read_text()) if path.exists() else {"models": []}
    registry["models"] = [m for m in registry["models"] if m.get("id") != entry["id"]] + [entry]
    text = json.dumps(registry, indent=1, ensure_ascii=False)
    path.write_text(text + "\n")
    (models_dir / "registry.js").write_text(
        f"(self.__nnunetWebJSON=self.__nnunetWebJSON||{{}})[\"models/registry.js\"]={text};\n"
    )


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--checkpoint", required=True, type=Path)
    ap.add_argument("--plans", required=True, type=Path)
    ap.add_argument("--dataset", required=True, type=Path)
    ap.add_argument("--config", default="3d_fullres")
    ap.add_argument("--id", required=True)
    ap.add_argument("--name", default=None)
    ap.add_argument("--meta", type=Path, default=None, help="JSON merged into model.json (labels colours, attribution, postprocess)")
    ap.add_argument("--out", required=True, type=Path)
    ap.add_argument("--no-js", action="store_true", help="skip the base64 shards used by file:// pages")
    args = ap.parse_args()

    plans = json.loads(args.plans.read_text())
    dataset = json.loads(args.dataset.read_text())
    config = plans["configurations"][args.config]
    while "inherits_from" in config:
        parent = plans["configurations"][config["inherits_from"]]
        config = {**parent, **{k: v for k, v in config.items() if k != "inherits_from"}}

    labels = sorted(dataset["labels"].items(), key=lambda kv: kv[1])
    num_classes = len(labels)
    spec = plain_conv_unet_spec(config, num_classes)

    weights, extra = load_state_dict(args.checkpoint)
    names = tensor_names(spec)
    missing = [n for n in names if n not in weights]
    if missing:
        raise SystemExit(f"checkpoint is missing {missing[:5]} ...")

    args.out.mkdir(parents=True, exist_ok=True)
    stale = set(args.out.glob("weights.*.bin")) | set(args.out.glob("weights.*.js"))

    table = {}
    blob = bytearray()
    for name in names:
        arr = np.asarray(weights[name], dtype=np.float32)
        if not np.all(np.isfinite(arr)):
            raise SystemExit(f"non-finite values in {name}")
        half = arr.astype("<f2")
        table[name] = {"offset": len(blob), "shape": list(arr.shape), "count": int(arr.size)}
        blob += half.tobytes()
        while len(blob) % 16:
            blob += b"\0"

    shards = []
    for i in range(0, len(blob), SHARD_BYTES):
        part = bytes(blob[i : i + SHARD_BYTES])
        fname = f"weights.{len(shards):03d}.bin"
        (args.out / fname).write_bytes(part)
        entry = {"file": fname, "bytes": len(part), "sha256": hashlib.sha256(part).hexdigest()}
        if not args.no_js:
            js = f"weights.{len(shards):03d}.js"
            payload = base64.b64encode(part).decode("ascii")
            (args.out / js).write_text(
                "(self.__nnunetWebShards=self.__nnunetWebShards||{})"
                f"[{json.dumps(args.id + '/' + fname)}]=\"{payload}\";\n"
            )
            entry["script"] = js
        shards.append(entry)

    written = {args.out / e["file"] for e in shards} | {args.out / e["script"] for e in shards if "script" in e}
    for old in sorted(stale - written):
        try:
            old.unlink()
        except OSError:
            print(f"note: could not remove stale shard {old.name} (not referenced by model.json)")

    props = plans["foreground_intensity_properties_per_channel"]["0"]
    scheme = config["normalization_schemes"][0]
    if scheme != "CTNormalization":
        raise SystemExit(f"unsupported normalization {scheme}")

    model = {
        "format": FORMAT,
        "id": args.id,
        "name": args.name or args.id,
        "labels": [{"value": v, "name": k} for k, v in labels],
        "network": spec,
        "preprocessing": {
            "axisOrder": "nnU-Net array order after transpose_forward of SimpleITK (z,y,x)",
            "transposeForward": plans["transpose_forward"],
            "transposeBackward": plans["transpose_backward"],
            "spacing": config["spacing"],
            "patchSize": config["patch_size"],
            "normalization": {
                "scheme": "CT",
                "clipLow": props["percentile_00_5"],
                "clipHigh": props["percentile_99_5"],
                "mean": props["mean"],
                "std": props["std"],
            },
        },
        "inference": {"tileStepSize": 0.5, "gaussianSigmaScale": 0.125, "gaussianValueScale": 10.0},
        "weights": {"dtype": "float16", "layout": "pytorch", "bytes": len(blob), "shards": shards, "tensors": table},
        "provenance": {
            "checkpointSHA256": sha256_file(args.checkpoint),
            "plansSHA256": sha256_file(args.plans),
            "datasetSHA256": sha256_file(args.dataset),
            "datasetName": plans.get("dataset_name"),
            "configuration": args.config,
            "converter": Path(__file__).name,
            **extra,
        },
    }
    if args.meta:
        meta = json.loads(args.meta.read_text())
        for key, value in meta.items():
            if key == "labels":
                by_value = {item["value"]: item for item in value}
                for item in model["labels"]:
                    item.update(by_value.get(item["value"], {}))
            else:
                model[key] = value
    text = json.dumps(model, indent=1, ensure_ascii=False)
    (args.out / "model.json").write_text(text + "\n")
    # file:// pages cannot fetch(); they load the same JSON through a script tag
    (args.out / "model.js").write_text(
        f"(self.__nnunetWebJSON=self.__nnunetWebJSON||{{}})[{json.dumps(args.id + '/model.js')}]={text};\n"
    )
    update_registry(args.out.parent, {"id": args.id, "name": model["name"], "version": model.get("version", "")})
    print(f"wrote {args.out}/model.json, {len(shards)} shards, {len(blob) / 2**20:.1f} MiB, {len(names)} tensors")
    return 0


if __name__ == "__main__":
    sys.exit(main())
