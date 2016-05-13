(function() {
  var URL, fixlink, getImageUrl, getProxiedName, isAboutLink, isImg, later, linkto, nameof, nameofconv, throttle, toggleVisibility, topof, tryparse, uniqfn,
    slice = [].slice;

  URL = require('url');

  nameof = function(e) {
    var ref, ref1, ref2;
    return (ref = (ref1 = (ref2 = e != null ? e.display_name : void 0) != null ? ref2 : e != null ? e.fallback_name : void 0) != null ? ref1 : e != null ? e.first_name : void 0) != null ? ref : 'Unknown';
  };

  nameofconv = function(c) {
    var entity, ents, name, names, one_to_one, p, part, ref, ref1;
    entity = require('./models').entity;
    part = (ref = c != null ? c.current_participant : void 0) != null ? ref : [];
    ents = (function() {
      var j, len, results;
      results = [];
      for (j = 0, len = part.length; j < len; j++) {
        p = part[j];
        if (!entity.isSelf(p.chat_id)) {
          results.push(entity[p.chat_id]);
        }
      }
      return results;
    })();
    entity[p.chat_id];
    name = "";
    one_to_one = (c != null ? (ref1 = c.type) != null ? ref1.indexOf('ONE_TO_ONE') : void 0 : void 0) >= 0;
    if ((c.name != null) && !one_to_one) {
      name = c.name;
    } else {
      names = ents.map(nameof);
      name = names.join(', ');
    }
    return name;
  };

  linkto = function(c) {
    return "https://plus.google.com/u/0/" + c + "/about";
  };

  later = function(f) {
    return setTimeout(f, 1);
  };

  throttle = function(ms, f) {
    var g, last, tim;
    last = 0;
    tim = null;
    return g = function() {
      var as, d, ret;
      as = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (tim) {
        clearTimeout(tim);
      }
      if ((d = Date.now() - last) > ms) {
        ret = f.apply(null, as);
        last = Date.now();
        return ret;
      } else {
        tim = setTimeout((function() {
          return g.apply(null, as);
        }), d);
        return void 0;
      }
    };
  };

  isAboutLink = function(s) {
    var ref;
    return ((ref = /https:\/\/plus.google.com\/u\/0\/([0-9]+)\/about/.exec(s)) != null ? ref : [])[1];
  };

  getProxiedName = function(e) {
    var ref, ref1, ref2, ref3, ref4, s;
    s = e != null ? (ref = e.chat_message) != null ? (ref1 = ref.message_content) != null ? (ref2 = ref1.segment) != null ? ref2[0] : void 0 : void 0 : void 0 : void 0;
    if (!s) {
      return;
    }
    return (s != null ? (ref3 = s.formatting) != null ? ref3.bold : void 0 : void 0) && isAboutLink(s != null ? (ref4 = s.link_data) != null ? ref4.link_target : void 0 : void 0);
  };

  tryparse = function(s) {
    var err, error;
    try {
      return JSON.parse(s);
    } catch (error) {
      err = error;
      return void 0;
    }
  };

  fixlink = function(l) {
    if ((l != null ? l[0] : void 0) === '/') {
      return "https:" + l;
    } else {
      return l;
    }
  };

  topof = function(el) {
    return (el != null ? el.offsetTop : void 0) + ((el != null ? el.offsetParent : void 0) ? topof(el.offsetParent) : 0);
  };

  uniqfn = function(as, fn) {
    var fned;
    fned = as.map(fn);
    return as.filter(function(v, i) {
      return fned.indexOf(fned[i]) === i;
    });
  };

  isImg = function(url) {
    return url != null ? url.match(/\.(png|jpe?g|gif|svg)$/i) : void 0;
  };

  getImageUrl = function(url) {
    var parsed;
    if (url == null) {
      url = "";
    }
    if (isImg(url)) {
      return url;
    }
    parsed = URL.parse(url, true);
    url = parsed.query.q;
    if (isImg(url)) {
      return url;
    }
    return false;
  };

  toggleVisibility = function(element) {
    if (element.style.display === 'block') {
      return element.style.display = 'none';
    } else {
      return element.style.display = 'block';
    }
  };

  module.exports = {
    nameof: nameof,
    nameofconv: nameofconv,
    linkto: linkto,
    later: later,
    throttle: throttle,
    uniqfn: uniqfn,
    isAboutLink: isAboutLink,
    getProxiedName: getProxiedName,
    tryparse: tryparse,
    fixlink: fixlink,
    topof: topof,
    isImg: isImg,
    getImageUrl: getImageUrl,
    toggleVisibility: toggleVisibility
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,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QkFBQSxnQkFGaUI7O0FBekVqQiIsImZpbGUiOiJ1aS91dGlsLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiVVJMID0gcmVxdWlyZSAndXJsJ1xuXG5uYW1lb2YgPSAoZSkgLT4gZT8uZGlzcGxheV9uYW1lID8gZT8uZmFsbGJhY2tfbmFtZSA/IGU/LmZpcnN0X25hbWUgPyAnVW5rbm93bidcblxubmFtZW9mY29udiA9IChjKSAtPlxuICAgIHtlbnRpdHl9ID0gcmVxdWlyZSAnLi9tb2RlbHMnXG4gICAgcGFydCA9IGM/LmN1cnJlbnRfcGFydGljaXBhbnQgPyBbXVxuICAgIGVudHMgPSBmb3IgcCBpbiBwYXJ0IHdoZW4gbm90IGVudGl0eS5pc1NlbGYgcC5jaGF0X2lkXG4gICAgICAgIGVudGl0eVtwLmNoYXRfaWRdXG4gICAgZW50aXR5W3AuY2hhdF9pZF1cbiAgICBuYW1lID0gXCJcIlxuICAgIG9uZV90b19vbmUgPSBjPy50eXBlPy5pbmRleE9mKCdPTkVfVE9fT05FJykgPj0gMFxuICAgIGlmIGMubmFtZT8gYW5kIG5vdCBvbmVfdG9fb25lXG4gICAgICAgIG5hbWUgPSBjLm5hbWVcbiAgICBlbHNlXG4gICAgICAgICMgYWxsIGVudGl0aWVzIGluIGNvbnZlcnNhdGlvbiB0aGF0IGlzIG5vdCBzZWxmXG4gICAgICAgICMgdGhlIG5hbWVzIG9mIHRob3NlIGVudGl0aWVzXG4gICAgICAgIG5hbWVzID0gZW50cy5tYXAgbmFtZW9mXG4gICAgICAgICMgam9pbmVkIHRvZ2V0aGVyIGluIGEgY29tcGVsbGluZyBtYW5uZXJcbiAgICAgICAgbmFtZSA9IG5hbWVzLmpvaW4gJywgJ1xuICAgIHJldHVybiBuYW1lXG5cblxubGlua3RvID0gKGMpIC0+IFwiaHR0cHM6Ly9wbHVzLmdvb2dsZS5jb20vdS8wLyN7Y30vYWJvdXRcIlxuXG5sYXRlciA9IChmKSAtPiBzZXRUaW1lb3V0IGYsIDFcblxudGhyb3R0bGUgPSAobXMsIGYpIC0+XG4gICAgbGFzdCA9IDBcbiAgICB0aW0gPSBudWxsXG4gICAgZyA9IChhcy4uLikgLT5cbiAgICAgICAgY2xlYXJUaW1lb3V0IHRpbSBpZiB0aW1cbiAgICAgICAgaWYgKGQgPSAoRGF0ZS5ub3coKSAtIGxhc3QpKSA+IG1zXG4gICAgICAgICAgICByZXQgPSBmIGFzLi4uXG4gICAgICAgICAgICBsYXN0ID0gRGF0ZS5ub3coKVxuICAgICAgICAgICAgcmV0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgICMgZW5zdXJlIHRoYXQgbGFzdCBldmVudCBpcyBhbHdheXMgZmlyZWRcbiAgICAgICAgICAgIHRpbSA9IHNldFRpbWVvdXQgKC0+ZyBhcy4uLiksIGRcbiAgICAgICAgICAgIHVuZGVmaW5lZFxuXG5pc0Fib3V0TGluayA9IChzKSAtPiAoL2h0dHBzOlxcL1xcL3BsdXMuZ29vZ2xlLmNvbVxcL3VcXC8wXFwvKFswLTldKylcXC9hYm91dC8uZXhlYyhzKSA/IFtdKVsxXVxuXG5nZXRQcm94aWVkTmFtZSA9IChlKSAtPlxuICAgIHMgPSBlPy5jaGF0X21lc3NhZ2U/Lm1lc3NhZ2VfY29udGVudD8uc2VnbWVudD9bMF1cbiAgICByZXR1cm4gdW5sZXNzIHNcbiAgICByZXR1cm4gcz8uZm9ybWF0dGluZz8uYm9sZCBhbmQgaXNBYm91dExpbmsocz8ubGlua19kYXRhPy5saW5rX3RhcmdldClcblxudHJ5cGFyc2UgPSAocykgLT4gdHJ5IEpTT04ucGFyc2UocykgY2F0Y2ggZXJyIHRoZW4gdW5kZWZpbmVkXG5cbmZpeGxpbmsgPSAobCkgLT4gaWYgbD9bMF0gPT0gJy8nIHRoZW4gXCJodHRwczoje2x9XCIgZWxzZSBsXG5cbnRvcG9mID0gKGVsKSAtPiBlbD8ub2Zmc2V0VG9wICsgaWYgZWw/Lm9mZnNldFBhcmVudCB0aGVuIHRvcG9mKGVsLm9mZnNldFBhcmVudCkgZWxzZSAwXG5cbnVuaXFmbiA9IChhcywgZm4pIC0+XG4gICAgZm5lZCA9IGFzLm1hcCBmblxuICAgIGFzLmZpbHRlciAodiwgaSkgLT4gZm5lZC5pbmRleE9mKGZuZWRbaV0pID09IGlcblxuaXNJbWcgPSAodXJsKSAtPiB1cmw/Lm1hdGNoIC9cXC4ocG5nfGpwZT9nfGdpZnxzdmcpJC9pXG5cbmdldEltYWdlVXJsID0gKHVybD1cIlwiKSAtPlxuICAgIHJldHVybiB1cmwgaWYgaXNJbWcgdXJsXG4gICAgcGFyc2VkID0gVVJMLnBhcnNlIHVybCwgdHJ1ZVxuICAgIHVybCA9IHBhcnNlZC5xdWVyeS5xXG4gICAgcmV0dXJuIHVybCBpZiBpc0ltZyB1cmxcbiAgICBmYWxzZVxuXG50b2dnbGVWaXNpYmlsaXR5ID0gKGVsZW1lbnQpIC0+XG4gICAgaWYgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID09ICdibG9jaydcbiAgICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgZWxzZVxuICAgICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG5cbm1vZHVsZS5leHBvcnRzID0ge25hbWVvZiwgbmFtZW9mY29udiwgbGlua3RvLCBsYXRlciwgdGhyb3R0bGUsIHVuaXFmbixcbmlzQWJvdXRMaW5rLCBnZXRQcm94aWVkTmFtZSwgdHJ5cGFyc2UsIGZpeGxpbmssIHRvcG9mLCBpc0ltZywgZ2V0SW1hZ2VVcmwsXG50b2dnbGVWaXNpYmlsaXR5fVxuIl19
