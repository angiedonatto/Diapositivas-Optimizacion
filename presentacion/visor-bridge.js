/* Puente opcional con el visor del equipo.
   No modifica el contenido: solo elige un tema y sincroniza la navegación.
   Fuera de ?integrada=1, cada presentación sigue funcionando de forma autónoma. */
(function () {
  'use strict';
  var params = new URLSearchParams(window.location.search);
  if (params.get('integrada') !== '1' || window.parent === window) return;
  var choices = ['local', 'tabu', 'ga', 'aco'];
  var tema = params.get('tema');
  if (choices.indexOf(tema) < 0) tema = 'local';
  var parts = location.pathname.split('/').filter(Boolean);
  var person = parts.includes('angie-donato') ? 'donato' : parts.includes('angie-loango') ? 'loango' : parts.includes('carolina') ? 'carolina' : '';
  if (!person) return;

  var css = {
    donato: [
      'html,body{height:100%;overflow:hidden;background:#fbfaf6!important}',
      '.topbar,.methods,.controlbar,.notes{display:none!important}',
      '.stage-wrap{padding:0!important;max-width:none!important;height:100vh}',
      '.stage{width:100%!important;height:100vh!important;min-height:0!important;max-height:none!important;aspect-ratio:auto!important;border:0!important;box-shadow:none!important;border-radius:0!important}',
      '.stage .slide{min-height:0!important}'
    ].join(''),
    loango: [
      'html,body{height:100%;overflow:hidden!important;background:#f1f0ea!important}',
      '#loango{margin:0!important;padding:0!important;border:0!important;min-height:100vh!important}',
      '#loango .lo-head,#loango .lo-bar,#loango .lo-keys{display:none!important}',
      '#loango .lo-wrap{max-width:none!important;height:100vh!important;padding:0!important}',
      '#loango .lo-viewport{margin:0!important;width:100%!important;height:100vh!important;display:grid!important;place-items:center!important}',
      '#loango .lo-frame{box-shadow:none!important;border-radius:4px!important}'
    ].join(''),
    carolina: [
      'html{scroll-behavior:auto!important}body{margin:0!important}',
      'body>header.top,nav.sections,#expo,#comparacion,#preguntas,body>footer{display:none!important}',
      '#carolina{padding:14px 0!important}',
      '#carolina>.wrap>header,#carolina .tabs-bar{display:none!important}',
      '#carolina .panel[hidden]{display:none!important}',
      '#carolina .wrap{max-width:1200px!important}',
      '#carolina .panel{margin-top:0!important}'
    ].join('')
  };
  var style = document.createElement('style');
  style.textContent = css[person];
  document.head.appendChild(style);

  function send(type, rest) {
    window.parent.postMessage(Object.assign({scope:'expo-child',type:type,person:person,tema:tema},rest||{}),'*');
  }
  function selectTopic() {
    var selector = person==='donato' ? '[data-method="'+tema+'"]' :
      person==='loango' ? '#lo-tab-'+tema : '#tab-'+tema;
    var b = document.querySelector(selector);
    if (b) b.click();
    if (person==='carolina') {
      document.querySelectorAll('#carolina .panel').forEach(function(p) {
        p.hidden = p.id !== 'p-'+tema;
      });
      window.scrollTo(0,0);
    }
    if (person==='loango') window.dispatchEvent(new Event('resize'));
  }
  function status() {
    if (person==='carolina') return {current:1,total:1,atStart:true,atEnd:true};
    var text = person==='donato' ?
      (document.getElementById('count')||{}).textContent :
      ((document.querySelector('.lo-count')||{}).textContent||'');
    var match = String(text||'').match(/(\d+)\s*\/\s*(\d+)/);
    var current = match ? Number(match[1]) : 1, total = match ? Number(match[2]) : (person==='donato'?3:4);
    var prev = document.querySelector(person==='donato'?'#prevBtn':'[data-lo="prev"]');
    var next = document.querySelector(person==='donato'?'#nextBtn':'[data-lo="next"]');
    return {current:current,total:total,atStart:person==='donato'?current===1:!!(prev&&prev.disabled),
      atEnd:person==='donato'?current===total:!!(next&&next.disabled)};
  }
  function announce() {send('status',status());}
  function move(direction) {
    var st=status();
    if ((direction==='next'&&st.atEnd) || (direction==='prev'&&st.atStart)) {
      send('boundary',{direction:direction});
      return;
    }
    var button = document.querySelector(person==='donato'?
      (direction==='next'?'#nextBtn':'#prevBtn'):
      (direction==='next'?'[data-lo="next"]':'[data-lo="prev"]'));
    if (button) button.click();
    announce();
  }
  function toEnd() {
    for (var i=0;i<200 && !status().atEnd;i++) {
      var btn=document.querySelector(person==='donato'?'#nextBtn':'[data-lo="next"]');
      if (!btn) break;
      btn.click();
    }
    announce();
  }
  function init(atEnd) {
    selectTopic();
    if (atEnd) toEnd();
    send('ready',status());
  }
  window.addEventListener('message',function(event) {
    if (event.source !== window.parent) return;
    var data=event.data;
    if (!data || data.scope !== 'expo-parent') return;
    if (data.cmd==='init') {
      if (choices.indexOf(data.tema)>=0) tema=data.tema;
      init(!!data.atEnd);
    } else if (data.cmd==='move' && (data.direction==='next'||data.direction==='prev')) {
      move(data.direction);
    } else if (data.cmd==='status') announce();
  });
  // Notificar navegación mediante botones y teclado internos, incluso si
  // quien presenta pulsa dentro del iframe en lugar del visor principal.
  var counter=document.querySelector(person==='donato'?'#count':person==='loango'?'.lo-count':'#tab-'+tema);
  if (counter && window.MutationObserver) {
    new MutationObserver(function() {announce()}).observe(counter,{childList:true,subtree:true,characterData:true,attributes:false});
  }
  // Ocultar el cambio de algoritmo dentro de un visor con tema sorteado.
  // La selección única se hace en la portada, no dentro de cada bloque.
  window.addEventListener('keydown',function(e) {
    if (/^[1-4]$/.test(e.key)) { e.preventDefault(); e.stopImmediatePropagation(); }
  },true);
  // Se ejecuta después del script autónomo de cada integrante.
  init(false);
})();