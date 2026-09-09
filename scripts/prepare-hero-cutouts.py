#!/usr/bin/env python3
"""Approved original-photo background removal. Build-time asset preparation only.

Requires Pillow, NumPy and SciPy. Sources and approval are recorded in
docs/rebuild/mobility-robot-rebrand.md. No generative image outputs are used.
The M4 Pro floor mask is specific to the recorded 667px source photograph.
"""
from pathlib import Path
from PIL import Image
import numpy as np
from scipy import ndimage as ndi

import argparse
parser = argparse.ArgumentParser(description='Prepare the approved hero cut-outs from original product photographs.')
parser.add_argument('source_dir', type=Path, help='Directory containing m4b-source.png, m4pro-source.jpg and x12-source.webp')
args = parser.parse_args()
src = args.source_dir
out = Path(__file__).resolve().parents[1] / 'app/assets/hero'
out.mkdir(parents=True, exist_ok=True)


def extract_white(im, min_hole_area, remove_floor=False):
    rgb=np.asarray(im.convert('RGB')).astype(np.float32)
    low=rgb.min(axis=2)
    spread=rgb.max(axis=2)-low
    # Match the neutral studio background, then keep disconnected white branding.
    white=(low>=238)&(spread<15)
    if remove_floor:
        if im.size != (667, 667):
            raise ValueError('The M4 Pro floor mask requires the recorded 667x667 source photograph.')
        yy,xx=np.indices(low.shape)
        # Original M4 Pro floor beneath the chassis and between its wheels.
        # The mask is limited to the floor; tyre texture and the metal footrest remain.
        floor=(yy>=510)&((xx<355)|(yy>=550)|((xx>470)&(yy>=540)))
        white |= floor&(low>=172)&(spread<18)
        central_floor=(yy>=510)&(yy<=560)&(xx>=235)&(xx<=365)
        white |= central_floor&(low>=110)&(spread<18)
    labels,count=ndi.label(white)
    sizes=np.bincount(labels.ravel())
    boundary=np.unique(np.concatenate([labels[0],labels[-1],labels[:,0],labels[:,-1]]))
    ids=np.union1d(boundary, np.flatnonzero(sizes>=min_hole_area))
    ids=ids[ids!=0]
    background=np.isin(labels,ids)
    solid=~background
    # Tiny isolated JPEG specks and detached floor-shadow fragments are not the chair.
    parts,n=ndi.label(solid)
    sizes=np.bincount(parts.ravel());sizes[0]=0
    chair=parts==sizes.argmax()
    # Preserve tiny hardware attached diagonally to the silhouette.
    chair=ndi.binary_propagation(chair, mask=solid, structure=np.ones((3,3)))
    interior=ndi.binary_erosion(chair, iterations=2)
    _,nearest=ndi.distance_transform_edt(~interior,return_indices=True)
    foreground=rgb[nearest[0],nearest[1]]
    distance=ndi.distance_transform_edt(~chair)
    edge=ndi.binary_dilation(chair,iterations=1)&~interior
    alpha=chair.astype(np.float32)
    # Recover coverage from the original white matte only in the narrow edge band.
    coverage=np.clip((255-rgb.min(axis=2))/np.maximum(255-foreground.min(axis=2),1),0,1)
    alpha[edge]=coverage[edge]
    alpha[background & (distance>1)]=0
    # Remove colour contamination from the old white background at antialiased edges.
    pixels=rgb.copy()
    partial=(alpha>0)&(alpha<1)
    pixels[partial]=np.clip((rgb[partial]-255*(1-alpha[partial,None]))/alpha[partial,None],0,255)
    rgba=np.dstack((pixels,alpha*255)).round().astype(np.uint8)
    return Image.fromarray(rgba)

images={
 'm4b':extract_white(Image.open(src/'m4b-source.png'),220),
 'm4-pro':extract_white(Image.open(src/'m4pro-source.jpg'),80,remove_floor=True),
 'x12':Image.open(src/'x12-source.webp').convert('RGBA')
}
for name,im in images.items():
    bbox=im.getchannel('A').getbbox()
    im=im.crop(bbox)
    # Tight, consistent transparent margins keep feet aligned without clipping.
    pad=round(max(im.size)*.025)
    canvas=Image.new('RGBA',(im.width+pad*2,im.height+pad*2))
    canvas.alpha_composite(im,(pad,pad))
    for width in [360,720]:
        size=(width,round(canvas.height*width/canvas.width))
        resized=canvas.resize(size,Image.Resampling.LANCZOS)
        path=out/f'{name}-{width}.webp'
        resized.save(path,format='WEBP',quality=87,method=6,exact=True)
        alpha=np.asarray(Image.open(path).getchannel('A'))
        print(name,size,path.stat().st_size,'transparent',round(float((alpha==0).mean()),3))
    images[name]=canvas
