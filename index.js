//adapted from http://www.script-tutorials.com/custom-scrollbars-cross-browser-solution/

function OaScrollbar(containerId, opts){
  opts = opts || {};

  var that = this;

  this.cont = document.getElementById(containerId);
  this.mouseY = 0;
  this.sg = false;

  this.sw = opts.sw || 12; // scrollbar width

  // binding events
  _addEvent(window.document, 'mousemove', this.onmousemove.bind(this));
  _addEvent(window.document, 'mouseup', this.onmouseup.bind(this));
  _addEvent(window, 'resize', this.refresh.bind(this));

  var contClone = this.cont.cloneNode(false);
  if(contClone.id){
    contClone.id += '-wrap';
  }
  contClone.style.overflow = "hidden";
  this.cont.parentNode.appendChild(contClone);
  contClone.appendChild(this.cont);
  this.cont.style.position = 'absolute';
  this.cont.style.left = this.cont.style.top = '0px';
  this.cont.style.width = this.cont.style.height = '100%';

  //creating scrollbar child elements
  this.st = _createDiv('oasb_st', contClone);
  this.sb = _createDiv('oasb_sb', contClone);

  // on mouse down processing
  this.sb.onmousedown = function (e) {
    if (! that.sg) {
      if (! e) e = window.event;

      that.yZ = e.screenY;
      that.sZ = that.cont.scrollTop;
      that.sg = true;

      // new class name
      that.sb.className = 'oasb_sb oasb_sb_down';
    }
    return false;
  };

  // on mouse down on free track area - move our scroll element too
  this.st.onmousedown = function (e) {
    if (! e) e = window.event;

    that.mouseY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    for (var o = that.cont, y = 0; o != null; o = o.offsetParent) y += o.offsetTop;
    that.cont.scrollTop = (that.mouseY - y - (that.ratio * that.cont.offsetHeight / 2) - that.sw) / that.ratio;
    that.sb.onmousedown(e);
  };

  // on mouse over - apply custom class name: oasb_sb_over
  this.sb.onmouseover = function (e) {
    if (! that.sg) that.sb.className = 'oasb_sb oasb_sb_over';
    return false;
  };

  // on mouse out - revert back our usual class name 'oasb_sb'
  this.sb.onmouseout = function (e) {
    if (! that.sg) that.sb.className = 'oasb_sb';
    return false;
  };

  // start scrolling
  this.onscroll();
  this.refresh();

  // binding own onscroll event
  this.cont.addEventListener('scroll', this.onscroll.bind(this), false);

};

// onscroll - change positions of scroll element
OaScrollbar.prototype.onscroll = function(e){
  this.ratio = this.cont.offsetHeight / this.cont.scrollHeight;
  this.sb.style.top = Math.floor(this.cont.scrollTop * this.ratio) + 'px';
};

OaScrollbar.prototype.onmousemove = function(e){
  if (! e) e = window.event;
  // get vertical mouse position
  this.mouseY = e.screenY;
  if (this.sg) this.cont.scrollTop = this.sZ + (this.mouseY - this.yZ) / this.ratio;
};

OaScrollbar.prototype.onmouseup = function(e){
  if (! e) e = window.event;
  var tg = (e.target) ? e.target : e.srcElement;
  if (this.cont && document.releaseCapture) this.cont.releaseCapture();

  // new class name
  if (this.cont) this.sb.className = (tg.className.indexOf('scrollbar') > 0) ? 'oasb_sb oasb_sb_over' : 'oasb_sb';
  document.onselectstart = '';
  this.sg = false;
};

OaScrollbar.prototype.refresh = function(e){
  this.onscroll();
  this.sb.style.width = this.st.style.width = this.sw + 'px';
  this.sb.style.height = Math.ceil(Math.max(this.sw * .5, this.ratio * this.cont.offsetHeight) + 1) + 'px';
};


function _addEvent (o, e, f) {
  if (window.addEventListener) { o.addEventListener(e, f, false); return true; }
  if (window.attachEvent) return o.attachEvent('on' + e, f);
  return false;
}

function _createDiv (className, contClone) {
  var o = document.createElement('div');
  o.className = className;
  contClone.appendChild(o);
  return o;
};

module.exports = OaScrollbar;
