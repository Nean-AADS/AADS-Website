/* Lycoris hero: a plain-JavaScript port of the "Lycoris Specimen" component
   (21st.dev, @kedhareswer). A red chrome spider lily, modelled procedurally
   and lit in raw WebGL, with scroll-scrubbed frames.

   - Homepage: the existing hero copy is spread across three scroll frames
     (cover, crown, bloom). No text is added or changed; elements are only
     regrouped and animated. Every word stays in the page for search engines
     and screen readers, and a focused link scrolls its frame into view.
   - Inside pages: a still lily sits behind the page title.
   - No JavaScript, no WebGL or reduced motion: the page falls back to the
     normal static hero (a still lily, or none at all).
   No gradients are drawn; the chrome look comes from lighting in the shader. */
(()=>{
'use strict';
const doc=document, root=doc.documentElement;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const RED='#D21E47';

// ---------- vector helpers ----------
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const mul=(a,s)=>[a[0]*s,a[1]*s,a[2]*s];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l]};
const rng=seed=>{let s=seed>>>0;return()=>{s=(s+0x6d2b79f5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}};
const HEART=[0,0.25,0];

// ---------- the flower as centrelines ----------
function buildCurves(florets,seed){
  const F=Math.max(3,Math.min(8,Math.round(florets))),r=rng(seed),curves=[],up=[0,1,0];
  for(let i=0;i<F;i++){
    const phi=(i/F)*Math.PI*2+(r()-.5)*.3, tilt=1.05+(r()-.5)*.25;
    const radial=[Math.cos(phi),0,Math.sin(phi)];
    const u=norm([Math.sin(tilt)*radial[0],Math.cos(tilt),Math.sin(tilt)*radial[2]]);
    const base=[radial[0]*.13,.07,radial[2]*.13];
    const e1=norm(cross(u,Math.abs(u[1])>.9?[1,0,0]:up)), e2=cross(u,e1);
    const common={base,stagger:i/F};
    const ped=[];for(let k=0;k<=10;k++){const s=k/10;ped.push([radial[0]*.13*s,.07*Math.sin(s*Math.PI/2),radial[2]*.13*s])}
    curves.push({pts:ped,kind:2,w:.022,t:0,lat:e1,twist:0,bulb:false,phase:0,...common});
    for(let j=0;j<6;j++){
      const th=(j/6)*Math.PI*2+i*.7+(r()-.5)*.35;
      const d=add(mul(e1,Math.cos(th)),mul(e2,Math.sin(th)));
      const lat=norm(cross(d,u)), phase=r()*Math.PI*2;
      const L=1.35+r()*.3,b0=.45+r()*.2,b1=2.75+r()*.45,pts=[base],steps=48;let p=base;
      for(let k=1;k<=steps;k++){const s=k/steps,b=b0+(b1-b0)*Math.pow(s,1.2);p=add(p,mul(add(mul(d,Math.sin(b)),mul(u,Math.cos(b))),L/steps));pts.push(p)}
      for(let k=1;k<=steps;k++){const s=k/steps;pts[k]=add(pts[k],mul(lat,Math.sin(s*Math.PI*2.4+phase)*.05*s))}
      curves.push({pts,kind:0,w:.075+r()*.02,t:.02,lat,twist:.2+r()*.35,bulb:false,phase,...common});
      const d2=add(mul(e1,Math.cos(th+.52)),mul(e2,Math.sin(th+.52)));
      const dh=norm([d2[0],0,d2[2]]), start=norm(add(u,mul(d2,.25)));
      const end=norm(add(add(mul(radial,.85),mul(dh,.5)),[0,-.95,0]));
      const Ls=1.75+r()*.45,sp=[base];p=base;
      for(let k=1;k<=44;k++){const s=k/44,m=Math.pow(s,1.15);p=add(p,mul(norm(add(mul(start,1-m),mul(end,m))),Ls/44));sp.push(p)}
      curves.push({pts:sp,kind:1,w:.012,t:0,lat,twist:0,bulb:true,phase:phase+1.3,...common});
    }
    {const end=norm(add(mul(radial,.9),[0,-.35,0])),sp=[base];let p=base;const Ls=2.2+r()*.3;
     for(let k=1;k<=44;k++){const s=k/44;p=add(p,mul(norm(add(mul(u,1-s),mul(end,s))),Ls/44));sp.push(p)}
     curves.push({pts:sp,kind:1,w:.009,t:0,lat:e1,twist:0,bulb:false,phase:r()*6,...common});}
  }
  const stem=[];for(let k=0;k<=40;k++){const s=k/40;stem.push([Math.sin(s*2.2)*.07,.04-s*4.6,Math.sin(s*1.3)*.03])}
  curves.push({pts:stem,kind:2,w:.05,t:0,lat:[1,0,0],twist:0,bulb:false,phase:0,stagger:0,base:[0,0,0]});
  let radius=0;for(const c of curves){if(c.kind===2)continue;for(const q of c.pts)radius=Math.max(radius,Math.hypot(q[0]-HEART[0],q[1]-HEART[1],q[2]-HEART[2]))}
  return {curves,radius};
}

const STRIDE=13;
function buildMesh(curves){
  const v=[],idx=[];let count=0;
  const push=(p,n,s,c)=>{v.push(p[0],p[1],p[2],n[0],n[1],n[2],s,c.phase,c.kind,c.stagger,c.base[0],c.base[1],c.base[2]);return count++};
  const tangent=(pts,i)=>norm(sub(pts[Math.min(i+1,pts.length-1)],pts[Math.max(i-1,0)]));
  for(const c of curves){
    const n=c.pts.length;
    if(c.kind===0){
      const rings=[];let first=[],last=[],T0=[0,1,0],T1=[0,1,0];
      for(let i=0;i<n;i++){
        const s=i/(n-1),T=tangent(c.pts,i);let N=norm(cross(T,c.lat)),W=cross(N,T);
        const a=c.twist*Math.sin(Math.PI*s),ca=Math.cos(a),sa=Math.sin(a);
        const W2=add(mul(W,ca),mul(N,sa));N=sub(mul(N,ca),mul(W,sa));W=W2;
        const hw=c.w*(.42+.58*Math.pow(Math.sin(Math.PI*Math.min(1,.12+s*.9)),.6))*(1+.1*Math.sin(s*34+c.phase));
        const p=c.pts[i];
        const k0=add(add(p,mul(W,hw)),mul(N,c.t)),k1=add(sub(p,mul(W,hw)),mul(N,c.t)),k2=sub(sub(p,mul(W,hw)),mul(N,c.t)),k3=sub(add(p,mul(W,hw)),mul(N,c.t));
        const mW=mul(W,-1),mN=mul(N,-1);
        rings.push([push(k0,N,s,c),push(k1,N,s,c),push(k1,mW,s,c),push(k2,mW,s,c),push(k2,mN,s,c),push(k3,mN,s,c),push(k3,W,s,c),push(k0,W,s,c)]);
        if(i===0){first=[k0,k1,k2,k3];T0=T}
        if(i===n-1){last=[k0,k1,k2,k3];T1=T}
      }
      for(let i=0;i<n-1;i++){const a=rings[i],b=rings[i+1];for(let f=0;f<4;f++){const x=f*2;idx.push(a[x],a[x+1],b[x],a[x+1],b[x+1],b[x])}}
      const cap=(q,nrm,s)=>{const o=q.map(p=>push(p,nrm,s,c));idx.push(o[0],o[1],o[2],o[0],o[2],o[3])};
      cap(first,mul(T0,-1),0);cap(last,T1,1);
    }else{
      const seg=c.kind===2?10:6;let N=norm(cross(tangent(c.pts,0),c.kind===2?[0,0,1]:c.lat));const rings=[];
      for(let i=0;i<n;i++){
        const s=i/(n-1),T=tangent(c.pts,i);N=norm(sub(N,mul(T,dot(N,T))));const B=cross(T,N);
        let rad=c.w*(c.kind===1?1-.35*s:1);
        if(c.bulb&&s>.9)rad=c.w*(.65+2.1*Math.sin(((s-.9)/.1)*Math.PI*.92));
        if(c.kind===1&&i===n-1)rad*=.3;
        rings.push(count);
        for(let k=0;k<=seg;k++){const a=(k/seg)*Math.PI*2,nr=add(mul(N,Math.cos(a)),mul(B,Math.sin(a)));push(add(c.pts[i],mul(nr,rad)),nr,s,c)}
      }
      for(let i=0;i<n-1;i++)for(let k=0;k<seg;k++){const a=rings[i]+k,b=rings[i+1]+k;idx.push(a,a+1,b,a+1,b+1,b)}
    }
  }
  return {data:new Float32Array(v),index:new Uint16Array(idx)};
}

// ---------- maths ----------
const clamp01=x=>x<=0?0:x>1?1:x;
const easeInOut=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const sceneCoord=(p,n,hold)=>{if(n<=1)return 0;const t=clamp01(p)*(n-1),i=Math.min(Math.floor(t),n-2),h=hold/2;return i+easeInOut(clamp01((t-i-h)/(1-2*h)))};
const reveal=(coord,scene,delay)=>{const d=coord-scene,lag=d<0?delay:1-delay;return clamp01((.6-Math.abs(d)-lag*.2)/.25)};
const perspective=(fovy,aspect,near,far)=>{const f=1/Math.tan(fovy/2),m=new Float32Array(16);m[0]=f/aspect;m[5]=f;m[10]=(far+near)/(near-far);m[11]=-1;m[14]=(2*far*near)/(near-far);return m};
const lookAt=(eye,at)=>{const z=norm(sub(eye,at)),x=norm(cross([0,1,0],z)),y=cross(z,x),m=new Float32Array(16);
  m[0]=x[0];m[4]=x[1];m[8]=x[2];m[1]=y[0];m[5]=y[1];m[9]=y[2];m[2]=z[0];m[6]=z[1];m[10]=z[2];m[12]=-dot(x,eye);m[13]=-dot(y,eye);m[14]=-dot(z,eye);m[15]=1;return m};
const multiply=(a,b)=>{const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];return o};
const rotY=t=>{const c=Math.cos(t),s=Math.sin(t);return new Float32Array([c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1])};
const rotX=t=>{const c=Math.cos(t),s=Math.sin(t);return new Float32Array([1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1])};
const hexToLinear=hex=>{const n=parseInt(hex.replace('#',''),16),ch=v=>Math.pow(v/255,2.2);return [ch((n>>16)&255),ch((n>>8)&255),ch(n&255)]};

const VERT=`attribute vec3 a_pos;attribute vec3 a_nrm;attribute vec4 a_aux;attribute vec3 a_base;
uniform mat4 u_vp;uniform mat4 u_model;uniform vec2 u_offset;uniform float u_time;uniform float u_bloom;uniform float u_sway;uniform float u_stem;
varying vec3 v_n;varying vec3 v_w;varying float v_s;
void main(){vec3 p=a_pos;float k=a_aux.z;
if(k<1.5){float g=clamp(u_bloom*1.6-a_aux.w*0.6,0.0,1.0);g=1.0-pow(1.0-g,3.0);p=a_base+(p-a_base)*g;
float amp=(k<0.5?0.03:0.06)*u_sway*a_aux.x*a_aux.x;p+=amp*vec3(sin(u_time*0.9+a_aux.y),0.5*sin(u_time*1.3+a_aux.y*1.7),cos(u_time*0.7+a_aux.y*1.3));}
else if(p.y<0.0){p.y*=u_stem;}
vec4 w=u_model*vec4(p,1.0);v_w=w.xyz;v_n=(u_model*vec4(a_nrm,0.0)).xyz;v_s=a_aux.x;gl_Position=u_vp*w;gl_Position.xy+=u_offset*gl_Position.w;}`;
const FRAG=`precision highp float;uniform vec3 u_eye;uniform vec3 u_red;uniform vec3 u_hot;uniform float u_alpha;
varying vec3 v_n;varying vec3 v_w;varying float v_s;
float studio(vec3 r){float key=pow(max(dot(r,normalize(vec3(-0.45,0.85,0.35))),0.0),14.0)*2.6;
float strip=smoothstep(0.55,0.8,r.x)*smoothstep(-0.7,0.3,r.y)*1.4;float rim=smoothstep(0.55,0.95,-r.z)*smoothstep(-0.2,0.5,r.y)*0.9;
float hz=exp(-abs(r.y-0.05)*7.0)*0.4;return key+strip+rim+hz;}
void main(){vec3 n=normalize(v_n);vec3 v=normalize(u_eye-v_w);if(dot(n,v)<0.0)n=-n;vec3 r=reflect(-v,n);float e=studio(r);
float fr=pow(1.0-max(dot(n,v),0.0),3.0);float dif=max(dot(n,normalize(vec3(-0.3,0.8,0.6))),0.0);
vec3 col=u_red*(0.04+0.22*dif);col+=u_red*e*1.15;col+=u_hot*pow(e,3.0)*0.3;col+=u_red*fr*1.1;col*=0.8+0.2*smoothstep(0.0,0.25,v_s);
col=col/(1.0+col);col=pow(col,vec3(1.0/2.2));gl_FragColor=vec4(col*u_alpha,u_alpha);}`;

// ---------- renderer (WebGL, with a stroked 2D fallback) ----------
function createRenderer(canvas){
  if(window.AADSMag)return window.AADSMag.create(canvas);
  const {curves,radius}=buildCurves(6,7), mesh=buildMesh(curves);
  let gl=null,ctx2d=null,prog=null;const loc={};
  const init=()=>{
    gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true});
    if(!gl)return false;
    const compile=(type,src)=>{const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);return gl.getShaderParameter(sh,gl.COMPILE_STATUS)?sh:null};
    const vs=compile(gl.VERTEX_SHADER,VERT),fs=compile(gl.FRAGMENT_SHADER,FRAG);if(!vs||!fs)return false;
    prog=gl.createProgram();gl.attachShader(prog,vs);gl.attachShader(prog,fs);gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog,gl.LINK_STATUS))return false;gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,mesh.data,gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,mesh.index,gl.STATIC_DRAW);
    const attr=(n,size,off)=>{const a=gl.getAttribLocation(prog,n);if(a<0)return;gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,size,gl.FLOAT,false,STRIDE*4,off*4)};
    attr('a_pos',3,0);attr('a_nrm',3,3);attr('a_aux',4,6);attr('a_base',3,10);
    for(const n of['u_vp','u_model','u_offset','u_time','u_bloom','u_sway','u_stem','u_eye','u_red','u_hot','u_alpha'])loc[n]=gl.getUniformLocation(prog,n);
    gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);return true;
  };
  if(!init()){gl=null;ctx2d=canvas.getContext('2d')}
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();gl=null});
  canvas.addEventListener('webglcontextrestored',()=>{if(!init())gl=null});
  let W=1,H=1,dpr=1;
  const resize=()=>{const r=canvas.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);dpr=Math.min(devicePixelRatio||1,2);
    const cw=Math.round(W*dpr),ch=Math.round(H*dpr);if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch}};
  const red=hexToLinear(RED);
  const draw=(k,{spin=0,px=0,py=0,time=0,bloom=1,sway=0,alpha=1})=>{
    const fov=30*Math.PI/180,minDim=Math.min(W,H);
    const dist=(radius*H)/(k.size*minDim*Math.tan(fov/2));
    const el=Math.max(-88,Math.min(88,k.el+py*9))*Math.PI/180;
    const eye=[HEART[0],HEART[1]+Math.sin(el)*dist,HEART[2]+Math.cos(el)*dist];
    const vp=multiply(perspective(fov,W/H,Math.max(.05,dist-6),dist+8),lookAt(eye,HEART));
    const model=multiply(rotY(k.spin+spin+px*.35),rotX(py*.05));
    if(gl&&prog){
      gl.viewport(0,0,canvas.width,canvas.height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.uniformMatrix4fv(loc.u_vp,false,vp);gl.uniformMatrix4fv(loc.u_model,false,model);gl.uniform2f(loc.u_offset,k.ox,k.oy);
      gl.uniform1f(loc.u_time,time);gl.uniform1f(loc.u_bloom,bloom);gl.uniform1f(loc.u_sway,sway);gl.uniform1f(loc.u_stem,k.stem);
      gl.uniform3f(loc.u_eye,eye[0],eye[1],eye[2]);gl.uniform3f(loc.u_red,red[0]*2.2,red[1]*2.2,red[2]*2.2);gl.uniform3f(loc.u_hot,1,.55+red[1],.5+red[2]);
      gl.uniform1f(loc.u_alpha,alpha);gl.drawElements(gl.TRIANGLES,mesh.index.length,gl.UNSIGNED_SHORT,0);
    }else if(ctx2d){
      const c=ctx2d,mvp=multiply(vp,model);c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);c.globalAlpha=alpha;c.lineCap='round';c.strokeStyle=RED;
      for(const cv of curves){c.beginPath();cv.pts.forEach((q,i)=>{const y=cv.kind===2&&q[1]<0?q[1]*k.stem:q[1];
        const cx=mvp[0]*q[0]+mvp[4]*y+mvp[8]*q[2]+mvp[12],cy=mvp[1]*q[0]+mvp[5]*y+mvp[9]*q[2]+mvp[13],cw=mvp[3]*q[0]+mvp[7]*y+mvp[11]*q[2]+mvp[15];
        const sx=((cx/cw+k.ox)*.5+.5)*W,sy=(.5-(cy/cw+k.oy)*.5)*H;i?c.lineTo(sx,sy):c.moveTo(sx,sy)});
        c.lineWidth=cv.kind===0?(minDim*k.size)/22:cv.kind===1?1.2:3;c.stroke()}
    }
  };
  return {resize,draw,size:()=>({W,H})};
}

// Static print grain (an SVG noise filter, not a gradient).
const grain=()=>{const ns='http://www.w3.org/2000/svg',s=doc.createElementNS(ns,'svg');s.setAttribute('aria-hidden','true');s.setAttribute('class','lys-grain');
  s.innerHTML='<filter id="lys-grain-f"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0"/></filter><rect width="100%" height="100%" filter="url(#lys-grain-f)"/>';return s};

// Runs a render loop only while the element is on screen.
// records desk behind the magnifier: a base layer plus a zoomed copy clipped to the lens
const docsLayer=(stage)=>{const Z=1.9,mk=c=>{const d=doc.createElement('div');d.className=c;d.setAttribute('aria-hidden','true');d.innerHTML='<img alt="" src="./assets/hero-records.svg" decoding="async">';return d};
  const base=mk('lys-docs'),zoom=mk('lys-docs lys-docs-zoom');stage.prepend(zoom);stage.prepend(base);
  return R=>{const l=R.lens&&R.lens();if(!l){zoom.style.clipPath='inset(50%)';return}
    zoom.style.transformOrigin=l.cx.toFixed(1)+'px '+l.cy.toFixed(1)+'px';zoom.style.transform='scale('+Z+')';
    zoom.style.clipPath='polygon('+l.pts.map(q=>(l.cx+(q[0]-l.cx)/Z).toFixed(1)+'px '+(l.cy+(q[1]-l.cy)/Z).toFixed(1)+'px').join(',')+')'}};
function loop(el,tick){
  let raf=0,on=false,vis=true,last=performance.now();
  const f=now=>{raf=requestAnimationFrame(f);const dt=Math.min(.05,(now-last)/1000);last=now;tick(now,dt)};
  const start=()=>{if(on||!vis||doc.hidden)return;on=true;last=performance.now();raf=requestAnimationFrame(f)};
  const stop=()=>{on=false;cancelAnimationFrame(raf)};
  new IntersectionObserver(([e])=>{vis=e.isIntersecting;vis?start():stop()}).observe(el);
  doc.addEventListener('visibilitychange',()=>doc.hidden?stop():start());start();
}

// ---------- still lily (inside pages, and the homepage under reduced motion) ----------
function still(stage,key,keyNarrow,bp){
  const canvas=doc.createElement('canvas');canvas.className='lys-canvas';canvas.setAttribute('aria-hidden','true');
  stage.prepend(canvas);stage.append(grain());stage.classList.add('lys-still');
  const docsUp=docsLayer(stage);
  const R=createRenderer(canvas);const ro=new ResizeObserver(()=>R.resize());ro.observe(canvas);R.resize();
  const narrow=()=>matchMedia('(max-width:'+(bp||760)+'px)').matches;
  const pointer={x:0,y:0,tx:0,ty:0};let time=0;const born=performance.now();
  if(!reduce)stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();pointer.tx=(e.clientX-r.left)/r.width*2-1;pointer.ty=(e.clientY-r.top)/r.height*2-1});
  const tick=(now,dt)=>{
    if(!reduce)time+=dt;
    pointer.x+=(pointer.tx-pointer.x)*(1-Math.exp(-dt*4));pointer.y+=(pointer.ty-pointer.y)*(1-Math.exp(-dt*4));
    const n=narrow(),k=n?keyNarrow:key;
    R.draw(k,{spin:reduce?0:Math.sin(time*.35)*.45,px:reduce?0:pointer.x,py:reduce?0:pointer.y,time,bloom:reduce?1:clamp01((now-born)/2600),sway:reduce?0:1,alpha:(n&&!bp)?.38:1});docsUp(R);
  };
  if(reduce){requestAnimationFrame(()=>{R.resize();tick(performance.now(),0)});ro.disconnect();new ResizeObserver(()=>{R.resize();tick(performance.now(),0)}).observe(canvas)}
  else loop(stage,tick);
}

// ---------- homepage: scroll-scrubbed frames ----------
const KEYS=[
  {spin:-.45,el:6,  size:.78,ox:.44,oy:.04,tilt:.12, roll:0,  stem:1},   // magnifier, three-quarter
  {spin:.75, el:22, size:.6, ox:.48,oy:0,  tilt:-.35,roll:.55,stem:1},   // turned, searching
  {spin:-.1, el:-8, size:.92,ox:.54,oy:.06,tilt:.05, roll:-.35,stem:1},  // lens to the viewer
];
const KEYS_TALL=[
  {spin:-.45,el:6, size:.7, ox:0,oy:.36,tilt:.12, roll:0,  stem:1},
  {spin:.75, el:22,size:.6, ox:0,oy:.4, tilt:-.35,roll:.55,stem:1},
  {spin:-.1, el:-8,size:.74,ox:0,oy:.38,tilt:.05, roll:-.35,stem:1},
];
const keyAt=(coord,tall)=>{const K=tall?KEYS_TALL:KEYS,i=Math.max(0,Math.min(K.length-1,Math.floor(coord))),j=Math.min(K.length-1,i+1),f=coord-i,a=K[i],b=K[j],l=(x,y)=>x+(y-x)*f;
  return {spin:l(a.spin,b.spin),el:l(a.el,b.el),size:l(a.size,b.size),ox:l(a.ox,b.ox),oy:l(a.oy,b.oy),tilt:l(a.tilt||0,b.tilt||0),roll:l(a.roll||0,b.roll||0),stem:l(a.stem,b.stem)}};

function home(top){
  const strip=top.querySelector('.brand-strip'),hero=top.querySelector('.hero'),copy=top.querySelector('.hero-copy');
  const h1=copy&&copy.querySelector('h1'),h2=copy&&copy.querySelector('h2'),p=copy&&copy.querySelector('p:not(.hero-support)'),support=copy&&copy.querySelector('.hero-support'),actions=copy&&copy.querySelector('.hero-actions');
  const shortcuts=top.querySelector('.service-shortcuts');
  if(!strip||!hero||!h1||!h2||!p||!support||!actions)return false;
  root.classList.add('lys-home');
  // Regroup (document order is unchanged): [kicker][h1] | [h2 + paragraph] | [support line + buttons]
  const wrap=(cls,...els)=>{const d=doc.createElement('div');d.className=cls;els[0].before(d);els.forEach(e=>d.append(e));return d};
  const f1=wrap('lys-f lys-f1',h2,p), f2=wrap('lys-f lys-f2',support,actions);
  h1.classList.add('lys-f','lys-f0');strip.classList.add('lys-f','lys-f0k');
  const scroller=doc.createElement('div');scroller.className='lys-root';
  const stage=doc.createElement('div');stage.className='lys-stage';
  strip.before(scroller);scroller.append(stage);stage.append(strip,hero);
  if(shortcuts)scroller.after(shortcuts);
  const canvas=doc.createElement('canvas');canvas.className='lys-canvas';canvas.setAttribute('aria-hidden','true');stage.prepend(canvas);stage.append(grain());
  const docsUp=docsLayer(stage);
  // frame ticks (like the specimen's side nav)
  const nav=doc.createElement('nav');nav.className='lys-nav';nav.setAttribute('aria-label','Hero');
  const ticks=[0,1,2].map(i=>{const b=doc.createElement('button');b.type='button';b.setAttribute('aria-label',String(i+1));b.innerHTML='<span class="lys-tick"></span>';b.addEventListener('click',()=>jump(i));nav.append(b);return b});
  stage.append(nav);

  const items=[[strip,0,'rise',0],[h1,0,'clip',.15],[h2,1,'clip',0],[p,1,'rise',.25],[support,2,'clip',0],[actions,2,'rise',.3]].map(([el,scene,fx,delay])=>({el,scene,fx,delay,last:-1}));
  const R=createRenderer(canvas);
  const ro=new ResizeObserver(()=>R.resize());ro.observe(stage);R.resize();
  const SC=3,HOLD=.34;
  const progress=()=>{const r=scroller.getBoundingClientRect(),travel=r.height-stage.clientHeight;return travel<=0?0:clamp01(-r.top/travel)};
  const jump=i=>{const r=scroller.getBoundingClientRect(),travel=r.height-stage.clientHeight;window.scrollTo({top:scrollY+r.top+(i/(SC-1))*travel,behavior:'smooth'})};
  // A keyboard user tabbing into a later frame gets that frame scrolled into view.
  stage.addEventListener('focusin',e=>{const it=items.find(x=>x.el.contains(e.target));if(it&&Math.round(coordNow)!==it.scene)jump(it.scene)});
  const pointer={x:0,y:0,tx:0,ty:0};let spin=0,spinVel=0,drag=null;
  stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();pointer.tx=(e.clientX-r.left)/r.width*2-1;pointer.ty=(e.clientY-r.top)/r.height*2-1;
    if(drag&&drag.id===e.pointerId){spinVel+=(e.clientX-drag.x)*.0022;drag.x=e.clientX}});
  stage.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('a,button'))return;drag={id:e.pointerId,x:e.clientX}});
  addEventListener('pointerup',()=>{drag=null});
  let time=0,prog=-1,coordNow=0,shown=-1;const born=performance.now();
  loop(scroller,(now,dt)=>{
    time+=dt;const pr=progress();prog=prog<0?pr:prog+(pr-prog)*(1-Math.exp(-dt*9));
    const coord=sceneCoord(prog,SC,HOLD);coordNow=coord;const scene=Math.round(coord);
    if(scene!==shown){shown=scene;ticks.forEach((b,i)=>i===scene?b.setAttribute('aria-current','step'):b.removeAttribute('aria-current'))}
    const {W,H}=R.size(),tall=H>W*1.05||W<760,k=keyAt(coord,tall);
    pointer.x+=(pointer.tx-pointer.x)*(1-Math.exp(-dt*4));pointer.y+=(pointer.ty-pointer.y)*(1-Math.exp(-dt*4));
    spin+=spinVel;spinVel*=Math.exp(-dt*3);if(!drag)spin*=Math.exp(-dt*.8);
    R.draw(k,{spin,px:pointer.x,py:pointer.y,time,bloom:clamp01((now-born)/2600),sway:1,alpha:tall?.9:1});docsUp(R);
    for(const it of items){
      const q=Math.round(reveal(coord,it.scene,it.delay)*500)/500;if(q===it.last)continue;it.last=q;
      const s=it.el.style,dir=coord<it.scene?1:-1;
      s.opacity=String(q);s.pointerEvents=q<.5?'none':'';
      if(it.fx==='clip'){const hid=((1-q)*100).toFixed(1);s.clipPath=q>=1?'':dir>0?'inset(0 0 '+hid+'% 0)':'inset('+hid+'% 0 0 0)';s.transform=q>=1?'':'translateY('+((1-q)*.4*dir).toFixed(3)+'em)'}
      else{s.transform=q>=1?'':'translateY('+((1-q)*34*dir).toFixed(1)+'px)';s.filter=q>.995?'':'blur('+((1-q)*8).toFixed(1)+'px)'}
    }
  });
  return true;
}

// ---------- start ----------
const homeTop=doc.querySelector('.home-light .blue-top');
const glOK=(()=>{try{const c=doc.createElement('canvas');return !!(c.getContext('webgl'))}catch(e){return false}})();
if(homeTop){
  if(!reduce&&glOK&&home(homeTop)){/* scroll hero running */}
  else{root.classList.add('lys-home-still');still(homeTop,{spin:-.45,el:6,size:.8,ox:.5,oy:.06,tilt:.12,roll:0,stem:1},{spin:-.45,el:6,size:.5,ox:.4,oy:.55,tilt:.12,roll:0,stem:1})}
}
doc.querySelectorAll('.inside-top').forEach(t=>still(t,{spin:-.4,el:8,size:.74,ox:.6,oy:.04,tilt:.1,roll:.2,stem:1},{spin:-.4,el:8,size:.82,ox:.32,oy:.02,tilt:.1,roll:.2,stem:1},1099));
window.AADSLily={createRenderer,loop,glOK,reduce};
})();
