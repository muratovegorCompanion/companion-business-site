/* Поведінка нової головної (nh.css). Лічильники й форма — у script.js, тут лише
   поява при скролі, стрічка відгуків, лінія кроків і відео в першому екрані. */
(function(){
  const root=document.querySelector('.nh');
  if(!root) return;
  const still=matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Поява блоків. Клас nh-anim ставимо тільки тут: без скрипта все видно одразу.
  if(!still && 'IntersectionObserver' in window){
    root.classList.add('nh-anim');
    const io=new IntersectionObserver(es=>es.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('nh-in'); io.unobserve(e.target); }
    }),{threshold:.12,rootMargin:'0px 0px -40px 0px'});
    root.querySelectorAll('.nh-rv').forEach(el=>io.observe(el));
  }

  // Відео: при «менше руху» лишається постер.
  const video=document.getElementById('nh-hero-video');
  if(video && still){ video.removeAttribute('autoplay'); video.pause(); }

  // Відгуки: нативний scroll-snap, кнопки лише підштовхують.
  const track=document.getElementById('nh-track');
  const cnt=document.getElementById('nh-cnt');
  if(track){
    const cards=[...track.children];
    const step=()=>cards[1] ? cards[1].offsetLeft-cards[0].offsetLeft : cards[0].offsetWidth;
    const atEnd=()=>track.scrollLeft>=track.scrollWidth-track.clientWidth-4;
    root.querySelectorAll('.nh-rv-ctrl button').forEach(b=>b.addEventListener('click',()=>{
      const dir=Number(b.dataset.dir);
      if(dir>0 && atEnd()) return track.scrollTo({left:0,behavior:'smooth'});
      if(dir<0 && track.scrollLeft<=4) return track.scrollTo({left:track.scrollWidth,behavior:'smooth'});
      track.scrollBy({left:step()*dir,behavior:'smooth'});
    }));
    const sync=()=>{
      if(!cnt) return;
      const i=atEnd() ? cards.length : Math.min(cards.length, Math.round(track.scrollLeft/step())+1);
      cnt.textContent=`${i} / ${cards.length}`;
    };
    track.addEventListener('scroll',()=>requestAnimationFrame(sync),{passive:true});
  }

  // Лінія між кроками прорисовується разом зі скролом (на сторінці їх може бути кілька).
  const rails=[...root.querySelectorAll('.nh-steps')];
  if(rails.length && !still){
    const paint=()=>rails.forEach(steps=>{
      const r=steps.getBoundingClientRect();
      const p=Math.min(1,Math.max(0,(innerHeight*.8-r.top)/(r.height+innerHeight*.3)));
      steps.style.setProperty('--p',p.toFixed(3));
    });
    addEventListener('scroll',paint,{passive:true}); addEventListener('resize',paint); paint();
  }

  // Перемикач ролей (логістика): вкладки з клавіатурою за стандартом ARIA.
  root.querySelectorAll('[role="tablist"]').forEach(list=>{
    const tabs=[...list.querySelectorAll('[role="tab"]')];
    const select=t=>tabs.forEach(x=>{
      const on=x===t; x.setAttribute('aria-selected',String(on)); x.tabIndex=on?0:-1;
      document.getElementById(x.getAttribute('aria-controls')).hidden=!on;
    });
    tabs.forEach((t,i)=>{
      t.addEventListener('click',()=>select(t));
      t.addEventListener('keydown',e=>{
        const d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0; if(!d) return;
        const n=tabs[(i+d+tabs.length)%tabs.length]; select(n); n.focus(); e.preventDefault();
      });
    });
  });

  // Відео першого екрана на внутрішніх сторінках
  document.querySelectorAll('.nh-phero video').forEach(v=>{ if(still){ v.removeAttribute('autoplay'); v.pause(); } });

  // Невеликі ролики (кроки процесу): вантажимо й граємо лише коли на екрані.
  const clips=[...root.querySelectorAll('video[data-nh-autoplay]')];
  if(clips.length && !still && 'IntersectionObserver' in window){
    const vio=new IntersectionObserver(es=>es.forEach(e=>{
      const v=e.target;
      if(e.isIntersecting){ v.play().catch(()=>{}); } else { v.pause(); }
    }),{threshold:.35});
    clips.forEach(v=>vio.observe(v));
  }
})();
