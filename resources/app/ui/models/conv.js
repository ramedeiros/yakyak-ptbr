(function() {
  var HISTORY_AMOUNT, MAX_UNREAD, add, addChatMessage, addChatMessagePlaceholder, addTyping, addWatermark, domerge, entity, findByEventId, findClientGenerated, funcs, getProxiedName, isEventType, isPureHangout, isQuiet, isStarred, lastChanged, later, lookup, merge, nameof, nameofconv, pruneTyping, ref, rename, sortby, starredconvs, toggleStar, tryparse, uniqfn, unread, unreadTotal, viewstate,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  entity = require('./entity');

  viewstate = require('./viewstate');

  ref = require('../util'), nameof = ref.nameof, nameofconv = ref.nameofconv, getProxiedName = ref.getProxiedName, later = ref.later, uniqfn = ref.uniqfn, tryparse = ref.tryparse;

  merge = function() {
    var j, k, len1, o, os, t, v;
    t = arguments[0], os = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    for (j = 0, len1 = os.length; j < len1; j++) {
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

  lookup = {};

  domerge = function(id, props) {
    var ref1;
    return lookup[id] = merge((ref1 = lookup[id]) != null ? ref1 : {}, props);
  };

  add = function(conv) {
    var conversation, event, id, j, len1, p, ref1, ref2, ref3, ref4;
    if (conv != null ? (ref1 = conv.conversation) != null ? (ref2 = ref1.conversation_id) != null ? ref2.id : void 0 : void 0 : void 0) {
      conversation = conv.conversation, event = conv.event;
      conv = conversation;
      conv.event = event;
    }
    id = (conv.conversation_id || conv.id).id;
    domerge(id, conv);
    if (conv.event < 20) {
      conv.nomorehistory = true;
    }
    ref4 = (ref3 = conv != null ? conv.participant_data : void 0) != null ? ref3 : [];
    for (j = 0, len1 = ref4.length; j < len1; j++) {
      p = ref4[j];
      entity.add(p);
    }
    return lookup[id];
  };

  rename = function(conv, newname) {
    var id;
    id = conv.conversation_id.id;
    lookup[id].name = newname;
    return updated('conv');
  };

  addChatMessage = function(msg) {
    var conv, cpos, id, ref1, ref2, ref3, ref4;
    id = ((ref1 = msg.conversation_id) != null ? ref1 : {}).id;
    if (!id) {
      return;
    }
    conv = lookup[id];
    if (!conv) {
      conv = lookup[id] = {
        conversation_id: {
          id: id
        },
        event: [],
        self_conversation_state: {
          sort_timestamp: 0
        }
      };
    }
    if (!conv.event) {
      conv.event = [];
    }
    cpos = findClientGenerated(conv, msg != null ? (ref2 = msg.self_event_state) != null ? ref2.client_generated_id : void 0 : void 0);
    if (!cpos) {
      cpos = findByEventId(conv, msg.event_id);
    }
    if (cpos) {
      conv.event[cpos] = msg;
    } else {
      conv.event.push(msg);
    }
    if (conv != null) {
      if ((ref3 = conv.self_conversation_state) != null) {
        ref3.sort_timestamp = (ref4 = msg.timestamp) != null ? ref4 : Date.now() * 1000;
      }
    }
    unreadTotal();
    updated('conv');
    return conv;
  };

  findClientGenerated = function(conv, client_generated_id) {
    var e, i, j, len1, ref1, ref2, ref3;
    if (!client_generated_id) {
      return;
    }
    ref2 = (ref1 = conv.event) != null ? ref1 : [];
    for (i = j = 0, len1 = ref2.length; j < len1; i = ++j) {
      e = ref2[i];
      if (((ref3 = e.self_event_state) != null ? ref3.client_generated_id : void 0) === client_generated_id) {
        return i;
      }
    }
  };

  findByEventId = function(conv, event_id) {
    var e, i, j, len1, ref1, ref2;
    if (!event_id) {
      return;
    }
    ref2 = (ref1 = conv.event) != null ? ref1 : [];
    for (i = j = 0, len1 = ref2.length; j < len1; i = ++j) {
      e = ref2[i];
      if (e.event_id === event_id) {
        return i;
      }
    }
  };

  addChatMessagePlaceholder = function(chat_id, arg) {
    var client_generated_id, conv_id, ev, islater, ref1, ref2, segsj, sr, ts, uploadimage;
    conv_id = arg.conv_id, client_generated_id = arg.client_generated_id, segsj = arg.segsj, ts = arg.ts, uploadimage = arg.uploadimage;
    ts = ts * 1000;
    ev = {
      chat_message: {
        message_content: {
          segment: segsj
        }
      },
      conversation_id: {
        id: conv_id
      },
      self_event_state: {
        client_generated_id: client_generated_id
      },
      sender_id: {
        chat_id: chat_id,
        gaia_id: chat_id
      },
      timestamp: ts,
      placeholder: true,
      uploadimage: uploadimage
    };
    sr = (ref1 = lookup[conv_id]) != null ? (ref2 = ref1.self_conversation_state) != null ? ref2.self_read_state : void 0 : void 0;
    islater = ts > (sr != null ? sr.latest_read_timestamp : void 0);
    if (sr && islater) {
      sr.latest_read_timestamp = ts;
    }
    return addChatMessage(ev);
  };

  addWatermark = function(ev) {
    var conv, conv_id, islater, latest_read_timestamp, participant_id, ref1, ref2, rev, sr, uniq;
    conv_id = ev != null ? (ref1 = ev.conversation_id) != null ? ref1.id : void 0 : void 0;
    if (!(conv_id && (conv = lookup[conv_id]))) {
      return;
    }
    if (!conv.read_state) {
      conv.read_state = [];
    }
    participant_id = ev.participant_id, latest_read_timestamp = ev.latest_read_timestamp;
    conv.read_state.push({
      participant_id: participant_id,
      latest_read_timestamp: latest_read_timestamp
    });
    if (conv.read_state.length > 200) {
      rev = conv.read_state.reverse();
      uniq = uniqfn(rev, function(e) {
        return e.participant_id.chat_id;
      });
      conv.read_state = uniq.reverse();
    }
    sr = conv != null ? (ref2 = conv.self_conversation_state) != null ? ref2.self_read_state : void 0 : void 0;
    islater = latest_read_timestamp > (sr != null ? sr.latest_read_timestamp : void 0);
    if (entity.isSelf(participant_id.chat_id) && sr && islater) {
      sr.latest_read_timestamp = latest_read_timestamp;
    }
    unreadTotal();
    return updated('conv');
  };

  uniqfn = function(as, fn) {
    var bs;
    bs = as.map(fn);
    return as.filter(function(e, i) {
      return bs.indexOf(bs[i]) === i;
    });
  };

  sortby = function(conv) {
    var ref1, ref2;
    return (ref1 = conv != null ? (ref2 = conv.self_conversation_state) != null ? ref2.sort_timestamp : void 0 : void 0) != null ? ref1 : 0;
  };

  MAX_UNREAD = 20;

  unread = function(conv) {
    var c, e, j, len1, ref1, ref2, ref3, ref4, t;
    t = conv != null ? (ref1 = conv.self_conversation_state) != null ? (ref2 = ref1.self_read_state) != null ? ref2.latest_read_timestamp : void 0 : void 0 : void 0;
    if (typeof t !== 'number') {
      return 0;
    }
    c = 0;
    ref4 = (ref3 = conv != null ? conv.event : void 0) != null ? ref3 : [];
    for (j = 0, len1 = ref4.length; j < len1; j++) {
      e = ref4[j];
      if (e.chat_message && e.timestamp > t) {
        c++;
      }
      if (c >= MAX_UNREAD) {
        return MAX_UNREAD;
      }
    }
    return c;
  };

  unreadTotal = (function() {
    var current, orMore;
    current = 0;
    orMore = false;
    return function() {
      var countunread, newTotal, sum;
      sum = function(a, b) {
        return a + b;
      };
      orMore = false;
      countunread = function(c) {
        var count;
        if (isQuiet(c)) {
          return 0;
        }
        count = funcs.unread(c);
        if (count === MAX_UNREAD) {
          orMore = true;
        }
        return count;
      };
      newTotal = funcs.list(false).map(countunread).reduce(sum, 0);
      if (current !== newTotal) {
        current = newTotal;
        later(function() {
          return action('unreadtotal', newTotal, orMore);
        });
      }
      return newTotal;
    };
  })();

  isQuiet = function(c) {
    var ref1;
    return (c != null ? (ref1 = c.self_conversation_state) != null ? ref1.notification_level : void 0 : void 0) === 'QUIET';
  };

  starredconvs = tryparse(localStorage.starredconvs) || [];

  isStarred = function(c) {
    var ref1, ref2;
    return ref1 = c != null ? (ref2 = c.conversation_id) != null ? ref2.id : void 0 : void 0, indexOf.call(starredconvs, ref1) >= 0;
  };

  toggleStar = function(c) {
    var i, id;
    id = c != null ? c.conversation_id.id : void 0;
    if (indexOf.call(starredconvs, id) < 0) {
      starredconvs.push(id);
    } else {
      starredconvs = (function() {
        var j, len1, results;
        results = [];
        for (j = 0, len1 = starredconvs.length; j < len1; j++) {
          i = starredconvs[j];
          if (i !== id) {
            results.push(i);
          }
        }
        return results;
      })();
    }
    localStorage.starredconvs = JSON.stringify(starredconvs);
    return updated('conv');
  };

  isEventType = function(type) {
    return function(ev) {
      return !!ev[type];
    };
  };

  isPureHangout = (function() {
    var isNotHangout, nots;
    nots = ['chat_message', 'conversation_rename'].map(isEventType);
    isNotHangout = function(e) {
      return nots.some(function(f) {
        return f(e);
      });
    };
    return function(c) {
      var ref1;
      return !((ref1 = c != null ? c.event : void 0) != null ? ref1 : []).some(isNotHangout);
    };
  })();

  lastChanged = function(c) {
    var ref1, ref2, ref3, ref4, ref5;
    return ((ref1 = c != null ? (ref2 = c.event) != null ? (ref3 = ref2[((ref4 = c != null ? (ref5 = c.event) != null ? ref5.length : void 0 : void 0) != null ? ref4 : 0) - 1]) != null ? ref3.timestamp : void 0 : void 0 : void 0) != null ? ref1 : 0) / 1000;
  };

  HISTORY_AMOUNT = 20;

  addTyping = function(typing) {
    var c, conv_id, len, ref1;
    conv_id = typing != null ? (ref1 = typing.conversation_id) != null ? ref1.id : void 0 : void 0;
    if (entity.isSelf(typing.user_id.chat_id)) {
      return;
    }
    if (!(c = lookup[conv_id])) {
      return;
    }
    if (!c.typing) {
      c.typing = [];
    }
    len = c.typing.length;
    c.typing.unshift(typing);
    c.typing = uniqfn(c.typing, function(t) {
      return t.user_id.chat_id;
    });
    c.typing.sort(function(t1, t2) {
      return t1.user_id.chat_id - t2.user_id.chat_id;
    });
    later(function() {
      return action('pruneTyping', conv_id);
    });
    updated('conv');
    if (len === 0) {
      return updated('startTyping');
    }
  };

  pruneTyping = (function() {
    var KEEP_OTHERS, KEEP_STOPPED, findNext, keepFor, prune;
    findNext = function(arr) {
      var expiry, i, j, len1, next, t;
      expiry = arr.map(function(t) {
        return t.timestamp + keepFor(t);
      });
      for (i = j = 0, len1 = expiry.length; j < len1; i = ++j) {
        t = expiry[i];
        if (!next || expiry[i] < expiry[next]) {
          next = i;
        }
      }
      return next;
    };
    KEEP_STOPPED = 1500;
    KEEP_OTHERS = 10000;
    keepFor = function(t) {
      if ((t != null ? t.status : void 0) === 'STOPPED') {
        return KEEP_STOPPED;
      } else {
        return KEEP_OTHERS;
      }
    };
    prune = function(t) {
      return (Date.now() - (t != null ? t.timestamp : void 0) / 1000) < keepFor(t);
    };
    return function(conv_id) {
      var c, lengthBefore, next, nextidx, waitUntil;
      if (!(c = lookup[conv_id])) {
        return;
      }
      if (c.typingtimer) {
        c.typingtimer = clearTimeout(c.typingtimer);
      }
      lengthBefore = c.typing.length;
      c.typing = c.typing.filter(prune);
      if (c.typing.length !== lengthBefore) {
        updated('conv');
      }
      if (!((nextidx = findNext(c.typing)) >= 0)) {
        return;
      }
      next = c.typing[nextidx];
      waitUntil = (keepFor(next) + next.timestamp / 1000) - Date.now();
      if (waitUntil < 0) {
        return console.error('escrevendo erro suprimido', waitUntil);
      }
      return c.typingtimer = setTimeout((function() {
        return action('pruneTyping', conv_id);
      }), waitUntil);
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
    _reset: function() {
      var k, v;
      for (k in lookup) {
        v = lookup[k];
        if (typeof v === 'object') {
          delete lookup[k];
        }
      }
      updated('conv');
      return null;
    },
    _initFromConvStates: function(convs) {
      var c, conv, countIf, j, len1;
      c = 0;
      countIf = function(a) {
        if (a) {
          return c++;
        }
      };
      for (j = 0, len1 = convs.length; j < len1; j++) {
        conv = convs[j];
        countIf(add(conv));
      }
      updated('conv');
      return c;
    },
    add: add,
    rename: rename,
    addChatMessage: addChatMessage,
    addChatMessagePlaceholder: addChatMessagePlaceholder,
    addWatermark: addWatermark,
    MAX_UNREAD: MAX_UNREAD,
    unread: unread,
    isQuiet: isQuiet,
    isStarred: isStarred,
    toggleStar: toggleStar,
    isPureHangout: isPureHangout,
    lastChanged: lastChanged,
    addTyping: addTyping,
    pruneTyping: pruneTyping,
    unreadTotal: unreadTotal,
    setNotificationLevel: function(conv_id, level) {
      var c, ref1;
      if (!(c = lookup[conv_id])) {
        return;
      }
      if ((ref1 = c.self_conversation_state) != null) {
        ref1.notification_level = level;
      }
      return updated('conv');
    },
    deleteConv: function(conv_id) {
      var c;
      if (!(c = lookup[conv_id])) {
        return;
      }
      delete lookup[conv_id];
      viewstate.setSelectedConv(null);
      return updated('conv');
    },
    removeParticipants: function(conv_id, ids) {
      var c, getId, p;
      if (!(c = lookup[conv_id])) {
        return;
      }
      getId = function(p) {
        return p.id.chat_id || p.id.gaia_id;
      };
      return c.participant_data = (function() {
        var j, len1, ref1, ref2, results;
        ref1 = c.participant_data;
        results = [];
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          p = ref1[j];
          if (ref2 = getId(p), indexOf.call(ids, ref2) < 0) {
            results.push(p);
          }
        }
        return results;
      })();
    },
    addParticipant: function(conv_id, participant) {
      var c;
      if (!(c = lookup[conv_id])) {
        return;
      }
      return c.participant_data.push(participant);
    },
    replaceFromStates: function(states) {
      var j, len1, st;
      for (j = 0, len1 = states.length; j < len1; j++) {
        st = states[j];
        add(st);
      }
      return updated('conv');
    },
    updateAtTop: function(attop) {
      var c, conv_id, ref1, ref2, ref3, timestamp;
      if (viewstate.state !== viewstate.STATE_NORMAL) {
        return;
      }
      conv_id = viewstate != null ? viewstate.selectedConv : void 0;
      if (attop && (c = lookup[conv_id]) && !(c != null ? c.nomorehistory : void 0) && !(c != null ? c.requestinghistory : void 0)) {
        timestamp = ((ref1 = (ref2 = c.event) != null ? (ref3 = ref2[0]) != null ? ref3.timestamp : void 0 : void 0) != null ? ref1 : 0) / 1000;
        if (!timestamp) {
          return;
        }
        c.requestinghistory = true;
        later(function() {
          return action('history', conv_id, timestamp, HISTORY_AMOUNT);
        });
        return updated('conv');
      }
    },
    updateHistory: function(state) {
      var c, conv_id, event, ref1, ref2;
      conv_id = state != null ? (ref1 = state.conversation_id) != null ? ref1.id : void 0 : void 0;
      if (!(c = lookup[conv_id])) {
        return;
      }
      c.requestinghistory = false;
      event = state != null ? state.event : void 0;
      c.event = (event != null ? event : []).concat((ref2 = c.event) != null ? ref2 : []);
      if ((event != null ? event.length : void 0) === 0) {
        c.nomorehistory = true;
      }
      updated('beforeHistory');
      updated('conv');
      return updated('afterHistory');
    },
    updatePlaceholderImage: function(arg) {
      var c, client_generated_id, conv_id, cpos, ev, path, seg;
      conv_id = arg.conv_id, client_generated_id = arg.client_generated_id, path = arg.path;
      if (!(c = lookup[conv_id])) {
        return;
      }
      cpos = findClientGenerated(c, client_generated_id);
      ev = c.event[cpos];
      seg = ev.chat_message.message_content.segment[0];
      seg.link_data = {
        link_target: path
      };
      return updated('conv');
    },
    list: function(sort) {
      var c, convs, k, starred, v;
      if (sort == null) {
        sort = true;
      }
      convs = (function() {
        var results;
        results = [];
        for (k in lookup) {
          v = lookup[k];
          if (typeof v === 'object') {
            results.push(v);
          }
        }
        return results;
      })();
      if (sort) {
        starred = (function() {
          var j, len1, results;
          results = [];
          for (j = 0, len1 = convs.length; j < len1; j++) {
            c = convs[j];
            if (isStarred(c)) {
              results.push(c);
            }
          }
          return results;
        })();
        convs = (function() {
          var j, len1, results;
          results = [];
          for (j = 0, len1 = convs.length; j < len1; j++) {
            c = convs[j];
            if (!isStarred(c)) {
              results.push(c);
            }
          }
          return results;
        })();
        starred.sort(function(e1, e2) {
          return nameofconv(e1).localeCompare(nameofconv(e2));
        });
        convs.sort(function(e1, e2) {
          return sortby(e2) - sortby(e1);
        });
        return starred.concat(convs);
      }
      return convs;
    }
  };

  module.exports = merge(lookup, funcs);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVpL21vZGVscy9jb252LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsb1lBQUE7SUFBQTs7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztFQUNULFNBQUEsR0FBWSxPQUFBLENBQVEsYUFBUjs7RUFDWixNQUFpRSxPQUFBLENBQVEsU0FBUixDQUFqRSxFQUFDLGFBQUEsTUFBRCxFQUFTLGlCQUFBLFVBQVQsRUFBcUIscUJBQUEsY0FBckIsRUFBcUMsWUFBQSxLQUFyQyxFQUE0QyxhQUFBLE1BQTVDLEVBQW9ELGVBQUE7O0VBRXBELEtBQUEsR0FBVSxTQUFBO0FBQWMsUUFBQTtJQUFiLGtCQUFHO0FBQVUsU0FBQSxzQ0FBQTs7QUFBQSxXQUFBLE1BQUE7O1lBQTJCLENBQUEsS0FBVSxJQUFWLElBQUEsQ0FBQSxLQUFnQjtVQUEzQyxDQUFFLENBQUEsQ0FBQSxDQUFGLEdBQU87O0FBQVA7QUFBQTtXQUFtRTtFQUFqRjs7RUFFVixNQUFBLEdBQVM7O0VBRVQsT0FBQSxHQUFVLFNBQUMsRUFBRCxFQUFLLEtBQUw7QUFBZSxRQUFBO1dBQUEsTUFBTyxDQUFBLEVBQUEsQ0FBUCxHQUFhLEtBQUEsc0NBQW9CLEVBQXBCLEVBQXlCLEtBQXpCO0VBQTVCOztFQUVWLEdBQUEsR0FBTSxTQUFDLElBQUQ7QUFFRixRQUFBO0lBQUEsb0dBQXNDLENBQUUsNkJBQXhDO01BQ0ssb0JBQUEsWUFBRCxFQUFlLGFBQUE7TUFDZixJQUFBLEdBQU87TUFDUCxJQUFJLENBQUMsS0FBTCxHQUFhLE1BSGpCOztJQUlDLEtBQU0sQ0FBQSxJQUFJLENBQUMsZUFBTCxJQUF3QixJQUFJLENBQUMsRUFBN0IsRUFBTjtJQUNELE9BQUEsQ0FBUSxFQUFSLEVBQVksSUFBWjtJQUdBLElBQTZCLElBQUksQ0FBQyxLQUFMLEdBQWEsRUFBMUM7TUFBQSxJQUFJLENBQUMsYUFBTCxHQUFxQixLQUFyQjs7QUFHQTtBQUFBLFNBQUEsd0NBQUE7O01BQUEs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O2dCQUFzQixTQUFBLENBQVUsQ0FBVjsyQkFBdEI7O0FBQUE7OztRQUNYLEtBQUE7O0FBQVM7ZUFBQSx5Q0FBQTs7Z0JBQXNCLENBQUksU0FBQSxDQUFVLENBQVY7MkJBQTFCOztBQUFBOzs7UUFDVCxPQUFPLENBQUMsSUFBUixDQUFhLFNBQUMsRUFBRCxFQUFLLEVBQUw7aUJBQVksVUFBQSxDQUFXLEVBQVgsQ0FBYyxDQUFDLGFBQWYsQ0FBNkIsVUFBQSxDQUFXLEVBQVgsQ0FBN0I7UUFBWixDQUFiO1FBQ0EsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFDLEVBQUQsRUFBSyxFQUFMO2lCQUFZLE1BQUEsQ0FBTyxFQUFQLENBQUEsR0FBYSxNQUFBLENBQU8sRUFBUDtRQUF6QixDQUFYO0FBQ0EsZUFBTyxPQUFPLENBQUMsTUFBUixDQUFlLEtBQWYsRUFMWDs7YUFNQTtJQVJFLENBMUZOOzs7RUFzR0osTUFBTSxDQUFDLE9BQVAsR0FBaUIsS0FBQSxDQUFNLE1BQU4sRUFBYyxLQUFkO0FBdlZqQiIsImZpbGUiOiJ1aS9tb2RlbHMvY29udi5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImVudGl0eSA9IHJlcXVpcmUgJy4vZW50aXR5JyAgICAgI1xudmlld3N0YXRlID0gcmVxdWlyZSAnLi92aWV3c3RhdGUnXG57bmFtZW9mLCBuYW1lb2Zjb252LCBnZXRQcm94aWVkTmFtZSwgbGF0ZXIsIHVuaXFmbiwgdHJ5cGFyc2V9ICA9IHJlcXVpcmUgJy4uL3V0aWwnXG5cbm1lcmdlICAgPSAodCwgb3MuLi4pIC0+IHRba10gPSB2IGZvciBrLHYgb2YgbyB3aGVuIHYgbm90IGluIFtudWxsLCB1bmRlZmluZWRdIGZvciBvIGluIG9zOyB0XG5cbmxvb2t1cCA9IHt9XG5cbmRvbWVyZ2UgPSAoaWQsIHByb3BzKSAtPiBsb29rdXBbaWRdID0gbWVyZ2UgKGxvb2t1cFtpZF0gPyB7fSksIHByb3BzXG5cbmFkZCA9IChjb252KSAtPlxuICAgICMgcmVqaWcgdGhlIHN0cnVjdHVyZSBzaW5jZSBpdCdzIGluc2FuZVxuICAgIGlmIGNvbnY/LmNvbnZlcnNhdGlvbj8uY29udmVyc2F0aW9uX2lkPy5pZFxuICAgICAgICB7Y29udmVyc2F0aW9uLCBldmVudH0gPSBjb252XG4gICAgICAgIGNvbnYgPSBjb252ZXJzYXRpb25cbiAgICAgICAgY29udi5ldmVudCA9IGV2ZW50XG4gICAge2lkfSA9IGNvbnYuY29udmVyc2F0aW9uX2lkIG9yIGNvbnYuaWRcbiAgICBkb21lcmdlIGlkLCBjb252XG4gICAgIyB3ZSBtYXJrIGNvbnZlcnNhdGlvbnMgd2l0aCBmZXcgZXZlbnRzIHRvIGtub3cgdGhhdCB0aGV5IGRlZmluaXRlbHlcbiAgICAjIGdvdCBubyBtb3JlIGhpc3RvcnkuXG4gICAgY29udi5ub21vcmVoaXN0b3J5ID0gdHJ1ZSBpZiBjb252LmV2ZW50IDwgMjBcbiAgICAjIHBhcnRpY2lwYW50X2RhdGEgY29udGFpbnMgZW50aXR5IGluZm9ybWF0aW9uXG4gICAgIyB3ZSB3YW50IGluIHRoZSBlbnRpdHkgbG9va3VwXG4gICAgZW50aXR5LmFkZCBwIGZvciBwIGluIGNvbnY/LnBhcnRpY2lwYW50X2RhdGEgPyBbXVxuICAgIGxvb2t1cFtpZF1cblxucmVuYW1lID0gKGNvbnYsIG5ld25hbWUpIC0+XG4gICAge2lkfSA9IGNvbnYuY29udmVyc2F0aW9uX2lkXG4gICAgbG9va3VwW2lkXS5uYW1lID0gbmV3bmFtZVxuICAgIHVwZGF0ZWQgJ2NvbnYnXG5cbmFkZENoYXRNZXNzYWdlID0gKG1zZykgLT5cbiAgICB7aWR9ID0gbXNnLmNvbnZlcnNhdGlvbl9pZCA/IHt9XG4gICAgcmV0dXJuIHVubGVzcyBpZFxuICAgIGNvbnYgPSBsb29rdXBbaWRdXG4gICAgdW5sZXNzIGNvbnZcbiAgICAgICAgIyBhIGNoYXQgbWVzc2FnZSB0aGF0IGJlbG9uZ3MgdG8gbm8gY29udmVyc2F0aW9uLiBjdXJpb3VzLlxuICAgICAgICAjIG1ha2Ugc29tZXRoaW5nIHNrZWxldGFsIGp1c3QgdG8gaG9sZCB0aGUgbmV3IG1lc3NhZ2VcbiAgICAgICAgY29udiA9IGxvb2t1cFtpZF0gPSB7XG4gICAgICAgICAgICBjb252ZXJzYXRpb25faWQ6IHtpZH1cbiAgICAgICAgICAgIGV2ZW50OiBbXVxuICAgICAgICAgICAgc2VsZl9jb252ZXJzYXRpb25fc3RhdGU6c29ydF90aW1lc3RhbXA6MFxuICAgICAgICB9XG4gICAgY29udi5ldmVudCA9IFtdIHVubGVzcyBjb252LmV2ZW50XG4gICAgIyB3ZSBjYW4gYWRkIG1lc3NhZ2UgcGxhY2Vob2xkZXIgdGhhdCBuZWVkcyByZXBsYWNpbmcgd2hlblxuICAgICMgdGhlIHJlYWwgZXZlbnQgZHJvcHMgaW4uIGlmIHdlIGZpbmQgdGhlIHNhbWUgZXZlbnQgaWQuXG4gICAgY3BvcyA9IGZpbmRDbGllbnRHZW5lcmF0ZWQgY29udiwgbXNnPy5zZWxmX2V2ZW50X3N0YXRlPy5jbGllbnRfZ2VuZXJhdGVkX2lkXG4gICAgdW5sZXNzIGNwb3NcbiAgICAgICAgY3BvcyA9IGZpbmRCeUV2ZW50SWQgY29udiwgbXNnLmV2ZW50X2lkXG4gICAgaWYgY3Bvc1xuICAgICAgICAjIHJlcGxhY2UgZXZlbnQgYnkgcG9zaXRpb25cbiAgICAgICAgY29udi5ldmVudFtjcG9zXSA9IG1zZ1xuICAgIGVsc2VcbiAgICAgICAgIyBhZGQgbGFzdFxuICAgICAgICBjb252LmV2ZW50LnB1c2ggbXNnXG4gICAgIyB1cGRhdGUgdGhlIHNvcnQgdGltZXN0YW1wIHRvIGxpc3QgY29udiBmaXJzdFxuICAgIGNvbnY/LnNlbGZfY29udmVyc2F0aW9uX3N0YXRlPy5zb3J0X3RpbWVzdGFtcCA9IG1zZy50aW1lc3RhbXAgPyAoRGF0ZS5ub3coKSAqIDEwMDApXG4gICAgdW5yZWFkVG90YWwoKVxuICAgIHVwZGF0ZWQgJ2NvbnYnXG4gICAgY29udlxuXG5maW5kQ2xpZW50R2VuZXJhdGVkID0gKGNvbnYsIGNsaWVudF9nZW5lcmF0ZWRfaWQpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBjbGllbnRfZ2VuZXJhdGVkX2lkXG4gICAgZm9yIGUsIGkgaW4gY29udi5ldmVudCA/IFtdXG4gICAgICAgIHJldHVybiBpIGlmIGUuc2VsZl9ldmVudF9zdGF0ZT8uY2xpZW50X2dlbmVyYXRlZF9pZCA9PSBjbGllbnRfZ2VuZXJhdGVkX2lkXG5cbmZpbmRCeUV2ZW50SWQgPSAoY29udiwgZXZlbnRfaWQpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBldmVudF9pZFxuICAgIGZvciBlLCBpIGluIGNvbnYuZXZlbnQgPyBbXVxuICAgICAgICByZXR1cm4gaSBpZiBlLmV2ZW50X2lkID09IGV2ZW50X2lkXG5cblxuIyB0aGlzIGlzIHVzZWQgd2hlbiBzZW5kaW5nIG5ldyBtZXNzYWdlcywgd2UgYWRkIGEgcGxhY2Vob2xkZXIgd2l0aFxuIyB0aGUgY29ycmVjdCBjbGllbnRfZ2VuZXJhdGVkX2lkLiB0aGlzIGVudHJ5IHdpbGwgYmUgcmVwbGFjZWQgaW5cbiMgYWRkQ2hhdE1lc3NhZ2Ugd2hlbiB0aGUgcmVhbCBtZXNzYWdlIGFycml2ZXMgZnJvbSB0aGUgc2VydmVyLlxuYWRkQ2hhdE1lc3NhZ2VQbGFjZWhvbGRlciA9IChjaGF0X2lkLCB7Y29udl9pZCwgY2xpZW50X2dlbmVyYXRlZF9pZCwgc2Vnc2osIHRzLCB1cGxvYWRpbWFnZX0pIC0+XG4gICAgdHMgPSB0cyAqIDEwMDAgIyBnb29nIGZvcm1cbiAgICBldiA9XG4gICAgICAgIGNoYXRfbWVzc2FnZTptZXNzYWdlX2NvbnRlbnQ6c2VnbWVudDpzZWdzalxuICAgICAgICBjb252ZXJzYXRpb25faWQ6aWQ6Y29udl9pZFxuICAgICAgICBzZWxmX2V2ZW50X3N0YXRlOmNsaWVudF9nZW5lcmF0ZWRfaWQ6Y2xpZW50X2dlbmVyYXRlZF9pZFxuICAgICAgICBzZW5kZXJfaWQ6XG4gICAgICAgICAgICBjaGF0X2lkOmNoYXRfaWRcbiAgICAgICAgICAgIGdhaWFfaWQ6Y2hhdF9pZFxuICAgICAgICB0aW1lc3RhbXA6dHNcbiAgICAgICAgcGxhY2Vob2xkZXI6dHJ1ZVxuICAgICAgICB1cGxvYWRpbWFnZTp1cGxvYWRpbWFnZVxuICAgICMgbGV0cyBzYXkgdGhpcyBpcyBhbHNvIHJlYWQgdG8gYXZvaWQgYW55IGJhZGdlc1xuICAgIHNyID0gbG9va3VwW2NvbnZfaWRdPy5zZWxmX2NvbnZlcnNhdGlvbl9zdGF0ZT8uc2VsZl9yZWFkX3N0YXRlXG4gICAgaXNsYXRlciA9IHRzID4gc3I/LmxhdGVzdF9yZWFkX3RpbWVzdGFtcFxuICAgIHNyLmxhdGVzdF9yZWFkX3RpbWVzdGFtcCA9IHRzIGlmIHNyIGFuZCBpc2xhdGVyXG4gICAgIyB0aGlzIHRyaWdnZXJzIHRoZSBtb2RlbCB1cGRhdGVcbiAgICBhZGRDaGF0TWVzc2FnZSBldlxuXG5hZGRXYXRlcm1hcmsgPSAoZXYpIC0+XG4gICAgY29udl9pZCA9IGV2Py5jb252ZXJzYXRpb25faWQ/LmlkXG4gICAgcmV0dXJuIHVubGVzcyBjb252X2lkIGFuZCBjb252ID0gbG9va3VwW2NvbnZfaWRdXG4gICAgY29udi5yZWFkX3N0YXRlID0gW10gdW5sZXNzIGNvbnYucmVhZF9zdGF0ZVxuICAgIHtwYXJ0aWNpcGFudF9pZCwgbGF0ZXN0X3JlYWRfdGltZXN0YW1wfSA9IGV2XG4gICAgY29udi5yZWFkX3N0YXRlLnB1c2gge1xuICAgICAgICBwYXJ0aWNpcGFudF9pZFxuICAgICAgICBsYXRlc3RfcmVhZF90aW1lc3RhbXBcbiAgICB9XG4gICAgIyBwYWNrIHRoZSByZWFkX3N0YXRlIGJ5IGtlZXBpbmcgdGhlIGxhc3Qgb2YgZWFjaCBwYXJ0aWNpcGFudF9pZFxuICAgIGlmIGNvbnYucmVhZF9zdGF0ZS5sZW5ndGggPiAyMDBcbiAgICAgICAgcmV2ID0gY29udi5yZWFkX3N0YXRlLnJldmVyc2UoKVxuICAgICAgICB1bmlxID0gdW5pcWZuIHJldiwgKGUpIC0+IGUucGFydGljaXBhbnRfaWQuY2hhdF9pZFxuICAgICAgICBjb252LnJlYWRfc3RhdGUgPSB1bmlxLnJldmVyc2UoKVxuICAgIHNyID0gY29udj8uc2VsZl9jb252ZXJzYXRpb25fc3RhdGU/LnNlbGZfcmVhZF9zdGF0ZVxuICAgIGlzbGF0ZXIgPSBsYXRlc3RfcmVhZF90aW1lc3RhbXAgPiBzcj8ubGF0ZXN0X3JlYWRfdGltZXN0YW1wXG4gICAgaWYgZW50aXR5LmlzU2VsZihwYXJ0aWNpcGFudF9pZC5jaGF0X2lkKSBhbmQgc3IgYW5kIGlzbGF0ZXJcbiAgICAgICAgc3IubGF0ZXN0X3JlYWRfdGltZXN0YW1wID0gbGF0ZXN0X3JlYWRfdGltZXN0YW1wXG4gICAgdW5yZWFkVG90YWwoKVxuICAgIHVwZGF0ZWQgJ2NvbnYnXG5cbnVuaXFmbiA9IChhcywgZm4pIC0+IGJzID0gYXMubWFwIGZuOyBhcy5maWx0ZXIgKGUsIGkpIC0+IGJzLmluZGV4T2YoYnNbaV0pID09IGlcblxuc29ydGJ5ID0gKGNvbnYpIC0+IGNvbnY/LnNlbGZfY29udmVyc2F0aW9uX3N0YXRlPy5zb3J0X3RpbWVzdGFtcCA/IDBcblxuIyB0aGlzIG51bWJlciBjb3JyZWxhdGVzIHRvIG51bWJlciBvZiBtYXggZXZlbnRzIHdlIGdldCBmcm9tXG4jIGhhbmdvdXRzIG9uIGNsaWVudCBzdGFydHVwLlxuTUFYX1VOUkVBRCA9IDIwXG5cbnVucmVhZCA9IChjb252KSAtPlxuICAgIHQgPSBjb252Py5zZWxmX2NvbnZlcnNhdGlvbl9zdGF0ZT8uc2VsZl9yZWFkX3N0YXRlPy5sYXRlc3RfcmVhZF90aW1lc3RhbXBcbiAgICByZXR1cm4gMCB1bmxlc3MgdHlwZW9mIHQgPT0gJ251bWJlcidcbiAgICBjID0gMFxuICAgIGZvciBlIGluIGNvbnY/LmV2ZW50ID8gW11cbiAgICAgICAgYysrIGlmIGUuY2hhdF9tZXNzYWdlIGFuZCBlLnRpbWVzdGFtcCA+IHRcbiAgICAgICAgcmV0dXJuIE1BWF9VTlJFQUQgaWYgYyA+PSBNQVhfVU5SRUFEXG4gICAgY1xuXG51bnJlYWRUb3RhbCA9IGRvIC0+XG4gICAgY3VycmVudCA9IDBcbiAgICBvck1vcmUgPSBmYWxzZVxuICAgIC0+XG4gICAgICAgIHN1bSA9IChhLCBiKSAtPiByZXR1cm4gYSArIGJcbiAgICAgICAgb3JNb3JlID0gZmFsc2VcbiAgICAgICAgY291bnR1bnJlYWQgPSAoYykgLT5cbiAgICAgICAgICAgIGlmIGlzUXVpZXQoYykgdGhlbiByZXR1cm4gMFxuICAgICAgICAgICAgY291bnQgPSBmdW5jcy51bnJlYWQgY1xuICAgICAgICAgICAgaWYgY291bnQgPT0gTUFYX1VOUkVBRCB0aGVuIG9yTW9yZSA9IHRydWVcbiAgICAgICAgICAgIHJldHVybiBjb3VudFxuICAgICAgICBuZXdUb3RhbCA9IGZ1bmNzLmxpc3QoZmFsc2UpLm1hcChjb3VudHVucmVhZCkucmVkdWNlKHN1bSwgMClcbiAgICAgICAgaWYgY3VycmVudCAhPSBuZXdUb3RhbFxuICAgICAgICAgICAgY3VycmVudCA9IG5ld1RvdGFsXG4gICAgICAgICAgICBsYXRlciAtPiBhY3Rpb24gJ3VucmVhZHRvdGFsJywgbmV3VG90YWwsIG9yTW9yZVxuICAgICAgICByZXR1cm4gbmV3VG90YWxcblxuaXNRdWlldCA9IChjKSAtPiBjPy5zZWxmX2NvbnZlcnNhdGlvbl9zdGF0ZT8ubm90aWZpY2F0aW9uX2xldmVsID09ICdRVUlFVCdcblxuc3RhcnJlZGNvbnZzID0gdHJ5cGFyc2UobG9jYWxTdG9yYWdlLnN0YXJyZWRjb252cykgfHwgW11cblxuaXNTdGFycmVkID0gKGMpIC0+IHJldHVybiBjPy5jb252ZXJzYXRpb25faWQ/LmlkIGluIHN0YXJyZWRjb252c1xuXG50b2dnbGVTdGFyID0gKGMpIC0+XG4gICAge2lkfSA9IGM/LmNvbnZlcnNhdGlvbl9pZFxuICAgIGlmIGlkIG5vdCBpbiBzdGFycmVkY29udnNcbiAgICAgICAgc3RhcnJlZGNvbnZzLnB1c2goaWQpXG4gICAgZWxzZVxuICAgICAgICBzdGFycmVkY29udnMgPSAoaSBmb3IgaSBpbiBzdGFycmVkY29udnMgd2hlbiBpICE9IGlkKVxuICAgIGxvY2FsU3RvcmFnZS5zdGFycmVkY29udnMgPSBKU09OLnN0cmluZ2lmeShzdGFycmVkY29udnMpO1xuICAgIHVwZGF0ZWQgJ2NvbnYnXG5cbmlzRXZlbnRUeXBlID0gKHR5cGUpIC0+IChldikgLT4gISFldlt0eXBlXVxuXG4jIGEgXCJoYW5nb3V0XCIgaXMgaW4gZ29vZ2xlIHRlcm1zIHN0cmljdGx5IGFuIGF1ZGlvL3ZpZGVvIGV2ZW50XG4jIG1hbnkgY29udmVyc2F0aW9ucyBpbiB0aGUgY29udmVyc2F0aW9uIGxpc3QgYXJlIGp1c3Qgc3VjaCBhblxuIyBldmVudCB3aXRoIG5vIGZ1cnRoZXIgY2hhdCBtZXNzYWdlcyBvciBhY3Rpdml0eS4gdGhpcyBmdW5jdGlvblxuIyB0ZWxscyB3aGV0aGVyIGEgaGFuZ291dCBvbmx5IGNvbnRhaW5zIHZpZGVvL2F1ZGlvLlxuaXNQdXJlSGFuZ291dCA9IGRvIC0+XG4gICAgbm90cyA9IFsnY2hhdF9tZXNzYWdlJywgJ2NvbnZlcnNhdGlvbl9yZW5hbWUnXS5tYXAoaXNFdmVudFR5cGUpXG4gICAgaXNOb3RIYW5nb3V0ID0gKGUpIC0+IG5vdHMuc29tZSAoZikgLT4gZihlKVxuICAgIChjKSAtPlxuICAgICAgICBub3QgKGM/LmV2ZW50ID8gW10pLnNvbWUgaXNOb3RIYW5nb3V0XG5cbiMgdGhlIHRpbWUgb2YgdGhlIGxhc3QgYWRkZWQgZXZlbnRcbmxhc3RDaGFuZ2VkID0gKGMpIC0+IChjPy5ldmVudD9bKGM/LmV2ZW50Py5sZW5ndGggPyAwKSAtIDFdPy50aW1lc3RhbXAgPyAwKSAvIDEwMDBcblxuIyB0aGUgbnVtYmVyIG9mIGhpc3RvcnkgZXZlbnRzIHRvIHJlcXVlc3RcbkhJU1RPUllfQU1PVU5UID0gMjBcblxuIyBhZGQgYSB0eXBpbmcgZW50cnlcbmFkZFR5cGluZyA9ICh0eXBpbmcpIC0+XG4gICAgY29udl9pZCA9IHR5cGluZz8uY29udmVyc2F0aW9uX2lkPy5pZFxuICAgICMgbm8gdHlwaW5nIGVudHJpZXMgZm9yIHNlbGZcbiAgICByZXR1cm4gaWYgZW50aXR5LmlzU2VsZiB0eXBpbmcudXNlcl9pZC5jaGF0X2lkXG4gICAgIyBhbmQgbm8gZW50cmllcyBpbiBub24tZXhpc3RpbmcgY29udnNcbiAgICByZXR1cm4gdW5sZXNzIGMgPSBsb29rdXBbY29udl9pZF1cbiAgICBjLnR5cGluZyA9IFtdIHVubGVzcyBjLnR5cGluZ1xuICAgICMgbGVuZ3RoIGF0IHN0YXJ0XG4gICAgbGVuID0gYy50eXBpbmcubGVuZ3RoXG4gICAgIyBhZGQgbmV3IHN0YXRlIHRvIHN0YXJ0IG9mIGFycmF5XG4gICAgYy50eXBpbmcudW5zaGlmdCB0eXBpbmdcbiAgICAjIGVuc3VyZSB0aGVyZSdzIG9ubHkgb25lIGVudHJ5IGluIGFycmF5IHBlciB1c2VyXG4gICAgYy50eXBpbmcgPSB1bmlxZm4gYy50eXBpbmcsICh0KSAtPiB0LnVzZXJfaWQuY2hhdF9pZFxuICAgICMgYW5kIHNvcnQgaXQgaW4gYSBzdGFibGUgd2F5XG4gICAgYy50eXBpbmcuc29ydCAodDEsIHQyKSAtPiB0MS51c2VyX2lkLmNoYXRfaWQgLSB0Mi51c2VyX2lkLmNoYXRfaWRcbiAgICAjIHNjaGVkdWxlIGEgcHJ1bmluZ1xuICAgIGxhdGVyIC0+IGFjdGlvbiAncHJ1bmVUeXBpbmcnLCBjb252X2lkXG4gICAgIyBhbmQgbWFyayBhcyB1cGRhdGVkXG4gICAgdXBkYXRlZCAnY29udidcbiAgICAjIGluZGljaWF0ZSB3ZSBqdXN0IHN0YXJ0ZWQgaGF2aW5nIHR5cGluZyBlbnRyaWVzXG4gICAgdXBkYXRlZCAnc3RhcnRUeXBpbmcnIGlmIGxlbiA9PSAwXG5cbiMgcHJ1bmUgb2xkIHR5cGluZyBlbnRyaWVzXG5wcnVuZVR5cGluZyA9IGRvIC0+XG5cbiAgICBmaW5kTmV4dCA9IChhcnIpIC0+XG4gICAgICAgIGV4cGlyeSA9IGFyci5tYXAgKHQpIC0+IHQudGltZXN0YW1wICsga2VlcEZvcih0KVxuICAgICAgICBuZXh0ID0gaSBmb3IgdCwgaSBpbiBleHBpcnkgd2hlbiAhbmV4dCBvciBleHBpcnlbaV0gPCBleHBpcnlbbmV4dF1cbiAgICAgICAgbmV4dFxuXG4gICAgS0VFUF9TVE9QUEVEID0gMTUwMCAgIyB0aW1lIHRvIGtlZXAgU1RPUFBFRCB0eXBpbmcgZW50cmllc1xuICAgIEtFRVBfT1RIRVJTICA9IDEwMDAwICMgdGltZSB0byBrZWVwIG90aGVyIHR5cGluZyBlbnRyaWVzIGJlZm9yZSBwcnVuaW5nXG5cbiAgICBrZWVwRm9yID0gKHQpIC0+IGlmIHQ/LnN0YXR1cyA9PSAnU1RPUFBFRCcgdGhlbiBLRUVQX1NUT1BQRUQgZWxzZSBLRUVQX09USEVSU1xuXG4gICAgcHJ1bmUgPSAodCkgLT4gKERhdGUubm93KCkgLSB0Py50aW1lc3RhbXAgLyAxMDAwKSA8IGtlZXBGb3IodClcblxuICAgIChjb252X2lkKSAtPlxuICAgICAgICByZXR1cm4gdW5sZXNzIGMgPSBsb29rdXBbY29udl9pZF1cbiAgICAgICAgIyBzdG9wIGV4aXN0aW5nIHRpbWVyXG4gICAgICAgIGMudHlwaW5ndGltZXIgPSBjbGVhclRpbWVvdXQgYy50eXBpbmd0aW1lciBpZiBjLnR5cGluZ3RpbWVyXG4gICAgICAgICMgdGhlIGxlbmd0aCBiZWZvcmUgcHJ1bmVcbiAgICAgICAgbGVuZ3RoQmVmb3JlID0gYy50eXBpbmcubGVuZ3RoXG4gICAgICAgICMgZmlsdGVyIG91dCBvbGQgc3R1ZmZcbiAgICAgICAgYy50eXBpbmcgPSBjLnR5cGluZy5maWx0ZXIocHJ1bmUpXG4gICAgICAgICMgbWF5YmUgd2UgY2hhbmdlZCBzb21ldGhpbmc/XG4gICAgICAgIHVwZGF0ZWQgJ2NvbnYnIGlmIGMudHlwaW5nLmxlbmd0aCAhPSBsZW5ndGhCZWZvcmVcbiAgICAgICAgIyB3aGVuIGlzIG5leHQgZXhwaXJpbmc/XG4gICAgICAgIHJldHVybiB1bmxlc3MgKG5leHRpZHggPSBmaW5kTmV4dCBjLnR5cGluZykgPj0gMFxuICAgICAgICAjIHRoZSBuZXh0IGVudHJ5IHRvIGV4cGlyZVxuICAgICAgICBuZXh0ID0gYy50eXBpbmdbbmV4dGlkeF1cbiAgICAgICAgIyBob3cgbG9uZyB3ZSB3YWl0IHVudGlsIGRvaW5nIGFub3RoZXIgcHJ1bmVcbiAgICAgICAgd2FpdFVudGlsID0gKGtlZXBGb3IobmV4dCkgKyBuZXh0LnRpbWVzdGFtcCAvIDEwMDApIC0gRGF0ZS5ub3coKVxuICAgICAgICByZXR1cm4gY29uc29sZS5lcnJvciAndHlwaW5nIHBydW5lIGVycm9yJywgd2FpdFVudGlsIGlmIHdhaXRVbnRpbCA8IDBcbiAgICAgICAgIyBzY2hlZHVsZSBuZXh0IHBydW5lXG4gICAgICAgIGMudHlwaW5ndGltZXIgPSBzZXRUaW1lb3V0ICgtPiBhY3Rpb24gJ3BydW5lVHlwaW5nJywgY29udl9pZCksIHdhaXRVbnRpbFxuXG5mdW5jcyA9XG4gICAgY291bnQ6IC0+XG4gICAgICAgIGMgPSAwOyAoYysrIGZvciBrLCB2IG9mIGxvb2t1cCB3aGVuIHR5cGVvZiB2ID09ICdvYmplY3QnKTsgY1xuXG4gICAgX3Jlc2V0OiAtPlxuICAgICAgICBkZWxldGUgbG9va3VwW2tdIGZvciBrLCB2IG9mIGxvb2t1cCB3aGVuIHR5cGVvZiB2ID09ICdvYmplY3QnXG4gICAgICAgIHVwZGF0ZWQgJ2NvbnYnXG4gICAgICAgIG51bGxcblxuICAgIF9pbml0RnJvbUNvbnZTdGF0ZXM6IChjb252cykgLT5cbiAgICAgICAgYyA9IDBcbiAgICAgICAgY291bnRJZiA9IChhKSAtPiBjKysgaWYgYVxuICAgICAgICBjb3VudElmIGFkZCBjb252IGZvciBjb252IGluIGNvbnZzXG4gICAgICAgIHVwZGF0ZWQgJ2NvbnYnXG4gICAgICAgIGNcblxuICAgIGFkZDphZGRcbiAgICByZW5hbWU6IHJlbmFtZVxuICAgIGFkZENoYXRNZXNzYWdlOiBhZGRDaGF0TWVzc2FnZVxuICAgIGFkZENoYXRNZXNzYWdlUGxhY2Vob2xkZXI6IGFkZENoYXRNZXNzYWdlUGxhY2Vob2xkZXJcbiAgICBhZGRXYXRlcm1hcms6IGFkZFdhdGVybWFya1xuICAgIE1BWF9VTlJFQUQ6IE1BWF9VTlJFQURcbiAgICB1bnJlYWQ6IHVucmVhZFxuICAgIGlzUXVpZXQ6IGlzUXVpZXRcbiAgICBpc1N0YXJyZWQ6IGlzU3RhcnJlZFxuICAgIHRvZ2dsZVN0YXI6IHRvZ2dsZVN0YXJcbiAgICBpc1B1cmVIYW5nb3V0OiBpc1B1cmVIYW5nb3V0XG4gICAgbGFzdENoYW5nZWQ6IGxhc3RDaGFuZ2VkXG4gICAgYWRkVHlwaW5nOiBhZGRUeXBpbmdcbiAgICBwcnVuZVR5cGluZzogcHJ1bmVUeXBpbmdcbiAgICB1bnJlYWRUb3RhbDogdW5yZWFkVG90YWxcblxuICAgIHNldE5vdGlmaWNhdGlvbkxldmVsOiAoY29udl9pZCwgbGV2ZWwpIC0+XG4gICAgICAgIHJldHVybiB1bmxlc3MgYyA9IGxvb2t1cFtjb252X2lkXVxuICAgICAgICBjLnNlbGZfY29udmVyc2F0aW9uX3N0YXRlPy5ub3RpZmljYXRpb25fbGV2ZWwgPSBsZXZlbFxuICAgICAgICB1cGRhdGVkICdjb252J1xuXG4gICAgZGVsZXRlQ29udjogKGNvbnZfaWQpIC0+XG4gICAgICAgIHJldHVybiB1bmxlc3MgYyA9IGxvb2t1cFtjb252X2lkXVxuICAgICAgICBkZWxldGUgbG9va3VwW2NvbnZfaWRdXG4gICAgICAgIHZpZXdzdGF0ZS5zZXRTZWxlY3RlZENvbnYgbnVsbFxuICAgICAgICB1cGRhdGVkICdjb252J1xuXG4gICAgcmVtb3ZlUGFydGljaXBhbnRzOiAoY29udl9pZCwgaWRzKSAtPlxuICAgICAgICByZXR1cm4gdW5sZXNzIGMgPSBsb29rdXBbY29udl9pZF1cbiAgICAgICAgZ2V0SWQgPSAocCkgLT4gcmV0dXJuIHAuaWQuY2hhdF9pZCBvciBwLmlkLmdhaWFfaWRcbiAgICAgICAgYy5wYXJ0aWNpcGFudF9kYXRhID0gKHAgZm9yIHAgaW4gYy5wYXJ0aWNpcGFudF9kYXRhIHdoZW4gZ2V0SWQocCkgbm90IGluIGlkcylcblxuICAgIGFkZFBhcnRpY2lwYW50OiAoY29udl9pZCwgcGFydGljaXBhbnQpIC0+XG4gICAgICAgIHJldHVybiB1bmxlc3MgYyA9IGxvb2t1cFtjb252X2lkXVxuICAgICAgICBjLnBhcnRpY2lwYW50X2RhdGEucHVzaCBwYXJ0aWNpcGFudFxuXG4gICAgcmVwbGFjZUZyb21TdGF0ZXM6IChzdGF0ZXMpIC0+XG4gICAgICAgIGFkZCBzdCBmb3Igc3QgaW4gc3RhdGVzXG4gICAgICAgIHVwZGF0ZWQgJ2NvbnYnXG5cbiAgICB1cGRhdGVBdFRvcDogKGF0dG9wKSAtPlxuICAgICAgICByZXR1cm4gdW5sZXNzIHZpZXdzdGF0ZS5zdGF0ZSA9PSB2aWV3c3RhdGUuU1RBVEVfTk9STUFMXG4gICAgICAgIGNvbnZfaWQgPSB2aWV3c3RhdGU/LnNlbGVjdGVkQ29udlxuICAgICAgICBpZiBhdHRvcCBhbmQgKGMgPSBsb29rdXBbY29udl9pZF0pIGFuZCAhYz8ubm9tb3JlaGlzdG9yeSBhbmQgIWM/LnJlcXVlc3RpbmdoaXN0b3J5XG4gICAgICAgICAgICB0aW1lc3RhbXAgPSAoYy5ldmVudD9bMF0/LnRpbWVzdGFtcCA/IDApIC8gMTAwMFxuICAgICAgICAgICAgcmV0dXJuIHVubGVzcyB0aW1lc3RhbXBcbiAgICAgICAgICAgIGMucmVxdWVzdGluZ2hpc3RvcnkgPSB0cnVlXG4gICAgICAgICAgICBsYXRlciAtPiBhY3Rpb24gJ2hpc3RvcnknLCBjb252X2lkLCB0aW1lc3RhbXAsIEhJU1RPUllfQU1PVU5UXG4gICAgICAgICAgICB1cGRhdGVkICdjb252J1xuXG4gICAgdXBkYXRlSGlzdG9yeTogKHN0YXRlKSAtPlxuICAgICAgICBjb252X2lkID0gc3RhdGU/LmNvbnZlcnNhdGlvbl9pZD8uaWRcbiAgICAgICAgcmV0dXJuIHVubGVzcyBjID0gbG9va3VwW2NvbnZfaWRdXG4gICAgICAgIGMucmVxdWVzdGluZ2hpc3RvcnkgPSBmYWxzZVxuICAgICAgICBldmVudCA9IHN0YXRlPy5ldmVudFxuICAgICAgICBjLmV2ZW50ID0gKGV2ZW50ID8gW10pLmNvbmNhdCAoYy5ldmVudCA/IFtdKVxuICAgICAgICBjLm5vbW9yZWhpc3RvcnkgPSB0cnVlIGlmIGV2ZW50Py5sZW5ndGggPT0gMFxuXG4gICAgICAgICMgZmlyc3Qgc2lnbmFsIGlzIHRvIGdpdmUgdmlld3MgYSBjaGFuZ2UgdG8gcmVjb3JkIHRoZVxuICAgICAgICAjIGN1cnJlbnQgdmlldyBwb3NpdGlvbiBiZWZvcmUgaW5qZWN0aW5nIG5ldyBET01cbiAgICAgICAgdXBkYXRlZCAnYmVmb3JlSGlzdG9yeSdcbiAgICAgICAgIyByZWRyYXdcbiAgICAgICAgdXBkYXRlZCAnY29udidcbiAgICAgICAgIyBsYXN0IHNpZ25hbCBpcyB0byBtb3ZlIHZpZXcgdG8gYmUgYXQgc2FtZSBwbGFjZVxuICAgICAgICAjIGFzIHdoZW4gd2UgaW5qZWN0ZWQgRE9NLlxuICAgICAgICB1cGRhdGVkICdhZnRlckhpc3RvcnknXG5cbiAgICB1cGRhdGVQbGFjZWhvbGRlckltYWdlOiAoe2NvbnZfaWQsIGNsaWVudF9nZW5lcmF0ZWRfaWQsIHBhdGh9KSAtPlxuICAgICAgICByZXR1cm4gdW5sZXNzIGMgPSBsb29rdXBbY29udl9pZF1cbiAgICAgICAgY3BvcyA9IGZpbmRDbGllbnRHZW5lcmF0ZWQgYywgY2xpZW50X2dlbmVyYXRlZF9pZFxuICAgICAgICBldiA9IGMuZXZlbnRbY3Bvc11cbiAgICAgICAgc2VnID0gZXYuY2hhdF9tZXNzYWdlLm1lc3NhZ2VfY29udGVudC5zZWdtZW50WzBdXG4gICAgICAgIHNlZy5saW5rX2RhdGEgPSBsaW5rX3RhcmdldDpwYXRoXG4gICAgICAgIHVwZGF0ZWQgJ2NvbnYnXG5cbiAgICBsaXN0OiAoc29ydCA9IHRydWUpIC0+XG4gICAgICAgIGNvbnZzID0gKHYgZm9yIGssIHYgb2YgbG9va3VwIHdoZW4gdHlwZW9mIHYgPT0gJ29iamVjdCcpXG4gICAgICAgIGlmIHNvcnRcbiAgICAgICAgICAgIHN0YXJyZWQgPSAoYyBmb3IgYyBpbiBjb252cyB3aGVuIGlzU3RhcnJlZChjKSlcbiAgICAgICAgICAgIGNvbnZzID0gKGMgZm9yIGMgaW4gY29udnMgd2hlbiBub3QgaXNTdGFycmVkKGMpKVxuICAgICAgICAgICAgc3RhcnJlZC5zb3J0IChlMSwgZTIpIC0+IG5hbWVvZmNvbnYoZTEpLmxvY2FsZUNvbXBhcmUobmFtZW9mY29udihlMikpXG4gICAgICAgICAgICBjb252cy5zb3J0IChlMSwgZTIpIC0+IHNvcnRieShlMikgLSBzb3J0YnkoZTEpXG4gICAgICAgICAgICByZXR1cm4gc3RhcnJlZC5jb25jYXQgY29udnNcbiAgICAgICAgY29udnNcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gbWVyZ2UgbG9va3VwLCBmdW5jc1xuIl19
