self.addEventListener('push',event=>{
 let data={title:'Cafea în Doi',body:'Ai o invitație nouă.',url:'/admin/invitatii'};
 try{if(event.data)data={...data,...event.data.json()}}catch{}
 event.waitUntil(self.registration.showNotification(data.title,{body:data.body,icon:'/favicon.ico',badge:'/favicon.ico',tag:'cafeaindoi-invitatie',data:{url:data.url}}));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const target=new URL(event.notification.data?.url||'/admin/invitatii',self.location.origin).href;
 event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(windows=>{const existing=windows.find(w=>w.url.startsWith(self.location.origin+'/admin/'));return existing?existing.focus().then(()=>existing.navigate(target)):clients.openWindow(target)}));
});
