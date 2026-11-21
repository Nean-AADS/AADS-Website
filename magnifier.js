/* AADS 3D magnifier: a small WebGL renderer drawing a procedural magnifying
   glass (navy rim, royal collar, red handle, glass lens) in the logo palette.
   Same draw() signature as the old lily renderer, so lycoris-hero.js and
   showcase.js use it unchanged. lens() returns the lens outline in CSS px so
   pages can magnify whatever sits behind the canvas. No gradients in CSS;
   shading is lighting in the shader. */
(()=>{
'use strict';
const TAU=Math.PI*2;
const C={navy:'#1E295A',navy2:'#2E3C82',royal:'#1334A6',red:'#D21E47',glass:'#CFE0FF'};
const lin=h=>{const n=parseInt(h.slice(1),16),f=v=>Math.pow(v/255,2.2);return [f(n>>16&255),f(n>>8&255),f(n&255)]};

/* ---------- geometry: [x,y,z, nx,ny,nz, r,g,b, mat] ---------- */
const LENS_C=[-.32,.32,0], R_RIM=1, LENS_R=.93, HANDLE_A=-Math.PI/4;
function build(){
  const op=[],gv=[],oi=[],gi=[];
  const put=(arr,p,n,c,m)=>{arr.push(p[0],p[1],p[2],n[0],n[1],n[2],c[0],c[1],c[2],m);return arr.length/10-1};
  // torus in the xy plane around LENS_C
  const torus=(R,r,col,segU=96,segV=18,zoff=0)=>{const base=op.length/10;
    for(let i=0;i<=segU;i++){const u=i/segU*TAU,cu=Math.cos(u),su=Math.sin(u);
      for(let j=0;j<=segV;j++){const v=j/segV*TAU,cv=Math.cos(v),sv=Math.sin(v);
        const n=[cu*cv,su*cv,sv];put(op,[LENS_C[0]+cu*(R+r*cv),LENS_C[1]+su*(R+r*cv),zoff+r*sv],n,col,0)}}
    for(let i=0;i<segU;i++)for(let j=0;j<segV;j++){const a=base+i*(segV+1)+j,b=a+segV+1;oi.push(a,b,a+1,a+1,b,b+1)}};
  // capsule-ish tube along a direction, radius profile fn(s)
  const tube=(p0,dir,len,rad,col,seg=40,ring=24,cap=true)=>{const base=op.length/10;
    const up=[0,0,1],side=[-dir[1],dir[0],0];
    for(let i=0;i<=seg;i++){const s=i/seg,r=rad(s),c=[p0[0]+dir[0]*len*s,p0[1]+dir[1]*len*s,0];
      const dr=(rad(Math.min(1,s+.01))-rad(Math.max(0,s-.01)))/(.02*len);
      for(let j=0;j<=ring;j++){const a=j/ring*TAU,ca=Math.cos(a),sa=Math.sin(a);
        let n=[side[0]*ca+up[0]*sa,side[1]*ca+up[1]*sa,up[2]*sa];n=[n[0]-dir[0]*dr,n[1]-dir[1]*dr,n[2]];const l=Math.hypot(...n);n=n.map(x=>x/l);
        put(op,[c[0]+(side[0]*ca)*r,c[1]+(side[1]*ca)*r,sa*r],n,col,0)}}
    for(let i=0;i<seg;i++)for(let j=0;j<ring;j++){const a=base+i*(ring+1)+j,b=a+ring+1;oi.push(a,b,a+1,a+1,b,b+1)}
  };
  const navy=lin(C.navy),navy2=lin(C.navy2),royal=lin(C.royal),red=lin(C.red),glass=lin(C.glass);
  torus(R_RIM,.085,navy);                    // main rim
  torus(R_RIM-.075,.022,royal,96,10,.045);    // inner bevel, front
  torus(R_RIM-.075,.022,royal,96,10,-.045);   // inner bevel, back
  const d=[Math.cos(HANDLE_A),Math.sin(HANDLE_A)];
  const p0=[LENS_C[0]+d[0]*(R_RIM+.04),LENS_C[1]+d[1]*(R_RIM+.04),0];
  tube(p0,d,.3,s=>.1+.02*Math.sin(s*Math.PI),navy2);                       // collar
  tube([p0[0]+d[0]*.3,p0[1]+d[1]*.3,0],d,.08,()=>.13,royal,4);              // ring
  tube([p0[0]+d[0]*.38,p0[1]+d[1]*.38,0],d,1.25,s=>{const e=s>.9?Math.sqrt(Math.max(0,1-Math.pow((s-.9)/.1,2))):1;return (.12+.035*s)*e+.001},red,60); // handle
  // lens: slightly convex glass disc (front and back caps)
  for(const side of[1,-1]){const base=gv.length/10,RS=24,AS=72;
    for(let i=0;i<=RS;i++){const rr=i/RS*LENS_R,z=side*.06*(1-Math.pow(i/RS,2));
      for(let j=0;j<=AS;j++){const a=j/AS*TAU,x=Math.cos(a)*rr,y=Math.sin(a)*rr;
        const nz=1,nx=side*.12*x/LENS_R*(i/RS),ny=side*.12*y/LENS_R*(i/RS);const l=Math.hypot(nx,ny,nz);
        put(gv,[LENS_C[0]+x,LENS_C[1]+y,z],[nx/l,ny/l,side*nz/l],glass,1)}}
    for(let i=0;i<RS;i++)for(let j=0;j<AS;j++){const a=base+i*(AS+1)+j,b=a+AS+1;gi.push(a,b,a+1,a+1,b,b+1)}}
  // merge
  const off=op.length/10;const data=new Float32Array(op.concat(gv));const idx=oi.concat(gi.map(i=>i+off));
  return {data,index:new Uint16Array(idx),opaqueCount:oi.length,glassCount:gi.length};
}

/* ---------- maths ---------- */
const persp=(f,a,n,fa)=>{const t=1/Math.tan(f/2),m=new Float32Array(16);m[0]=t/a;m[5]=t;m[10]=(fa+n)/(n-fa);m[11]=-1;m[14]=2*fa*n/(n-fa);return m};
const mul=(a,b)=>{const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];return o};
const rotY=t=>{const c=Math.cos(t),s=Math.sin(t);return new Float32Array([c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1])};
const rotX=t=>{const c=Math.cos(t),s=Math.sin(t);return new Float32Array([1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1])};
const rotZ=t=>{const c=Math.cos(t),s=Math.sin(t);return new Float32Array([c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1])};
const scl=s=>new Float32Array([s,0,0,0,0,s,0,0,0,0,s,0,0,0,0,1]);
const trans=(x,y,z)=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1]);
const xf=(m,p)=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14],m[3]*p[0]+m[7]*p[1]+m[11]*p[2]+m[15]];

const VERT=`attribute vec3 a_pos;attribute vec3 a_nrm;attribute vec3 a_col;attribute float a_mat;
uniform mat4 u_vp;uniform mat4 u_model;uniform vec2 u_offset;
varying vec3 v_n;varying vec3 v_w;varying vec3 v_c;varying float v_m;
void main(){vec4 w=u_model*vec4(a_pos,1.0);v_w=w.xyz;v_n=mat3(u_model)*a_nrm;v_c=a_col;v_m=a_mat;gl_Position=u_vp*w;gl_Position.xy+=u_offset*gl_Position.w;}`;
const FRAG=`precision highp float;uniform vec3 u_eye;uniform float u_alpha;uniform float u_pass;
varying vec3 v_n;varying vec3 v_w;varying vec3 v_c;varying float v_m;
float studio(vec3 r){float key=pow(max(dot(r,normalize(vec3(-0.45,0.85,0.45))),0.0),18.0)*3.0;
float strip=smoothstep(0.6,0.85,r.x)*smoothstep(-0.6,0.4,r.y)*1.2;float rim=smoothstep(0.6,0.95,-r.z)*0.5;
float top=smoothstep(0.7,1.0,r.y)*0.6;return key+strip+rim+top;}
void main(){vec3 n=normalize(v_n);vec3 v=normalize(u_eye-v_w);if(dot(n,v)<0.0)n=-n;vec3 r=reflect(-v,n);float e=studio(r);
float fr=pow(1.0-max(dot(n,v),0.0),3.0);float dif=max(dot(n,normalize(vec3(-0.3,0.7,0.65))),0.0);
if(v_m<0.5){if(u_pass>0.5)discard;
 vec3 col=v_c*(0.18+0.9*dif)+vec3(e)*0.55*(0.4+v_c)+v_c*fr*0.6;col=col/(1.0+col*0.6);col=pow(col,vec3(1.0/2.2));gl_FragColor=vec4(col*u_alpha,u_alpha);}
else{if(u_pass<0.5)discard;
 float a=clamp(0.02+fr*0.24+e*0.16,0.0,0.34)*u_alpha;vec3 col=mix(v_c,vec3(1.0),clamp(e*0.7,0.0,1.0));col=pow(col,vec3(1.0/2.2));gl_FragColor=vec4(col*a,a);}}`;

function create(canvas){
  const mesh=build();let gl=null,prog=null;const loc={};
  const init=()=>{gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true});if(!gl)return false;
    const cs=(t,s)=>{const h=gl.createShader(t);gl.shaderSource(h,s);gl.compileShader(h);return gl.getShaderParameter(h,gl.COMPILE_STATUS)?h:null};
    const vs=cs(gl.VERTEX_SHADER,VERT),fs=cs(gl.FRAGMENT_SHADER,FRAG);if(!vs||!fs)return false;
    prog=gl.createProgram();gl.attachShader(prog,vs);gl.attachShader(prog,fs);gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))return false;gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,mesh.data,gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,mesh.index,gl.STATIC_DRAW);
    const at=(n,sz,o)=>{const a=gl.getAttribLocation(prog,n);if(a<0)return;gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,sz,gl.FLOAT,false,40,o*4)};
    at('a_pos',3,0);at('a_nrm',3,3);at('a_col',3,6);at('a_mat',1,9);
    for(const n of['u_vp','u_model','u_offset','u_eye','u_alpha','u_pass'])loc[n]=gl.getUniformLocation(prog,n);
    gl.clearColor(0,0,0,0);return true};
  if(!init())gl=null;
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();gl=null});
  canvas.addEventListener('webglcontextrestored',()=>{if(!init())gl=null});
  let W=1,H=1,dpr=1,last=null;
  const resize=()=>{const r=canvas.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);dpr=Math.min(devicePixelRatio||1,2);
    const cw=Math.round(W*dpr),ch=Math.round(H*dpr);if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch}};
  /* k: {spin, el, size, ox, oy, tilt?, roll?}; o: {spin,px,py,time,bloom,sway,alpha,lx,ly} (lx/ly move the glass in model units) */
  const draw=(k,o={})=>{const {spin=0,px=0,py=0,time=0,bloom=1,sway=0,alpha=1,lx=0,ly=0}=o;
    const fov=30*Math.PI/180,minDim=Math.min(W,H),radius=1.75;
    const dist=(radius*H)/((k.size||.8)*minDim*Math.tan(fov/2));
    const el=Math.max(-80,Math.min(80,(k.el||0)+py*8))*Math.PI/180;
    const eye=[0,Math.sin(el)*dist,Math.cos(el)*dist];
    const look=(()=>{const z=[eye[0]/dist,eye[1]/dist,eye[2]/dist],x=[z[2],0,-z[0]],lx_=Math.hypot(...x)||1,X=x.map(a=>a/lx_),Y=[z[1]*X[2]-z[2]*X[1],z[2]*X[0]-z[0]*X[2],z[0]*X[1]-z[1]*X[0]];
      const m=new Float32Array(16);m[0]=X[0];m[4]=X[1];m[8]=X[2];m[1]=Y[0];m[5]=Y[1];m[9]=Y[2];m[2]=z[0];m[6]=z[1];m[10]=z[2];
      m[12]=-(X[0]*eye[0]+X[1]*eye[1]+X[2]*eye[2]);m[13]=-(Y[0]*eye[0]+Y[1]*eye[1]+Y[2]*eye[2]);m[14]=-(z[0]*eye[0]+z[1]*eye[1]+z[2]*eye[2]);m[15]=1;return m})();
    const vp=mul(persp(fov,W/H,Math.max(.05,dist-5),dist+6),look);
    const b=Math.max(0,Math.min(1,bloom)),ease=1-Math.pow(1-b,3);
    const bob=sway?Math.sin(time*1.1)*.05:0;
    let model=trans(-LENS_C[0]*.5+lx,-LENS_C[1]*.5+ly+bob,0);
    model=mul(model,mul(rotY((k.spin||0)+spin+px*.4+(1-ease)*1.6),mul(rotX((k.tilt||0)-py*.15+(sway?Math.sin(time*.7)*.05:0)),mul(rotZ((k.roll||0)+(1-ease)*-.6),scl(.55+.45*ease)))));
    const mvp=mul(vp,model);
    last={mvp,ox:k.ox||0,oy:k.oy||0};
    if(!gl||!prog)return;
    gl.viewport(0,0,canvas.width,canvas.height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(loc.u_vp,false,vp);gl.uniformMatrix4fv(loc.u_model,false,model);gl.uniform2f(loc.u_offset,k.ox||0,k.oy||0);
    gl.uniform3f(loc.u_eye,eye[0],eye[1],eye[2]);gl.uniform1f(loc.u_alpha,alpha);
    gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.BLEND);gl.uniform1f(loc.u_pass,0);
    gl.drawElements(gl.TRIANGLES,mesh.opaqueCount,gl.UNSIGNED_SHORT,0);
    gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.uniform1f(loc.u_pass,1);
    gl.drawElements(gl.TRIANGLES,mesh.glassCount,gl.UNSIGNED_SHORT,mesh.opaqueCount*2);gl.depthMask(true);
  };
  /* lens outline in CSS px (24 points) + centre, from the last draw */
  const lens=(n=24)=>{if(!last)return null;const pts=[];let cx=0,cy=0;
    const pr=p=>{const q=xf(last.mvp,p);return [((q[0]/q[3]+last.ox)*.5+.5)*W,(.5-(q[1]/q[3]+last.oy)*.5)*H]};
    for(let i=0;i<n;i++){const a=i/n*TAU;pts.push(pr([LENS_C[0]+Math.cos(a)*LENS_R,LENS_C[1]+Math.sin(a)*LENS_R,0]))}
    const c=pr(LENS_C);return {cx:c[0],cy:c[1],pts}};
  return {resize,draw,lens,size:()=>({W,H}),ok:!!gl};
}
window.AADSMag={create};
})();
