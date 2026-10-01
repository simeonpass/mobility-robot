"""Regenerate the per-count resting-position and podium constants in home-redesign.css
and keep them in step with HeroSection.tsx. Run after changing camera/floor/podium numbers."""
import math, re, sys
P=3.8; CAM=.34; FLOOR=.66; ITEM=.60
def solve(step_deg, target):
    th=math.radians(step_deg); lo,hi=0.05,P*0.9
    for _ in range(60):
        R=(lo+hi)/2; x=R*math.sin(th)*P/(P-R*math.cos(th))
        lo,hi=(R,hi) if x<target else (lo,R)
    return (lo+hi)/2
def pos(rel_deg,R):
    th=math.radians(rel_deg); x3=R*math.sin(th); z3=R*math.cos(th); s=P/(P-z3)
    return x3*s, CAM+(FLOOR-CAM)*s-ITEM, s
def rules(target, indent=''):
    out=[]
    for n in (4,5,6,7):
        step=360/n; R=solve(step,target)
        x0,y0,s0=pos(0,R); x1,y1,s1=pos(step,R)
        sel=f"{indent}.mr-turntable[data-count='{n}']"
        out.append(f"{sel} .mr-turntable-item[data-pos='0'] {{\n{indent}  transform: translate(-50%, calc(var(--tt-stage-h) * {y0:.4f})) scale({s0:.4f});\n{indent}}}")
        out.append(f"{sel} .mr-turntable-item[data-pos='1'] {{\n{indent}  transform: translate(calc(-50% + var(--tt-stage-h) * {x1:.4f}), calc(var(--tt-stage-h) * {y1:.4f})) scale({s1:.4f});\n{indent}}}")
        out.append(f"{sel} .mr-turntable-item[data-pos='-1'] {{\n{indent}  transform: translate(calc(-50% - var(--tt-stage-h) * {x1:.4f}), calc(var(--tt-stage-h) * {y1:.4f})) scale({s1:.4f});\n{indent}}}")
    return '\n'.join(out)+'\n'
css=sys.argv[1]
s=open(css,encoding='utf-8').read()
# desktop block: between the hidden rule and "/* Placard */"
i=s.index(".mr-turntable-item:not([data-pos='0']):not([data-pos='1']):not([data-pos='-1']) {"); i=s.index('}\n', i)+2
j=s.index('/* Placard */')
s=s[:i]+rules(1.17)+'\n'+s[j:]
i=s.index('  /* Tighter ring on phones'); i=s.index('\n', i)+1
j=s.index("  .mr-turntable-placard {\n    min-height: 0;")
s=s[:i]+rules(0.8,'  ')+s[j:]
s=re.sub(r"--tt-item-h: calc\(var\(--tt-stage-h\) \* [0-9.]+\);", f"--tt-item-h: calc(var(--tt-stage-h) * {ITEM});", s)
s=re.sub(r"--tt-cam: calc\(var\(--tt-stage-h\) \* [0-9.]+\);", f"--tt-cam: calc(var(--tt-stage-h) * {CAM});", s)
s=re.sub(r"--tt-floor: calc\(var\(--tt-stage-h\) \* [0-9.]+\);", f"--tt-floor: calc(var(--tt-stage-h) * {FLOOR});", s)
open(css,'w',encoding='utf-8').write(s)
tsx=sys.argv[2]; t=open(tsx).read()
t=re.sub(r"itemHeight: height \* [0-9.]+,", f"itemHeight: height * {ITEM},", t)
t=re.sub(r"camera: height \* [0-9.]+,", f"camera: height * {CAM},", t)
t=re.sub(r"floor: height \* [0-9.]+,", f"floor: height * {FLOOR},", t)
open(tsx,'w').write(t)
print('constants regenerated')
