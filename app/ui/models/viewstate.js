(function() {
  var Client, STATES, exp, later, merge, ref, ref1, ref2, ref3, ref4, throttle, tryparse,
    slice = [].slice;

  Client = require('hangupsjs');

  merge = function() {
    var j, k, len, o, os, t, v;
    t = arguments[0], os = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    for (j = 0, len = os.length; j < len; j++) {
      o = os[j];
      for (k in o) {
        v = o[k];
        if (v !== null && v !== (void 0)) {
          t[k] = v;
        }
      }
    }
    return t;
  };

  ref = require('../util'), throttle = ref.throttle, later = ref.later, tryparse = ref.tryparse;

  STATES = {
    STATE_STARTUP: 'startup',
    STATE_NORMAL: 'normal',
    STATE_ADD_CONVERSATION: 'add_conversation'
  };

  module.exports = exp = {
    state: null,
    attop: false,
    atbottom: true,
    selectedConv: localStorage.selectedConv,
    lastActivity: null,
    leftSize: (ref1 = tryparse(localStorage.leftSize)) != null ? ref1 : 200,
    size: tryparse((ref2 = localStorage.size) != null ? ref2 : "[940, 600]"),
    pos: tryparse((ref3 = localStorage.pos) != null ? ref3 : "[100, 100]"),
    showConvThumbs: tryparse(localStorage.showConvThumbs),
    zoom: tryparse((ref4 = localStorage.zoom) != null ? ref4 : "1.0"),
    loggedin: false,
    showtray: tryparse(localStorage.showtray) || false,
    hidedockicon: tryparse(localStorage.hidedockicon) || false,
    startminimizedtotray: tryparse(localStorage.startminimizedtotray) || false,
    theme: localStorage.theme || 'light-theme',
    setState: function(state) {
      if (this.state === state) {
        return;
      }
      this.state = state;
      if (state === STATES.STATE_STARTUP) {
        require('./connection').setLastActive(Date.now(), true);
      }
      return updated('viewstate');
    },
    setSelectedConv: function(c) {
      var conv, conv_id, ref10, ref5, ref6, ref7, ref8, ref9;
      conv = require('./conv');
      conv_id = (ref5 = (ref6 = c != null ? (ref7 = c.conversation_id) != null ? ref7.id : void 0 : void 0) != null ? ref6 : c != null ? c.id : void 0) != null ? ref5 : c;
      if (!conv_id) {
        conv_id = (ref8 = conv.list()) != null ? (ref9 = ref8[0]) != null ? (ref10 = ref9.conversation_id) != null ? ref10.id : void 0 : void 0 : void 0;
      }
      if (this.selectedConv === conv_id) {
        return;
      }
      this.selectedConv = localStorage.selectedConv = conv_id;
      this.setLastKeyDown(0);
      updated('viewstate');
      return updated('switchConv');
    },
    selectNextConv: function(offset) {
      var c, candidate, conv, i, id, index, j, len, list, results;
      if (offset == null) {
        offset = 1;
      }
      conv = require('./conv');
      id = this.selectedConv;
      c = conv[id];
      list = (function() {
        var j, len, ref5, results;
        ref5 = conv.list();
        results = [];
        for (j = 0, len = ref5.length; j < len; j++) {
          i = ref5[j];
          if (!conv.isPureHangout(i)) {
            results.push(i);
          }
        }
        return results;
      })();
      results = [];
      for (index = j = 0, len = list.length; j < len; index = ++j) {
        c = list[index];
        if (id === c.conversation_id.id) {
          candidate = index + offset;
          if (list[candidate]) {
            results.push(this.setSelectedConv(list[candidate]));
          } else {
            results.push(void 0);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    },
    updateAtTop: function(attop) {
      if (this.attop === attop) {
        return;
      }
      this.attop = attop;
      return updated('viewstate');
    },
    updateAtBottom: function(atbottom) {
      if (this.atbottom === atbottom) {
        return;
      }
      this.atbottom = atbottom;
      return this.updateActivity(Date.now());
    },
    updateActivity: function(time) {
      var c, conv, ur;
      conv = require('./conv');
      this.lastActivity = time;
      later(function() {
        return action('lastActivity');
      });
      if (!(document.hasFocus() && this.atbottom && this.state === STATES.STATE_NORMAL)) {
        return;
      }
      c = conv[this.selectedConv];
      if (!c) {
        return;
      }
      ur = conv.unread(c);
      if (ur > 0) {
        return later(function() {
          return action('updatewatermark');
        });
      }
    },
    setSize: function(size) {
      localStorage.size = JSON.stringify(size);
      this.size = size;
      return updated('viewstate');
    },
    setPosition: function(pos) {
      localStorage.pos = JSON.stringify(pos);
      this.pos = pos;
      return updated('viewstate');
    },
    setLeftSize: function(size) {
      if (this.leftSize === size) {
        return;
      }
      this.leftSize = localStorage.leftSize = size;
      return updated('viewstate');
    },
    setZoom: function(zoom) {
      return this.zoom = localStorage.zoom = document.body.style.zoom = zoom;
    },
    setLoggedin: function(val) {
      this.loggedin = val;
      return updated('viewstate');
    },
    setLastKeyDown: (function() {
      var PAUSED, STOPPED, TYPING, lastEmitted, ref5, timeout, update;
      ref5 = Client.TypingStatus, TYPING = ref5.TYPING, PAUSED = ref5.PAUSED, STOPPED = ref5.STOPPED;
      lastEmitted = 0;
      timeout = 0;
      return update = throttle(500, function(time) {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = null;
        if (!time) {
          return lastEmitted = 0;
        } else {
          if (time - lastEmitted > 5000) {
            later(function() {
              return action('settyping', TYPING);
            });
            lastEmitted = time;
          }
          return timeout = setTimeout(function() {
            lastEmitted = 0;
            action('settyping', PAUSED);
            return timeout = setTimeout(function() {
              return action('settyping', STOPPED);
            }, 6000);
          }, 6000);
        }
      });
    })(),
    setShowConvThumbs: function(doshow) {
      if (this.showConvThumbs === doshow) {
        return;
      }
      this.showConvThumbs = localStorage.showConvThumbs = doshow;
      return updated('viewstate');
    },
    setShowTray: function(value) {
      this.showtray = localStorage.showtray = value;
      if (!value) {
        return this.setStartMinimizedToTray(false);
      } else {
        return updated('viewstate');
      }
    },
    setHideDockIcon: function(value) {
      this.hidedockicon = localStorage.hidedockicon = value;
      return updated('viewstate');
    },
    setStartMinimizedToTray: function(value) {
      this.startminimizedtotray = localStorage.startminimizedtotray = value;
      return updated('viewstate');
    },
    setTheme: function(value) {
      this.theme = localStorage.theme = value;
      return updated('viewstate');
    }
  };

  merge(exp, STATES);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVpL21vZGVscy92aWV3c3RhdGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxrRkFBQTtJQUFBOztFQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsV0FBUjs7RUFFVCxLQUFBLEdBQVUsU0FBQTtBQUFjLFFBQUE7SUFBYixrQkFBRztBQUFVLFNBQUEsb0NBQUE7O0FBQUEsV0FBQSxNQUFBOztZQUEyQixDQUFBLEtBQVUsSUFBVixJQUFBLENBQUEsS0FBZ0I7VUFBM0MsQ0FBRSxDQUFBLENBQUEsQ0FBRixHQUFPOztBQUFQO0FBQUE7V0FBbUU7RUFBakY7O0VBRVYsTUFBOEIsT0FBQSxDQUFRLFNBQVIsQ0FBOUIsRUFBQyxlQUFBLFFBQUQsRUFBVyxZQUFBLEtBQVgsRUFBa0IsZUFBQTs7RUFFbEIsTUFBQSxHQUNJO0lBQUEsYUFBQSxFQUFlLFNBQWY7SUFDQSxZQUFBLEVBQWMsUUFEZDtJQUVBLHNCQUFBLEVBQXdCLGtCQUZ4Qjs7O0VBSUosTUFBTSxDQUFDLE9BQVAsR0FBaUIsR0FBQSxHQUFNO0lBQ25CLEtBQUEsRUFBTyxJQURZO0lBRW5CLEtBQUEsRUFBTyxLQUZZO0lBR25CLFFBQUEsRUFBVSxJQUhTO0lBSW5CLFlBQUEsRUFBYyxZQUFZLENBQUMsWUFKUjtJQUtuQixZQUFBLEVBQWMsSUFMSztJQU1uQixRQUFBLDREQUE0QyxHQU56QjtJQU9uQixJQUFBLEVBQU0sUUFBQSw2Q0FBNkIsWUFBN0IsQ0FQYTtJQVFuQixHQUFBLEVBQUssUUFBQSw0Q0FBNEIsWUFBNUIsQ0FSYztJQVNuQixjQUFBLEVBQWdCLFFBQUEsQ0FBUyxZQUFZLENBQUMsY0FBdEIsQ0FURztJQVVuQixJQUFBLEVBQU0sUUFBQSw2Q0FBNkIsS0FBN0IsQ0FWYTtJQVduQixRQUFBLEVBQVUsS0FYUztJQVluQixRQUFBLEVBQVUsUUFBQSxDQUFTLFlBQVksQ0FBQyxRQUF0QixDQUFBLElBQW1DLEtBWjFCO0lBYW5CLFlBQUEsRUFBYyxRQUFBLENB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Q0FBQyxZQUFiLEdBQTRCO2FBQzVDLE9BQUEsQ0FBUSxXQUFSO0lBRmEsQ0E1SEU7SUFnSW5CLHVCQUFBLEVBQXlCLFNBQUMsS0FBRDtNQUNyQixJQUFDLENBQUEsb0JBQUQsR0FBd0IsWUFBWSxDQUFDLG9CQUFiLEdBQW9DO2FBQzVELE9BQUEsQ0FBUSxXQUFSO0lBRnFCLENBaElOO0lBb0luQixRQUFBLEVBQVUsU0FBQyxLQUFEO01BQ04sSUFBQyxDQUFBLEtBQUQsR0FBUSxZQUFZLENBQUMsS0FBYixHQUFxQjthQUM3QixPQUFBLENBQVEsV0FBUjtJQUZNLENBcElTOzs7RUEySXZCLEtBQUEsQ0FBTSxHQUFOLEVBQVcsTUFBWDtBQXRKQSIsImZpbGUiOiJ1aS9tb2RlbHMvdmlld3N0YXRlLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiQ2xpZW50ID0gcmVxdWlyZSAnaGFuZ3Vwc2pzJ1xuXG5tZXJnZSAgID0gKHQsIG9zLi4uKSAtPiB0W2tdID0gdiBmb3Igayx2IG9mIG8gd2hlbiB2IG5vdCBpbiBbbnVsbCwgdW5kZWZpbmVkXSBmb3IgbyBpbiBvczsgdFxuXG57dGhyb3R0bGUsIGxhdGVyLCB0cnlwYXJzZX0gPSByZXF1aXJlICcuLi91dGlsJ1xuXG5TVEFURVMgPVxuICAgIFNUQVRFX1NUQVJUVVA6ICdzdGFydHVwJ1xuICAgIFNUQVRFX05PUk1BTDogJ25vcm1hbCdcbiAgICBTVEFURV9BRERfQ09OVkVSU0FUSU9OOiAnYWRkX2NvbnZlcnNhdGlvbidcblxubW9kdWxlLmV4cG9ydHMgPSBleHAgPSB7XG4gICAgc3RhdGU6IG51bGxcbiAgICBhdHRvcDogZmFsc2UgICAjIHRlbGxzIHdoZXRoZXIgbWVzc2FnZSBsaXN0IGlzIHNjcm9sbGUgdG8gdG9wXG4gICAgYXRib3R0b206IHRydWUgIyB0ZWxscyB3aGV0aGVyIG1lc3NhZ2UgbGlzdCBpcyBzY3JvbGxlZCB0byBib3R0b21cbiAgICBzZWxlY3RlZENvbnY6IGxvY2FsU3RvcmFnZS5zZWxlY3RlZENvbnZcbiAgICBsYXN0QWN0aXZpdHk6IG51bGxcbiAgICBsZWZ0U2l6ZTogdHJ5cGFyc2UobG9jYWxTdG9yYWdlLmxlZnRTaXplKSA/IDIwMFxuICAgIHNpemU6IHRyeXBhcnNlKGxvY2FsU3RvcmFnZS5zaXplID8gXCJbOTQwLCA2MDBdXCIpXG4gICAgcG9zOiB0cnlwYXJzZShsb2NhbFN0b3JhZ2UucG9zID8gXCJbMTAwLCAxMDBdXCIpXG4gICAgc2hvd0NvbnZUaHVtYnM6IHRyeXBhcnNlKGxvY2FsU3RvcmFnZS5zaG93Q29udlRodW1icylcbiAgICB6b29tOiB0cnlwYXJzZShsb2NhbFN0b3JhZ2Uuem9vbSA/IFwiMS4wXCIpXG4gICAgbG9nZ2VkaW46IGZhbHNlXG4gICAgc2hvd3RyYXk6IHRyeXBhcnNlKGxvY2FsU3RvcmFnZS5zaG93dHJheSkgb3IgZmFsc2VcbiAgICBoaWRlZG9ja2ljb246IHRyeXBhcnNlKGxvY2FsU3RvcmFnZS5oaWRlZG9ja2ljb24pIG9yIGZhbHNlXG4gICAgc3RhcnRtaW5pbWl6ZWR0b3RyYXk6IHRyeXBhcnNlKGxvY2FsU3RvcmFnZS5zdGFydG1pbmltaXplZHRvdHJheSkgb3IgZmFsc2VcbiAgICB0aGVtZTogbG9jYWxTdG9yYWdlLnRoZW1lIG9yICdsaWdodC10aGVtZSdcblxuICAgIHNldFN0YXRlOiAoc3RhdGUpIC0+XG4gICAgICAgIHJldHVybiBpZiBAc3RhdGUgPT0gc3RhdGVcbiAgICAgICAgQHN0YXRlID0gc3RhdGVcbiAgICAgICAgaWYgc3RhdGUgPT0gU1RBVEVTLlNUQVRFX1NUQVJUVVBcbiAgICAgICAgICAgICMgc2V0IGEgZmlyc3QgYWN0aXZlIHRpbWVzdGFtcCB0byBhdm9pZCByZXF1ZXN0aW5nXG4gICAgICAgICAgICAjIHN5bmNhbGxuZXdldmVudHMgb24gc3RhcnR1cFxuICAgICAgICAgICAgcmVxdWlyZSgnLi9jb25uZWN0aW9uJykuc2V0TGFzdEFjdGl2ZShEYXRlLm5vdygpLCB0cnVlKVxuICAgICAgICB1cGRhdGVkICd2aWV3c3RhdGUnXG5cbiAgICBzZXRTZWxlY3RlZENvbnY6IChjKSAtPlxuICAgICAgICBjb252ID0gcmVxdWlyZSAnLi9jb252JyAjIGNpcmN1bGFyXG4gICAgICAgIGNvbnZfaWQgPSBjPy5jb252ZXJzYXRpb25faWQ/LmlkID8gYz8uaWQgPyBjXG4gICAgICAgIHVubGVzcyBjb252X2lkXG4gICAgICAgICAgICBjb252X2lkID0gY29udi5saXN0KCk/WzBdPy5jb252ZXJzYXRpb25faWQ/LmlkXG4gICAgICAgIHJldHVybiBpZiBAc2VsZWN0ZWRDb252ID09IGNvbnZfaWRcbiAgICAgICAgQHNlbGVjdGVkQ29udiA9IGxvY2FsU3RvcmFnZS5zZWxlY3RlZENvbnYgPSBjb252X2lkXG4gICAgICAgIEBzZXRMYXN0S2V5RG93biAwXG4gICAgICAgIHVwZGF0ZWQgJ3ZpZXdzdGF0ZSdcbiAgICAgICAgdXBkYXRlZCAnc3dpdGNoQ29udidcblxuICAgIHNlbGVjdE5leHRDb252OiAob2Zmc2V0ID0gMSkgLT5cbiAgICAgICAgY29udiA9IHJlcXVpcmUgJy4vY29udidcbiAgICAgICAgaWQgPSBAc2VsZWN0ZWRDb252XG4gICAgICAgIGMgPSBjb252W2lkXVxuICAgICAgICBsaXN0ID0gKGkgZm9yIGkgaW4gY29udi5saXN0KCkgd2hlbiBub3QgY29udi5pc1B1cmVIYW5nb3V0KGkpKVxuICAgICAgICBmb3IgYywgaW5kZXggaW4gbGlzdFxuICAgICAgICAgICAgaWYgaWQgPT0gYy5jb252ZXJzYXRpb25faWQuaWRcbiAgICAgICAgICAgICAgICBjYW5kaWRhdGUgPSBpbmRleCArIG9mZnNldFxuICAgICAgICAgICAgICAgIEBzZXRTZWxlY3RlZENvbnYgbGlzdFtjYW5kaWRhdGVdIGlmIGxpc3RbY2FuZGlkYXRlXVxuXG4gICAgdXBkYXRlQXRUb3A6IChhdHRvcCkgLT5cbiAgICAgICAgcmV0dXJuIGlmIEBhdHRvcCA9PSBhdHRvcFxuICAgICAgICBAYXR0b3AgPSBhdHRvcFxuICAgICAgICB1cGRhdGVkICd2aWV3c3RhdGUnXG5cbiAgICB1cGRhdGVBdEJvdHRvbTogKGF0Ym90dG9tKSAtPlxuICAgICAgICByZXR1cm4gaWYgQGF0Ym90dG9tID09IGF0Ym90dG9tXG4gICAgICAgIEBhdGJvdHRvbSA9IGF0Ym90dG9tXG4gICAgICAgIEB1cGRhdGVBY3Rpdml0eSBEYXRlLm5vdygpXG5cbiAgICB1cGRhdGVBY3Rpdml0eTogKHRpbWUpIC0+XG4gICAgICAgIGNvbnYgPSByZXF1aXJlICcuL2NvbnYnICMgY2lyY3VsYXJcbiAgICAgICAgQGxhc3RBY3Rpdml0eSA9IHRpbWVcbiAgICAgICAgbGF0ZXIgLT4gYWN0aW9uICdsYXN0QWN0aXZpdHknXG4gICAgICAgIHJldHVybiB1bmxlc3MgZG9jdW1lbnQuaGFzRm9jdXMoKSBhbmQgQGF0Ym90dG9tIGFuZCBAc3RhdGUgPT0gU1RBVEVTLlNUQVRFX05PUk1BTFxuICAgICAgICBjID0gY29udltAc2VsZWN0ZWRDb252XVxuICAgICAgICByZXR1cm4gdW5sZXNzIGNcbiAgICAgICAgdXIgPSBjb252LnVucmVhZCBjXG4gICAgICAgIGlmIHVyID4gMFxuICAgICAgICAgICAgbGF0ZXIgLT4gYWN0aW9uICd1cGRhdGV3YXRlcm1hcmsnXG5cbiAgICBzZXRTaXplOiAoc2l6ZSkgLT5cbiAgICAgICAgbG9jYWxTdG9yYWdlLnNpemUgPSBKU09OLnN0cmluZ2lmeShzaXplKVxuICAgICAgICBAc2l6ZSA9IHNpemVcbiAgICAgICAgdXBkYXRlZCAndmlld3N0YXRlJ1xuXG4gICAgc2V0UG9zaXRpb246IChwb3MpIC0+XG4gICAgICAgIGxvY2FsU3RvcmFnZS5wb3MgPSBKU09OLnN0cmluZ2lmeShwb3MpXG4gICAgICAgIEBwb3MgPSBwb3NcbiAgICAgICAgdXBkYXRlZCAndmlld3N0YXRlJ1xuXG4gICAgc2V0TGVmdFNpemU6IChzaXplKSAtPlxuICAgICAgICByZXR1cm4gaWYgQGxlZnRTaXplID09IHNpemVcbiAgICAgICAgQGxlZnRTaXplID0gbG9jYWxTdG9yYWdlLmxlZnRTaXplID0gc2l6ZVxuICAgICAgICB1cGRhdGVkICd2aWV3c3RhdGUnXG5cbiAgICBzZXRab29tOiAoem9vbSkgLT5cbiAgICAgICAgQHpvb20gPSBsb2NhbFN0b3JhZ2Uuem9vbSA9IGRvY3VtZW50LmJvZHkuc3R5bGUuem9vbSA9IHpvb21cblxuICAgIHNldExvZ2dlZGluOiAodmFsKSAtPlxuICAgICAgICBAbG9nZ2VkaW4gPSB2YWxcbiAgICAgICAgdXBkYXRlZCAndmlld3N0YXRlJ1xuXG4gICAgc2V0TGFzdEtleURvd246IGRvIC0+XG4gICAgICAgIHtUWVBJTkcsIFBBVVNFRCwgU1RPUFBFRH0gPSBDbGllbnQuVHlwaW5nU3RhdHVzXG4gICAgICAgIGxhc3RFbWl0dGVkID0gMFxuICAgICAgICB0aW1lb3V0ID0gMFxuICAgICAgICB1cGRhdGUgPSB0aHJvdHRsZSA1MDAsICh0aW1lKSAtPlxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0IHRpbWVvdXQgaWYgdGltZW91dFxuICAgICAgICAgICAgdGltZW91dCA9IG51bGxcbiAgICAgICAgICAgIHVubGVzcyB0aW1lXG4gICAgICAgICAgICAgICAgbGFzdEVtaXR0ZWQgPSAwXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaWYgdGltZSAtIGxhc3RFbWl0dGVkID4gNTAwMFxuICAgICAgICAgICAgICAgICAgICBsYXRlciAtPiBhY3Rpb24gJ3NldHR5cGluZycsIFRZUElOR1xuICAgICAgICAgICAgICAgICAgICBsYXN0RW1pdHRlZCA9IHRpbWVcbiAgICAgICAgICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dCAtPlxuICAgICAgICAgICAgICAgICAgICAjIGFmdGVyIDYgc2Vjb2RzIG9mIG5vIGtleWJvYXJkLCB3ZSBjb25zaWRlciB0aGVcbiAgICAgICAgICAgICAgICAgICAgIyB1c2VyIHRvb2sgYSBicmVhay5cbiAgICAgICAgICAgICAgICAgICAgbGFzdEVtaXR0ZWQgPSAwXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbiAnc2V0dHlwaW5nJywgUEFVU0VEXG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0IC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAjIGFuZCBhZnRlciBhbm90aGVyIDYgc2Vjb25kcyAoMTIgdG90YWwpLCB3ZVxuICAgICAgICAgICAgICAgICAgICAgICAgIyBjb25zaWRlciB0aGUgdHlwaW5nIHN0b3BwZWQgYWx0b2dldGhlci5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbiAnc2V0dHlwaW5nJywgU1RPUFBFRFxuICAgICAgICAgICAgICAgICAgICAsIDYwMDBcbiAgICAgICAgICAgICAgICAsIDYwMDBcblxuICAgIHNldFNob3dDb252VGh1bWJzOiAoZG9zaG93KSAtPlxuICAgICAgICByZXR1cm4gaWYgQHNob3dDb252VGh1bWJzID09IGRvc2hvd1xuICAgICAgICBAc2hvd0NvbnZUaHVtYnMgPSBsb2NhbFN0b3JhZ2Uuc2hvd0NvbnZUaHVtYnMgPSBkb3Nob3dcbiAgICAgICAgdXBkYXRlZCAndmlld3N0YXRlJ1xuXG4gICAgc2V0U2hvd1RyYXk6ICh2YWx1ZSkgLT5cbiAgICAgICAgQHNob3d0cmF5ID0gbG9jYWxTdG9yYWdlLnNob3d0cmF5ID0gdmFsdWVcbiAgICAgICAgaWYgbm90IHZhbHVlIHRoZW4gQHNldFN0YXJ0TWluaW1pemVkVG9UcmF5KGZhbHNlKSBlbHNlIHVwZGF0ZWQgJ3ZpZXdzdGF0ZSdcblxuICAgIHNldEhpZGVEb2NrSWNvbjogKHZhbHVlKSAtPlxuICAgICAgICBAaGlkZWRvY2tpY29uID0gbG9jYWxTdG9yYWdlLmhpZGVkb2NraWNvbiA9IHZhbHVlXG4gICAgICAgIHVwZGF0ZWQgJ3ZpZXdzdGF0ZSdcblxuICAgIHNldFN0YXJ0TWluaW1pemVkVG9UcmF5OiAodmFsdWUpIC0+XG4gICAgICAgIEBzdGFydG1pbmltaXplZHRvdHJheSA9IGxvY2FsU3RvcmFnZS5zdGFydG1pbmltaXplZHRvdHJheSA9IHZhbHVlXG4gICAgICAgIHVwZGF0ZWQgJ3ZpZXdzdGF0ZSdcblxuICAgIHNldFRoZW1lOiAodmFsdWUpIC0+XG4gICAgICAgIEB0aGVtZT0gbG9jYWxTdG9yYWdlLnRoZW1lID0gdmFsdWVcbiAgICAgICAgdXBkYXRlZCAndmlld3N0YXRlJ1xuXG5cbn1cblxubWVyZ2UgZXhwLCBTVEFURVNcbiJdfQ==
