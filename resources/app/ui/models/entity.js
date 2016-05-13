(function() {
  var add, domerge, funcs, lookup, merge, needEntity, shallowif,
    slice = [].slice;

  merge = function() {
    var i, k, len, o, os, t, v;
    t = arguments[0], os = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    for (i = 0, len = os.length; i < len; i++) {
      o = os[i];
      for (k in o) {
        v = o[k];
        if (v !== null && v !== (void 0)) {
          t[k] = v;
        }
      }
    }
    return t;
  };

  shallowif = function(o, f) {
    var k, r, v;
    r = {};
    for (k in o) {
      v = o[k];
      if (f(k, v)) {
        r[k] = v;
      }
    }
    return r;
  };

  lookup = {};

  domerge = function(id, props) {
    var ref;
    return lookup[id] = merge((ref = lookup[id]) != null ? ref : {}, props);
  };

  add = function(entity, opts) {
    var chat_id, clone, gaia_id, ref, ref1;
    if (opts == null) {
      opts = {
        silent: false
      };
    }
    ref1 = (ref = entity != null ? entity.id : void 0) != null ? ref : {}, gaia_id = ref1.gaia_id, chat_id = ref1.chat_id;
    if (!(gaia_id || chat_id)) {
      return null;
    }
    if (!lookup[chat_id]) {
      lookup[chat_id] = {};
    }
    if (entity.properties) {
      domerge(chat_id, entity.properties);
    }
    clone = shallowif(entity, function(k) {
      return k !== 'id' && k !== 'properties';
    });
    domerge(chat_id, clone);
    lookup[chat_id].id = chat_id;
    if (chat_id !== gaia_id) {
      lookup[gaia_id] = lookup[chat_id];
    }
    if (!opts.silent) {
      updated('entity');
    }
    return lookup[chat_id];
  };

  needEntity = (function() {
    var fetch, gather, tim;
    tim = null;
    gather = [];
    fetch = function() {
      tim = null;
      action('getentity', gather);
      return gather = [];
    };
    return function(id, wait) {
      var ref;
      if (wait == null) {
        wait = 1000;
      }
      if ((ref = lookup[id]) != null ? ref.fetching : void 0) {
        return;
      }
      if (lookup[id]) {
        lookup[id].fetching = true;
      } else {
        lookup[id] = {
          id: id,
          fetching: true
        };
      }
      if (tim) {
        clearTimeout(tim);
      }
      tim = setTimeout(fetch, wait);
      return gather.push(id);
    };
  })();

  funcs = {
    count: function() {
      var c, k, v;
      c = 0;
      for (k in lookup) {
        v = lookup[k];
        if (typeof v === 'object') {
          c++;
        }
      }
      return c;
    },
    isSelf: function(chat_id) {
      return !!lookup.self && lookup[chat_id] === lookup.self;
    },
    _reset: function() {
      var k, v;
      for (k in lookup) {
        v = lookup[k];
        if (typeof v === 'object') {
          delete lookup[k];
        }
      }
      updated('entity');
      return null;
    },
    _initFromSelfEntity: function(self) {
      updated('entity');
      return lookup.self = add(self);
    },
    _initFromEntities: function(entities) {
      var c, countIf, entity, i, len;
      c = 0;
      countIf = function(a) {
        if (a) {
          return c++;
        }
      };
      for (i = 0, len = entities.length; i < len; i++) {
        entity = entities[i];
        countIf(add(entity));
      }
      updated('entity');
      return c;
    },
    add: add,
    needEntity: needEntity
  };

  module.exports = merge(lookup, funcs);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVpL21vZGVscy9lbnRpdHkuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0FBQUEsTUFBQSx5REFBQTtJQUFBOztFQUFBLEtBQUEsR0FBVSxTQUFBO0FBQWMsUUFBQTtJQUFiLGtCQUFHO0FBQVUsU0FBQSxvQ0FBQTs7QUFBQSxXQUFBLE1BQUE7O1lBQTJCLENBQUEsS0FBVSxJQUFWLElBQUEsQ0FBQSxLQUFnQjtVQUEzQyxDQUFFLENBQUEsQ0FBQSxDQUFGLEdBQU87O0FBQVA7QUFBQTtXQUFtRTtFQUFqRjs7RUFDVixTQUFBLEdBQVksU0FBQyxDQUFELEVBQUksQ0FBSjtBQUFVLFFBQUE7SUFBQSxDQUFBLEdBQUk7QUFBSSxTQUFBLE1BQUE7O1VBQTRCLENBQUEsQ0FBRSxDQUFGLEVBQUksQ0FBSjtRQUE1QixDQUFFLENBQUEsQ0FBQSxDQUFGLEdBQU87O0FBQVA7V0FBb0M7RUFBdEQ7O0VBRVosTUFBQSxHQUFTOztFQUVULE9BQUEsR0FBVSxTQUFDLEVBQUQsRUFBSyxLQUFMO0FBQWUsUUFBQTtXQUFBLE1BQU8sQ0FBQSxFQUFBLENBQVAsR0FBYSxLQUFBLG9DQUFvQixFQUFwQixFQUF5QixLQUF6QjtFQUE1Qjs7RUFFVixHQUFBLEdBQU0sU0FBQyxNQUFELEVBQVMsSUFBVDtBQUNGLFFBQUE7O01BRFcsT0FBTztRQUFBLE1BQUEsRUFBTyxLQUFQOzs7SUFDbEIsbUVBQWtDLEVBQWxDLEVBQUMsZUFBQSxPQUFELEVBQVUsZUFBQTtJQUNWLElBQUEsQ0FBQSxDQUFtQixPQUFBLElBQVcsT0FBOUIsQ0FBQTtBQUFBLGFBQU8sS0FBUDs7SUFHQSxJQUFBLENBQTRCLE1BQU8sQ0FBQSxPQUFBLENBQW5DO01BQUEsTUFBTyxDQUFBLE9BQUEsQ0FBUCxHQUFrQixHQUFsQjs7SUFHQSxJQUFHLE1BQU0sQ0FBQyxVQUFWO01BQ0ksT0FBQSxDQUFRLE9BQVIsRUFBaUIsTUFBTSxDQUFDLFVBQXhCLEVBREo7O0lBSUEsS0FBQSxHQUFRLFNBQUEsQ0FBVSxNQUFWLEVBQWtCLFNBQUMsQ0FBRDthQUFPLENBQUEsS0FBVSxJQUFWLElBQUEsQ0FBQSxLQUFnQjtJQUF2QixDQUFsQjtJQUNSLE9BQUEsQ0FBUSxPQUFSLEVBQWlCLEtBQWpCO0lBRUEsTUFBTyxDQUFBLE9BQUEsQ0FBUSxDQUFDLEVBQWhCLEdBQXFCO0lBR3JCLElBQXFDLE9BQUEsS0FBVyxPQUFoRDtNQUFBLE1BQU8sQ0FBQSxPQUFBLENBQVAsR0FBa0IsTUFBTyxDQUFBLE9BQUEsRUFBekI7O0lBRUEsSUFBQSxDQUF3QixJQUFJLENBQUMsTUFBN0I7TUFBQSxPQUFBLENBQVEsUUFBUixFQUFBOztXQUdBLE1BQU8sQ0FBQSxPQUFBO0VBdkJMOztFQTBCTixVQUFBLEdBQWdCLENBQUEsU0FBQTtBQUNaLFFBQUE7SUFBQSxHQUFBLEdBQU07SUFDTixNQUFBLEdBQVM7SUFDVCxLQUFBLEdBQVEsU0FBQTtNQUNKLEdBQUEsR0FBTTtNQUNOLE1BQUEsQ0FBTyxXQUFQLEVBQW9CLE1BQXBCO2FBQ0EsTUFBQSxHQUFTO0lBSEw7V0FJUixTQUFDLEVBQUQsRUFBSyxJQUFMO0FBQ0ksVUFBQTs7UUFEQyxPQUFLOztNQUNOLG9DQUFvQixDQUFFLGlCQUF0QjtBQUFBLGVBQUE7O01BQ0EsSUFBRyxNQUFPLENBQUEsRUFBQSxDQUFWO1FBQ0ksTUFBTyxDQUFBLEVBQUEsQ0FBRyxDQUFDLFFBQVgsR0FBc0IsS0FEMUI7T0FBQSxNQUFBO1FBR0ksTUFBTyxDQUFBLEVBQUEsQ0FBUCxHQUFhO1VBQ1QsRUFBQSxFQUFJLEVBREs7VUFFVCxRQUFBLEVBQVUsSUFGRDtVQUhqQjs7TUFPQSxJQUFvQixHQUFwQjtRQUFBLFlBQUEsQ0FBYSxHQUFiLEVBQUE7O01BQ0EsR0FBQSxHQUFNLFVBQUEsQ0FBVyxLQUFYLEVBQWtCLElBQWxCO2FBQ04sTUFBTSxDQUFDLElBQVAsQ0FBWSxFQUFaO0lBWEo7RUFQWSxDQUFBLENBQUgsQ0FBQTs7RUFzQmIsS0FBQSxHQUNJO0lBQUEsS0FBQSxFQUFPLFNBQUE7QUFDSCxVQUFBO01BQUEsQ0FBQSxHQUFJO0FBQUksV0FBQSxXQUFBOztZQUE0QixPQUFPLENBQVAsS0FBWTtVQUF4QyxDQUFBOztBQUFBO2FBQW1EO0lBRHhELENBQVA7SUFHQSxNQUFBLEVBQVEsU0FBQyxPQUFEO0FBQWEsYUFBTyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQVQsSUFBa0IsTUFBTyxDQUFBLE9BQUEsQ0FBUCxLQUFtQixNQUFNLENBQUM7SUFBaEUsQ0FIUjtJQUtBLE1BQUEsRUFBUSxTQUFBO0FBQ0osVUFBQTtBQUFBLFdBQUEsV0FBQTs7WUFBeUMsT0FBTyxDQUFQLEtBQVk7VUFBckQsT0FBTyxNQUFPLENBQUEsQ0FBQTs7QUFBZDtNQUNBLE9BQUEsQ0FBUSxRQUFSO2FBQ0E7SUFISSxDQUxSO0lBVUEsbUJBQUEsRUFBcUIsU0FBQyxJQUFEO01BQ2pCLE9BQUEsQ0FBUSxRQUFSO2FBQ0EsTUFBTSxDQUFDLElBQVAsR0FBYyxHQUFBLENBQUksSUFBSjtJQUZHLENBVnJCO0lBY0EsaUJBQUEsRUFBcUIsU0FBQyxRQUFEO0FBQ2pCLFVBQUE7TUFBQSxDQUFBLEdBQUk7TUFDSixPQUFBLEdBQVUsU0FBQyxDQUFEO1FBQU8sSUFBTyxDQUFQO2lCQUFBLENBQUEsR0FBQTs7TUFBUDtBQUNWLFdBQUEsMENBQUE7O1FBQUEsT0FBQSxDQUFRLEdBQUEsQ0FBSSxNQUFKLENBQVI7QUFBQTtNQUNBLE9BQUEsQ0FBUSxRQUFSO2FBQ0E7SUFMaUIsQ0FkckI7SUFxQkEsR0FBQSxFQUFLLEdBckJMO0lBc0JBLFVBQUEsRUFBWSxVQXRCWjs7O0VBd0JKLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLEtBQUEsQ0FBTSxNQUFOLEVBQWMsS0FBZDtBQWhGakIiLCJmaWxlIjoidWkvbW9kZWxzL2VudGl0eS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIlxubWVyZ2UgICA9ICh0LCBvcy4uLikgLT4gdFtrXSA9IHYgZm9yIGssdiBvZiBvIHdoZW4gdiBub3QgaW4gW251bGwsIHVuZGVmaW5lZF0gZm9yIG8gaW4gb3M7IHRcbnNoYWxsb3dpZiA9IChvLCBmKSAtPiByID0ge307IHJba10gPSB2IGZvciBrLCB2IG9mIG8gd2hlbiBmKGssdik7IHJcblxubG9va3VwID0ge31cblxuZG9tZXJnZSA9IChpZCwgcHJvcHMpIC0+IGxvb2t1cFtpZF0gPSBtZXJnZSAobG9va3VwW2lkXSA/IHt9KSwgcHJvcHNcblxuYWRkID0gKGVudGl0eSwgb3B0cyA9IHNpbGVudDpmYWxzZSkgLT5cbiAgICB7Z2FpYV9pZCwgY2hhdF9pZH0gPSBlbnRpdHk/LmlkID8ge31cbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgZ2FpYV9pZCBvciBjaGF0X2lkXG5cbiAgICAjIGVuc3VyZSB0aGVyZSBpcyBhdCBsZWFzdCBzb21ldGhpbmdcbiAgICBsb29rdXBbY2hhdF9pZF0gPSB7fSB1bmxlc3MgbG9va3VwW2NoYXRfaWRdXG5cbiAgICAjIGRlcmVmZXJlbmNlIC5wcm9wZXJ0aWVzIHRvIGJlIG9uIG1haW4gb2JqXG4gICAgaWYgZW50aXR5LnByb3BlcnRpZXNcbiAgICAgICAgZG9tZXJnZSBjaGF0X2lkLCBlbnRpdHkucHJvcGVydGllc1xuXG4gICAgIyBtZXJnZSByZXN0IG9mIHByb3BzXG4gICAgY2xvbmUgPSBzaGFsbG93aWYgZW50aXR5LCAoaykgLT4gayBub3QgaW4gWydpZCcsICdwcm9wZXJ0aWVzJ11cbiAgICBkb21lcmdlIGNoYXRfaWQsIGNsb25lXG5cbiAgICBsb29rdXBbY2hhdF9pZF0uaWQgPSBjaGF0X2lkXG5cbiAgICAjIGhhbmRsZSBkaWZmZXJlbnQgY2hhdF9pZCB0byBnYWlhX2lkXG4gICAgbG9va3VwW2dhaWFfaWRdID0gbG9va3VwW2NoYXRfaWRdIGlmIGNoYXRfaWQgIT0gZ2FpYV9pZFxuXG4gICAgdXBkYXRlZCAnZW50aXR5JyB1bmxlc3Mgb3B0cy5zaWxlbnRcblxuICAgICMgcmV0dXJuIHRoZSByZXN1bHRcbiAgICBsb29rdXBbY2hhdF9pZF1cblxuXG5uZWVkRW50aXR5ID0gZG8gLT5cbiAgICB0aW0gPSBudWxsXG4gICAgZ2F0aGVyID0gW11cbiAgICBmZXRjaCA9IC0+XG4gICAgICAgIHRpbSA9IG51bGxcbiAgICAgICAgYWN0aW9uICdnZXRlbnRpdHknLCBnYXRoZXJcbiAgICAgICAgZ2F0aGVyID0gW11cbiAgICAoaWQsIHdhaXQ9MTAwMCkgLT5cbiAgICAgICAgcmV0dXJuIGlmIGxvb2t1cFtpZF0/LmZldGNoaW5nXG4gICAgICAgIGlmIGxvb2t1cFtpZF1cbiAgICAgICAgICAgIGxvb2t1cFtpZF0uZmV0Y2hpbmcgPSB0cnVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGxvb2t1cFtpZF0gPSB7XG4gICAgICAgICAgICAgICAgaWQ6IGlkXG4gICAgICAgICAgICAgICAgZmV0Y2hpbmc6IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2xlYXJUaW1lb3V0IHRpbSBpZiB0aW1cbiAgICAgICAgdGltID0gc2V0VGltZW91dCBmZXRjaCwgd2FpdFxuICAgICAgICBnYXRoZXIucHVzaCBpZFxuXG5cblxuZnVuY3MgPVxuICAgIGNvdW50OiAtPlxuICAgICAgICBjID0gMDsgKGMrKyBmb3IgaywgdiBvZiBsb29rdXAgd2hlbiB0eXBlb2YgdiA9PSAnb2JqZWN0Jyk7IGNcblxuICAgIGlzU2VsZjogKGNoYXRfaWQpIC0+IHJldHVybiAhIWxvb2t1cC5zZWxmIGFuZCBsb29rdXBbY2hhdF9pZF0gPT0gbG9va3VwLnNlbGZcblxuICAgIF9yZXNldDogLT5cbiAgICAgICAgZGVsZXRlIGxvb2t1cFtrXSBmb3IgaywgdiBvZiBsb29rdXAgd2hlbiB0eXBlb2YgdiA9PSAnb2JqZWN0J1xuICAgICAgICB1cGRhdGVkICdlbnRpdHknXG4gICAgICAgIG51bGxcblxuICAgIF9pbml0RnJvbVNlbGZFbnRpdHk6IChzZWxmKSAtPlxuICAgICAgICB1cGRhdGVkICdlbnRpdHknXG4gICAgICAgIGxvb2t1cC5zZWxmID0gYWRkIHNlbGZcblxuICAgIF9pbml0RnJvbUVudGl0aWVzOiAgIChlbnRpdGllcykgLT5cbiAgICAgICAgYyA9IDBcbiAgICAgICAgY291bnRJZiA9IChhKSAtPiBjKysgaWYgYVxuICAgICAgICBjb3VudElmIGFkZCBlbnRpdHkgZm9yIGVudGl0eSBpbiBlbnRpdGllc1xuICAgICAgICB1cGRhdGVkICdlbnRpdHknXG4gICAgICAgIGNcblxuICAgIGFkZDogYWRkXG4gICAgbmVlZEVudGl0eTogbmVlZEVudGl0eVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1lcmdlIGxvb2t1cCwgZnVuY3NcbiJdfQ==
