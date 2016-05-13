(function() {
  var addClass, attachListeners, attached, closest, drag, exp, models, noInputKeydown, onActivity, onScroll, ref, removeClass, resize, resizers, throttle, topof, viewstate;

  ref = require('../util'), throttle = ref.throttle, topof = ref.topof;

  models = require('../models');

  viewstate = models.viewstate;

  attached = false;

  attachListeners = function() {
    if (attached) {
      return;
    }
    window.addEventListener('mousemove', onActivity);
    window.addEventListener('click', onActivity);
    window.addEventListener('keydown', onActivity);
    return window.addEventListener('keydown', noInputKeydown);
  };

  onActivity = throttle(100, function(ev) {
    return setTimeout(function() {
      var ref1;
      return action('activity', (ref1 = ev.timeStamp) != null ? ref1 : Date.now());
    }, 1);
  });

  noInputKeydown = function(ev) {
    if (ev.target.tagName !== 'TEXTAREA') {
      return action('noinputkeydown', ev);
    }
  };

  onScroll = throttle(20, function(ev) {
    var atbottom, attop, child, el;
    el = ev.target;
    child = el.children[0];
    atbottom = (el.scrollTop + el.offsetHeight) >= (child.offsetHeight - 10);
    action('atbottom', atbottom);
    attop = el.scrollTop <= (el.offsetHeight / 2);
    return action('attop', attop);
  });

  addClass = function(el, cl) {
    if (!el) {
      return;
    }
    if (RegExp("\\s*" + cl).exec(el.className)) {
      return;
    }
    el.className += el.className ? " " + cl : cl;
    return el;
  };

  removeClass = function(el, cl) {
    if (!el) {
      return;
    }
    el.className = el.className.replace(RegExp("\\s*" + cl), '');
    return el;
  };

  closest = function(el, cl) {
    if (!el) {
      return;
    }
    if (!(cl instanceof RegExp)) {
      cl = RegExp("\\s*" + cl);
    }
    if (el.className.match(cl)) {
      return el;
    } else {
      return closest(el.parentNode, cl);
    }
  };

  drag = (function() {
    var ondragenter, ondragleave, ondragover, ondrop;
    ondragover = ondragenter = function(ev) {
      ev.preventDefault();
      addClass(closest(ev.target, 'dragtarget'), 'dragover');
      ev.dataTransfer.dropEffect = 'copy';
      return false;
    };
    ondrop = function(ev) {
      ev.preventDefault();
      return action('Enviando imagem', ev.dataTransfer.files);
    };
    ondragleave = function(ev) {
      return removeClass(closest(ev.target, 'dragtarget'), 'dragover');
    };
    return {
      ondragover: ondragover,
      ondragenter: ondragenter,
      ondrop: ondrop,
      ondragleave: ondragleave
    };
  })();

  resize = (function() {
    var rz;
    rz = null;
    return {
      onmousemove: function(ev) {
        if (rz && ev.buttons & 1) {
          return rz(ev);
        } else {
          return rz = null;
        }
      },
      onmousedown: function(ev) {
        var ref1;
        return rz = resizers[(ref1 = ev.target.dataset) != null ? ref1.resize : void 0];
      },
      onmouseup: function(ev) {
        return rz = null;
      }
    };
  })();

  resizers = {
    leftResize: function(ev) {
      return action('leftresize', Math.max(90, ev.clientX));
    }
  };

  module.exports = exp = layout(function() {
    div({
      "class": 'applayout dragtarget'
    }, drag, resize, function() {
      div({
        "class": 'left'
      }, function() {
        div({
          "class": 'list'
        }, region('left'));
        return div({
          "class": 'lfoot'
        }, region('lfoot'));
      });
      div({
        "class": 'leftresize',
        'data-resize': 'leftResize'
      });
      return div({
        "class": 'right'
      }, function() {
        div({
          "class": 'main'
        }, region('main'), {
          onscroll: onScroll
        });
        div({
          "class": 'maininfo'
        }, region('maininfo'));
        div({
          "class": 'foot'
        }, region('foot'));
        return div({
          "class": 'theme'
        }, region('theme'));
      });
    });
    return attachListeners();
  });

  (function() {
    var id, lastVisibleMessage, ofs;
    id = ofs = null;
    lastVisibleMessage = function() {
      var bottom, i, last, len, m, ref1, screl;
      screl = document.querySelector('.main');
      bottom = screl.scrollTop + screl.offsetHeight;
      last = null;
      ref1 = document.querySelectorAll('.message');
      for (i = 0, len = ref1.length; i < len; i++) {
        m = ref1[i];
        if (topof(m) < bottom) {
          last = m;
        }
      }
      return last;
    };
    exp.recordMainPos = function() {
      var el;
      el = lastVisibleMessage();
      id = el != null ? el.id : void 0;
      if (!(el && id)) {
        return;
      }
      return ofs = topof(el);
    };
    return exp.adjustMainPos = function() {
      var el, inserted, nofs, screl;
      if (!(id && ofs)) {
        return;
      }
      el = document.getElementById(id);
      nofs = topof(el);
      inserted = nofs - ofs;
      screl = document.querySelector('.main');
      screl.scrollTop = screl.scrollTop + inserted;
      return id = ofs = null;
    };
  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVpL3ZpZXdzL2FwcGxheW91dC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFBQSxNQUFBOztFQUFBLE1BQW9CLE9BQUEsQ0FBUSxTQUFSLENBQXBCLEVBQUMsZUFBQSxRQUFELEVBQVcsWUFBQTs7RUFDWCxNQUFBLEdBQWMsT0FBQSxDQUFRLFdBQVI7O0VBQ2IsWUFBYSxPQUFiOztFQUVELFFBQUEsR0FBVzs7RUFDWCxlQUFBLEdBQWtCLFNBQUE7SUFDZCxJQUFVLFFBQVY7QUFBQSxhQUFBOztJQUNBLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixXQUF4QixFQUFxQyxVQUFyQztJQUNBLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixPQUF4QixFQUFpQyxVQUFqQztJQUNBLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixTQUF4QixFQUFtQyxVQUFuQztXQUNBLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixTQUF4QixFQUFtQyxjQUFuQztFQUxjOztFQU9sQixVQUFBLEdBQWEsUUFBQSxDQUFTLEdBQVQsRUFBYyxTQUFDLEVBQUQ7V0FLdkIsVUFBQSxDQUFXLFNBQUE7QUFDVCxVQUFBO2FBQUEsTUFBQSxDQUFPLFVBQVAseUNBQWtDLElBQUksQ0FBQyxHQUFMLENBQUEsQ0FBbEM7SUFEUyxDQUFYLEVBRUUsQ0FGRjtFQUx1QixDQUFkOztFQVNiLGNBQUEsR0FBaUIsU0FBQyxFQUFEO0lBQ2IsSUFBK0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFWLEtBQXFCLFVBQXBEO2FBQUEsTUFBQSxDQUFPLGdCQUFQLEVBQXlCLEVBQXpCLEVBQUE7O0VBRGE7O0VBR2pCLFFBQUEsR0FBVyxRQUFBLENBQVMsRUFBVCxFQUFhLFNBQUMsRUFBRDtBQUNwQixRQUFBO0lBQUEsRUFBQSxHQUFLLEVBQUUsQ0FBQztJQUNSLEtBQUEsR0FBUSxFQUFFLENBQUMsUUFBUyxDQUFBLENBQUE7SUFHcEIsUUFBQSxHQUFXLENBQUMsRUFBRSxDQUFDLFNBQUgsR0FBZSxFQUFFLENBQUMs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QyxRQUFBO0lBQUEsRUFBQSxHQUFLLEdBQUEsR0FBTTtJQUVYLGtCQUFBLEdBQXFCLFNBQUE7QUFFakIsVUFBQTtNQUFBLEtBQUEsR0FBUSxRQUFRLENBQUMsYUFBVCxDQUF1QixPQUF2QjtNQUVSLE1BQUEsR0FBUyxLQUFLLENBQUMsU0FBTixHQUFrQixLQUFLLENBQUM7TUFFakMsSUFBQSxHQUFPO0FBQ1A7QUFBQSxXQUFBLHNDQUFBOztZQUE2RCxLQUFBLENBQU0sQ0FBTixDQUFBLEdBQVc7VUFBeEUsSUFBQSxHQUFPOztBQUFQO0FBQ0EsYUFBTztJQVJVO0lBVXJCLEdBQUcsQ0FBQyxhQUFKLEdBQW9CLFNBQUE7QUFDaEIsVUFBQTtNQUFBLEVBQUEsR0FBSyxrQkFBQSxDQUFBO01BQ0wsRUFBQSxnQkFBSyxFQUFFLENBQUU7TUFDVCxJQUFBLENBQUEsQ0FBYyxFQUFBLElBQU8sRUFBckIsQ0FBQTtBQUFBLGVBQUE7O2FBQ0EsR0FBQSxHQUFNLEtBQUEsQ0FBTSxFQUFOO0lBSlU7V0FNcEIsR0FBRyxDQUFDLGFBQUosR0FBb0IsU0FBQTtBQUNoQixVQUFBO01BQUEsSUFBQSxDQUFBLENBQWMsRUFBQSxJQUFPLEdBQXJCLENBQUE7QUFBQSxlQUFBOztNQUNBLEVBQUEsR0FBSyxRQUFRLENBQUMsY0FBVCxDQUF3QixFQUF4QjtNQUNMLElBQUEsR0FBTyxLQUFBLENBQU0sRUFBTjtNQUVQLFFBQUEsR0FBVyxJQUFBLEdBQU87TUFDbEIsS0FBQSxHQUFRLFFBQVEsQ0FBQyxhQUFULENBQXVCLE9BQXZCO01BQ1IsS0FBSyxDQUFDLFNBQU4sR0FBa0IsS0FBSyxDQUFDLFNBQU4sR0FBa0I7YUFFcEMsRUFBQSxHQUFLLEdBQUEsR0FBTTtJQVRLO0VBbkJyQixDQUFBLENBQUgsQ0FBQTtBQXZHQSIsImZpbGUiOiJ1aS92aWV3cy9hcHBsYXlvdXQuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJcbnt0aHJvdHRsZSwgdG9wb2Z9ID0gcmVxdWlyZSAnLi4vdXRpbCdcbm1vZGVscyAgICAgID0gcmVxdWlyZSAnLi4vbW9kZWxzJ1xue3ZpZXdzdGF0ZX0gPSBtb2RlbHNcblxuYXR0YWNoZWQgPSBmYWxzZVxuYXR0YWNoTGlzdGVuZXJzID0gLT5cbiAgICByZXR1cm4gaWYgYXR0YWNoZWRcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vtb3ZlJywgb25BY3Rpdml0eVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdjbGljaycsIG9uQWN0aXZpdHlcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAna2V5ZG93bicsIG9uQWN0aXZpdHlcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAna2V5ZG93bicsIG5vSW5wdXRLZXlkb3duXG5cbm9uQWN0aXZpdHkgPSB0aHJvdHRsZSAxMDAsIChldikgLT5cbiAgICAjIFRoaXMgb2NjYXNpb25hbGx5IGhhcHBlbnMgdG8gZ2VuZXJhdGUgZXJyb3Igd2hlblxuICAgICPCoHVzZXIgY2xpY2tpbmcgaGFzIGdlbmVyYXRlZCBhbiBhcHBsaWNhdGlvbiBldmVudFxuICAgICMgdGhhdCBpcyBiZWluZyBoYW5kbGVkIHdoaWxlIHdlIGFsc28gcmVjZWl2ZSB0aGUgZXZlbnRcbiAgICAjIEN1cnJlbnQgZml4OiBkZWZlciB0aGUgYWN0aW9uIGdlbmVyYXRlZCBkdXJpbmcgdGhlIHVwZGF0ZVxuICAgIHNldFRpbWVvdXQgLT5cbiAgICAgIGFjdGlvbiAnYWN0aXZpdHknLCBldi50aW1lU3RhbXAgPyBEYXRlLm5vdygpXG4gICAgLCAxXG5cbm5vSW5wdXRLZXlkb3duID0gKGV2KSAtPlxuICAgIGFjdGlvbiAnbm9pbnB1dGtleWRvd24nLCBldiBpZiBldi50YXJnZXQudGFnTmFtZSAhPSAnVEVYVEFSRUEnXG5cbm9uU2Nyb2xsID0gdGhyb3R0bGUgMjAsIChldikgLT5cbiAgICBlbCA9IGV2LnRhcmdldFxuICAgIGNoaWxkID0gZWwuY2hpbGRyZW5bMF1cblxuICAgICMgY2FsY3VsYXRpb24gdG8gc2VlIHdoZXRoZXIgd2UgYXJlIGF0IHRoZSBib3R0b20gd2l0aCBhIHRvbGVyYW5jZSB2YWx1ZVxuICAgIGF0Ym90dG9tID0gKGVsLnNjcm9sbFRvcCArIGVsLm9mZnNldEhlaWdodCkgPj0gKGNoaWxkLm9mZnNldEhlaWdodCAtIDEwKVxuICAgIGFjdGlvbiAnYXRib3R0b20nLCBhdGJvdHRvbVxuXG4gICAgIyBjaGVjayB3aGV0aGVyIHdlIGFyZSBhdCB0aGUgdG9wIHdpdGggYSB0b2xlcmFuY2UgdmFsdWVcbiAgICBhdHRvcCA9IGVsLnNjcm9sbFRvcCA8PSAoZWwub2Zmc2V0SGVpZ2h0IC8gMilcbiAgICBhY3Rpb24gJ2F0dG9wJywgYXR0b3BcblxuYWRkQ2xhc3MgPSAoZWwsIGNsKSAtPlxuICAgIHJldHVybiB1bmxlc3MgZWxcbiAgICByZXR1cm4gaWYgUmVnRXhwKFwiXFxcXHMqI3tjbH1cIikuZXhlYyBlbC5jbGFzc05hbWVcbiAgICBlbC5jbGFzc05hbWUgKz0gaWYgZWwuY2xhc3NOYW1lIHRoZW4gXCIgI3tjbH1cIiBlbHNlIGNsXG4gICAgZWxcblxucmVtb3ZlQ2xhc3MgPSAoZWwsIGNsKSAtPlxuICAgIHJldHVybiB1bmxlc3MgZWxcbiAgICBlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWUucmVwbGFjZSBSZWdFeHAoXCJcXFxccyoje2NsfVwiKSwgJydcbiAgICBlbFxuXG5jbG9zZXN0ID0gKGVsLCBjbCkgLT5cbiAgICByZXR1cm4gdW5sZXNzIGVsXG4gICAgY2wgPSBSZWdFeHAoXCJcXFxccyoje2NsfVwiKSB1bmxlc3MgY2wgaW5zdGFuY2VvZiBSZWdFeHBcbiAgICBpZiBlbC5jbGFzc05hbWUubWF0Y2goY2wpIHRoZW4gZWwgZWxzZSBjbG9zZXN0KGVsLnBhcmVudE5vZGUsIGNsKVxuXG5kcmFnID0gZG8gLT5cblxuICAgIG9uZHJhZ292ZXIgPSBvbmRyYWdlbnRlciA9IChldikgLT5cbiAgICAgICAgIyB0aGlzIGVuYWJsZXMgZHJhZ2dpbmcgYXQgYWxsXG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgYWRkQ2xhc3MgY2xvc2VzdChldi50YXJnZXQsICdkcmFndGFyZ2V0JyksICdkcmFnb3ZlcidcbiAgICAgICAgZXYuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnY29weSdcbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBvbmRyb3AgPSAoZXYpIC0+XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgYWN0aW9uICd1cGxvYWRpbWFnZScsIGV2LmRhdGFUcmFuc2Zlci5maWxlc1xuXG4gICAgb25kcmFnbGVhdmUgPSAoZXYpIC0+XG4gICAgICAgIHJlbW92ZUNsYXNzIGNsb3Nlc3QoZXYudGFyZ2V0LCAnZHJhZ3RhcmdldCcpLCAnZHJhZ292ZXInXG5cbiAgICB7b25kcmFnb3Zlciwgb25kcmFnZW50ZXIsIG9uZHJvcCwgb25kcmFnbGVhdmV9XG5cblxucmVzaXplID0gZG8gLT5cbiAgICByeiA9IG51bGxcbiAgICB7XG4gICAgICAgIG9ubW91c2Vtb3ZlOiAoZXYpIC0+XG4gICAgICAgICAgICBpZiByeiBhbmQgZXYuYnV0dG9ucyAmIDFcbiAgICAgICAgICAgICAgICByeihldilcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByeiA9IG51bGxcbiAgICAgICAgb25tb3VzZWRvd246IChldikgLT5cbiAgICAgICAgICAgIHJ6ID0gcmVzaXplcnNbZXYudGFyZ2V0LmRhdGFzZXQ/LnJlc2l6ZV1cbiAgICAgICAgb25tb3VzZXVwOiAoZXYpIC0+XG4gICAgICAgICAgICByeiA9IG51bGxcbiAgICB9XG5cbnJlc2l6ZXJzID1cbiAgICBsZWZ0UmVzaXplOiAoZXYpIC0+IGFjdGlvbiAnbGVmdHJlc2l6ZScsIChNYXRoLm1heCA5MCwgZXYuY2xpZW50WClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cCA9IGxheW91dCAtPlxuICAgIGRpdiBjbGFzczonYXBwbGF5b3V0IGRyYWd0YXJnZXQnLCBkcmFnLCByZXNpemUsIC0+XG4gICAgICAgIGRpdiBjbGFzczonbGVmdCcsIC0+XG4gICAgICAgICAgICBkaXYgY2xhc3M6J2xpc3QnLCByZWdpb24oJ2xlZnQnKVxuICAgICAgICAgICAgZGl2IGNsYXNzOidsZm9vdCcsIHJlZ2lvbignbGZvb3QnKVxuICAgICAgICBkaXYgY2xhc3M6J2xlZnRyZXNpemUnLCAnZGF0YS1yZXNpemUnOidsZWZ0UmVzaXplJ1xuICAgICAgICBkaXYgY2xhc3M6J3JpZ2h0JywgLT5cbiAgICAgICAgICAgIGRpdiBjbGFzczonbWFpbicsIHJlZ2lvbignbWFpbicpLCBvbnNjcm9sbDogb25TY3JvbGxcbiAgICAgICAgICAgIGRpdiBjbGFzczonbWFpbmluZm8nLCByZWdpb24oJ21haW5pbmZvJylcbiAgICAgICAgICAgIGRpdiBjbGFzczonZm9vdCcsIHJlZ2lvbignZm9vdCcpXG4gICAgICAgICAgICBkaXYgY2xhc3M6ICd0aGVtZScsIHJlZ2lvbigndGhlbWUnKVxuICAgIGF0dGFjaExpc3RlbmVycygpXG5cblxuZG8gLT5cbiAgICBpZCA9IG9mcyA9IG51bGxcblxuICAgIGxhc3RWaXNpYmxlTWVzc2FnZSA9IC0+XG4gICAgICAgICMgdGhlIHZpZXdwb3J0XG4gICAgICAgIHNjcmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1haW4nKVxuICAgICAgICAjIHRoZSBwaXhlbCBvZmZzZXQgZm9yIHRoZSBib3R0b20gb2YgdGhlIHZpZXdwb3J0XG4gICAgICAgIGJvdHRvbSA9IHNjcmVsLnNjcm9sbFRvcCArIHNjcmVsLm9mZnNldEhlaWdodFxuICAgICAgICAjIGFsbCBtZXNzYWdlc1xuICAgICAgICBsYXN0ID0gbnVsbFxuICAgICAgICBsYXN0ID0gbSBmb3IgbSBpbiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubWVzc2FnZScpIHdoZW4gdG9wb2YobSkgPCBib3R0b21cbiAgICAgICAgcmV0dXJuIGxhc3RcblxuICAgIGV4cC5yZWNvcmRNYWluUG9zID0gLT5cbiAgICAgICAgZWwgPSBsYXN0VmlzaWJsZU1lc3NhZ2UoKVxuICAgICAgICBpZCA9IGVsPy5pZFxuICAgICAgICByZXR1cm4gdW5sZXNzIGVsIGFuZCBpZFxuICAgICAgICBvZnMgPSB0b3BvZiBlbFxuXG4gICAgZXhwLmFkanVzdE1haW5Qb3MgPSAtPlxuICAgICAgICByZXR1cm4gdW5sZXNzIGlkIGFuZCBvZnNcbiAgICAgICAgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCBpZFxuICAgICAgICBub2ZzID0gdG9wb2YgZWxcbiAgICAgICAgIyB0aGUgc2l6ZSBvZiB0aGUgaW5zZXJ0ZWQgZWxlbWVudHNcbiAgICAgICAgaW5zZXJ0ZWQgPSBub2ZzIC0gb2ZzXG4gICAgICAgIHNjcmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1haW4nKVxuICAgICAgICBzY3JlbC5zY3JvbGxUb3AgPSBzY3JlbC5zY3JvbGxUb3AgKyBpbnNlcnRlZFxuICAgICAgICAjIHJlc2V0XG4gICAgICAgIGlkID0gb2ZzID0gbnVsbFxuIl19
