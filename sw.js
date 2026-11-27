importScripts("adhkar.js");
var C="adhkar-v3",F=["./","index.html","style.css","app.js","adhkar.js","manifest.json","icon-192.png","icon-512.png"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(C).then(function(x){return x.addAll(F)}));self.skipWaiting()});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C&&x!=="adhkar-set"}).map(function(x){return caches.delete(x)}))}));self.clients.claim()});
self.addEventListener("fetch",function(e){if(e.request.method!=="GET")return;e.respondWith(fetch(e.request).catch(function(){return caches.match(e.request)}))});
function pick(){return caches.open("adhkar-set").then(function(x){return x.match("/adhkar-settings")}).then(function(r){return r?r.json():{}}).then(function(S){
var n=new Date(),m=n.getHours()*60+n.getMinutes(),best="morning",bd=1e9;
Object.keys(D).forEach(function(k){var t=(S[k]&&S[k].t)||D[k].t,p=t.split(":"),d=Math.abs(m-(+p[0]*60+ +p[1]));d=Math.min(d,1440-d);if(d<bd){bd=d;best=k}});return best}).catch(function(){return "morning"})}
var last={};
function run(k){var t=Date.now();if(last[k]&&t-last[k]<45000)return Promise.resolve();last[k]=t;var L=D[k].l.filter(function(d){return d[3]});
return L.reduce(function(p,d,j){return p.then(function(){
return self.registration.showNotification(D[k].n+" ("+ar(j+1)+"/"+ar(L.length)+")",{body:d[0]+"\n("+d[2]+")",tag:"adhkar-"+k+"-"+j,lang:"ar",dir:"rtl",icon:"icon-192.png",badge:"icon-192.png",silent:true,data:{k:k}})
}).then(function(){return new Promise(function(r){setTimeout(r,j<L.length-1?3000:0)})})},Promise.resolve())}
self.addEventListener("push",function(e){e.waitUntil(pick().then(run))});
self.addEventListener("notificationclick",function(e){e.notification.close();var k=(e.notification.data||{}).k||"morning";
e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(function(l){var u="./?c="+k;if(l.length){l[0].navigate(u);return l[0].focus()}return clients.openWindow(u)}))});
