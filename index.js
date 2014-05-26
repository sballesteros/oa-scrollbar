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

  //markers container
  this.markersContainer = _createDiv('markers', contClone);
  this.markers = {};
  this.markersId = {}; //map resource id to markers id
  this.globalCnt = 0;

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
  var topSb = Math.floor(this.cont.scrollTop * this.ratio);
  this.sb.style.top = topSb + 'px';
  var bottomSb = topSb + this.sb.offsetHeight;

  //if marker whithin sb: highlight

  for(var key in this.markers){
    var $marker = this.markers[key];
    var topMarker = _getValue($marker.style.top);
    var bottomMarker = topMarker + _getValue($marker.style.height);

    if( (topSb<topMarker) && (bottomMarker<bottomSb) || ((topMarker<bottomSb) && (bottomMarker>bottomSb)) || ((bottomMarker>topSb) && (topMarker<topSb)) ){
      $marker.classList.add('oasb-marker-highlight');
    } else {
      $marker.classList.remove('oasb-marker-highlight');
    }
  }

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
  this.sb.style.height = Math.ceil(Math.max(this.sw * .5, this.ratio * this.cont.offsetHeight)) + 'px';
};


OaScrollbar.prototype.addMarker = function(range, id){
  var $marker = document.createElement("div");
  $marker.className = 'oasb-marker';
  $marker.id = 'marker-' + this.globalCnt;
  $marker.onmousedown = this.st.onmousedown.bind(this);

  var $ancestor = range.commonAncestorContainer;
  var $el;
  if ($ancestor.nodeType === 3) {
    $el = $ancestor.parentNode;
  } else if($ancestor.nodeType === 1) {
    $el = $ancestor;
  };

  var boxMarker = $el.getBoundingClientRect();
  var boxCont = this.cont.getBoundingClientRect();

  var height = $el.offsetHeight;
  var top = boxMarker.top - boxCont.top;

  $marker.style.top = top*this.ratio + 'px';
  $marker.style.height = Math.ceil(Math.max(this.sw * .5, height * this.ratio) + 1) + 'px';
  $marker.style.width = (this.sw-2) + 'px';

  this.markersContainer.appendChild($marker);

  this.markers[$marker.id] = $marker;
  if(id){
    if(this.markersId[id]){
      this.markersId[id].push($marker);
    } else {
      this.markersId[id] = [ $marker ];
    }
  }

  this.globalCnt++;
  this.refresh();
};

OaScrollbar.prototype.removeMarker = function(id){

  if(id in this.markersId){
    this.markersId[id].forEach(function($el){
      this.markersContainer.removeChild($el);
    }, this);
    delete this.markersId[id];
    delete this.markers[id];
  }

};


function _addEvent (o, e, f) {
  if (window.addEventListener) { o.addEventListener(e, f, false); return true; }
  if (window.attachEvent) return o.attachEvent('on' + e, f);
  return false;
};

function _createDiv (className, contClone) {
  var o = document.createElement('div');
  o.className = className;
  contClone.appendChild(o);
  return o;
};

function _getValue(x){
  if(typeof x === 'number') {
    return x
  } else if(typeof x === 'string' && x.indexOf('px') !==-1){
    return parseInt(x.slice(0,x.length-2), 10);
  } else {
    throw new Error('_getValue error ' + x);
  }
};


module.exports = OaScrollbar;
