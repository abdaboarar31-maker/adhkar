var W="https://square-star-8d92.abdcode.workers.dev",V="BPCw2k4x7m9N3vR8qL1zX6yT5wP2jH4gF8dS3aK9mL7nB5vC2xZ8qW4eR6tY1uI3oP7aS9dF2gH5jK8lM6nB4vC1xZ3qW7eR9tY2uI5oP8a";
var K=["morning","evening","sleep"],c="morning",i=0,n=0,S={};
function $(x){return document.getElementById(x)}
try{S=JSON.parse(localStorage.getItem("adhkar")||"{}")}catch(e){S={}}
K.forEach(function(k){S[k]=S[k]||{t:D[k].t,on:true}});
var q=location.search.match(/c=(\w+)/);if(q&&D[q[1]])c=q[1];
function ok(){$("en").classList.add("done");$("et").textContent="الإشعارات مفعّلة"}
function st(t){$("st").textContent=t}
function save(){try{localStorage.setItem("adhkar",JSON.stringify(S))}catch(e){}sync()}
function show(){var d=D[c].l[i];document.body.dataset.c=c;$("tx").textContent=d[0];$("sr").textContent="يُقال "+d[2];$("cn").textContent=ar(n);$("ct").textContent="من "+ar(d[1]);$("ix").textContent=ar(i+1)+" / "+ar(D[c].l.length);$("pg").style.strokeDashoffset=326.7*(1-n/d[1]);
Array.prototype.forEach.call(document.querySelectorAll(".tab"),function(b){b.setAttribute("aria-selected",b.dataset.k==c)})}
$("tabs").innerHTML=K.map(function(k){return '<button class="tab" role="tab" data-k="'+k+'">'+D[k].n+'</button>'}).join("");
$("tabs").onclick=function(e){var k=e.target.dataset.k;if(k){c=k;i=0;n=0;show()}};
$("ring").onclick=function(){var d=D[c].l[i];if(n<d[1])n++;if(navigator.vibrate)navigator.vibrate(15);show();if(n>=d[1]&&i<D[c].l.length-1)setTimeout(function(){i++;n=0;show()},450)};
$("nx").onclick=function(){if(i<D[c].l.length-1){i++;n=0;show()}};
$("pv").onclick=function(){if(i>0){i--;n=0;show()}};
$("set").innerHTML=K.map(function(k){return '<div class="row"><span>'+D[k].n+'</span><input type="time" data-k="'+k+'" value="'+S[k].t+'"><label class="sw"><input type="checkbox" data-s="'+k+'"'+(S[k].on?" checked":"")+' aria-label="تفعيل"><i></i></label></div>'}).join("");
$("set").onchange=function(e){var k=e.target.dataset.k||e.target.dataset.s;if(e.target.type=="time")S[k].t=e.target.value;else S[k].on=e.target.checked;save()};
var R=document.documentElement,dk=matchMedia("(prefers-color-scheme:dark)").matches;
function th(){R.dataset.theme=dk?"dark":"light";$("th").textContent=dk?"☀":"☾"}
$("th").onclick=function(){dk=!dk;th()};th();

function b64(s){
  var clean=String(s||"").trim().replace(/\s+/g,"").replace(/-/g,"+").replace(/_/g,"/");
  var pad="=".repeat((4-(clean.length%4))%4);
  var raw=atob(clean+pad);
  var arr=new Uint8Array(raw.length);
  for(var j=0;j<raw.length;j++)arr[j]=raw.charCodeAt(j);
  return arr;
}
function sync(){if(!navigator.serviceWorker)return;
try{caches.open("adhkar-set").then(function(x){x.put("/adhkar-settings",new Response(JSON.stringify(S)))})}catch(e){}
return navigator.serviceWorker.ready.then(function(r){return r.pushManager.getSubscription()}).then(function(s){
if(s&&W.indexOf("YOUR")<0)return fetch(W+"/subscribe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sub:s,settings:S,tz:Intl.DateTimeFormat().resolvedOptions().timeZone})})}).catch(function(){})}
$("en").onclick=async function(){
var b=$("en");b.classList.remove("go");void b.offsetWidth;b.classList.add("go");
if(!("Notification" in window)||!("PushManager" in window)){st("هذا الجهاز أو المتصفح لا يدعم الإشعارات. أضف البرنامج إلى الشاشة الرئيسية ثم افتحه من الأيقونة.");return}
if(V.indexOf("YOUR")>=0||W.indexOf("YOUR")>=0){st("لم يُضبط عنوان الخادم ومفتاح الإشعارات في ملف app.js بعد.");return}
try{var p=await Notification.requestPermission();if(p!=="granted"){st("لم يُسمح بالإشعارات. يمكنك السماح بها من إعدادات الجهاز.");return}
var r=await navigator.serviceWorker.ready;
var old=await r.pushManager.getSubscription();if(old){try{await old.unsubscribe()}catch(e){}}
var key=b64(V);
if(key.length!==65){st("خطأ: طول مفتاح P-256 غير صحيح ("+key.length+" بايت بدل 65)");return}
var s=await r.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key});
await sync();ok();st("تم تفعيل الإشعارات بنجاح.")}catch(e){st("خطأ: "+(e&&e.message?e.message:"تعذّر تفعيل الإشعارات"))}};
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").then(sync).catch(function(){});
if(!(matchMedia("(display-mode: standalone)").matches||navigator.standalone))$("hint").hidden=false;
show();
if("Notification" in window&&Notification.permission==="granted")ok();
