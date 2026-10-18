'use strict';
// Markdown is repository content, never trusted application HTML.
window.renderLoliteReadme=(text,root)=>{
  const template=document.createElement('template');
  template.innerHTML=window.marked.parse(text,{gfm:true});
  const allowed=new Set(['H1','H2','H3','H4','H5','H6','P','EM','STRONG','A','UL','OL','LI','PRE','CODE','BLOCKQUOTE','HR','BR','TABLE','THEAD','TBODY','TFOOT','TR','TH','TD','DEL','DETAILS','SUMMARY']);
  const dropped=new Set(['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','FORM','INPUT','BUTTON','SVG','MATH','LINK','META']);
  function copy(node){
    if(node.nodeType===Node.TEXT_NODE)return document.createTextNode(node.textContent);
    const fragment=document.createDocumentFragment();
    if(node.nodeType!==Node.ELEMENT_NODE||dropped.has(node.tagName))return fragment;
    if(node.tagName==='IMG')return document.createTextNode(node.getAttribute('alt')||'');
    const out=allowed.has(node.tagName)?document.createElement(node.tagName.toLowerCase()):fragment;
    if(node.tagName==='A'){
      try{const url=new URL(node.getAttribute('href')||'', 'https://github.com/darby9123-arch/Lolite-OS/blob/main/README.md');
        if(['https:','http:'].includes(url.protocol)&&!url.username&&!url.password){out.href=url.href;out.target='_blank';out.rel='noopener noreferrer';}
      }catch{}
    }
    for(const child of node.childNodes)out.append(copy(child));
    return out;
  }
  const safe=document.createDocumentFragment();for(const node of template.content.childNodes)safe.append(copy(node));root.replaceChildren(safe);
};
