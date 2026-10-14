export const API_ORIGIN = 'https://backer-bluefocus.vercel.app';
export function apiURL(route){if(!route.startsWith('/api/'))throw new Error('Unsupported service route.');return new URL(route,API_ORIGIN).href;}
export async function requestAPI(route,{method='POST',body,signal}={}){
 let response;
 try{response=await fetch(apiURL(route),{method,headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),credentials:'omit',signal:signal||AbortSignal.timeout(35000)});}catch(error){if(error.name==='TimeoutError'||error.name==='AbortError')throw new Error('The simulation service took too long. Please try again.');throw new Error('Could not reach the simulation service. Check your connection and try again.');}
 let data;try{data=await response.json();}catch{throw new Error('The simulation service returned an unreadable response. Please try again.');}
 if(!response.ok)throw new Error(data.error||'Could not complete this request.');return data;
}
