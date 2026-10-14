const MAX_FILE_BYTES=64*1024*1024;
const MAX_XML_BYTES=16*1024*1024;
const MAX_TEXT=80000;
const SUPPORTED=new Set(['pdf','docx','pptx','txt','md','csv']);
const decoder=new TextDecoder('utf-8');
const clean=text=>text.replace(/\u0000/g,'').replace(/[\t ]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
function result(file,text,pages,unit,truncated=false){text=clean(text);if(!text)throw new Error(`${file.name}: no readable text was found. For scanned PDFs, attach a text version.`);return {name:file.name.slice(0,250),text:text.slice(0,MAX_TEXT),pages,unit,truncated:truncated||text.length>MAX_TEXT,storage:'Read in your browser. Original file is not uploaded.'};}
function selectedEntry(name,ext){return ext==='docx'?/^word\/(document|footnotes|endnotes|header\d+|footer\d+)\.xml$/.test(name):/^ppt\/slides\/slide\d+\.xml$/.test(name);}
// Inspect ZIP metadata before inflating any selected document text.
export function inspectOfficeArchive(bytes,ext){
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let end=-1;
 for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--){if(view.getUint32(i,true)===0x06054b50){end=i;break;}}
 if(end<0)throw new Error('This Office file is not a readable ZIP document.');
 const disk=view.getUint16(end+4,true),directoryDisk=view.getUint16(end+6,true),count=view.getUint16(end+10,true),offset=view.getUint32(end+16,true);
 if(disk||directoryDisk||count===65535||offset===0xffffffff||count>5000)throw new Error('This Office file is too complex. Export it as a text file.');
 let cursor=offset,total=0;const names=[];
 for(let i=0;i<count;i++){
  if(cursor+46>bytes.length||view.getUint32(cursor,true)!==0x02014b50)throw new Error('The Office file directory is damaged.');
  const flags=view.getUint16(cursor+8,true),size=view.getUint32(cursor+24,true),length=view.getUint16(cursor+28,true),extra=view.getUint16(cursor+30,true),comment=view.getUint16(cursor+32,true);
  if(cursor+46+length+extra+comment>bytes.length)throw new Error('The Office file directory is incomplete.');
  const name=decoder.decode(bytes.subarray(cursor+46,cursor+46+length));
  if(selectedEntry(name,ext)){if(flags&1)throw new Error('Password-protected Office files are not supported.');if(size===0xffffffff||size>MAX_XML_BYTES)throw new Error('The document text is too large. Export a shorter text version.');total+=size;if(total>MAX_XML_BYTES)throw new Error('The document text is too large. Export a shorter text version.');names.push(name);}
  cursor+=46+length+extra+comment;
 }
 if(!names.length)throw new Error('This Office file contains no supported document text.');return names;
}
function xmlText(bytes,ext){
 const source=decoder.decode(bytes);if(/<!DOCTYPE|<!ENTITY/i.test(source))throw new Error('This Office XML format is not supported.');
 const doc=new DOMParser().parseFromString(source,'application/xml');if(doc.getElementsByTagName('parsererror').length)throw new Error('The document contains damaged XML.');
 const paragraphs=[...doc.getElementsByTagNameNS('*','p')];
 return paragraphs.map(p=>[...p.getElementsByTagNameNS('*','t')].map(t=>t.textContent).join('')).filter(Boolean).join('\n');
}
async function office(file,bytes,ext){
 const names=inspectOfficeArchive(bytes,ext);
 const {unzipSync}=await import('./vendor/fflate/fflate.mjs');
 const selected=new Set(names);const files=unzipSync(bytes,{filter:entry=>selected.has(entry.name)&&entry.originalSize<=MAX_XML_BYTES});
 names.sort(ext==='pptx'?(a,b)=>Number(a.match(/slide(\d+)/)[1])-Number(b.match(/slide(\d+)/)[1]):(a,b)=>a==='word/document.xml'?-1:b==='word/document.xml'?1:a.localeCompare(b));
 let text='';for(const [i,name] of names.entries()){if(!files[name])throw new Error('The document text could not be read.');text+=(ext==='pptx'?`Slide ${i+1}\n`:'')+xmlText(files[name],ext)+'\n\n';if(text.length>=MAX_TEXT)break;}
 return result(file,text,ext==='pptx'?names.length:1,ext==='pptx'?'slide':'document');
}
async function pdf(file,bytes){
 const pdfjs=await import('./vendor/pdfjs/pdf.min.mjs');
 pdfjs.GlobalWorkerOptions.workerSrc=new URL('./vendor/pdfjs/pdf.worker.min.mjs',import.meta.url).href;
 const task=pdfjs.getDocument({data:bytes,isEvalSupported:false,disableFontFace:true,cMapUrl:new URL('./vendor/pdfjs/cmaps/',import.meta.url).href,cMapPacked:true,standardFontDataUrl:new URL('./vendor/pdfjs/standard_fonts/',import.meta.url).href,wasmUrl:new URL('./vendor/pdfjs/wasm/',import.meta.url).href});
 let timer;const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>{task.destroy();reject(new Error('Reading this PDF took too long. Try a smaller file or a text version.'));},40000);});
 try{return await Promise.race([(async()=>{const doc=await task.promise;let text='';const count=Math.min(doc.numPages,200);for(let page=1;page<=count;page++){const p=await doc.getPage(page);const content=await p.getTextContent();text+=content.items.map(x=>('str' in x?x.str+(x.hasEOL?'\n':' '):'')).join('')+'\n\n';p.cleanup();if(text.length>=MAX_TEXT)break;}return result(file,text,doc.numPages,'page',doc.numPages>200);})(),timeout]);}
 catch(error){if(error.name==='PasswordException')throw new Error('Password-protected PDFs are not supported.');throw error;}
 finally{clearTimeout(timer);await task.destroy();}
}
export async function extractBrief(file){
 if(file.size>MAX_FILE_BYTES)throw new Error(`${file.name}: use a file at most 64 MiB.`);
 const ext=file.name.split('.').pop().toLowerCase();if(!SUPPORTED.has(ext))throw new Error('Use a PDF, DOCX, PPTX, TXT, MD or CSV file.');
 const bytes=new Uint8Array(await file.arrayBuffer());
 if(ext==='pdf')return pdf(file,bytes);
 if(ext==='docx'||ext==='pptx')return office(file,bytes,ext);
 let text;if(bytes[0]===255&&bytes[1]===254)text=new TextDecoder('utf-16le').decode(bytes);else if(bytes[0]===254&&bytes[1]===255)text=new TextDecoder('utf-16be').decode(bytes);else text=decoder.decode(bytes);
 return result(file,text,1,'document');
}
