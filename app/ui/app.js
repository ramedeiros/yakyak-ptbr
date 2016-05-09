(function() {
  var applayout, conv, dispatcher, ipc, ref, ref1, trifl, viewstate,
    slice = [].slice;

  ipc = require('ipc');

  trifl = require('trifl');

  trifl.expose(window);

  window.notr = require('notr');

  notr.defineStack('def', 'body', {
    top: '3px',
    right: '15px'
  });

  dispatcher = require('./dispatcher');

  (ref = trifl.tagg).expose.apply(ref, [window].concat(slice.call('ul li div span a i b u s button p label input table thead tbody tr td th textarea br pass img h1 h2 h3 h4 hr link'.split(' '))));

  applayout = require('./views').applayout;

  ref1 = require('./models'), viewstate = ref1.viewstate, conv = ref1.conv;

  require('./views/menu')(viewstate);

  if (viewstate.startminimizedtotray) {
    require('remote').getCurrentWindow().hide();
  }

  document.body.appendChild(applayout.el);

  (function() {
    var ipcon;
    ipcon = ipc.on.bind(ipc);
    return ipc.on = function(n, fn) {
      return ipcon(n, function() {
        var as;
        as = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        action('alive', Date.now());
        return fn.apply(null, as);
      });
    };
  })();

  ipc.on('init', function(e) {
    return dispatcher.init(e);
  });

  require('./events').forEach(function(n) {
    return ipc.on(n, function(e) {
      return action(n, e);
    });
  });

  ipc.on('getentity:result', function(r, data) {
    return action('addentities', r.entities, data != null ? data.add_to_conv : void 0);
  });

  ipc.on('resize', function(dim) {
    return action('resize', dim);
  });

  ipc.on('move', function(pos) {
    return action('move', pos);
  });

  ipc.on('searchentities:result', function(r) {
    return action('setsearchedentities', r.entity);
  });

  ipc.on('createconversation:result', function(c, name) {
    c.conversation_id = c.id;
    if (name) {
      c.name = name;
    }
    action('createconversationdone', c);
    return action('setstate', viewstate.STATE_NORMAL);
  });

  ipc.on('syncallnewevents:response', function(r) {
    return action('handlesyncedevents', r);
  });

  ipc.on('syncrecentconversations:response', function(r) {
    return action('handlerecentconversations', r);
  });

  ipc.on('getconversation:response', function(r) {
    return action('handlehistory', r);
  });

  ipc.on('uploadingimage', function(spec) {
    return action('uploadingimage', spec);
  });

  require('./dispatcher');

  require('./views/controller');

  action('reqinit');

  window.addEventListener('online', function() {
    return action('wonline', true);
  });

  window.addEventListener('offline', function() {
    return action('wonline', false);
  });

  action('wonline', window.navigator.onLine);

}).call(this);

//# sourceMappingURL=data:application/json;base64,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LElBQUYsR0FBUyxLQUFUOztJQUNBLE1BQUEsQ0FBTyx3QkFBUCxFQUFpQyxDQUFqQztXQUNBLE1BQUEsQ0FBTyxVQUFQLEVBQW1CLFNBQVMsQ0FBQyxZQUE3QjtFQUpnQyxDQUFwQzs7RUFLQSxHQUFHLENBQUMsRUFBSixDQUFPLDJCQUFQLEVBQW9DLFNBQUMsQ0FBRDtXQUFPLE1BQUEsQ0FBTyxvQkFBUCxFQUE2QixDQUE3QjtFQUFQLENBQXBDOztFQUNBLEdBQUcsQ0FBQyxFQUFKLENBQU8sa0NBQVAsRUFBMkMsU0FBQyxDQUFEO1dBQU8sTUFBQSxDQUFPLDJCQUFQLEVBQW9DLENBQXBDO0VBQVAsQ0FBM0M7O0VBQ0EsR0FBRyxDQUFDLEVBQUosQ0FBTywwQkFBUCxFQUFtQyxTQUFDLENBQUQ7V0FBTyxNQUFBLENBQU8sZUFBUCxFQUF3QixDQUF4QjtFQUFQLENBQW5DOztFQUNBLEdBQUcsQ0FBQyxFQUFKLENBQU8sZ0JBQVAsRUFBeUIsU0FBQyxJQUFEO1dBQVUsTUFBQSxDQUFPLGdCQUFQLEVBQXlCLElBQXpCO0VBQVYsQ0FBekI7O0VBR0EsT0FBQSxDQUFRLGNBQVI7O0VBQ0EsT0FBQSxDQUFRLG9CQUFSOztFQUtBLE1BQUEsQ0FBTyxTQUFQOztFQUdBLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixRQUF4QixFQUFtQyxTQUFBO1dBQUcsTUFBQSxDQUFPLFNBQVAsRUFBa0IsSUFBbEI7RUFBSCxDQUFuQzs7RUFDQSxNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsU0FBeEIsRUFBbUMsU0FBQTtXQUFHLE1BQUEsQ0FBTyxTQUFQLEVBQWtCLEtBQWxCO0VBQUgsQ0FBbkM7O0VBRUEsTUFBQSxDQUFPLFNBQVAsRUFBa0IsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFuQztBQXpFQSIsImZpbGUiOiJ1aS9hcHAuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJpcGMgPSByZXF1aXJlICdpcGMnXG5cbiMgZXhwb3NlIHRyaWZsIGluIGdsb2JhbCBzY29wZVxudHJpZmwgPSByZXF1aXJlICd0cmlmbCdcbnRyaWZsLmV4cG9zZSB3aW5kb3dcblxuIyBpbiBhcHAgbm90aWZpY2F0aW9uIHN5c3RlbVxud2luZG93Lm5vdHIgPSByZXF1aXJlICdub3RyJ1xubm90ci5kZWZpbmVTdGFjayAnZGVmJywgJ2JvZHknLCB7dG9wOiczcHgnLCByaWdodDonMTVweCd9XG5cbiMgaW5pdCB0cmlmbCBkaXNwYXRjaGVyXG5kaXNwYXRjaGVyID0gcmVxdWlyZSAnLi9kaXNwYXRjaGVyJ1xuXG4jIGV4cG9zZSBzb21lIHNlbGVjdGVkIHRhZ2cgZnVuY3Rpb25zXG50cmlmbC50YWdnLmV4cG9zZSB3aW5kb3csICgndWwgbGkgZGl2IHNwYW4gYSBpIGIgdSBzIGJ1dHRvbiBwIGxhYmVsXG5pbnB1dCB0YWJsZSB0aGVhZCB0Ym9keSB0ciB0ZCB0aCB0ZXh0YXJlYSBiciBwYXNzIGltZyBoMSBoMiBoMyBoNFxuaHIgbGluaycuc3BsaXQoJyAnKSkuLi5cblxue2FwcGxheW91dH0gICAgICAgPSByZXF1aXJlICcuL3ZpZXdzJ1xue3ZpZXdzdGF0ZSwgY29udn0gPSByZXF1aXJlICcuL21vZGVscydcblxucmVxdWlyZSgnLi92aWV3cy9tZW51Jykodmlld3N0YXRlKVxuaWYgdmlld3N0YXRlLnN0YXJ0bWluaW1pemVkdG90cmF5XG4gIHJlcXVpcmUoJ3JlbW90ZScpLmdldEN1cnJlbnRXaW5kb3coKS5oaWRlKClcblxuIyB0aWUgbGF5b3V0IHRvIERPTVxuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCBhcHBsYXlvdXQuZWxcblxuIyBpbnRlcmNlcHQgZXZlcnkgZXZlbnQgd2UgbGlzdGVuIHRvXG4jIHRvIG1ha2UgYW4gJ2FsaXZlJyBhY3Rpb24gdG8ga25vd1xuIyB0aGUgc2VydmVyIGlzIGFsaXZlXG5kbyAtPlxuICAgIGlwY29uID0gaXBjLm9uLmJpbmQoaXBjKVxuICAgIGlwYy5vbiA9IChuLCBmbikgLT5cbiAgICAgICAgaXBjb24gbiwgKGFzLi4uKSAtPlxuICAgICAgICAgICAgYWN0aW9uICdhbGl2ZScsIERhdGUubm93KClcbiAgICAgICAgICAgIGZuIGFzLi4uXG5cbiMgd2lyZSB1cCBzdHVmZiBmcm9tIHNlcnZlclxuaXBjLm9uICdpbml0JywgKGUpIC0+IGRpc3BhdGNoZXIuaW5pdCBlXG4jIGV2ZW50cyBmcm9tIGhhbmd1cHNqc1xucmVxdWlyZSgnLi9ldmVudHMnKS5mb3JFYWNoIChuKSAtPiBpcGMub24gbiwgKGUpIC0+IGFjdGlvbiBuLCBlXG4jIHJlc3BvbnNlIGZyb20gZ2V0ZW50aXR5XG5pcGMub24gJ2dldGVudGl0eTpyZXN1bHQnLCAociwgZGF0YSkgLT5cbiAgICBhY3Rpb24gJ2FkZGVudGl0aWVzJywgci5lbnRpdGllcywgZGF0YT8uYWRkX3RvX2NvbnZcblxuaXBjLm9uICdyZXNpemUnLCAoZGltKSAtPiBhY3Rpb24gJ3Jlc2l6ZScsIGRpbVxuaXBjLm9uICdtb3ZlJywgKHBvcykgIC0+IGFjdGlvbiAnbW92ZScsIHBvc1xuaXBjLm9uICdzZWFyY2hlbnRpdGllczpyZXN1bHQnLCAocikgLT5cbiAgYWN0aW9uICdzZXRzZWFyY2hlZGVudGl0aWVzJywgci5lbnRpdHlcbmlwYy5vbiAnY3JlYXRlY29udmVyc2F0aW9uOnJlc3VsdCcsIChjLCBuYW1lKSAtPlxuICAgIGMuY29udmVyc2F0aW9uX2lkID0gYy5pZCAjwqBmaXggY29udmVyc2F0aW9uIHBheWxvYWRcbiAgICBjLm5hbWUgPSBuYW1lIGlmIG5hbWVcbiAgICBhY3Rpb24gJ2NyZWF0ZWNvbnZlcnNhdGlvbmRvbmUnLCBjXG4gICAgYWN0aW9uICdzZXRzdGF0ZScsIHZpZXdzdGF0ZS5TVEFURV9OT1JNQUxcbmlwYy5vbiAnc3luY2FsbG5ld2V2ZW50czpyZXNwb25zZScsIChyKSAtPiBhY3Rpb24gJ2hhbmRsZXN5bmNlZGV2ZW50cycsIHJcbmlwYy5vbiAnc3luY3JlY2VudGNvbnZlcnNhdGlvbnM6cmVzcG9uc2UnLCAocikgLT4gYWN0aW9uICdoYW5kbGVyZWNlbnRjb252ZXJzYXRpb25zJywgclxuaXBjLm9uICdnZXRjb252ZXJzYXRpb246cmVzcG9uc2UnLCAocikgLT4gYWN0aW9uICdoYW5kbGVoaXN0b3J5JywgclxuaXBjLm9uICd1cGxvYWRpbmdpbWFnZScsIChzcGVjKSAtPiBhY3Rpb24gJ3VwbG9hZGluZ2ltYWdlJywgc3BlY1xuXG4jIGluaXQgZGlzcGF0Y2hlci9jb250cm9sbGVyXG5yZXF1aXJlICcuL2Rpc3BhdGNoZXInXG5yZXF1aXJlICcuL3ZpZXdzL2NvbnRyb2xsZXInXG5cbiMgcmVxdWVzdCBpbml0IHRoaXMgaXMgbm90IGhhcHBlbmluZyB3aGVuXG4jIHRoZSBzZXJ2ZXIgaXMganVzdCBjb25uZWN0aW5nLCBidXQgZm9yXG4jIGRldiBtb2RlIHdoZW4gd2UgcmVsb2FkIHRoZSBwYWdlXG5hY3Rpb24gJ3JlcWluaXQnXG5cbiMgcmVnaXN0ZXIgZXZlbnQgbGlzdGVuZXJzIGZvciBvbi9vZmZsaW5lXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnb25saW5lJywgIC0+IGFjdGlvbiAnd29ubGluZScsIHRydWVcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyICdvZmZsaW5lJywgLT4gYWN0aW9uICd3b25saW5lJywgZmFsc2VcbiMgdGVsbCB0aGUgc3RhcnR1cCBzdGF0ZVxuYWN0aW9uICd3b25saW5lJywgd2luZG93Lm5hdmlnYXRvci5vbkxpbmVcbiJdfQ==
