var W="https://adhkar-push.abdcode.workers.dev",V="BAOAcp9wpG9eMNft_BFzXL3rvb6jD0ZoaPYYfLbHMjOzjmecMUrQnOGlnBRGlxs5JY0cOvBVhUsl7PuEFkr_fsk";
var K=["morning","evening","sleep"],c="morning",i=0,n=0,S={},T="auto",dev="x",mq=matchMedia("(prefers-color-scheme:dark)");
function $(x){return document.getElementById(x)}
try{S=JSON.parse(localStorage.getItem("adhkar")||"{}");T=localStorage.getItem("adhkar-theme")||"auto";dev=localStorage.getItem("adhkar-dev");if(!dev){dev=Math.random().toString(36).slice(2)+Date.now().toString(36);localStorage.setItem("adhkar-dev",dev)}}catch(e){S=S||{};dev=dev||"x"}
K.forEach(function(k){S[k]=S[k]||{t:D[k].t,on:true}});
var q=location.search.match(/c=(\w+)/);if(q&&D[q[1]])c=q[1];
function st(t){var e=$("st");e.textContent=t;e.classList.add("on");clearTimeout(st.t);st.t=setTimeout(function(){e.classList.remove("on")},3500)}
function save(){try{localStorage.setItem("adhkar",JSON.stringify(S))}catch(e){}sync()}
function show(){var d=D[c].l[i];document.body.dataset.c=c;$("tx").textContent=d[0];$("sr").textContent="يُقال "+d[2];$("cn").textContent=ar(n);$("ct").textContent="من "+ar(d[1]);$("ix").textContent=ar(i+1)+" / "+ar(D[c].l.length);$("pg").style.strokeDashoffset=326.7*(1-n/d[1]);$("tx").parentNode.scrollTop=0;
Array.prototype.forEach.call(document.querySelectorAll(".tab"),function(b){b.setAttribute("aria-selected",b.dataset.k==c)})}
function rs(){var k=c;$("set").innerHTML='<div class="row"><span>تنبيه '+D[k].n+'</span><input type="time" id="tm" value="'+S[k].t+'"><label class="sw"><input type="checkbox" id="on"'+(S[k].on?" checked":"")+' aria-label="تفعيل"><i></i></label></div>';
$("tm").onchange=function(){S[k].t=this.value;save()};$("on").onchange=function(){S[k].on=this.checked;save()}}
$("tabs").innerHTML=K.map(function(k){return '<button class="tab" role="tab" data-k="'+k+'">'+D[k].n+'</button>'}).join("");
$("tabs").onclick=function(e){var k=e.target.dataset.k;if(k){c=k;i=0;n=0;show();rs()}};
$("ring").onpointerdown=function(){var d=D[c].l[i];if(n<d[1])n++;if(navigator.vibrate)navigator.vibrate(15);show();if(n>=d[1]&&i<D[c].l.length-1)setTimeout(function(){i++;n=0;show()},450)};
$("nx").onclick=function(){if(i<D[c].l.length-1){i++;n=0;show()}};
$("pv").onclick=function(){if(i>0){i--;n=0;show()}};
var R=document.documentElement,TI={auto:"◐",light:"☀",dark:"☾"},TL={auto:"تلقائي حسب الهاتف",light:"الوضع النهاري",dark:"الوضع الليلي"};
function th(){var d=T=="auto"?mq.matches:T=="dark";R.dataset.theme=d?"dark":"light";$("th").textContent=TI[T]}
$("th").onclick=function(){T=T=="auto"?"light":T=="light"?"dark":"auto";try{localStorage.setItem("adhkar-theme",T)}catch(e){}th();st(TL[T])};
if(mq.addEventListener)mq.addEventListener("change",th);else mq.addListener(th);
document.addEventListener("gesturestart",function(e){e.preventDefault()});
function ok(){$("en").classList.add("done");$("en").setAttribute("aria-label","الإشعارات مفعّلة")}
function b64(s){var p="=".repeat((4-s.length%4)%4),r=atob((s+p).replace(/-/g,"+").replace(/_/g,"/"));return Uint8Array.from(r,function(x){return x.charCodeAt(0)})}
function sync(){if(!navigator.serviceWorker)return;
try{caches.open("adhkar-set").then(function(x){x.put("/adhkar-settings",new Response(JSON.stringify(S)))})}catch(e){}
navigator.serviceWorker.ready.then(function(r){return r.pushManager.getSubscription()}).then(function(s){
if(s&&W.indexOf("YOUR")<0)fetch(W+"/subscribe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({dev:dev,sub:s,settings:S,tz:Intl.DateTimeFormat().resolvedOptions().timeZone})}).catch(function(){})}).catch(function(){})}
$("en").onclick=async function(){
var b=$("en");b.classList.remove("go");void b.offsetWidth;b.classList.add("go");
if(!("Notification" in window)||!("PushManager" in window)){st("أضف البرنامج إلى الشاشة الرئيسية ثم افتحه من الأيقونة لتفعيل الإشعارات.");return}
if(V.indexOf("YOUR")>=0||W.indexOf("YOUR")>=0){st("لم يُضبط عنوان الخادم ومفتاح الإشعارات بعد.");return}
try{var p=await Notification.requestPermission();if(p!=="granted"){st("لم يُسمح بالإشعارات. يمكنك السماح بها من إعدادات الجهاز.");return}
var r=await navigator.serviceWorker.ready;var s=await r.pushManager.getSubscription()||await r.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64(V)});
await sync();ok();st("تم تفعيل الإشعارات بنجاح.")}catch(e){st("تعذّر تفعيل الإشعارات. حاول مرة أخرى.")}};
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").then(sync).catch(function(){});
if(!(matchMedia("(display-mode: standalone)").matches||navigator.standalone))$("hint").hidden=false;
th();show();rs();
if("Notification" in window&&Notification.permission==="granted")ok();
