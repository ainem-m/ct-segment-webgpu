(self.__nnunetWebJSON=self.__nnunetWebJSON||{})["dentalsegmentator/model.js"]={
 "format": "nnunet-webgpu-v1",
 "id": "dentalsegmentator",
 "name": "DentalSegmentator",
 "labels": [
  {
   "value": 0,
   "name": "background",
   "key": "background",
   "ja": "背景",
   "color": [
    0,
    0,
    0
   ]
  },
  {
   "value": 1,
   "name": "Upper Skull",
   "key": "upper_skull",
   "ja": "上顎・頭蓋骨",
   "color": [
    232,
    196,
    140
   ]
  },
  {
   "value": 2,
   "name": "Mandible",
   "key": "mandible",
   "ja": "下顎骨",
   "color": [
    214,
    120,
    92
   ]
  },
  {
   "value": 3,
   "name": "Upper Teeth",
   "key": "upper_teeth",
   "ja": "上顎歯",
   "color": [
    120,
    200,
    255
   ]
  },
  {
   "value": 4,
   "name": "Lower Teeth",
   "key": "lower_teeth",
   "ja": "下顎歯",
   "color": [
    130,
    230,
    160
   ]
  },
  {
   "value": 5,
   "name": "Mandibular canal",
   "key": "mandibular_canal",
   "ja": "下顎管",
   "color": [
    255,
    220,
    60
   ]
  }
 ],
 "network": {
  "type": "PlainConvUNet",
  "inputChannels": 1,
  "numClasses": 6,
  "features": [
   32,
   64,
   128,
   256,
   320,
   320
  ],
  "strides": [
   [
    1,
    1,
    1
   ],
   [
    2,
    2,
    2
   ],
   [
    2,
    2,
    2
   ],
   [
    2,
    2,
    2
   ],
   [
    2,
    2,
    2
   ],
   [
    2,
    2,
    1
   ]
  ],
  "kernel": [
   3,
   3,
   3
  ],
  "nConvEncoder": [
   2,
   2,
   2,
   2,
   2,
   2
  ],
  "nConvDecoder": [
   2,
   2,
   2,
   2,
   2
  ],
  "norm": {
   "type": "instance",
   "eps": 1e-05,
   "affine": true
  },
  "nonlin": {
   "type": "leaky_relu",
   "slope": 0.01
  }
 },
 "preprocessing": {
  "axisOrder": "nnU-Net array order after transpose_forward of SimpleITK (z,y,x)",
  "transposeForward": [
   1,
   0,
   2
  ],
  "transposeBackward": [
   1,
   0,
   2
  ],
  "spacing": [
   0.4492189884185791,
   0.31200000643730164,
   0.4492189884185791
  ],
  "patchSize": [
   128,
   160,
   112
  ],
  "normalization": {
   "scheme": "CT",
   "clipLow": -110.0,
   "clipHigh": 3067.0,
   "mean": 1273.709228515625,
   "std": 558.4849853515625
  }
 },
 "inference": {
  "tileStepSize": 0.5,
  "gaussianSigmaScale": 0.125,
  "gaussianValueScale": 10.0
 },
 "weights": {
  "dtype": "float16",
  "layout": "pytorch",
  "bytes": 61569168,
  "shards": [
   {
    "file": "weights.000.bin",
    "bytes": 16777216,
    "sha256": "b9cb8a37ac8e799497d774b1aecb0c03f19f7a36d5dd8138c6fd3bb4bf59aed8",
    "script": "weights.000.js"
   },
   {
    "file": "weights.001.bin",
    "bytes": 16777216,
    "sha256": "38d830d1934e19647ad3215a7b0b914ac23ed48babc8d1e86783294e33f8c8a8",
    "script": "weights.001.js"
   },
   {
    "file": "weights.002.bin",
    "bytes": 16777216,
    "sha256": "72dc43c8466f149c5c5c3671fbf2d1ec00dc63757a2454efee9ae394b3a54768",
    "script": "weights.002.js"
   },
   {
    "file": "weights.003.bin",
    "bytes": 11237520,
    "sha256": "b5bb0cad98b3d528ba23051d26417cb2d6e1b4a92e2345d34d82f07745177cc9",
    "script": "weights.003.js"
   }
  ],
  "tensors": {
   "encoder.stages.0.0.convs.0.conv.weight": {
    "offset": 0,
    "shape": [
     32,
     1,
     3,
     3,
     3
    ],
    "count": 864
   },
   "encoder.stages.0.0.convs.0.conv.bias": {
    "offset": 1728,
    "shape": [
     32
    ],
    "count": 32
   },
   "encoder.stages.0.0.convs.0.norm.weight": {
    "offset": 1792,
    "shape": [
     32
    ],
    "count": 32
   },
   "encoder.stages.0.0.convs.0.norm.bias": {
    "offset": 1856,
    "shape": [
     32
    ],
    "count": 32
   },
   "encoder.stages.0.0.convs.1.conv.weight": {
    "offset": 1920,
    "shape": [
     32,
     32,
     3,
     3,
     3
    ],
    "count": 27648
   },
   "encoder.stages.0.0.convs.1.conv.bias": {
    "offset": 57216,
    "shape": [
     32
    ],
    "count": 32
   },
   "encoder.stages.0.0.convs.1.norm.weight": {
    "offset": 57280,
    "shape": [
     32
    ],
    "count": 32
   },
   "encoder.stages.0.0.convs.1.norm.bias": {
    "offset": 57344,
    "shape": [
     32
    ],
    "count": 32
   },
   "encoder.stages.1.0.convs.0.conv.weight": {
    "offset": 57408,
    "shape": [
     64,
     32,
     3,
     3,
     3
    ],
    "count": 55296
   },
   "encoder.stages.1.0.convs.0.conv.bias": {
    "offset": 168000,
    "shape": [
     64
    ],
    "count": 64
   },
   "encoder.stages.1.0.convs.0.norm.weight": {
    "offset": 168128,
    "shape": [
     64
    ],
    "count": 64
   },
   "encoder.stages.1.0.convs.0.norm.bias": {
    "offset": 168256,
    "shape": [
     64
    ],
    "count": 64
   },
   "encoder.stages.1.0.convs.1.conv.weight": {
    "offset": 168384,
    "shape": [
     64,
     64,
     3,
     3,
     3
    ],
    "count": 110592
   },
   "encoder.stages.1.0.convs.1.conv.bias": {
    "offset": 389568,
    "shape": [
     64
    ],
    "count": 64
   },
   "encoder.stages.1.0.convs.1.norm.weight": {
    "offset": 389696,
    "shape": [
     64
    ],
    "count": 64
   },
   "encoder.stages.1.0.convs.1.norm.bias": {
    "offset": 389824,
    "shape": [
     64
    ],
    "count": 64
   },
   "encoder.stages.2.0.convs.0.conv.weight": {
    "offset": 389952,
    "shape": [
     128,
     64,
     3,
     3,
     3
    ],
    "count": 221184
   },
   "encoder.stages.2.0.convs.0.conv.bias": {
    "offset": 832320,
    "shape": [
     128
    ],
    "count": 128
   },
   "encoder.stages.2.0.convs.0.norm.weight": {
    "offset": 832576,
    "shape": [
     128
    ],
    "count": 128
   },
   "encoder.stages.2.0.convs.0.norm.bias": {
    "offset": 832832,
    "shape": [
     128
    ],
    "count": 128
   },
   "encoder.stages.2.0.convs.1.conv.weight": {
    "offset": 833088,
    "shape": [
     128,
     128,
     3,
     3,
     3
    ],
    "count": 442368
   },
   "encoder.stages.2.0.convs.1.conv.bias": {
    "offset": 1717824,
    "shape": [
     128
    ],
    "count": 128
   },
   "encoder.stages.2.0.convs.1.norm.weight": {
    "offset": 1718080,
    "shape": [
     128
    ],
    "count": 128
   },
   "encoder.stages.2.0.convs.1.norm.bias": {
    "offset": 1718336,
    "shape": [
     128
    ],
    "count": 128
   },
   "encoder.stages.3.0.convs.0.conv.weight": {
    "offset": 1718592,
    "shape": [
     256,
     128,
     3,
     3,
     3
    ],
    "count": 884736
   },
   "encoder.stages.3.0.convs.0.conv.bias": {
    "offset": 3488064,
    "shape": [
     256
    ],
    "count": 256
   },
   "encoder.stages.3.0.convs.0.norm.weight": {
    "offset": 3488576,
    "shape": [
     256
    ],
    "count": 256
   },
   "encoder.stages.3.0.convs.0.norm.bias": {
    "offset": 3489088,
    "shape": [
     256
    ],
    "count": 256
   },
   "encoder.stages.3.0.convs.1.conv.weight": {
    "offset": 3489600,
    "shape": [
     256,
     256,
     3,
     3,
     3
    ],
    "count": 1769472
   },
   "encoder.stages.3.0.convs.1.conv.bias": {
    "offset": 7028544,
    "shape": [
     256
    ],
    "count": 256
   },
   "encoder.stages.3.0.convs.1.norm.weight": {
    "offset": 7029056,
    "shape": [
     256
    ],
    "count": 256
   },
   "encoder.stages.3.0.convs.1.norm.bias": {
    "offset": 7029568,
    "shape": [
     256
    ],
    "count": 256
   },
   "encoder.stages.4.0.convs.0.conv.weight": {
    "offset": 7030080,
    "shape": [
     320,
     256,
     3,
     3,
     3
    ],
    "count": 2211840
   },
   "encoder.stages.4.0.convs.0.conv.bias": {
    "offset": 11453760,
    "shape": [
     320
    ],
    "count": 320
   },
   "encoder.stages.4.0.convs.0.norm.weight": {
    "offset": 11454400,
    "shape": [
     320
    ],
    "count": 320
   },
   "encoder.stages.4.0.convs.0.norm.bias": {
    "offset": 11455040,
    "shape": [
     320
    ],
    "count": 320
   },
   "encoder.stages.4.0.convs.1.conv.weight": {
    "offset": 11455680,
    "shape": [
     320,
     320,
     3,
     3,
     3
    ],
    "count": 2764800
   },
   "encoder.stages.4.0.convs.1.conv.bias": {
    "offset": 16985280,
    "shape": [
     320
    ],
    "count": 320
   },
   "encoder.stages.4.0.convs.1.norm.weight": {
    "offset": 16985920,
    "shape": [
     320
    ],
    "count": 320
   },
   "encoder.stages.4.0.convs.1.norm.bias": {
    "offset": 16986560,
    "shape": [
     320
    ],
    "count": 320
   },
   "encoder.stages.5.0.convs.0.conv.weight": {
    "offset": 16987200,
    "shape": [
     320,
     320,
     3,
     3,
     3
    ],
    "count": 2764800
   },
   "encoder.stages.5.0.convs.0.conv.bias": {
    "offset": 22516800,
    "shape": [
     320
    ],
    "count": 320
   },
   "encoder.stages.5.0.convs.0.norm.weight": {
    "offset": 22517440,
    "shape": [
     320
    ],
    "count": 320
   },
   "encoder.stages.5.0.convs.0.norm.bias": {
    "offset": 22518080,
    "shape": [
     320
    ],
    "count": 320
   },
   "encoder.stages.5.0.convs.1.conv.weight": {
    "offset": 22518720,
    "shape": [
     320,
     320,
     3,
     3,
     3
    ],
    "count": 2764800
   },
   "encoder.stages.5.0.convs.1.conv.bias": {
    "offset": 28048320,
    "shape": [
     320
    ],
    "count": 320
   },
   "encoder.stages.5.0.convs.1.norm.weight": {
    "offset": 28048960,
    "shape": [
     320
    ],
    "count": 320
   },
   "encoder.stages.5.0.convs.1.norm.bias": {
    "offset": 28049600,
    "shape": [
     320
    ],
    "count": 320
   },
   "decoder.transpconvs.0.weight": {
    "offset": 28050240,
    "shape": [
     320,
     320,
     2,
     2,
     1
    ],
    "count": 409600
   },
   "decoder.transpconvs.0.bias": {
    "offset": 28869440,
    "shape": [
     320
    ],
    "count": 320
   },
   "decoder.stages.0.convs.0.conv.weight": {
    "offset": 28870080,
    "shape": [
     320,
     640,
     3,
     3,
     3
    ],
    "count": 5529600
   },
   "decoder.stages.0.convs.0.conv.bias": {
    "offset": 39929280,
    "shape": [
     320
    ],
    "count": 320
   },
   "decoder.stages.0.convs.0.norm.weight": {
    "offset": 39929920,
    "shape": [
     320
    ],
    "count": 320
   },
   "decoder.stages.0.convs.0.norm.bias": {
    "offset": 39930560,
    "shape": [
     320
    ],
    "count": 320
   },
   "decoder.stages.0.convs.1.conv.weight": {
    "offset": 39931200,
    "shape": [
     320,
     320,
     3,
     3,
     3
    ],
    "count": 2764800
   },
   "decoder.stages.0.convs.1.conv.bias": {
    "offset": 45460800,
    "shape": [
     320
    ],
    "count": 320
   },
   "decoder.stages.0.convs.1.norm.weight": {
    "offset": 45461440,
    "shape": [
     320
    ],
    "count": 320
   },
   "decoder.stages.0.convs.1.norm.bias": {
    "offset": 45462080,
    "shape": [
     320
    ],
    "count": 320
   },
   "decoder.transpconvs.1.weight": {
    "offset": 45462720,
    "shape": [
     320,
     256,
     2,
     2,
     2
    ],
    "count": 655360
   },
   "decoder.transpconvs.1.bias": {
    "offset": 46773440,
    "shape": [
     256
    ],
    "count": 256
   },
   "decoder.stages.1.convs.0.conv.weight": {
    "offset": 46773952,
    "shape": [
     256,
     512,
     3,
     3,
     3
    ],
    "count": 3538944
   },
   "decoder.stages.1.convs.0.conv.bias": {
    "offset": 53851840,
    "shape": [
     256
    ],
    "count": 256
   },
   "decoder.stages.1.convs.0.norm.weight": {
    "offset": 53852352,
    "shape": [
     256
    ],
    "count": 256
   },
   "decoder.stages.1.convs.0.norm.bias": {
    "offset": 53852864,
    "shape": [
     256
    ],
    "count": 256
   },
   "decoder.stages.1.convs.1.conv.weight": {
    "offset": 53853376,
    "shape": [
     256,
     256,
     3,
     3,
     3
    ],
    "count": 1769472
   },
   "decoder.stages.1.convs.1.conv.bias": {
    "offset": 57392320,
    "shape": [
     256
    ],
    "count": 256
   },
   "decoder.stages.1.convs.1.norm.weight": {
    "offset": 57392832,
    "shape": [
     256
    ],
    "count": 256
   },
   "decoder.stages.1.convs.1.norm.bias": {
    "offset": 57393344,
    "shape": [
     256
    ],
    "count": 256
   },
   "decoder.transpconvs.2.weight": {
    "offset": 57393856,
    "shape": [
     256,
     128,
     2,
     2,
     2
    ],
    "count": 262144
   },
   "decoder.transpconvs.2.bias": {
    "offset": 57918144,
    "shape": [
     128
    ],
    "count": 128
   },
   "decoder.stages.2.convs.0.conv.weight": {
    "offset": 57918400,
    "shape": [
     128,
     256,
     3,
     3,
     3
    ],
    "count": 884736
   },
   "decoder.stages.2.convs.0.conv.bias": {
    "offset": 59687872,
    "shape": [
     128
    ],
    "count": 128
   },
   "decoder.stages.2.convs.0.norm.weight": {
    "offset": 59688128,
    "shape": [
     128
    ],
    "count": 128
   },
   "decoder.stages.2.convs.0.norm.bias": {
    "offset": 59688384,
    "shape": [
     128
    ],
    "count": 128
   },
   "decoder.stages.2.convs.1.conv.weight": {
    "offset": 59688640,
    "shape": [
     128,
     128,
     3,
     3,
     3
    ],
    "count": 442368
   },
   "decoder.stages.2.convs.1.conv.bias": {
    "offset": 60573376,
    "shape": [
     128
    ],
    "count": 128
   },
   "decoder.stages.2.convs.1.norm.weight": {
    "offset": 60573632,
    "shape": [
     128
    ],
    "count": 128
   },
   "decoder.stages.2.convs.1.norm.bias": {
    "offset": 60573888,
    "shape": [
     128
    ],
    "count": 128
   },
   "decoder.transpconvs.3.weight": {
    "offset": 60574144,
    "shape": [
     128,
     64,
     2,
     2,
     2
    ],
    "count": 65536
   },
   "decoder.transpconvs.3.bias": {
    "offset": 60705216,
    "shape": [
     64
    ],
    "count": 64
   },
   "decoder.stages.3.convs.0.conv.weight": {
    "offset": 60705344,
    "shape": [
     64,
     128,
     3,
     3,
     3
    ],
    "count": 221184
   },
   "decoder.stages.3.convs.0.conv.bias": {
    "offset": 61147712,
    "shape": [
     64
    ],
    "count": 64
   },
   "decoder.stages.3.convs.0.norm.weight": {
    "offset": 61147840,
    "shape": [
     64
    ],
    "count": 64
   },
   "decoder.stages.3.convs.0.norm.bias": {
    "offset": 61147968,
    "shape": [
     64
    ],
    "count": 64
   },
   "decoder.stages.3.convs.1.conv.weight": {
    "offset": 61148096,
    "shape": [
     64,
     64,
     3,
     3,
     3
    ],
    "count": 110592
   },
   "decoder.stages.3.convs.1.conv.bias": {
    "offset": 61369280,
    "shape": [
     64
    ],
    "count": 64
   },
   "decoder.stages.3.convs.1.norm.weight": {
    "offset": 61369408,
    "shape": [
     64
    ],
    "count": 64
   },
   "decoder.stages.3.convs.1.norm.bias": {
    "offset": 61369536,
    "shape": [
     64
    ],
    "count": 64
   },
   "decoder.transpconvs.4.weight": {
    "offset": 61369664,
    "shape": [
     64,
     32,
     2,
     2,
     2
    ],
    "count": 16384
   },
   "decoder.transpconvs.4.bias": {
    "offset": 61402432,
    "shape": [
     32
    ],
    "count": 32
   },
   "decoder.stages.4.convs.0.conv.weight": {
    "offset": 61402496,
    "shape": [
     32,
     64,
     3,
     3,
     3
    ],
    "count": 55296
   },
   "decoder.stages.4.convs.0.conv.bias": {
    "offset": 61513088,
    "shape": [
     32
    ],
    "count": 32
   },
   "decoder.stages.4.convs.0.norm.weight": {
    "offset": 61513152,
    "shape": [
     32
    ],
    "count": 32
   },
   "decoder.stages.4.convs.0.norm.bias": {
    "offset": 61513216,
    "shape": [
     32
    ],
    "count": 32
   },
   "decoder.stages.4.convs.1.conv.weight": {
    "offset": 61513280,
    "shape": [
     32,
     32,
     3,
     3,
     3
    ],
    "count": 27648
   },
   "decoder.stages.4.convs.1.conv.bias": {
    "offset": 61568576,
    "shape": [
     32
    ],
    "count": 32
   },
   "decoder.stages.4.convs.1.norm.weight": {
    "offset": 61568640,
    "shape": [
     32
    ],
    "count": 32
   },
   "decoder.stages.4.convs.1.norm.bias": {
    "offset": 61568704,
    "shape": [
     32
    ],
    "count": 32
   },
   "decoder.seg_layers.4.weight": {
    "offset": 61568768,
    "shape": [
     6,
     32,
     1,
     1,
     1
    ],
    "count": 192
   },
   "decoder.seg_layers.4.bias": {
    "offset": 61569152,
    "shape": [
     6
    ],
    "count": 6
   }
  }
 },
 "provenance": {
  "checkpointSHA256": "a3a91ae0f8d7ab403d8662e47d2f0bdf7fc51e7783b46632841274dff8266c32",
  "plansSHA256": "9c86692e5a4cc383436a94ae4d2787037483f6abc79759be9ccd5aa9e63847a1",
  "datasetSHA256": "d8a430a51b35c631089761bff0767dca1f2e98723248f3baa33fb002d24ed82e",
  "datasetName": "Dataset111_453CT",
  "configuration": "3d_fullres",
  "converter": "convert_nnunet_checkpoint.py",
  "trainer_name": "nnUNetTrainer",
  "inference_allowed_mirroring_axes": [
   0,
   1,
   2
  ]
 },
 "version": "Dataset111_453CT v1.0.0-alpha (fold 0, 3d_fullres)",
 "postprocess": {
  "removeSmallIslands": {
   "classes": [
    1,
    2,
    3,
    4
   ],
   "connectivity": 6,
   "minimumVoxels": 1000
  }
 },
 "attribution": {
  "model": "DentalSegmentator pretrained model by Gauthier Dot et al., CC BY 4.0",
  "modelUrl": "https://doi.org/10.5281/zenodo.10829675",
  "paper": "Dot G. et al. DentalSegmentator: robust open source deep learning-based CT and CBCT image segmentation. Journal of Dentistry (2024). https://doi.org/10.1016/j.jdent.2024.105130",
  "framework": "nnU-Net: Isensee F. et al. Nature Methods (2021). https://doi.org/10.1038/s41592-020-01008-z",
  "license": "https://creativecommons.org/licenses/by/4.0/",
  "changes": "Weights converted from PyTorch float32 to float16 for WebGPU. Preprocessing parameters from the Slicer DentalSegmentator Dataset111_453CT v1.0.0-alpha release, whose checkpoint is byte-identical to the Zenodo Dataset112 archive.",
  "notEndorsed": "The original authors do not endorse this application."
 }
};
