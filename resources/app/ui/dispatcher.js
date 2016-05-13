(function() {
  var Client, connection, conv, convsettings, entity, ipc, isImg, later, notify, ref, ref1, remote, resendfocus, sendsetpresence, throttle, userinput, viewstate,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice;

  Client = require('hangupsjs');

  remote = require('remote');

  ipc = require('ipc');

  ref = require('./models'), entity = ref.entity, conv = ref.conv, viewstate = ref.viewstate, userinput = ref.userinput, connection = ref.connection, convsettings = ref.convsettings, notify = ref.notify;

  ref1 = require('./util'), throttle = ref1.throttle, later = ref1.later, isImg = ref1.isImg;

  'connecting connected connect_failed'.split(' ').forEach(function(n) {
    return handle(n, function() {
      return connection.setState(n);
    });
  });

  handle('alive', function(time) {
    return connection.setLastActive(time);
  });

  handle('reqinit', function() {
    ipc.send('reqinit');
    connection.setState(connection.CONNECTING);
    return viewstate.setState(viewstate.STATE_STARTUP);
  });

  module.exports = {
    init: function(arg) {
      var init;
      init = arg.init;
      return action('init', init);
    }
  };

  handle('init', function(init) {
    var ref2, ref3;
    viewstate.setLoggedin(true);
    viewstate.setState(viewstate.STATE_NORMAL);
    entity._initFromSelfEntity(init.self_entity);
    if (init.entities) {
      entity._initFromEntities(init.entities);
    }
    conv._initFromConvStates(init.conv_states);
    if (!conv[viewstate.selectedConv]) {
      viewstate.setSelectedConv((ref2 = conv.list()) != null ? (ref3 = ref2[0]) != null ? ref3.conversation_id : void 0 : void 0);
    }
    return require('./version').check();
  });

  handle('chat_message', function(ev) {
    conv.addChatMessage(ev);
    return notify.addToNotify(ev);
  });

  handle('watermark', function(ev) {
    return conv.addWatermark(ev);
  });

  handle('update:unreadcount', function() {
    return console.log('update');
  });

  handle('addconversation', function() {
    viewstate.setState(viewstate.STATE_ADD_CONVERSATION);
    return convsettings.reset();
  });

  handle('convsettings', function() {
    var id;
    id = viewstate.selectedConv;
    if (!conv[id]) {
      return;
    }
    convsettings.reset();
    convsettings.loadConversation(conv[id]);
    return viewstate.setState(viewstate.STATE_ADD_CONVERSATION);
  });

  handle('activity', function(time) {
    return viewstate.updateActivity(time);
  });

  handle('atbottom', function(atbottom) {
    return viewstate.updateAtBottom(atbottom);
  });

  handle('attop', function(attop) {
    viewstate.updateAtTop(attop);
    return conv.updateAtTop(attop);
  });

  handle('history', function(conv_id, timestamp) {
    return ipc.send('getconversation', conv_id, timestamp, 20);
  });

  handle('handlehistory', function(r) {
    if (!r.conversation_state) {
      return;
    }
    return conv.updateHistory(r.conversation_state);
  });

  handle('selectConv', function(conv) {
    viewstate.setState(viewstate.STATE_NORMAL);
    viewstate.setSelectedConv(conv);
    return ipc.send('setfocus', viewstate.selectedConv);
  });

  handle('selectNextConv', function(offset) {
    if (offset == null) {
      offset = 1;
    }
    if (viewstate.state !== viewstate.STATE_NORMAL) {
      return;
    }
    viewstate.selectNextConv(offset);
    return ipc.send('setfocus', viewstate.selectedConv);
  });

  handle('sendmessage', function(txt) {
    var msg;
    msg = userinput.buildChatMessage(txt);
    ipc.send('sendchatmessage', msg);
    return conv.addChatMessagePlaceholder(entity.self.id, msg);
  });

  handle('toggleshowtray', function() {
    return viewstate.setShowTray(!viewstate.showtray);
  });

  handle('togglehidedockicon', function() {
    return viewstate.setHideDockIcon(!viewstate.hidedockicon);
  });

  handle('togglewindow', function() {
    var mainWindow;
    mainWindow = remote.getCurrentWindow();
    if (mainWindow.isVisible()) {
      return mainWindow.hide();
    } else {
      return mainWindow.show();
    }
  });

  handle('togglestartminimizedtotray', function() {
    return viewstate.setStartMinimizedToTray(!viewstate.startminimizedtotray);
  });

  handle('toggletheme', function(theme) {
    return viewstate.setTheme(theme);
  });

  handle('showwindow', function() {
    var mainWindow;
    mainWindow = remote.getCurrentWindow();
    return mainWindow.show();
  });

  sendsetpresence = throttle(10000, function() {
    ipc.send('setpresence');
    return ipc.send('setactiveclient', true, 15);
  });

  resendfocus = throttle(15000, function() {
    return ipc.send('setfocus', viewstate.selectedConv);
  });

  handle('lastActivity', function() {
    sendsetpresence();
    if (document.hasFocus()) {
      return resendfocus();
    }
  });

  handle('appfocus', function() {
    return ipc.send('appfocus');
  });

  handle('updatewatermark', (function() {
    var throttleWaterByConv;
    throttleWaterByConv = {};
    return function() {
      var c, conv_id, sendWater;
      conv_id = viewstate.selectedConv;
      c = conv[conv_id];
      if (!c) {
        return;
      }
      sendWater = throttleWaterByConv[conv_id];
      if (!sendWater) {
        (function(conv_id) {
          sendWater = throttle(1000, function() {
            return ipc.send('updatewatermark', conv_id, Date.now());
          });
          return throttleWaterByConv[conv_id] = sendWater;
        })(conv_id);
      }
      return sendWater();
    };
  })());

  handle('getentity', function(ids) {
    return ipc.send('getentity', ids);
  });

  handle('addentities', function(es, conv_id) {
    var e, i, len, ref2;
    ref2 = es != null ? es : [];
    for (i = 0, len = ref2.length; i < len; i++) {
      e = ref2[i];
      entity.add(e);
    }
    if (conv_id) {
      (es != null ? es : []).forEach(function(p) {
        return conv.addParticipant(conv_id, p);
      });
      return viewstate.setState(viewstate.STATE_NORMAL);
    }
  });

  handle('uploadimage', function(files) {
    var _, client_generated_id, conv_id, ext, file, i, len, msg, ref2, ref3, results;
    conv_id = viewstate.selectedConv;
    if (!(viewstate.state === viewstate.STATE_NORMAL && conv[conv_id])) {
      return;
    }
    results = [];
    for (i = 0, len = files.length; i < len; i++) {
      file = files[i];
      if (!isImg(file.path)) {
        ref3 = (ref2 = file.path.match(/.*(\.\w+)$/)) != null ? ref2 : [], _ = ref3[0], ext = ref3[1];
        notr("Ignorando arquivo do tipo " + ext);
        continue;
      }
      msg = userinput.buildChatMessage('enviando imagem…');
      msg.uploadimage = true;
      client_generated_id = msg.client_generated_id;
      conv.addChatMessagePlaceholder(entity.self.id, msg);
      results.push(ipc.send('uploadimage', {
        path: file.path,
        conv_id: conv_id,
        client_generated_id: client_generated_id
      }));
    }
    return results;
  });

  handle('onpasteimage', function() {
    var client_generated_id, conv_id, msg;
    conv_id = viewstate.selectedConv;
    if (!conv_id) {
      return;
    }
    msg = userinput.buildChatMessage('enviando imagem…');
    msg.uploadimage = true;
    client_generated_id = msg.client_generated_id;
    conv.addChatMessagePlaceholder(entity.self.id, msg);
    return ipc.send('uploadclipboardimage', {
      conv_id: conv_id,
      client_generated_id: client_generated_id
    });
  });

  handle('uploadingimage', function(spec) {});

  handle('leftresize', function(size) {
    return viewstate.setLeftSize(size);
  });

  handle('resize', function(dim) {
    return viewstate.setSize(dim);
  });

  handle('move', function(pos) {
    return viewstate.setPosition(pos);
  });

  handle('conversationname', function(name) {
    return convsettings.setName(name);
  });

  handle('conversationquery', function(query) {
    return convsettings.setSearchQuery(query);
  });

  handle('searchentities', function(query, max_results) {
    return ipc.send('searchentities', query, max_results);
  });

  handle('setsearchedentities', function(r) {
    return convsettings.setSearchedEntities(r);
  });

  handle('selectentity', function(e) {
    return convsettings.addSelectedEntity(e);
  });

  handle('deselectentity', function(e) {
    return convsettings.removeSelectedEntity(e);
  });

  handle('togglegroup', function(e) {
    return convsettings.setGroup(!convsettings.group);
  });

  handle('saveconversation', function() {
    var c, conv_id, current, e, id, name, needsRename, one_to_one, p, recreate, ref2, selected, toadd;
    viewstate.setState(viewstate.STATE_NORMAL);
    conv_id = convsettings.id;
    c = conv[conv_id];
    one_to_one = (c != null ? (ref2 = c.type) != null ? ref2.indexOf('ONE_TO_ONE') : void 0 : void 0) >= 0;
    selected = (function() {
      var i, len, ref3, results;
      ref3 = convsettings.selectedEntities;
      results = [];
      for (i = 0, len = ref3.length; i < len; i++) {
        e = ref3[i];
        results.push(e.id.chat_id);
      }
      return results;
    })();
    recreate = conv_id && one_to_one && convsettings.group;
    needsRename = convsettings.group && convsettings.name && convsettings.name !== (c != null ? c.name : void 0);
    if (!conv_id || recreate) {
      name = (convsettings.group ? convsettings.name : void 0) || "";
      ipc.send('createconversation', selected, name, convsettings.group);
      return;
    }
    p = c.participant_data;
    current = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = p.length; i < len; i++) {
        c = p[i];
        if (!entity.isSelf(c.id.chat_id)) {
          results.push(c.id.chat_id);
        }
      }
      return results;
    })();
    toadd = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = selected.length; i < len; i++) {
        id = selected[i];
        if (indexOf.call(current, id) < 0) {
          results.push(id);
        }
      }
      return results;
    })();
    if (toadd.length) {
      ipc.send('adduser', conv_id, toadd);
    }
    if (needsRename) {
      return ipc.send('renameconversation', conv_id, convsettings.name);
    }
  });

  handle('conversation_rename', function(c) {
    conv.rename(c, c.conversation_rename.new_name);
    return conv.addChatMessage(c);
  });

  handle('membership_change', function(e) {
    var conv_id, id, ids, ref2;
    conv_id = e.conversation_id.id;
    ids = (function() {
      var i, len, ref2, results;
      ref2 = e.membership_change.participant_ids;
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        id = ref2[i];
        results.push(id.chat_id || id.gaia_id);
      }
      return results;
    })();
    if (e.membership_change.type === 'LEAVE') {
      if (ref2 = entity.self.id, indexOf.call(ids, ref2) >= 0) {
        return conv.deleteConv(conv_id);
      }
      return conv.removeParticipants(conv_id, ids);
    }
    conv.addChatMessage(e);
    return ipc.send('getentity', ids, {
      add_to_conv: conv_id
    });
  });

  handle('createconversationdone', function(c) {
    convsettings.reset();
    conv.add(c);
    return viewstate.setSelectedConv(c.id.id);
  });

  handle('notification_level', function(n) {
    var conv_id, level, ref2;
    conv_id = n != null ? (ref2 = n[0]) != null ? ref2[0] : void 0 : void 0;
    level = (n != null ? n[1] : void 0) === 10 ? 'QUIET' : 'RING';
    if (conv_id && level) {
      return conv.setNotificationLevel(conv_id, level);
    }
  });

  handle('togglenotif', function() {
    var QUIET, RING, c, conv_id, q, ref2;
    ref2 = Client.NotificationLevel, QUIET = ref2.QUIET, RING = ref2.RING;
    conv_id = viewstate.selectedConv;
    if (!(c = conv[conv_id])) {
      return;
    }
    q = conv.isQuiet(c);
    ipc.send('setconversationnotificationlevel', conv_id, (q ? RING : QUIET));
    return conv.setNotificationLevel(conv_id, (q ? 'RING' : 'QUIET'));
  });

  handle('togglestar', function() {
    var c, conv_id;
    conv_id = viewstate.selectedConv;
    if (!(c = conv[conv_id])) {
      return;
    }
    return conv.toggleStar(c);
  });

  handle('delete', function(a) {
    var c, conv_id, ref2;
    conv_id = a != null ? (ref2 = a[0]) != null ? ref2[0] : void 0 : void 0;
    if (!(c = conv[conv_id])) {
      return;
    }
    return conv.deleteConv(conv_id);
  });

  handle('deleteconv', function(confirmed) {
    var conv_id;
    conv_id = viewstate.selectedConv;
    if (!confirmed) {
      return later(function() {
        if (confirm('Deletar a conversa?')) {
          return action('deleteconv', true);
        }
      });
    } else {
      return ipc.send('deleteconversation', conv_id);
    }
  });

  handle('leaveconv', function(confirmed) {
    var conv_id;
    conv_id = viewstate.selectedConv;
    if (!confirmed) {
      return later(function() {
        if (confirm('Deletar a conversa?')) {
          return action('leaveconv', true);
        }
      });
    } else {
      return ipc.send('removeuser', conv_id);
    }
  });

  handle('lastkeydown', function(time) {
    return viewstate.setLastKeyDown(time);
  });

  handle('settyping', function(v) {
    var conv_id;
    conv_id = viewstate.selectedConv;
    if (!(conv_id && viewstate.state === viewstate.STATE_NORMAL)) {
      return;
    }
    return ipc.send('settyping', conv_id, v);
  });

  handle('typing', function(t) {
    return conv.addTyping(t);
  });

  handle('pruneTyping', function(conv_id) {
    return conv.pruneTyping(conv_id);
  });

  handle('syncallnewevents', throttle(10000, function(time) {
    if (!time) {
      return;
    }
    return ipc.send('syncallnewevents', time);
  }));

  handle('handlesyncedevents', function(r) {
    var e, i, j, len, len1, ref2, ref3, st, states;
    states = r != null ? r.conversation_state : void 0;
    if (!(states != null ? states.length : void 0)) {
      return;
    }
    for (i = 0, len = states.length; i < len; i++) {
      st = states[i];
      ref3 = (ref2 = st != null ? st.event : void 0) != null ? ref2 : [];
      for (j = 0, len1 = ref3.length; j < len1; j++) {
        e = ref3[j];
        conv.addChatMessage(e);
      }
    }
    return connection.setEventState(connection.IN_SYNC);
  });

  handle('syncrecentconversations', throttle(10000, function() {
    return ipc.send('syncrecentconversations');
  }));

  handle('handlerecentconversations', function(r) {
    var st;
    if (!(st = r.conversation_state)) {
      return;
    }
    conv.replaceFromStates(st);
    return connection.setEventState(connection.IN_SYNC);
  });

  handle('client_conversation', function(c) {
    var ref2;
    if (!conv[c != null ? (ref2 = c.conversation_id) != null ? ref2.id : void 0 : void 0]) {
      return conv.add(c);
    }
  });

  handle('hangout_event', function(e) {
    var ref2, ref3;
    if ((ref2 = e != null ? (ref3 = e.hangout_event) != null ? ref3.event_type : void 0 : void 0) !== 'START_HANGOUT' && ref2 !== 'END_HANGOUT') {
      return;
    }
    return notify.addToNotify(e);
  });

  'presence reply_to_invite settings conversation_notification invitation_watermark'.split(' ').forEach(function(n) {
    return handle(n, function() {
      var as;
      as = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return console.log.apply(console, [n].concat(slice.call(as)));
    });
  });

  handle('unreadtotal', function(total, orMore) {
    var value;
    value = "";
    if (total > 0) {
      value = total + (orMore ? "+" : "");
    }
    return ipc.send('updatebadge', value);
  });

  handle('showconvthumbs', function(doshow) {
    return viewstate.setShowConvThumbs(doshow);
  });

  handle('devtools', function() {
    return remote.getCurrentWindow().openDevTools({
      detach: true
    });
  });

  handle('quit', function() {
    return ipc.send('quit');
  });

  handle('togglefullscreen', function() {
    return ipc.send('togglefullscreen');
  });

  handle('zoom', function(step) {
    if (step != null) {
      return viewstate.setZoom((parseFloat(document.body.style.zoom) || 1.0) + step);
    }
    return viewstate.setZoom(1);
  });

  handle('logout', function() {
    return ipc.send('logout');
  });

  handle('wonline', function(wonline) {
    connection.setWindowOnline(wonline);
    if (wonline) {
      return ipc.send('hangupsConnect');
    } else {
      return ipc.send('hangupsDisconnect');
    }
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,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QyxVQUFBLENBQVcsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBL0IsQ0FBQSxJQUF3QyxHQUF6QyxDQUFBLEdBQWdELElBQWxFLEVBRFg7O1dBRUEsU0FBUyxDQUFDLE9BQVYsQ0FBa0IsQ0FBbEI7RUFIVyxDQUFmOztFQUtBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCLFNBQUE7V0FDYixHQUFHLENBQUMsSUFBSixDQUFTLFFBQVQ7RUFEYSxDQUFqQjs7RUFHQSxNQUFBLENBQU8sU0FBUCxFQUFrQixTQUFDLE9BQUQ7SUFDZCxVQUFVLENBQUMsZUFBWCxDQUEyQixPQUEzQjtJQUNBLElBQUcsT0FBSDthQUNJLEdBQUcsQ0FBQyxJQUFKLENBQVMsZ0JBQVQsRUFESjtLQUFBLE1BQUE7YUFHSSxHQUFHLENBQUMsSUFBSixDQUFTLG1CQUFULEVBSEo7O0VBRmMsQ0FBbEI7QUFqVkEiLCJmaWxlIjoidWkvZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIkNsaWVudCA9IHJlcXVpcmUgJ2hhbmd1cHNqcydcbnJlbW90ZSA9IHJlcXVpcmUgJ3JlbW90ZSdcbmlwYyAgICA9IHJlcXVpcmUgJ2lwYydcblxue2VudGl0eSwgY29udiwgdmlld3N0YXRlLCB1c2VyaW5wdXQsIGNvbm5lY3Rpb24sIGNvbnZzZXR0aW5ncywgbm90aWZ5fSA9IHJlcXVpcmUgJy4vbW9kZWxzJ1xue3Rocm90dGxlLCBsYXRlciwgaXNJbWd9ID0gcmVxdWlyZSAnLi91dGlsJ1xuXG4nY29ubmVjdGluZyBjb25uZWN0ZWQgY29ubmVjdF9mYWlsZWQnLnNwbGl0KCcgJykuZm9yRWFjaCAobikgLT5cbiAgICBoYW5kbGUgbiwgLT4gY29ubmVjdGlvbi5zZXRTdGF0ZSBuXG5cbmhhbmRsZSAnYWxpdmUnLCAodGltZSkgLT4gY29ubmVjdGlvbi5zZXRMYXN0QWN0aXZlIHRpbWVcblxuaGFuZGxlICdyZXFpbml0JywgLT5cbiAgICBpcGMuc2VuZCAncmVxaW5pdCdcbiAgICBjb25uZWN0aW9uLnNldFN0YXRlIGNvbm5lY3Rpb24uQ09OTkVDVElOR1xuICAgIHZpZXdzdGF0ZS5zZXRTdGF0ZSB2aWV3c3RhdGUuU1RBVEVfU1RBUlRVUFxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gICAgaW5pdDogKHtpbml0fSkgLT4gYWN0aW9uICdpbml0JywgaW5pdFxuXG5cbmhhbmRsZSAnaW5pdCcsIChpbml0KSAtPlxuICAgICMgc2V0IHRoZSBpbml0aWFsIHZpZXcgc3RhdGVcbiAgICB2aWV3c3RhdGUuc2V0TG9nZ2VkaW4gdHJ1ZVxuICAgIHZpZXdzdGF0ZS5zZXRTdGF0ZSB2aWV3c3RhdGUuU1RBVEVfTk9STUFMXG5cbiAgICAjIHVwZGF0ZSBtb2RlbCBmcm9tIGluaXQgb2JqZWN0XG4gICAgZW50aXR5Ll9pbml0RnJvbVNlbGZFbnRpdHkgaW5pdC5zZWxmX2VudGl0eVxuICAgIGVudGl0eS5faW5pdEZyb21FbnRpdGllcyBpbml0LmVudGl0aWVzIGlmIGluaXQuZW50aXRpZXNcbiAgICBjb252Ll9pbml0RnJvbUNvbnZTdGF0ZXMgaW5pdC5jb252X3N0YXRlc1xuICAgICMgZW5zdXJlIHRoZXJlJ3MgYSBzZWxlY3RlZCBjb252XG4gICAgdW5sZXNzIGNvbnZbdmlld3N0YXRlLnNlbGVjdGVkQ29udl1cbiAgICAgICAgdmlld3N0YXRlLnNldFNlbGVjdGVkQ29udiBjb252Lmxpc3QoKT9bMF0/LmNvbnZlcnNhdGlvbl9pZFxuXG4gICAgcmVxdWlyZSgnLi92ZXJzaW9uJykuY2hlY2soKVxuXG5oYW5kbGUgJ2NoYXRfbWVzc2FnZScsIChldikgLT5cbiAgICBjb252LmFkZENoYXRNZXNzYWdlIGV2XG4gICAgIyB0aGVzZSBtZXNzYWdlcyBhcmUgdG8gZ28gdGhyb3VnaCBub3RpZmljYXRpb25zXG4gICAgbm90aWZ5LmFkZFRvTm90aWZ5IGV2XG5cbmhhbmRsZSAnd2F0ZXJtYXJrJywgKGV2KSAtPlxuICAgIGNvbnYuYWRkV2F0ZXJtYXJrIGV2XG5cbmhhbmRsZSAndXBkYXRlOnVucmVhZGNvdW50JywgLT5cbiAgICBjb25zb2xlLmxvZyAndXBkYXRlJ1xuXG5oYW5kbGUgJ2FkZGNvbnZlcnNhdGlvbicsIC0+XG4gICAgdmlld3N0YXRlLnNldFN0YXRlIHZpZXdzdGF0ZS5TVEFURV9BRERfQ09OVkVSU0FUSU9OXG4gICAgY29udnNldHRpbmdzLnJlc2V0KClcblxuaGFuZGxlICdjb252c2V0dGluZ3MnLCAtPlxuICAgIGlkID0gdmlld3N0YXRlLnNlbGVjdGVkQ29udlxuICAgIHJldHVybiB1bmxlc3MgY29udltpZF1cbiAgICBjb252c2V0dGluZ3MucmVzZXQoKVxuICAgIGNvbnZzZXR0aW5ncy5sb2FkQ29udmVyc2F0aW9uIGNvbnZbaWRdXG4gICAgdmlld3N0YXRlLnNldFN0YXRlIHZpZXdzdGF0ZS5TVEFURV9BRERfQ09OVkVSU0FUSU9OXG5cbmhhbmRsZSAnYWN0aXZpdHknLCAodGltZSkgLT5cbiAgICB2aWV3c3RhdGUudXBkYXRlQWN0aXZpdHkgdGltZVxuXG5oYW5kbGUgJ2F0Ym90dG9tJywgKGF0Ym90dG9tKSAtPlxuICAgIHZpZXdzdGF0ZS51cGRhdGVBdEJvdHRvbSBhdGJvdHRvbVxuXG5oYW5kbGUgJ2F0dG9wJywgKGF0dG9wKSAtPlxuICAgIHZpZXdzdGF0ZS51cGRhdGVBdFRvcCBhdHRvcFxuICAgIGNvbnYudXBkYXRlQXRUb3AgYXR0b3BcblxuaGFuZGxlICdoaXN0b3J5JywgKGNvbnZfaWQsIHRpbWVzdGFtcCkgLT5cbiAgICBpcGMuc2VuZCAnZ2V0Y29udmVyc2F0aW9uJywgY29udl9pZCwgdGltZXN0YW1wLCAyMFxuXG5oYW5kbGUgJ2hhbmRsZWhpc3RvcnknLCAocikgLT5cbiAgICByZXR1cm4gdW5sZXNzIHIuY29udmVyc2F0aW9uX3N0YXRlXG4gICAgY29udi51cGRhdGVIaXN0b3J5IHIuY29udmVyc2F0aW9uX3N0YXRlXG5cbmhhbmRsZSAnc2VsZWN0Q29udicsIChjb252KSAtPlxuICAgIHZpZXdzdGF0ZS5zZXRTdGF0ZSB2aWV3c3RhdGUuU1RBVEVfTk9STUFMXG4gICAgdmlld3N0YXRlLnNldFNlbGVjdGVkQ29udiBjb252XG4gICAgaXBjLnNlbmQgJ3NldGZvY3VzJywgdmlld3N0YXRlLnNlbGVjdGVkQ29udlxuXG5oYW5kbGUgJ3NlbGVjdE5leHRDb252JywgKG9mZnNldCA9IDEpIC0+XG4gICAgaWYgdmlld3N0YXRlLnN0YXRlICE9IHZpZXdzdGF0ZS5TVEFURV9OT1JNQUwgdGhlbiByZXR1cm5cbiAgICB2aWV3c3RhdGUuc2VsZWN0TmV4dENvbnYgb2Zmc2V0XG4gICAgaXBjLnNlbmQgJ3NldGZvY3VzJywgdmlld3N0YXRlLnNlbGVjdGVkQ29udlxuXG5oYW5kbGUgJ3NlbmRtZXNzYWdlJywgKHR4dCkgLT5cbiAgICBtc2cgPSB1c2VyaW5wdXQuYnVpbGRDaGF0TWVzc2FnZSB0eHRcbiAgICBpcGMuc2VuZCAnc2VuZGNoYXRtZXNzYWdlJywgbXNnXG4gICAgY29udi5hZGRDaGF0TWVzc2FnZVBsYWNlaG9sZGVyIGVudGl0eS5zZWxmLmlkLCBtc2dcblxuaGFuZGxlICd0b2dnbGVzaG93dHJheScsIC0+XG4gICAgdmlld3N0YXRlLnNldFNob3dUcmF5KG5vdCB2aWV3c3RhdGUuc2hvd3RyYXkpXG5cbmhhbmRsZSAndG9nZ2xlaGlkZWRvY2tpY29uJywgLT5cbiAgICB2aWV3c3RhdGUuc2V0SGlkZURvY2tJY29uKG5vdCB2aWV3c3RhdGUuaGlkZWRvY2tpY29uKVxuXG5oYW5kbGUgJ3RvZ2dsZXdpbmRvdycsIC0+XG4gICAgbWFpbldpbmRvdyA9IHJlbW90ZS5nZXRDdXJyZW50V2luZG93KCkgIyBBbmQgd2UgaG9wZSB3ZSBkb24ndCBnZXQgYW5vdGhlciA7KVxuICAgIGlmIG1haW5XaW5kb3cuaXNWaXNpYmxlKCkgdGhlbiBtYWluV2luZG93LmhpZGUoKSBlbHNlIG1haW5XaW5kb3cuc2hvdygpXG5cbmhhbmRsZSAndG9nZ2xlc3RhcnRtaW5pbWl6ZWR0b3RyYXknLCAtPlxuICAgIHZpZXdzdGF0ZS5zZXRTdGFydE1pbmltaXplZFRvVHJheShub3Qgdmlld3N0YXRlLnN0YXJ0bWluaW1pemVkdG90cmF5KVxuXG5oYW5kbGUgJ3RvZ2dsZXRoZW1lJywgKHRoZW1lKSAtPlxuICAgIHZpZXdzdGF0ZS5zZXRUaGVtZSh0aGVtZSlcblxuaGFuZGxlICdzaG93d2luZG93JywgLT5cbiAgICBtYWluV2luZG93ID0gcmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKSAjIEFuZCB3ZSBob3BlIHdlIGRvbid0IGdldCBhbm90aGVyIDspXG4gICAgbWFpbldpbmRvdy5zaG93KClcblxuc2VuZHNldHByZXNlbmNlID0gdGhyb3R0bGUgMTAwMDAsIC0+XG4gICAgaXBjLnNlbmQgJ3NldHByZXNlbmNlJ1xuICAgIGlwYy5zZW5kICdzZXRhY3RpdmVjbGllbnQnLCB0cnVlLCAxNVxucmVzZW5kZm9jdXMgPSB0aHJvdHRsZSAxNTAwMCwgLT4gaXBjLnNlbmQgJ3NldGZvY3VzJywgdmlld3N0YXRlLnNlbGVjdGVkQ29udlxuXG5oYW5kbGUgJ2xhc3RBY3Rpdml0eScsIC0+XG4gICAgc2VuZHNldHByZXNlbmNlKClcbiAgICByZXNlbmRmb2N1cygpIGlmIGRvY3VtZW50Lmhhc0ZvY3VzKClcblxuaGFuZGxlICdhcHBmb2N1cycsIC0+XG4gICAgaXBjLnNlbmQgJ2FwcGZvY3VzJ1xuXG5oYW5kbGUgJ3VwZGF0ZXdhdGVybWFyaycsIGRvIC0+XG4gICAgdGhyb3R0bGVXYXRlckJ5Q29udiA9IHt9XG4gICAgLT5cbiAgICAgICAgY29udl9pZCA9IHZpZXdzdGF0ZS5zZWxlY3RlZENvbnZcbiAgICAgICAgYyA9IGNvbnZbY29udl9pZF1cbiAgICAgICAgcmV0dXJuIHVubGVzcyBjXG4gICAgICAgIHNlbmRXYXRlciA9IHRocm90dGxlV2F0ZXJCeUNvbnZbY29udl9pZF1cbiAgICAgICAgdW5sZXNzIHNlbmRXYXRlclxuICAgICAgICAgICAgZG8gKGNvbnZfaWQpIC0+XG4gICAgICAgICAgICAgICAgc2VuZFdhdGVyID0gdGhyb3R0bGUgMTAwMCwgLT4gaXBjLnNlbmQgJ3VwZGF0ZXdhdGVybWFyaycsIGNvbnZfaWQsIERhdGUubm93KClcbiAgICAgICAgICAgICAgICB0aHJvdHRsZVdhdGVyQnlDb252W2NvbnZfaWRdID0gc2VuZFdhdGVyXG4gICAgICAgIHNlbmRXYXRlcigpXG5cblxuaGFuZGxlICdnZXRlbnRpdHknLCAoaWRzKSAtPiBpcGMuc2VuZCAnZ2V0ZW50aXR5JywgaWRzXG5oYW5kbGUgJ2FkZGVudGl0aWVzJywgKGVzLCBjb252X2lkKSAtPlxuICAgIGVudGl0eS5hZGQgZSBmb3IgZSBpbiBlcyA/IFtdXG4gICAgaWYgY29udl9pZCAjwqBhdXRvLWFkZCB0aGVzZSBwcGwgdG8gYSBjb252XG4gICAgICAgIChlcyA/IFtdKS5mb3JFYWNoIChwKSAtPiBjb252LmFkZFBhcnRpY2lwYW50IGNvbnZfaWQsIHBcbiAgICAgICAgdmlld3N0YXRlLnNldFN0YXRlIHZpZXdzdGF0ZS5TVEFURV9OT1JNQUxcblxuaGFuZGxlICd1cGxvYWRpbWFnZScsIChmaWxlcykgLT5cbiAgICAjIHRoaXMgbWF5IGNoYW5nZSBkdXJpbmcgdXBsb2FkXG4gICAgY29udl9pZCA9IHZpZXdzdGF0ZS5zZWxlY3RlZENvbnZcbiAgICAjIHNlbnNlIGNoZWNrIHRoYXQgY2xpZW50IGlzIGluIGdvb2Qgc3RhdGVcbiAgICByZXR1cm4gdW5sZXNzIHZpZXdzdGF0ZS5zdGF0ZSA9PSB2aWV3c3RhdGUuU1RBVEVfTk9STUFMIGFuZCBjb252W2NvbnZfaWRdXG4gICAgIyBzaGlwIGl0XG4gICAgZm9yIGZpbGUgaW4gZmlsZXNcbiAgICAgICAgIyBvbmx5IGltYWdlcyBwbGVhc2VcbiAgICAgICAgdW5sZXNzIGlzSW1nIGZpbGUucGF0aFxuICAgICAgICAgICAgW18sIGV4dF0gPSBmaWxlLnBhdGgubWF0Y2goLy4qKFxcLlxcdyspJC8pID8gW11cbiAgICAgICAgICAgIG5vdHIgXCJJZ25vcmluZyBmaWxlIG9mIHR5cGUgI3tleHR9XCJcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICMgbWVzc2FnZSBmb3IgYSBwbGFjZWhvbGRlclxuICAgICAgICBtc2cgPSB1c2VyaW5wdXQuYnVpbGRDaGF0TWVzc2FnZSAndXBsb2FkaW5nIGltYWdl4oCmJ1xuICAgICAgICBtc2cudXBsb2FkaW1hZ2UgPSB0cnVlXG4gICAgICAgIHtjbGllbnRfZ2VuZXJhdGVkX2lkfSA9IG1zZ1xuICAgICAgICAjIGFkZCBhIHBsYWNlaG9sZGVyIGZvciB0aGUgaW1hZ2VcbiAgICAgICAgY29udi5hZGRDaGF0TWVzc2FnZVBsYWNlaG9sZGVyIGVudGl0eS5zZWxmLmlkLCBtc2dcbiAgICAgICAgIyBhbmQgYmVnaW4gdXBsb2FkXG4gICAgICAgIGlwYy5zZW5kICd1cGxvYWRpbWFnZScsIHtwYXRoOmZpbGUucGF0aCwgY29udl9pZCwgY2xpZW50X2dlbmVyYXRlZF9pZH1cblxuaGFuZGxlICdvbnBhc3RlaW1hZ2UnLCAtPlxuICAgIGNvbnZfaWQgPSB2aWV3c3RhdGUuc2VsZWN0ZWRDb252XG4gICAgcmV0dXJuIHVubGVzcyBjb252X2lkXG4gICAgbXNnID0gdXNlcmlucHV0LmJ1aWxkQ2hhdE1lc3NhZ2UgJ3VwbG9hZGluZyBpbWFnZeKApidcbiAgICBtc2cudXBsb2FkaW1hZ2UgPSB0cnVlXG4gICAge2NsaWVudF9nZW5lcmF0ZWRfaWR9ID0gbXNnXG4gICAgY29udi5hZGRDaGF0TWVzc2FnZVBsYWNlaG9sZGVyIGVudGl0eS5zZWxmLmlkLCBtc2dcbiAgICBpcGMuc2VuZCAndXBsb2FkY2xpcGJvYXJkaW1hZ2UnLCB7Y29udl9pZCwgY2xpZW50X2dlbmVyYXRlZF9pZH1cblxuaGFuZGxlICd1cGxvYWRpbmdpbWFnZScsIChzcGVjKSAtPlxuICAgICMgWFhYIHRoaXMgZG9lc24ndCBsb29rIHZlcnkgZ29vZCBiZWNhdXNlIHRoZSBpbWFnZVxuICAgICMgc2hvd3MsIHRoZW4gZmxpY2tlcnMgYXdheSBiZWZvcmUgdGhlIHJlYWwgaXMgbG9hZGVkXG4gICAgIyBmcm9tIHRoZSB1cGxvYWQuXG4gICAgI2NvbnYudXBkYXRlUGxhY2Vob2xkZXJJbWFnZSBzcGVjXG5cbmhhbmRsZSAnbGVmdHJlc2l6ZScsIChzaXplKSAtPiB2aWV3c3RhdGUuc2V0TGVmdFNpemUgc2l6ZVxuaGFuZGxlICdyZXNpemUnLCAoZGltKSAtPiB2aWV3c3RhdGUuc2V0U2l6ZSBkaW1cbmhhbmRsZSAnbW92ZScsIChwb3MpIC0+IHZpZXdzdGF0ZS5zZXRQb3NpdGlvbiBwb3NcblxuaGFuZGxlICdjb252ZXJzYXRpb25uYW1lJywgKG5hbWUpIC0+XG4gICAgY29udnNldHRpbmdzLnNldE5hbWUgbmFtZVxuaGFuZGxlICdjb252ZXJzYXRpb25xdWVyeScsIChxdWVyeSkgLT5cbiAgICBjb252c2V0dGluZ3Muc2V0U2VhcmNoUXVlcnkgcXVlcnlcbmhhbmRsZSAnc2VhcmNoZW50aXRpZXMnLCAocXVlcnksIG1heF9yZXN1bHRzKSAtPlxuICAgIGlwYy5zZW5kICdzZWFyY2hlbnRpdGllcycsIHF1ZXJ5LCBtYXhfcmVzdWx0c1xuaGFuZGxlICdzZXRzZWFyY2hlZGVudGl0aWVzJywgKHIpIC0+XG4gICAgY29udnNldHRpbmdzLnNldFNlYXJjaGVkRW50aXRpZXMgclxuaGFuZGxlICdzZWxlY3RlbnRpdHknLCAoZSkgLT4gY29udnNldHRpbmdzLmFkZFNlbGVjdGVkRW50aXR5IGVcbmhhbmRsZSAnZGVzZWxlY3RlbnRpdHknLCAoZSkgLT4gY29udnNldHRpbmdzLnJlbW92ZVNlbGVjdGVkRW50aXR5IGVcbmhhbmRsZSAndG9nZ2xlZ3JvdXAnLCAoZSkgLT4gY29udnNldHRpbmdzLnNldEdyb3VwKCFjb252c2V0dGluZ3MuZ3JvdXApXG5cbmhhbmRsZSAnc2F2ZWNvbnZlcnNhdGlvbicsIC0+XG4gICAgdmlld3N0YXRlLnNldFN0YXRlIHZpZXdzdGF0ZS5TVEFURV9OT1JNQUxcbiAgICBjb252X2lkID0gY29udnNldHRpbmdzLmlkXG4gICAgYyA9IGNvbnZbY29udl9pZF1cbiAgICBvbmVfdG9fb25lID0gYz8udHlwZT8uaW5kZXhPZignT05FX1RPX09ORScpID49IDBcbiAgICBzZWxlY3RlZCA9IChlLmlkLmNoYXRfaWQgZm9yIGUgaW4gY29udnNldHRpbmdzLnNlbGVjdGVkRW50aXRpZXMpXG4gICAgcmVjcmVhdGUgPSBjb252X2lkIGFuZCBvbmVfdG9fb25lIGFuZCBjb252c2V0dGluZ3MuZ3JvdXBcbiAgICBuZWVkc1JlbmFtZSA9IGNvbnZzZXR0aW5ncy5ncm91cCBhbmQgY29udnNldHRpbmdzLm5hbWUgYW5kIGNvbnZzZXR0aW5ncy5uYW1lICE9IGM/Lm5hbWVcbiAgICAjIHJlbWVtYmVyOiB3ZSBkb24ndCByZW5hbWUgb25lX3RvX29uZXMsIGdvb2dsZSB3ZWIgY2xpZW50IGRvZXMgbm90IGRvIGl0XG4gICAgaWYgbm90IGNvbnZfaWQgb3IgcmVjcmVhdGVcbiAgICAgICAgbmFtZSA9IChjb252c2V0dGluZ3MubmFtZSBpZiBjb252c2V0dGluZ3MuZ3JvdXApIG9yIFwiXCJcbiAgICAgICAgaXBjLnNlbmQgJ2NyZWF0ZWNvbnZlcnNhdGlvbicsIHNlbGVjdGVkLCBuYW1lLCBjb252c2V0dGluZ3MuZ3JvdXBcbiAgICAgICAgcmV0dXJuXG4gICAgcCA9IGMucGFydGljaXBhbnRfZGF0YVxuICAgIGN1cnJlbnQgPSAoYy5pZC5jaGF0X2lkIGZvciBjIGluIHAgd2hlbiBub3QgZW50aXR5LmlzU2VsZiBjLmlkLmNoYXRfaWQpXG4gICAgdG9hZGQgPSAoaWQgZm9yIGlkIGluIHNlbGVjdGVkIHdoZW4gaWQgbm90IGluIGN1cnJlbnQpXG4gICAgaXBjLnNlbmQgJ2FkZHVzZXInLCBjb252X2lkLCB0b2FkZCBpZiB0b2FkZC5sZW5ndGhcbiAgICBpcGMuc2VuZCAncmVuYW1lY29udmVyc2F0aW9uJywgY29udl9pZCwgY29udnNldHRpbmdzLm5hbWUgaWYgbmVlZHNSZW5hbWVcblxuaGFuZGxlICdjb252ZXJzYXRpb25fcmVuYW1lJywgKGMpIC0+XG4gICAgY29udi5yZW5hbWUgYywgYy5jb252ZXJzYXRpb25fcmVuYW1lLm5ld19uYW1lXG4gICAgY29udi5hZGRDaGF0TWVzc2FnZSBjXG5cbmhhbmRsZSAnbWVtYmVyc2hpcF9jaGFuZ2UnLCAoZSkgLT5cbiAgICBjb252X2lkID0gZS5jb252ZXJzYXRpb25faWQuaWRcbiAgICBpZHMgPSAoaWQuY2hhdF9pZCBvciBpZC5nYWlhX2lkIGZvciBpZCBpbiBlLm1lbWJlcnNoaXBfY2hhbmdlLnBhcnRpY2lwYW50X2lkcylcbiAgICBpZiBlLm1lbWJlcnNoaXBfY2hhbmdlLnR5cGUgPT0gJ0xFQVZFJ1xuICAgICAgICBpZiBlbnRpdHkuc2VsZi5pZCBpbiBpZHNcbiAgICAgICAgICAgIHJldHVybiBjb252LmRlbGV0ZUNvbnYgY29udl9pZFxuICAgICAgICByZXR1cm4gY29udi5yZW1vdmVQYXJ0aWNpcGFudHMgY29udl9pZCwgaWRzXG4gICAgY29udi5hZGRDaGF0TWVzc2FnZSBlXG4gICAgaXBjLnNlbmQgJ2dldGVudGl0eScsIGlkcywge2FkZF90b19jb252OiBjb252X2lkfVxuXG5oYW5kbGUgJ2NyZWF0ZWNvbnZlcnNhdGlvbmRvbmUnLCAoYykgLT5cbiAgICBjb252c2V0dGluZ3MucmVzZXQoKVxuICAgIGNvbnYuYWRkIGNcbiAgICB2aWV3c3RhdGUuc2V0U2VsZWN0ZWRDb252IGMuaWQuaWRcblxuaGFuZGxlICdub3RpZmljYXRpb25fbGV2ZWwnLCAobikgLT5cbiAgICBjb252X2lkID0gbj9bMF0/WzBdXG4gICAgbGV2ZWwgPSBpZiBuP1sxXSA9PSAxMCB0aGVuICdRVUlFVCcgZWxzZSAnUklORydcbiAgICBjb252LnNldE5vdGlmaWNhdGlvbkxldmVsIGNvbnZfaWQsIGxldmVsIGlmIGNvbnZfaWQgYW5kIGxldmVsXG5cbmhhbmRsZSAndG9nZ2xlbm90aWYnLCAtPlxuICAgIHtRVUlFVCwgUklOR30gPSBDbGllbnQuTm90aWZpY2F0aW9uTGV2ZWxcbiAgICBjb252X2lkID0gdmlld3N0YXRlLnNlbGVjdGVkQ29udlxuICAgIHJldHVybiB1bmxlc3MgYyA9IGNvbnZbY29udl9pZF1cbiAgICBxID0gY29udi5pc1F1aWV0KGMpXG4gICAgaXBjLnNlbmQgJ3NldGNvbnZlcnNhdGlvbm5vdGlmaWNhdGlvbmxldmVsJywgY29udl9pZCwgKGlmIHEgdGhlbiBSSU5HIGVsc2UgUVVJRVQpXG4gICAgY29udi5zZXROb3RpZmljYXRpb25MZXZlbCBjb252X2lkLCAoaWYgcSB0aGVuICdSSU5HJyBlbHNlICdRVUlFVCcpXG5cbmhhbmRsZSAndG9nZ2xlc3RhcicsIC0+XG4gICAgY29udl9pZCA9IHZpZXdzdGF0ZS5zZWxlY3RlZENvbnZcbiAgICByZXR1cm4gdW5sZXNzIGMgPSBjb252W2NvbnZfaWRdXG4gICAgY29udi50b2dnbGVTdGFyKGMpXG5cbmhhbmRsZSAnZGVsZXRlJywgKGEpIC0+XG4gICAgY29udl9pZCA9IGE/WzBdP1swXVxuICAgIHJldHVybiB1bmxlc3MgYyA9IGNvbnZbY29udl9pZF1cbiAgICBjb252LmRlbGV0ZUNvbnYgY29udl9pZFxuXG5oYW5kbGUgJ2RlbGV0ZWNvbnYnLCAoY29uZmlybWVkKSAtPlxuICAgIGNvbnZfaWQgPSB2aWV3c3RhdGUuc2VsZWN0ZWRDb252XG4gICAgdW5sZXNzIGNvbmZpcm1lZFxuICAgICAgICBsYXRlciAtPiBpZiBjb25maXJtICdSZWFsbHkgZGVsZXRlIGNvbnZlcnNhdGlvbj8nXG4gICAgICAgICAgICBhY3Rpb24gJ2RlbGV0ZWNvbnYnLCB0cnVlXG4gICAgZWxzZVxuICAgICAgICBpcGMuc2VuZCAnZGVsZXRlY29udmVyc2F0aW9uJywgY29udl9pZFxuXG5oYW5kbGUgJ2xlYXZlY29udicsIChjb25maXJtZWQpIC0+XG4gICAgY29udl9pZCA9IHZpZXdzdGF0ZS5zZWxlY3RlZENvbnZcbiAgICB1bmxlc3MgY29uZmlybWVkXG4gICAgICAgIGxhdGVyIC0+IGlmIGNvbmZpcm0gJ1JlYWxseSBsZWF2ZSBjb252ZXJzYXRpb24/J1xuICAgICAgICAgICAgYWN0aW9uICdsZWF2ZWNvbnYnLCB0cnVlXG4gICAgZWxzZVxuICAgICAgICBpcGMuc2VuZCAncmVtb3ZldXNlcicsIGNvbnZfaWRcblxuaGFuZGxlICdsYXN0a2V5ZG93bicsICh0aW1lKSAtPiB2aWV3c3RhdGUuc2V0TGFzdEtleURvd24gdGltZVxuaGFuZGxlICdzZXR0eXBpbmcnLCAodikgLT5cbiAgICBjb252X2lkID0gdmlld3N0YXRlLnNlbGVjdGVkQ29udlxuICAgIHJldHVybiB1bmxlc3MgY29udl9pZCBhbmQgdmlld3N0YXRlLnN0YXRlID09IHZpZXdzdGF0ZS5TVEFURV9OT1JNQUxcbiAgICBpcGMuc2VuZCAnc2V0dHlwaW5nJywgY29udl9pZCwgdlxuXG5oYW5kbGUgJ3R5cGluZycsICh0KSAtPlxuICAgIGNvbnYuYWRkVHlwaW5nIHRcbmhhbmRsZSAncHJ1bmVUeXBpbmcnLCAoY29udl9pZCkgLT5cbiAgICBjb252LnBydW5lVHlwaW5nIGNvbnZfaWRcblxuaGFuZGxlICdzeW5jYWxsbmV3ZXZlbnRzJywgdGhyb3R0bGUgMTAwMDAsICh0aW1lKSAtPlxuICAgIHJldHVybiB1bmxlc3MgdGltZVxuICAgIGlwYy5zZW5kICdzeW5jYWxsbmV3ZXZlbnRzJywgdGltZVxuaGFuZGxlICdoYW5kbGVzeW5jZWRldmVudHMnLCAocikgLT5cbiAgICBzdGF0ZXMgPSByPy5jb252ZXJzYXRpb25fc3RhdGVcbiAgICByZXR1cm4gdW5sZXNzIHN0YXRlcz8ubGVuZ3RoXG4gICAgZm9yIHN0IGluIHN0YXRlc1xuICAgICAgICBmb3IgZSBpbiAoc3Q/LmV2ZW50ID8gW10pXG4gICAgICAgICAgICBjb252LmFkZENoYXRNZXNzYWdlIGVcbiAgICBjb25uZWN0aW9uLnNldEV2ZW50U3RhdGUgY29ubmVjdGlvbi5JTl9TWU5DXG5cbmhhbmRsZSAnc3luY3JlY2VudGNvbnZlcnNhdGlvbnMnLCB0aHJvdHRsZSAxMDAwMCwgLT5cbiAgICBpcGMuc2VuZCAnc3luY3JlY2VudGNvbnZlcnNhdGlvbnMnXG5oYW5kbGUgJ2hhbmRsZXJlY2VudGNvbnZlcnNhdGlvbnMnLCAocikgLT5cbiAgICByZXR1cm4gdW5sZXNzIHN0ID0gci5jb252ZXJzYXRpb25fc3RhdGVcbiAgICBjb252LnJlcGxhY2VGcm9tU3RhdGVzIHN0XG4gICAgY29ubmVjdGlvbi5zZXRFdmVudFN0YXRlIGNvbm5lY3Rpb24uSU5fU1lOQ1xuXG5oYW5kbGUgJ2NsaWVudF9jb252ZXJzYXRpb24nLCAoYykgLT5cbiAgICBjb252LmFkZCBjIHVubGVzcyBjb252W2M/LmNvbnZlcnNhdGlvbl9pZD8uaWRdXG5cbmhhbmRsZSAnaGFuZ291dF9ldmVudCcsIChlKSAtPlxuICAgIHJldHVybiB1bmxlc3MgZT8uaGFuZ291dF9ldmVudD8uZXZlbnRfdHlwZSBpbiBbJ1NUQVJUX0hBTkdPVVQnLCAnRU5EX0hBTkdPVVQnXVxuICAgICMgdHJpZ2dlciBub3RpZmljYXRpb25zIGZvciB0aGlzXG4gICAgbm90aWZ5LmFkZFRvTm90aWZ5IGVcblxuJ3ByZXNlbmNlIHJlcGx5X3RvX2ludml0ZSBzZXR0aW5ncyBjb252ZXJzYXRpb25fbm90aWZpY2F0aW9uIGludml0YXRpb25fd2F0ZXJtYXJrJy5zcGxpdCgnICcpLmZvckVhY2ggKG4pIC0+XG4gICAgaGFuZGxlIG4sIChhcy4uLikgLT4gY29uc29sZS5sb2cgbiwgYXMuLi5cblxuaGFuZGxlICd1bnJlYWR0b3RhbCcsICh0b3RhbCwgb3JNb3JlKSAtPlxuICAgIHZhbHVlID0gXCJcIlxuICAgIGlmIHRvdGFsID4gMCB0aGVuIHZhbHVlID0gdG90YWwgKyAoaWYgb3JNb3JlIHRoZW4gXCIrXCIgZWxzZSBcIlwiKVxuICAgIGlwYy5zZW5kICd1cGRhdGViYWRnZScsIHZhbHVlXG5cbmhhbmRsZSAnc2hvd2NvbnZ0aHVtYnMnLCAoZG9zaG93KSAtPlxuICAgIHZpZXdzdGF0ZS5zZXRTaG93Q29udlRodW1icyBkb3Nob3dcblxuaGFuZGxlICdkZXZ0b29scycsIC0+XG4gICAgcmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKS5vcGVuRGV2VG9vbHMgZGV0YWNoOnRydWVcblxuaGFuZGxlICdxdWl0JywgLT5cbiAgICBpcGMuc2VuZCAncXVpdCdcblxuaGFuZGxlICd0b2dnbGVmdWxsc2NyZWVuJywgLT5cbiAgICBpcGMuc2VuZCAndG9nZ2xlZnVsbHNjcmVlbidcblxuaGFuZGxlICd6b29tJywgKHN0ZXApIC0+XG4gICAgaWYgc3RlcD9cbiAgICAgICAgcmV0dXJuIHZpZXdzdGF0ZS5zZXRab29tIChwYXJzZUZsb2F0KGRvY3VtZW50LmJvZHkuc3R5bGUuem9vbSkgb3IgMS4wKSArIHN0ZXBcbiAgICB2aWV3c3RhdGUuc2V0Wm9vbSAxXG5cbmhhbmRsZSAnbG9nb3V0JywgLT5cbiAgICBpcGMuc2VuZCAnbG9nb3V0J1xuXG5oYW5kbGUgJ3dvbmxpbmUnLCAod29ubGluZSkgLT5cbiAgICBjb25uZWN0aW9uLnNldFdpbmRvd09ubGluZSB3b25saW5lXG4gICAgaWYgd29ubGluZVxuICAgICAgICBpcGMuc2VuZCAnaGFuZ3Vwc0Nvbm5lY3QnXG4gICAgZWxzZVxuICAgICAgICBpcGMuc2VuZCAnaGFuZ3Vwc0Rpc2Nvbm5lY3QnXG4iXX0=
