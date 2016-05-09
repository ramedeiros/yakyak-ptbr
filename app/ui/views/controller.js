(function() {
  var applayout, connection, conninfo, controls, convadd, convlist, dockicon, input, later, menu, messages, models, notifications, redraw, ref, remote, setLeftSize, theme, trayicon, typinginfo, viewstate;

  remote = require('remote');

  ref = require('./index'), applayout = ref.applayout, convlist = ref.convlist, messages = ref.messages, input = ref.input, conninfo = ref.conninfo, convadd = ref.convadd, controls = ref.controls, notifications = ref.notifications, typinginfo = ref.typinginfo, menu = ref.menu, trayicon = ref.trayicon, dockicon = ref.dockicon, theme = ref.theme;

  models = require('../models');

  viewstate = models.viewstate, connection = models.connection;

  later = require('../util').later;

  handle('update:connection', (function() {
    var el;
    el = null;
    return function() {
      conninfo(connection);
      if (connection.state === connection.CONNECTED) {
        if (el != null) {
          if (typeof el.hide === "function") {
            el.hide();
          }
        }
        return el = null;
      } else {
        return el = notr({
          html: conninfo.el.innerHTML,
          stay: 0,
          id: 'conn'
        });
      }
    };
  })());

  setLeftSize = function(left) {
    document.querySelector('.left').style.width = left + 'px';
    return document.querySelector('.leftresize').style.left = (left - 2) + 'px';
  };

  handle('update:viewstate', function() {
    setLeftSize(viewstate.leftSize);
    if (viewstate.state === viewstate.STATE_STARTUP) {
      if (Array.isArray(viewstate.size)) {
        later(function() {
          var ref1;
          return (ref1 = remote.getCurrentWindow()).setSize.apply(ref1, viewstate.size);
        });
      }
      if (Array.isArray(viewstate.pos)) {
        later(function() {
          var ref1;
          return (ref1 = remote.getCurrentWindow()).setPosition.apply(ref1, viewstate.pos);
        });
      }
      applayout.left(null);
      applayout.main(null);
      applayout.maininfo(null);
      applayout.foot(null);
      applayout.theme(null);
      return document.body.style.zoom = viewstate.zoom;
    } else if (viewstate.state === viewstate.STATE_NORMAL) {
      redraw();
      applayout.lfoot(controls);
      applayout.left(convlist);
      applayout.main(messages);
      applayout.maininfo(typinginfo);
      applayout.foot(input);
      applayout.theme(theme);
      menu(viewstate);
      trayicon(models);
      return dockicon(viewstate);
    } else if (viewstate.state === viewstate.STATE_ADD_CONVERSATION) {
      redraw();
      applayout.left(convlist);
      applayout.main(convadd);
      applayout.maininfo(null);
      applayout.foot(null);
      return applayout.theme(theme);
    } else {
      return console.log('unknown viewstate.state', viewstate.state);
    }
  });

  handle('update:entity', function() {
    return redraw();
  });

  handle('update:conv', function() {
    return redraw();
  });

  handle('update:searchedentities', function() {
    return redraw();
  });

  handle('update:selectedEntities', function() {
    return redraw();
  });

  handle('update:convsettings', function() {
    return redraw();
  });

  redraw = function() {
    notifications(models);
    controls(models);
    convlist(models);
    messages(models);
    typinginfo(models);
    input(models);
    convadd(models);
    trayicon(models);
    return theme(viewstate);
  };

  handle('update:switchConv', function() {
    return messages.scrollToBottom();
  });

  handle('update:beforeHistory', function() {
    return applayout.recordMainPos();
  });

  handle('update:afterHistory', function() {
    return applayout.adjustMainPos();
  });

  handle('update:beforeImg', function() {
    return applayout.recordMainPos();
  });

  handle('update:afterImg', function() {
    if (viewstate.atbottom) {
      return messages.scrollToBottom();
    } else {
      return applayout.adjustMainPos();
    }
  });

  handle('update:startTyping', function() {
    if (viewstate.atbottom) {
      return messages.scrollToBottom();
    }
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVpL3ZpZXdzL2NvbnRyb2xsZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0VBRVQsTUFDK0QsT0FBQSxDQUFRLFNBQVIsQ0FEL0QsRUFBQyxnQkFBQSxTQUFELEVBQVksZUFBQSxRQUFaLEVBQXNCLGVBQUEsUUFBdEIsRUFBZ0MsWUFBQSxLQUFoQyxFQUF1QyxlQUFBLFFBQXZDLEVBQWlELGNBQUEsT0FBakQsRUFBMEQsZUFBQSxRQUExRCxFQUNBLG9CQUFBLGFBREEsRUFDZSxpQkFBQSxVQURmLEVBQzJCLFdBQUEsSUFEM0IsRUFDaUMsZUFBQSxRQURqQyxFQUMyQyxlQUFBLFFBRDNDLEVBQ3FELFlBQUE7O0VBRXJELE1BQUEsR0FBYyxPQUFBLENBQVEsV0FBUjs7RUFDYixtQkFBQSxTQUFELEVBQVksb0JBQUE7O0VBRVgsUUFBUyxPQUFBLENBQVEsU0FBUixFQUFUOztFQUdELE1BQUEsQ0FBTyxtQkFBUCxFQUErQixDQUFBLFNBQUE7QUFDM0IsUUFBQTtJQUFBLEVBQUEsR0FBSztXQUNMLFNBQUE7TUFFSSxRQUFBLENBQVMsVUFBVDtNQUdBLElBQUcsVUFBVSxDQUFDLEtBQVgsS0FBb0IsVUFBVSxDQUFDLFNBQWxDOzs7WUFDSSxFQUFFLENBQUU7OztlQUNKLEVBQUEsR0FBSyxLQUZUO09BQUEsTUFBQTtlQUlJLEVBQUEsR0FBSyxJQUFBLENBQUs7VUFBQyxJQUFBLEVBQUssUUFBUSxDQUFDLEVBQUUsQ0FBQyxTQUFsQjtVQUE2QixJQUFBLEVBQUssQ0FBbEM7VUFBcUMsRUFBQSxFQUFHLE1BQXhDO1NBQUwsRUFKVDs7SUFMSjtFQUYyQixDQUFBLENBQUgsQ0FBQSxDQUE1Qjs7RUFjQSxXQUFBLEdBQWMsU0FBQyxJQUFEO0lBQ1YsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsT0FBdkIsQ0FBK0IsQ0FBQyxLQUFLLENBQUMsS0FBdEMsR0FBOEMsSUFBQSxHQUFP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QVMsTUFBVDtJQUNBLFVBQUEsQ0FBVyxNQUFYO0lBQ0EsS0FBQSxDQUFNLE1BQU47SUFDQSxPQUFBLENBQVEsTUFBUjtJQUNBLFFBQUEsQ0FBUyxNQUFUO1dBQ0EsS0FBQSxDQUFNLFNBQU47RUFUSzs7RUFXVCxNQUFBLENBQU8sbUJBQVAsRUFBNEIsU0FBQTtXQUN4QixRQUFRLENBQUMsY0FBVCxDQUFBO0VBRHdCLENBQTVCOztFQUdBLE1BQUEsQ0FBTyxzQkFBUCxFQUErQixTQUFBO1dBQzNCLFNBQVMsQ0FBQyxhQUFWLENBQUE7RUFEMkIsQ0FBL0I7O0VBRUEsTUFBQSxDQUFPLHFCQUFQLEVBQThCLFNBQUE7V0FDMUIsU0FBUyxDQUFDLGFBQVYsQ0FBQTtFQUQwQixDQUE5Qjs7RUFHQSxNQUFBLENBQU8sa0JBQVAsRUFBMkIsU0FBQTtXQUN2QixTQUFTLENBQUMsYUFBVixDQUFBO0VBRHVCLENBQTNCOztFQUVBLE1BQUEsQ0FBTyxpQkFBUCxFQUEwQixTQUFBO0lBQ3RCLElBQUcsU0FBUyxDQUFDLFFBQWI7YUFDSSxRQUFRLENBQUMsY0FBVCxDQUFBLEVBREo7S0FBQSxNQUFBO2FBR0ksU0FBUyxDQUFDLGFBQVYsQ0FBQSxFQUhKOztFQURzQixDQUExQjs7RUFNQSxNQUFBLENBQU8sb0JBQVAsRUFBNkIsU0FBQTtJQUN6QixJQUFHLFNBQVMsQ0FBQyxRQUFiO2FBQ0ksUUFBUSxDQUFDLGNBQVQsQ0FBQSxFQURKOztFQUR5QixDQUE3QjtBQXpHQSIsImZpbGUiOiJ1aS92aWV3cy9jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsicmVtb3RlID0gcmVxdWlyZSAncmVtb3RlJ1xuXG57YXBwbGF5b3V0LCBjb252bGlzdCwgbWVzc2FnZXMsIGlucHV0LCBjb25uaW5mbywgY29udmFkZCwgY29udHJvbHMsXG5ub3RpZmljYXRpb25zLCB0eXBpbmdpbmZvLCBtZW51LCB0cmF5aWNvbiwgZG9ja2ljb24sIHRoZW1lIH0gPSByZXF1aXJlICcuL2luZGV4J1xuXG5tb2RlbHMgICAgICA9IHJlcXVpcmUgJy4uL21vZGVscydcbnt2aWV3c3RhdGUsIGNvbm5lY3Rpb259ID0gbW9kZWxzXG5cbntsYXRlcn0gPSByZXF1aXJlICcuLi91dGlsJ1xuXG5cbmhhbmRsZSAndXBkYXRlOmNvbm5lY3Rpb24nLCBkbyAtPlxuICAgIGVsID0gbnVsbFxuICAgIC0+XG4gICAgICAgICMgZHJhdyB2aWV3XG4gICAgICAgIGNvbm5pbmZvIGNvbm5lY3Rpb25cblxuICAgICAgICAjIHBsYWNlIGluIGxheW91dFxuICAgICAgICBpZiBjb25uZWN0aW9uLnN0YXRlID09IGNvbm5lY3Rpb24uQ09OTkVDVEVEXG4gICAgICAgICAgICBlbD8uaGlkZT8oKVxuICAgICAgICAgICAgZWwgPSBudWxsXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGVsID0gbm90ciB7aHRtbDpjb25uaW5mby5lbC5pbm5lckhUTUwsIHN0YXk6MCwgaWQ6J2Nvbm4nfVxuXG5cbnNldExlZnRTaXplID0gKGxlZnQpIC0+XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmxlZnQnKS5zdHlsZS53aWR0aCA9IGxlZnQgKyAncHgnXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmxlZnRyZXNpemUnKS5zdHlsZS5sZWZ0ID0gKGxlZnQgLSAyKSArICdweCdcblxuXG5oYW5kbGUgJ3VwZGF0ZTp2aWV3c3RhdGUnLCAtPlxuICAgIHNldExlZnRTaXplIHZpZXdzdGF0ZS5sZWZ0U2l6ZVxuICAgIGlmIHZpZXdzdGF0ZS5zdGF0ZSA9PSB2aWV3c3RhdGUuU1RBVEVfU1RBUlRVUFxuICAgICAgICBpZiBBcnJheS5pc0FycmF5IHZpZXdzdGF0ZS5zaXplXG4gICAgICAgICAgICBsYXRlciAtPiByZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpLnNldFNpemUgdmlld3N0YXRlLnNpemUuLi5cbiAgICAgICAgaWYgQXJyYXkuaXNBcnJheSB2aWV3c3RhdGUucG9zXG4gICAgICAgICAgICBsYXRlciAtPiByZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpLnNldFBvc2l0aW9uIHZpZXdzdGF0ZS5wb3MuLi5cbiAgICAgICAgYXBwbGF5b3V0LmxlZnQgbnVsbFxuICAgICAgICBhcHBsYXlvdXQubWFpbiBudWxsXG4gICAgICAgIGFwcGxheW91dC5tYWluaW5mbyBudWxsXG4gICAgICAgIGFwcGxheW91dC5mb290IG51bGxcbiAgICAgICAgYXBwbGF5b3V0LnRoZW1lIG51bGxcbiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS56b29tID0gdmlld3N0YXRlLnpvb21cbiAgICBlbHNlIGlmIHZpZXdzdGF0ZS5zdGF0ZSA9PSB2aWV3c3RhdGUuU1RBVEVfTk9STUFMXG4gICAgICAgIHJlZHJhdygpXG4gICAgICAgIGFwcGxheW91dC5sZm9vdCBjb250cm9sc1xuICAgICAgICBhcHBsYXlvdXQubGVmdCBjb252bGlzdFxuICAgICAgICBhcHBsYXlvdXQubWFpbiBtZXNzYWdlc1xuICAgICAgICBhcHBsYXlvdXQubWFpbmluZm8gdHlwaW5naW5mb1xuICAgICAgICBhcHBsYXlvdXQuZm9vdCBpbnB1dFxuICAgICAgICBhcHBsYXlvdXQudGhlbWUgdGhlbWVcbiAgICAgICAgbWVudSB2aWV3c3RhdGVcbiAgICAgICAgdHJheWljb24gbW9kZWxzXG4gICAgICAgIGRvY2tpY29uIHZpZXdzdGF0ZVxuICAgIGVsc2UgaWYgdmlld3N0YXRlLnN0YXRlID09IHZpZXdzdGF0ZS5TVEFURV9BRERfQ09OVkVSU0FUSU9OXG4gICAgICAgIHJlZHJhdygpXG4gICAgICAgIGFwcGxheW91dC5sZWZ0IGNvbnZsaXN0XG4gICAgICAgIGFwcGxheW91dC5tYWluIGNvbnZhZGRcbiAgICAgICAgYXBwbGF5b3V0Lm1haW5pbmZvIG51bGxcbiAgICAgICAgYXBwbGF5b3V0LmZvb3QgbnVsbFxuICAgICAgICBhcHBsYXlvdXQudGhlbWUgdGhlbWVcbiAgICBlbHNlXG4gICAgICAgIGNvbnNvbGUubG9nICd1bmtub3duIHZpZXdzdGF0ZS5zdGF0ZScsIHZpZXdzdGF0ZS5zdGF0ZVxuXG5oYW5kbGUgJ3VwZGF0ZTplbnRpdHknLCAtPlxuICAgIHJlZHJhdygpXG5cbmhhbmRsZSAndXBkYXRlOmNvbnYnLCAtPlxuICAgIHJlZHJhdygpXG5cbmhhbmRsZSAndXBkYXRlOnNlYXJjaGVkZW50aXRpZXMnLCAtPlxuICByZWRyYXcoKVxuXG5oYW5kbGUgJ3VwZGF0ZTpzZWxlY3RlZEVudGl0aWVzJywgLT5cbiAgcmVkcmF3KClcblxuaGFuZGxlICd1cGRhdGU6Y29udnNldHRpbmdzJywgLT4gcmVkcmF3KClcblxucmVkcmF3ID0gLT5cbiAgICBub3RpZmljYXRpb25zIG1vZGVsc1xuICAgIGNvbnRyb2xzIG1vZGVsc1xuICAgIGNvbnZsaXN0IG1vZGVsc1xuICAgIG1lc3NhZ2VzIG1vZGVsc1xuICAgIHR5cGluZ2luZm8gbW9kZWxzXG4gICAgaW5wdXQgbW9kZWxzXG4gICAgY29udmFkZCBtb2RlbHNcbiAgICB0cmF5aWNvbiBtb2RlbHNcbiAgICB0aGVtZSB2aWV3c3RhdGVcblxuaGFuZGxlICd1cGRhdGU6c3dpdGNoQ29udicsIC0+XG4gICAgbWVzc2FnZXMuc2Nyb2xsVG9Cb3R0b20oKVxuXG5oYW5kbGUgJ3VwZGF0ZTpiZWZvcmVIaXN0b3J5JywgLT5cbiAgICBhcHBsYXlvdXQucmVjb3JkTWFpblBvcygpXG5oYW5kbGUgJ3VwZGF0ZTphZnRlckhpc3RvcnknLCAtPlxuICAgIGFwcGxheW91dC5hZGp1c3RNYWluUG9zKClcblxuaGFuZGxlICd1cGRhdGU6YmVmb3JlSW1nJywgLT5cbiAgICBhcHBsYXlvdXQucmVjb3JkTWFpblBvcygpXG5oYW5kbGUgJ3VwZGF0ZTphZnRlckltZycsIC0+XG4gICAgaWYgdmlld3N0YXRlLmF0Ym90dG9tXG4gICAgICAgIG1lc3NhZ2VzLnNjcm9sbFRvQm90dG9tKClcbiAgICBlbHNlXG4gICAgICAgIGFwcGxheW91dC5hZGp1c3RNYWluUG9zKClcblxuaGFuZGxlICd1cGRhdGU6c3RhcnRUeXBpbmcnLCAtPlxuICAgIGlmIHZpZXdzdGF0ZS5hdGJvdHRvbVxuICAgICAgICBtZXNzYWdlcy5zY3JvbGxUb0JvdHRvbSgpXG4iXX0=
