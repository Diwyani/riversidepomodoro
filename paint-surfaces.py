"""Generate Little Stream's seamless, painterly surface textures with Python's standard library."""
from pathlib import Path
import math, random, struct, zlib
p=Path(__file__).resolve().parent
N=256
rng=random.Random(8412)
def noise_grid(n): return [[rng.random()*2-1 for _ in range(n)] for _ in range(n)]
grids={n:noise_grid(n) for n in [4,8,16,64]}
def noise(x,y,n):
 x=x/N*n;y=y/N*n;i=math.floor(x);j=math.floor(y);u=x-i;v=y-j;u=u*u*(3-2*u);v=v*v*(3-2*v);g=grids[n]
 return (g[j%n][i%n]*(1-u)+g[j%n][(i+1)%n]*u)*(1-v)+(g[(j+1)%n][i%n]*(1-u)+g[(j+1)%n][(i+1)%n]*u)*v
def chunk(t,d): return struct.pack('!I',len(d))+t+d+struct.pack('!I',zlib.crc32(t+d)&0xffffffff)
def write(name,pixels):
 raw=b''.join(b'\0'+bytes(pixels[y*N*3:(y+1)*N*3]) for y in range(N))
 data=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',N,N,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(raw))+chunk(b'IEND',b'')
 (p/(name+'.png')).write_bytes(data)
for name in ['ground','path','bark','stone','barkSoft']:
 pixels=[]
 for y in range(N):
  for x in range(N):
   broad=noise(x,y,4);mid=noise(x,y,16);fine=noise(x,y,64);grain=(rng.random()-.5)
   if name=='ground':
    t=broad*13+mid*5+fine*2+grain*3
    rgb=[145+t,156+t,132+t];earth=max(0,noise(x,y,8)-.35)*25;rgb[0]+=earth;rgb[1]-=earth*.3
   elif name=='path':
    t=broad*6+mid*3+fine*2+grain*4
    pebble=grain>.492;t+=9 if pebble else 0
    rgb=[190+t,178+t,167+t]
   elif name=='stone':
    t=broad*13+mid*5+fine*2+grain*2
    vein=abs(math.sin(x*.049+math.sin(y*.049)*1.8+mid*.18));t-=5*max(0,1-vein/.045)
    rgb=[157+t,161+t,175+t]
   elif name=='barkSoft':
    t=broad*12+mid*4+fine*1.5+grain*2
    rgb=[149+t,143+t,133+t]
   else:
    phase=x/N*math.tau*17+math.sin(y/N*math.tau)*.6+math.sin(x/N*math.tau*3)*.6
    groove=max(0,math.cos(phase))**14
    ridge=max(0,math.cos(phase-.45))**8
    t=broad*9+mid*4+fine*1.5+grain*2-groove*19+ridge*7
    rgb=[133+t,121+t,115+t]
   pixels.extend(max(0,min(255,round(v))) for v in rgb)
 write(name,pixels)
print('Painted ground, path, bark and independent stone textures.')
