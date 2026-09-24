"use client";
import {useEffect,useRef,useState} from "react";

type Mode="idle"|"camera"|"recording"|"preview";
const MAX_SECONDS=5;

export default function LiveMediaCapture({onChange}:{onChange:(file:File|null)=>void}){
 const liveRef=useRef<HTMLVideoElement>(null),previewRef=useRef<HTMLVideoElement>(null),streamRef=useRef<MediaStream|null>(null),timerRef=useRef<ReturnType<typeof setInterval>|null>(null);
 const [mode,setMode]=useState<Mode>("idle"),[kind,setKind]=useState<"selfie"|"video"|null>(null),[preview,setPreview]=useState(""),[seconds,setSeconds]=useState(MAX_SECONDS),[error,setError]=useState("");
 function stopStream(){streamRef.current?.getTracks().forEach(track=>track.stop());streamRef.current=null;if(timerRef.current)clearInterval(timerRef.current)}
 useEffect(()=>()=>{stopStream();if(preview)URL.revokeObjectURL(preview)},[preview]);
 async function openCamera(nextKind:"selfie"|"video"){
  setError("");setKind(nextKind);if(!navigator.mediaDevices?.getUserMedia){setError("Camera nu este disponibilă în acest browser.");return}
  try{const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:720},height:{ideal:960}},audio:false});streamRef.current=stream;setMode("camera");requestAnimationFrame(()=>{if(liveRef.current){liveRef.current.srcObject=stream;void liveRef.current.play()}})}
  catch{setError("Nu am putut deschide camera. Verifică permisiunea pentru cameră.")}
 }
 function accept(blob:Blob,type:string,name:string){if(preview)URL.revokeObjectURL(preview);const file=new File([blob],name,{type});setPreview(URL.createObjectURL(blob));onChange(file);stopStream();setMode("preview")}
 function takeSelfie(){const video=liveRef.current;if(!video||!video.videoWidth)return;const scale=Math.min(1,720/video.videoWidth),canvas=document.createElement("canvas");canvas.width=Math.round(video.videoWidth*scale);canvas.height=Math.round(video.videoHeight*scale);canvas.getContext("2d")?.drawImage(video,0,0,canvas.width,canvas.height);canvas.toBlob(blob=>{if(blob)accept(blob,"image/jpeg","selfie-live.jpg")}, "image/jpeg",.82)}
 function recordVideo(){
  const stream=streamRef.current;if(!stream||typeof MediaRecorder==="undefined"){setError("Înregistrarea video nu este disponibilă în acest browser.");return}
  const preferred=["video/mp4;codecs=h264","video/mp4","video/webm;codecs=vp8","video/webm"].find(x=>MediaRecorder.isTypeSupported(x));
  try{const recorder=new MediaRecorder(stream,{...(preferred?{mimeType:preferred}:{}),videoBitsPerSecond:650_000}),chunks:Blob[]=[];recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.onstop=()=>{const type=(recorder.mimeType||"video/webm").split(";")[0],ext=type.includes("mp4")?"mp4":"webm";const blob=new Blob(chunks,{type});if(blob.size>4*1024*1024){setError("Videoul este prea mare. Refă înregistrarea sau folosește un selfie.");stopStream();setMode("idle");setKind(null);return}accept(blob,type,`prezentare-live.${ext}`)};recorder.start();setMode("recording");setSeconds(MAX_SECONDS);let left=MAX_SECONDS;timerRef.current=setInterval(()=>{left-=1;setSeconds(left);if(left<=0){if(timerRef.current)clearInterval(timerRef.current);if(recorder.state==="recording")recorder.stop()}},1000)}
  catch{setError("Înregistrarea video nu a putut porni. Poți folosi un selfie.")}
 }
 function reset(){if(preview)URL.revokeObjectURL(preview);setPreview("");onChange(null);setMode("idle");setKind(null);setSeconds(MAX_SECONDS);setError("")}
 function cancelCamera(){stopStream();setMode("idle");setKind(null)}
 return <div className="live-capture">
  <div className="live-capture-head"><strong>Selfie sau prezentare video</strong><span>Obligatoriu</span></div>
  <p>Realizează acum un selfie sau un video fără sunet de maximum 5 secunde. Nu se poate alege din galerie. Materialul ajută la reducerea invitațiilor false și automate.</p>
  {mode==="idle"&&<div className="live-capture-options"><button type="button" onClick={()=>void openCamera("selfie")}><span>📷</span><b>Fă un selfie</b></button><button type="button" onClick={()=>void openCamera("video")}><span>🎥</span><b>Video de 5 secunde</b></button></div>}
  {(mode==="camera"||mode==="recording")&&<div className="camera-stage"><video ref={liveRef} muted playsInline autoPlay aria-label="Previzualizare cameră frontală"/>{mode==="recording"&&<div className="recording-count"><i/> {seconds}s</div>}<div className="camera-actions">{mode==="camera"&&kind==="selfie"&&<button type="button" className="capture-main" onClick={takeSelfie}>Fă fotografia</button>}{mode==="camera"&&kind==="video"&&<button type="button" className="capture-main" onClick={recordVideo}>Începe înregistrarea</button>}{mode!=="recording"&&<button type="button" onClick={cancelCamera}>Renunță</button>}</div></div>}
  {mode==="preview"&&<div className="capture-preview">{kind==="selfie"?<img src={preview} alt="Previzualizarea selfie-ului făcut acum"/>:<video ref={previewRef} src={preview} muted playsInline controls aria-label="Previzualizarea prezentării video"/>}<div><strong>{kind==="selfie"?"Selfie pregătit":"Video pregătit · fără sunet"}</strong><button type="button" onClick={reset}>Refă</button></div></div>}
  {error&&<p className="capture-error" role="alert">{error}</p>}
  <small>Materialul rămâne în spațiul privat de administrare, nu este publicat și poate fi șters la cerere.</small>
 </div>
}
