(function(){"use strict";const g=`
    attribute vec2 aPos;
    void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
  `,x=`
    precision highp float;
    uniform vec2 resolution;
    uniform float time;

    float PHI = 1.61803398874989484820459;

    float random(vec2 xy) {
      return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
    }

    void main(void) {
      float u_total_size = 18.0;   // grid cell size, device px
      float u_dot_size   = 2.0;    // dot size within the cell, device px

      vec2 st = gl_FragCoord.xy;
      st.x -= abs(floor((mod(resolution.x, u_total_size) - u_dot_size) * 0.5));
      st.y -= abs(floor((mod(resolution.y, u_total_size) - u_dot_size) * 0.5));

      float opacity = step(0.0, st.x);
      opacity *= step(0.0, st.y);

      vec2 st2 = vec2(floor(st.x / u_total_size), floor(st.y / u_total_size));

      float frequency = 5.0;
      float show_offset = random(st2);
      float rand = random(st2 * floor((time / frequency) + show_offset + frequency) + 1.0);

      // stepped opacities — matches the CanvasRevealEffect default ramp
      float idx = floor(rand * 10.0);
      float ov = 0.3;
      ov = mix(ov, 0.5, step(3.0, idx));
      ov = mix(ov, 0.8, step(6.0, idx));
      ov = mix(ov, 1.0, step(9.0, idx));
      opacity *= ov;

      // carve the dot out of the cell
      opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
      opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

      vec3 color = vec3(1.0); // white dots, matching sign-in-flow-1's colors
      gl_FragColor = vec4(color * opacity, 1.0);
    }
  `;function f(e,t,s){const o=e.createShader(t);return e.shaderSource(o,s),e.compileShader(o),e.getShaderParameter(o,e.COMPILE_STATUS)?o:(console.warn("Shader compile error:",e.getShaderInfoLog(o)),null)}function u(){const e=document.getElementById("bg");if(!e)return;let t;try{t=e.getContext("webgl")||e.getContext("experimental-webgl")}catch{t=null}if(!t){e.style.display="none";return}const s=f(t,t.VERTEX_SHADER,g),o=f(t,t.FRAGMENT_SHADER,x);if(!s||!o){e.style.display="none";return}const i=t.createProgram();t.attachShader(i,s),t.attachShader(i,o),t.linkProgram(i),t.useProgram(i);const A=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,A),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),t.STATIC_DRAW);const m=t.getAttribLocation(i,"aPos");t.enableVertexAttribArray(m),t.vertexAttribPointer(m,2,t.FLOAT,!1,0,0);const z=t.getUniformLocation(i,"resolution"),R=t.getUniformLocation(i,"time"),h=Math.min(window.devicePixelRatio||1,2);function v(){const a=Math.floor(window.innerWidth*h),r=Math.floor(window.innerHeight*h);e.width=a,e.height=r,e.style.width=window.innerWidth+"px",e.style.height=window.innerHeight+"px",t.viewport(0,0,a,r),t.uniform2f(z,a,r)}v();const l=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches,P=navigator.connection&&navigator.connection.saveData,b=l?1/0:P?100:1e3/30;let _=1,p,c=!0,n=0;function d(a){if(!c)return;const r=Number(a)||performance.now(),y=n?r-n:16.667;(!n||y>=b)&&(_+=Math.max(.05,Math.min(.3,y*.003)),t.uniform1f(R,_),t.drawArrays(t.TRIANGLE_STRIP,0,4),n=r),l||(p=requestAnimationFrame(d))}let w;window.addEventListener("resize",()=>{clearTimeout(w),w=setTimeout(()=>{v(),l&&c&&(n=0,d(performance.now()))},150)}),d(performance.now()),document.addEventListener("visibilitychange",()=>{c=!document.hidden,c&&(cancelAnimationFrame(p),n=0,d(performance.now()))})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",u):u()})();
