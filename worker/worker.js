const PUB="BML_jNhfyPXrEkyhtViJ_tGenuXufsE1tnoUoZL9WPnkovSxDd3gLU4A3bwaYKV_ssTcOdSlHeI61PoPADw7gOw";
const E=new TextEncoder();
const b64u=a=>btoa(String.fromCharCode(...new Uint8Array(a))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const unb=s=>Uint8Array.from(atob(s.replace(/-/g,"+").replace(/_/g,"/")),c=>c.charCodeAt(0));
async function jwt(aud,env){
  const pub=unb(PUB);
  const key=await crypto.subtle.importKey("jwk",{kty:"EC",crv:"P-256",x:b64u(pub.slice(1,33)),y:b64u(pub.slice(33,65)),d:(env.VAPID_PRIVATE||"").replace(/[\s"']/g,"")},{name:"ECDSA",namedCurve:"P-256"},false,["sign"]);
  const h=b64u(E.encode(JSON.stringify({typ:"JWT",alg:"ES256"})));
  const p=b64u(E.encode(JSON.stringify({aud,exp:Math.floor(Date.now()/1000)+43200,sub:"https://abdaboarar31-maker.github.io"})));
  const s=await crypto.subtle.sign({name:"ECDSA",hash:"SHA-256"},key,E.encode(h+"."+p));
  return h+"."+p+"."+b64u(s);
}
async function push(sub,env){
  const t=await jwt(new URL(sub.endpoint).origin,env);
  return fetch(sub.endpoint,{method:"POST",headers:{Authorization:`vapid t=${t}, k=${PUB}`,TTL:"3600",Urgency:"high"}});
}
function hhmm(tz){return new Intl.DateTimeFormat("en-GB",{timeZone:tz,hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).format(new Date())}
const H={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"POST,OPTIONS"};
export default{
  async fetch(r,env){
    if(r.method==="OPTIONS")return new Response(null,{headers:H});
    if(r.method==="POST"&&new URL(r.url).pathname==="/subscribe"){
      const b=await r.json();
      if(!b.sub||!b.sub.endpoint)return new Response("bad",{status:400,headers:H});
      const id=b64u(await crypto.subtle.digest("SHA-256",E.encode(b.sub.endpoint)));
      await env.SUBS.put(id,JSON.stringify({sub:b.sub,settings:b.settings,tz:b.tz||"UTC"}));
      return new Response("ok",{headers:H});
    }
    if(new URL(r.url).pathname==="/test"){
      const {keys}=await env.SUBS.list();const out=[];
      for(const k of keys){
        const v=JSON.parse(await env.SUBS.get(k.name)||"null");if(!v)continue;
        try{const res=await push(v.sub,env);out.push({host:new URL(v.sub.endpoint).host,status:res.status,body:(await res.text()).slice(0,200)})}catch(e){out.push({error:String(e)})}
      }
      return new Response(JSON.stringify({v:"v3",privLen:(env.VAPID_PRIVATE||"").replace(/[\s"']/g,"").length,subscribers:keys.length,results:out},null,1),{headers:{...H,"Content-Type":"application/json"}});
    }
    return new Response("Adhkar push worker",{headers:H});
  },
  async scheduled(ev,env,ctx){
    const {keys}=await env.SUBS.list();
    for(const k of keys){
      try{
        const v=JSON.parse(await env.SUBS.get(k.name)||"null");
        if(!v)continue;
        const t=hhmm(v.tz);
        if(!Object.values(v.settings||{}).some(s=>s&&s.on&&s.t===t))continue;
        ctx.waitUntil(push(v.sub,env).then(res=>{console.log("push",res.status);if(res.status===404||res.status===410)return env.SUBS.delete(k.name)}));
      }catch(e){console.log(String(e))}
    }
  }
};
