/* Service pages: typing code editor in the hero + process line fill. */
(function () {
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Typing code editor ---------- */
  var code = document.getElementById('ideCode');
  if (code && !reduced) {
    var walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        // keep line numbers visible, only type the code itself
        return n.parentNode.tagName === 'I' ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], n;
    while ((n = walker.nextNode())) { nodes.push({ node: n, text: n.nodeValue }); n.nodeValue = ''; }

    var caret = document.createElement('span');
    caret.className = 'ide__caret';
    var status = document.getElementById('ideStatus');
    var statusText = status ? status.textContent : '';
    if (status) status.textContent = 'writing…';
    code.parentNode.classList.add('is-typing');

    var i = 0, c = 0;
    function step() {
      // type a few characters per frame so longer files don't drag
      for (var k = 0; k < 2 && i < nodes.length; k++) {
        var cur = nodes[i];
        cur.node.nodeValue = cur.text.slice(0, ++c);
        cur.node.parentNode.insertBefore(caret, cur.node.nextSibling);
        if (c >= cur.text.length) { i++; c = 0; }
      }
      if (i < nodes.length) {
        setTimeout(step, 16);
      } else {
        code.parentNode.classList.remove('is-typing');
        code.parentNode.classList.add('is-done');
        if (status) status.textContent = statusText;
      }
    }
    // wait for the page loader to clear
    setTimeout(step, 1300);
  }

  /* ---------- Process line fill ---------- */
  var flow = document.getElementById('svcFlow');
  if (flow) {
    if ('IntersectionObserver' in window && !reduced) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { flow.classList.add('is-filled'); io.disconnect(); }
        });
      }, { threshold: 0.35 });
      io.observe(flow);
    } else {
      flow.classList.add('is-filled');
    }
  }
})();
