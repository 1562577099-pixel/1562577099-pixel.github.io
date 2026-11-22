// The public URL stays fixed; asset cache versions are maintained separately.
(() => {
  if(location.origin!=='https://1562577099-pixel.github.io')return;
  if(location.pathname!=='/'&&location.pathname!=='/index.html')return;
  const permalink=new URL('https://1562577099-pixel.github.io/?v=8');
  permalink.hash=location.hash;
  if(location.href!==permalink.href)history.replaceState(history.state,'',permalink.href);
})();
