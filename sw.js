var W="https://adhkar-push.abdcode.workers.dev";
importScripts("adhkar.js");
var C="adhkar-v5",F=["./","index.html","style.css","app.js","adhkar.js","manifest.json","icon-192.png","icon-512.png"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(C).then(function(x){return x.addAll(F)}));self.skipWaiting()});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C&&x!=="adhkar-set"}).map(function(x){return caches.delete(x)}))}));self.clients.claim()});
self.addEventListener("fetch",function(e){if(e.request.method!=="GET")return;e.respondWith(fetch(e.request).catch(function(){return caches.match(e.request)}))});
function pick(){return caches.open("adhkar-set").then(function(x){return x.match("/adhkar-settings")}).then(function(r){return r?r.json():{}}).then(function(S){
var n=new Date(),m=n.getHours()*60+n.getMinutes(),best="morning",bd=1e9;
Object.keys(D).forEach(function(k){var t=(S[k]&&S[k].t)||D[k].t,p=t.split(":"),d=Math.abs(m-(+p[0]*60+ +p[1]));d=Math.min(d,1440-d);if(d<bd){bd=d;best=k}});return best}).catch(function(){return "morning"})}
function one(k){return caches.open("adhkar-set").then(function(x){return x.match("/adhkar-state").then(function(r){return r?r.json():{}}).then(function(s){
var L=D[k].l.filter(function(d){return d[3]}),t=Date.now(),j=(s.k===k&&t-s.t<40000)?s.i+1:0;if(j>=L.length)j=L.length-1;var d=L[j];
return x.put("/adhkar-state",new Response(JSON.stringify({k:k,i:j,t:t}))).then(function(){
return self.registration.showNotification(D[k].n+" ("+ar(j+1)+"/"+ar(L.length)+")",{body:d[0]+"\n("+d[2]+")",tag:"adhkar-"+k+"-"+j,lang:"ar",dir:"rtl",icon:"icon-192.png",badge:"icon-192.png",silent:true,data:{k:k}})})})})}
self.addEventListener("push",function(e){e.waitUntil(fetch(W+"/msg?x="+Date.now()).then(function(r){return r.json()}).catch(function(){return {}}).then(function(m){
return caches.open("adhkar-set").then(function(x){return x.match("/adhkar-seen").then(function(r){return r?r.text():""}).then(function(seen){
if(m.id&&m.id!==seen&&Math.abs(Date.now()-m.t)<120000){return x.put("/adhkar-seen",new Response(m.id)).then(function(){return self.registration.showNotification(m.title,{body:m.body,lang:"ar",dir:"rtl",icon:"icon-192.png",badge:"icon-192.png",data:{u:m.url}})})}
return pick().then(one)})})}))});
self.addEventListener("notificationclick",function(e){e.notification.close();var k=(e.notification.data||{}).k||"morning";
e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(function(l){var d=e.notification.data||{},u=d.u||"./?c="+k;if(l.length){l[0].navigate(u);return l[0].focus()}return clients.openWindow(u)}))});
