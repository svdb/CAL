
aFocus=function(){if(document.getElementById("prelude")){var aElts=document.getElementById("prelude").getElementsByTagName("A");for(var i=0;i<aElts.length;i++){aElts[i].className="hidden";aElts[i].onfocus=function(){this.className="";}}}}
function addLoadEvent(func){if(window.addEventListener)
window.addEventListener("load",func,false);else if(window.attachEvent)
window.attachEvent("onload",func);}
addLoadEvent(aFocus);