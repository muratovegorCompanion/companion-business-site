// Відео, промотане скролом: ролик не грає сам, його поточний час прив'язаний
// до положення сторінки. Зупинився — кадр стоїть, відмотав назад — документи
// повертаються в стопку. Так зроблені сторінки Apple.
//
// Розмітка: <video data-scrub class="..." muted playsinline preload="auto"
//   poster="кадр.jpg"><source src="кліп.mp4" type="video/mp4"></video>
// Прогрес рахується по контейнеру [data-scrub-track] — від його появи знизу
// до виходу зверху.
(function(){
  var vids = [].slice.call(document.querySelectorAll('video[data-scrub]'));
  if (!vids.length) return;
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  vids.forEach(function(v){
    var track = v.closest('[data-scrub-track]') || v.parentElement;
    var ready = false, target = 0, current = 0, raf = 0;

    // Без скрипта і зі «зменшити рух» лишається постер — перший кадр ролика.
    if (reduce) return;

    v.muted = true; v.playsInline = true; v.pause();
    v.addEventListener('loadedmetadata', function(){ ready = true; measure(); });

    function measure(){
      if (!ready || !v.duration) return;
      var r = track.getBoundingClientRect();
      // 0 — низ доріжки торкнувся низу екрана, 1 — верх доріжки пішов за верх
      var total = r.height + innerHeight;
      var passed = innerHeight - r.top;
      var p = Math.min(1, Math.max(0, passed / total));
      target = p * v.duration;
      if (!raf) raf = requestAnimationFrame(tick);
    }
    // Стрибок currentTime смикає картинку, тому доганяємо плавно.
    function tick(){
      raf = 0;
      var d = target - current;
      if (Math.abs(d) < .004){ current = target; }
      else { current += d * .18; raf = requestAnimationFrame(tick); }
      try { v.currentTime = current; } catch (e) {}
    }
    addEventListener('scroll', measure, {passive:true});
    addEventListener('resize', measure, {passive:true});
    measure();
  });
})();
