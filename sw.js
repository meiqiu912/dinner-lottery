/* 简单 PWA 缓存：网络优先，失败回退缓存（保证离线也能抽签） */
const CACHE = 'dinner-lottery-v3';
const DISH_IMGS = [
  'congyou-banmian','dan-chaofan','donggua-paigu-tang','fanqie-chaodan','gali-ji',
  'ganbian-doujiao','gongbao-jiding','heijiao-niuliu','hongshaorou','huiguo-rou',
  'kele-jichi','mapo-doufu','qingjiao-tudousi','qingzheng-luyu','shui-jiao',
  'shuizhu-roupian','suantong-yumai','tangcu-paigu','tomato-egg-noodles','yidalimian','yuxiang-rousi'
].map(n => `./img/dishes/${n}.jpg`);
const ASSETS = [
  './', './index.html', './css/style.css',
  './js/data-recipes.js', './js/data-restaurants.js', './js/amap.js', './js/app.js',
  './manifest.json', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png',
  ...DISH_IMGS
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request))
  );
});
