# CT Segment WebGPU

**ブラウザだけで CT／CBCT のセグメンテーションを行う Web アプリです。** インストール不要で、データはどこにも送信されません。
nnU-Net 系の学習済みモデルを WebGPU のコンピュートシェーダー（WGSL）で直接実行します。
最初のモデルは [DentalSegmentator](https://doi.org/10.5281/zenodo.10829675) で、上顎・頭蓋骨、下顎骨、上顎歯、下顎歯、下顎管の 5 クラスを分けます。

**▶ https://ainem-m.github.io/ct-segment-webgpu/**

> 研究・教育・技術評価用です。医療機器ではなく、結果を診断・治療に使うことはできません。
> CT と結果はブラウザ内だけで処理されます。サーバーへのアップロードはありません。

*English: In-browser CT/CBCT segmentation with nnU-Net models running on WebGPU (WGSL compute shaders). No install, no upload. First model: DentalSegmentator (CC BY 4.0). Research and education use only; not a medical device.*

## 使い方

1. WebGPU に対応した Chrome / Edge（デスクトップ版）で上のページを開きます。
2. DICOM フォルダ、または NIfTI（`.nii` / `.nii.gz`）をドロップします。
3. 「セグメンテーションを実行」を押します。
4. 3 断面と 3D で確認し、STL（クラス別 / zip）、ラベル NIfTI、処理記録 JSON を保存します。

モデル（約 59 MB）は最初に開いたときに読み込まれます。

### オフラインで使う（HTML 1 枚）

[Releases](https://github.com/ainem-m/ct-segment-webgpu/releases) の `ct-segment-webgpu.html`（約 68 MB）は、
モデルを埋め込んだ 1 ファイル版です。ダウンロードしてダブルクリックで開けば、通信なしで動きます。
自分で作る場合は `python3 tools/build_single_html.py` を実行します（`dist/` に出力）。

### ローカルサーバーで使う

リポジトリを clone して `serve.command`（macOS、ダブルクリック）または
`python3 -m http.server 8000 --bind 127.0.0.1` を実行し、`http://localhost:8000/` を開きます。

## 処理の流れ

| 段階 | 内容 |
| --- | --- |
| 入力 | NIfTI-1、DICOM（非圧縮 Implicit/Explicit VR LE、Deflate、RLE）。シリーズ選択、向き・間隔・重複・欠損の検証、ガントリー傾斜は物理座標で補正 |
| 格子 | ボリューム全体を覆う LPS 座標の格子をモデル間隔（0.449 × 0.449 × 0.312 mm）で作り、線形補間 |
| 正規化 | nnU-Net CTNormalization（−110〜3067 HU でクリップ、平均 1273.7 / 標準偏差 558.5） |
| 推論 | 3d_fullres PlainConvUNet、パッチ 128×160×112、重なり 50%、ガウス重み付き平均。スラブ単位で確定するので全 logits を保持しない |
| 後処理 | クラス 1〜4 の小さな島を除去（6 近傍、既定 1000 ボクセル） |
| 表面 | Surface Nets（top1−top2 の logit 差でサブボクセル位置を決定）+ Taubin 平滑化。STL は LPS（または RAS）mm |

GPU は `shader-f16` があれば fp16（累積は fp32）、なければ fp32 で動きます。`?f32` を付けると fp32 を強制します。
JPEG 系・JPEG 2000 で圧縮された DICOM には未対応です（エラーを表示します）。非圧縮 DICOM か NIfTI に変換してください。

## 検証

| 項目 | 結果 |
| --- | --- |
| ネットワーク（fp32） | 公式 PyTorch 実装と全 27 層一致（誤差 ~1e-7） |
| 1 パッチ（fp16、Apple M 系 GPU） | 1.27 秒、最大クラス一致率 99.997% |
| 症例全体（233×233×259 格子、36 パッチ） | 推論 約 60 秒。PyTorch fp32 参照と全クラス Dice ≥ 0.9999 |

## モデルと前処理パラメータ

Zenodo の `Dataset112_DentalSegmentator_v100` アーカイブに入っている `plans.json` は、同梱チェックポイントと値が一致しません。
チェックポイントは Slicer 版 `Dataset111_453CT` v1.0.0-alpha のものとバイト単位で同一（CRC32 `f13829be`、SHA-256 `a3a91ae0…`）なので、
`models/dentalsegmentator/source/plans.json` には Slicer リリースの `plans.json` を使っています。

## モデルの追加

`tools/convert_nnunet_checkpoint.py` は PyTorch なしで nnU-Net v2 のチェックポイントを読み（コードを実行しないアンピックラー）、
fp16 の重み分割ファイルと `model.json`（構造・前処理・ラベル・出典）を書き、`models/registry.json` を更新します。

```bash
python3 tools/convert_nnunet_checkpoint.py \
  --checkpoint <nnUNet_results>/.../fold_0/checkpoint_final.pth \
  --plans  models/dentalsegmentator/source/plans.json \
  --dataset models/dentalsegmentator/source/dataset.json \
  --meta   models/dentalsegmentator/source/meta.json \
  --id dentalsegmentator --name DentalSegmentator \
  --out models/dentalsegmentator --no-js
```

対応している構造は nnU-Net の `PlainConvUNet`（3×3×3 畳み込み、InstanceNorm、LeakyReLU、カーネル = ストライドの転置畳み込み）と
CTNormalization です（ResEnc 系や複数フォールドのアンサンブルは未対応）。

## ライセンスと出典

- コード: [Apache License 2.0](LICENSE)
- DentalSegmentator の学習済み重み（`models/dentalsegmentator/`）: Gauthier Dot et al., [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
  - モデル: [Zenodo 10.5281/zenodo.10829675](https://doi.org/10.5281/zenodo.10829675)、論文: Dot G. et al., *Journal of Dentistry* (2024), [10.1016/j.jdent.2024.105130](https://doi.org/10.1016/j.jdent.2024.105130)
  - 変更点: PyTorch fp32 から fp16 への形式変換のみ。学習済みの値は変更していません。
  - 原著者はこのアプリを推奨・保証していません。
- nnU-Net: Isensee F. et al., *Nature Methods* (2021), [10.1038/s41592-020-01008-z](https://doi.org/10.1038/s41592-020-01008-z)

詳しくは [NOTICE](NOTICE) を参照してください。
