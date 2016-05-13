(function() {
  var callNeedAnswer, getProxiedName, nameof, notifier, openHangout, path, ref, shell, textMessage;

  notifier = require('node-notifier');

  shell = require('shell');

  path = require('path');

  ref = require('../util'), nameof = ref.nameof, getProxiedName = ref.getProxiedName;

  callNeedAnswer = {};

  module.exports = function(models) {
    var conv, entity, notify, quietIf, tonot;
    conv = models.conv, notify = models.notify, entity = models.entity;
    tonot = notify.popToNotify();
    quietIf = function(c, chat_id) {
      return (typeof document !== "undefined" && document !== null ? document.hasFocus() : void 0) || conv.isQuiet(c) || entity.isSelf(chat_id);
    };
    return tonot.forEach(function(msg) {
      var c, chat_id, cid, conv_id, proxied, ref1, ref2, ref3, ref4, ref5, ref6, sender, text;
      conv_id = msg != null ? (ref1 = msg.conversation_id) != null ? ref1.id : void 0 : void 0;
      c = conv[conv_id];
      chat_id = msg != null ? (ref2 = msg.sender_id) != null ? ref2.chat_id : void 0 : void 0;
      proxied = getProxiedName(msg);
      cid = proxied ? proxied : msg != null ? (ref3 = msg.sender_id) != null ? ref3.chat_id : void 0 : void 0;
      sender = nameof(entity[cid]);
      text = null;
      if (msg.chat_message != null) {
        if (((ref4 = msg.chat_message) != null ? ref4.message_content : void 0) == null) {
          return;
        }
        text = textMessage(msg.chat_message.message_content, proxied);
      } else if (((ref5 = msg.hangout_event) != null ? ref5.event_type : void 0) === 'START_HANGOUT') {
        text = "Recebendo chamada";
        callNeedAnswer[conv_id] = true;
        notr({
          html: ("Recebendo chamada de " + sender + ". ") + '<a href="#" class="accept">Aceitar</a> / ' + '<a href="#" class="reject">Rejeitar</a>',
          stay: 0,
          id: "hang" + conv_id,
          onclick: function(e) {
            var ref6;
            delete callNeedAnswer[conv_id];
            if ((e != null ? (ref6 = e.target) != null ? ref6.className : void 0 : void 0) === 'accept') {
              notr({
                html: 'Atendido',
                stay: 1000,
                id: "hang" + conv_id
              });
              return openHangout(conv_id);
            } else {
              return notr({
                html: 'Rejeitado',
                stay: 1000,
                id: "hang" + conv_id
              });
            }
          }
        });
      } else if (((ref6 = msg.hangout_event) != null ? ref6.event_type : void 0) === 'END_HANGOUT') {
        if (callNeedAnswer[conv_id]) {
          delete callNeedAnswer[conv_id];
          notr({
            html: ("Chamada perdida de " + sender + ". ") + '<a href="#">OK</a>',
            id: "hang" + conv_id,
            stay: 0
          });
        }
      } else {
        return;
      }
      if (!text || quietIf(c, chat_id)) {
        return;
      }
      return notifier.notify({
        title: sender,
        message: text,
        wait: true,
        sender: 'com.github.yakyak',
        sound: true
      }, function(err, res) {
        if (res != null ? res.trim().match(/Activate/) : void 0) {
          action('appfocus');
          return action('selectConv', c);
        }
      });
    });
  };

  textMessage = function(cont, proxied) {
    var i, seg, segs;
    segs = (function() {
      var j, len, ref1, ref2, results;
      ref2 = (ref1 = cont != null ? cont.segment : void 0) != null ? ref1 : [];
      results = [];
      for (i = j = 0, len = ref2.length; j < len; i = ++j) {
        seg = ref2[i];
        if (proxied && i < 2) {
          continue;
        }
        if (!seg.text) {
          continue;
        }
        results.push(seg.text);
      }
      return results;
    })();
    return segs.join('');
  };

  openHangout = function(conv_id) {
    return shell.openExternal("https://plus.google.com/hangouts/_/CONVERSATION/" + conv_id);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVpL3ZpZXdzL25vdGlmaWNhdGlvbnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGVBQVI7O0VBQ1gsS0FBQSxHQUFXLE9BQUEsQ0FBUSxPQUFSOztFQUNYLElBQUEsR0FBVyxPQUFBLENBQVEsTUFBUjs7RUFFWCxNQUEyQixPQUFBLENBQVEsU0FBUixDQUEzQixFQUFDLGFBQUEsTUFBRCxFQUFTLHFCQUFBOztFQUdULGNBQUEsR0FBaUI7O0VBRWpCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsTUFBRDtBQUNiLFFBQUE7SUFBQyxjQUFBLElBQUQsRUFBTyxnQkFBQSxNQUFQLEVBQWUsZ0JBQUE7SUFDZixLQUFBLEdBQVEsTUFBTSxDQUFDLFdBQVAsQ0FBQTtJQUVSLE9BQUEsR0FBVSxTQUFDLENBQUQsRUFBSSxPQUFKO3FFQUFnQixRQUFRLENBQUUsUUFBVixDQUFBLFdBQUEsSUFBd0IsSUFBSSxDQUFDLE9BQUwsQ0FBYSxDQUFiLENBQXhCLElBQTJDLE1BQU0sQ0FBQyxNQUFQLENBQWMsT0FBZDtJQUEzRDtXQUVWLEtBQUssQ0FBQyxPQUFOLENBQWMsU0FBQyxHQUFEO0FBQ1YsVUFBQTtNQUFBLE9BQUEsNERBQThCLENBQUU7TUFDaEMsQ0FBQSxHQUFJLElBQUssQ0FBQSxPQUFBO01BQ1QsT0FBQSxzREFBd0IsQ0FBRTtNQUUxQixPQUFBLEdBQVUsY0FBQSxDQUFlLEdBQWY7TUFDVixHQUFBLEdBQVMsT0FBSCxHQUFnQixPQUFoQixzREFBMkMsQ0FBRTtNQUNuRCxNQUFBLEdBQVMsTUFBQSxDQUFPLE1BQU8sQ0FBQSxHQUFBLENBQWQ7TUFDVCxJQUFBLEdBQU87TUFFUCxJQUFHLHdCQUFIO1FBQ0ksSUFBYywyRUFBZDtBQUFBLGlCQUFBOztRQUNBLElBQUEsR0FBTyxXQUFBLENBQVksR0FBRyxDQUFDLFlBQVksQ0FBQyxlQUE3QixFQUE4QyxPQUE5QyxFQUZYO09BQUEsTUFHSyw4Q0FBb0IsQ0FBRSxvQkFBbkIsS0FBaUMsZUFBcEM7UUFDRCxJQUFBLEdBQU87UUFDUCxjQUFlLENBQUEsT0FBQSxDQUFmLEdBQTBCO1FBQzFCLElBQUEsQ0FDSTtVQUFBLElBQUEsRUFBTSxDQUFBLHFCQUFBLEdBQXNCLE1BQXRCLEdBQTZCLElBQTdCLENBQUEsR0FDTiwwQ0FETSxHQUVOLHVDQUZBO1VBR0EsSUFBQSxFQUFNLENBSE47VUFJQSxFQUFBLEVBQUksTUFBQSxHQUFPLE9BSlg7VUFLQSxPQUFBLEVBQVMsU0FBQyxDQUFEO0FBQ0wsZ0JBQUE7WUFBQSxPQUFPLGNBQWUsQ0FBQSxPQUFBO1lBQ3RCLGlEQUFZLENBQUUsNEJBQVgsS0FBd0IsUUFBM0I7Y0FDSSxJQUFBLENBQUs7Z0JBQUMsSUFBQSxFQUFLLFVBQU47Z0JBQWtCLElBQUEsRUFBSyxJQUF2QjtnQkFBNkIsRUFBQSxFQUFHLE1BQUEsR0FBTyxPQUF2QztlQUFMO3FCQUNBLFdBQUEsQ0FBWSxPQUFaLEVBRko7YUFBQSxNQUFBO3FCQUlJLElBQUEsQ0FBSztnQkFBQyxJQUFBLEVBQUssVUFBTjtnQkFBa0IsSUFBQSxFQUFLLElBQXZCO2dCQUE2QixFQUFBLEVBQUcsTUFBQSxHQUFPLE9BQXZDO2VBQUwsRUFKSjs7VUFGSyxDQUxUO1NBREosRUFIQztPQUFBLE1BZ0JBLDhDQUFvQixDQUFFLG9CQUFuQixLQUFpQyxhQUFwQztRQUNELElBQUcsY0FBZSxDQUFBLE9BQUEsQ0FBbEI7VUFDSSxPQUFPLGNBQWUsQ0FBQSxPQUFBO1VBQ3RCLElBQUEsQ0FDSTtZQUFBLElBQUEsRUFBTSxDQUFBLG1CQUFBLEdBQW9CLE1BQXBCLEdBQTJCLElBQTNCLENBQUEsR0FBaUMsb0JBQXZDO1lBQ0EsRUFBQSxFQUFJLE1BQUEsR0FBTyxPQURYO1lBRUEsSUFBQSxFQUFNLENBRk47V0FESixFQUZKO1NBREM7T0FBQSxNQUFBO0FBUUQsZUFSQzs7TUFXTCxJQUFVLENBQUMsSUFBRCxJQUFTLE9BQUEsQ0FBUSxDQUFSLEVBQVcsT0FBWCxDQUFuQjtBQUFBLGVBQUE7O2FBQ0EsUUFBUSxDQUFDLE1BQVQsQ0FDSTtRQUFBLEtBQUEsRUFBTyxNQUFQO1FBQ0EsT0FBQSxFQUFTLElBRFQ7UUFFQSxJQUFBLEVBQU0sSUFGTjtRQUdBLE1BQUEsRUFBUSxtQkFIUjtRQUlBLEtBQUEsRUFBTyxJQUpQO09BREosRUFNRSxTQUFDLEdBQUQsRUFBTSxHQUFOO1FBQ0Esa0JBQUcsR0FBRyxDQUFFLElBQUwsQ0FBQSxDQUFXLENBQUMsS0FBWixDQUFrQixVQUFsQixVQUFIO1VBQ0UsTUFBQSxDQUFPLFVBQVA7aUJBQ0EsTUFBQSxDQUFPLFlBQVAsRUFBcUIsQ0FBckIsRUFGRjs7TUFEQSxDQU5GO0lBekNVLENBQWQ7RUFOYTs7RUEyRGpCLFdBQUEsR0FBYyxTQUFDLElBQUQsRUFBTyxPQUFQO0FBQ1YsUUFBQTtJQUFBLElBQUE7O0FBQU87QUFBQTtXQUFBLDhDQUFBOztRQUNILElBQVksT0FBQSxJQUFZLENBQUEsR0FBSSxDQUE1QjtBQUFBLG1CQUFBOztRQUNBLElBQUEsQ0FBZ0IsR0FBRyxDQUFDLElBQXBCO0FBQUEsbUJBQUE7O3FCQUNBLEdBQUcsQ0FBQztBQUhEOzs7V0FJUCxJQUFJLENBQUMsSUFBTCxDQUFVLEVBQVY7RUFMVTs7RUFRZCxXQUFBLEdBQWMsU0FBQyxPQUFEO1dBQ1YsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsa0RBQUEsR0FBbUQsT0FBdEU7RUFEVTtBQTVFZCIsImZpbGUiOiJ1aS92aWV3cy9ub3RpZmljYXRpb25zLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsibm90aWZpZXIgPSByZXF1aXJlICdub2RlLW5vdGlmaWVyJ1xuc2hlbGwgICAgPSByZXF1aXJlICdzaGVsbCdcbnBhdGggICAgID0gcmVxdWlyZSAncGF0aCdcblxue25hbWVvZiwgZ2V0UHJveGllZE5hbWV9ID0gcmVxdWlyZSAnLi4vdXRpbCdcblxuIyBjb252X2lkIG1hcmtlcnMgZm9yIGNhbGwgbm90aWZpY2F0aW9uc1xuY2FsbE5lZWRBbnN3ZXIgPSB7fVxuXG5tb2R1bGUuZXhwb3J0cyA9IChtb2RlbHMpIC0+XG4gICAge2NvbnYsIG5vdGlmeSwgZW50aXR5fSA9IG1vZGVsc1xuICAgIHRvbm90ID0gbm90aWZ5LnBvcFRvTm90aWZ5KClcblxuICAgIHF1aWV0SWYgPSAoYywgY2hhdF9pZCkgLT4gZG9jdW1lbnQ/Lmhhc0ZvY3VzKCkgb3IgY29udi5pc1F1aWV0KGMpIG9yIGVudGl0eS5pc1NlbGYoY2hhdF9pZClcblxuICAgIHRvbm90LmZvckVhY2ggKG1zZykgLT5cbiAgICAgICAgY29udl9pZCA9IG1zZz8uY29udmVyc2F0aW9uX2lkPy5pZFxuICAgICAgICBjID0gY29udltjb252X2lkXVxuICAgICAgICBjaGF0X2lkID0gbXNnPy5zZW5kZXJfaWQ/LmNoYXRfaWRcblxuICAgICAgICBwcm94aWVkID0gZ2V0UHJveGllZE5hbWUobXNnKVxuICAgICAgICBjaWQgPSBpZiBwcm94aWVkIHRoZW4gcHJveGllZCBlbHNlIG1zZz8uc2VuZGVyX2lkPy5jaGF0X2lkXG4gICAgICAgIHNlbmRlciA9IG5hbWVvZiBlbnRpdHlbY2lkXVxuICAgICAgICB0ZXh0ID0gbnVsbFxuXG4gICAgICAgIGlmIG1zZy5jaGF0X21lc3NhZ2U/XG4gICAgICAgICAgICByZXR1cm4gdW5sZXNzIG1zZy5jaGF0X21lc3NhZ2U/Lm1lc3NhZ2VfY29udGVudD9cbiAgICAgICAgICAgIHRleHQgPSB0ZXh0TWVzc2FnZSBtc2cuY2hhdF9tZXNzYWdlLm1lc3NhZ2VfY29udGVudCwgcHJveGllZFxuICAgICAgICBlbHNlIGlmIG1zZy5oYW5nb3V0X2V2ZW50Py5ldmVudF90eXBlID09ICdTVEFSVF9IQU5HT1VUJ1xuICAgICAgICAgICAgdGV4dCA9IFwiSW5jb21pbmcgY2FsbFwiXG4gICAgICAgICAgICBjYWxsTmVlZEFuc3dlcltjb252X2lkXSA9IHRydWVcbiAgICAgICAgICAgIG5vdHJcbiAgICAgICAgICAgICAgICBodG1sOiBcIkluY29taW5nIGNhbGwgZnJvbSAje3NlbmRlcn0uIFwiICtcbiAgICAgICAgICAgICAgICAnPGEgaHJlZj1cIiNcIiBjbGFzcz1cImFjY2VwdFwiPkFjY2VwdDwvYT4gLyAnICtcbiAgICAgICAgICAgICAgICAnPGEgaHJlZj1cIiNcIiBjbGFzcz1cInJlamVjdFwiPlJlamVjdDwvYT4nXG4gICAgICAgICAgICAgICAgc3RheTogMFxuICAgICAgICAgICAgICAgIGlkOiBcImhhbmcje2NvbnZfaWR9XCJcbiAgICAgICAgICAgICAgICBvbmNsaWNrOiAoZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGNhbGxOZWVkQW5zd2VyW2NvbnZfaWRdXG4gICAgICAgICAgICAgICAgICAgIGlmIGU/LnRhcmdldD8uY2xhc3NOYW1lID09ICdhY2NlcHQnXG4gICAgICAgICAgICAgICAgICAgICAgICBub3RyKHtodG1sOidBY2NlcHRlZCcsIHN0YXk6MTAwMCwgaWQ6XCJoYW5nI3tjb252X2lkfVwifSlcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZW5IYW5nb3V0IGNvbnZfaWRcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgbm90cih7aHRtbDonUmVqZWN0ZWQnLCBzdGF5OjEwMDAsIGlkOlwiaGFuZyN7Y29udl9pZH1cIn0pXG4gICAgICAgIGVsc2UgaWYgbXNnLmhhbmdvdXRfZXZlbnQ/LmV2ZW50X3R5cGUgPT0gJ0VORF9IQU5HT1VUJ1xuICAgICAgICAgICAgaWYgY2FsbE5lZWRBbnN3ZXJbY29udl9pZF1cbiAgICAgICAgICAgICAgICBkZWxldGUgY2FsbE5lZWRBbnN3ZXJbY29udl9pZF1cbiAgICAgICAgICAgICAgICBub3RyXG4gICAgICAgICAgICAgICAgICAgIGh0bWw6IFwiTWlzc2VkIGNhbGwgZnJvbSAje3NlbmRlcn0uIFwiICsgJzxhIGhyZWY9XCIjXCI+T0s8L2E+J1xuICAgICAgICAgICAgICAgICAgICBpZDogXCJoYW5nI3tjb252X2lkfVwiXG4gICAgICAgICAgICAgICAgICAgIHN0YXk6IDBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgIyBtYXliZSB0cmlnZ2VyIE9TIG5vdGlmaWNhdGlvblxuICAgICAgICByZXR1cm4gaWYgIXRleHQgb3IgcXVpZXRJZihjLCBjaGF0X2lkKVxuICAgICAgICBub3RpZmllci5ub3RpZnlcbiAgICAgICAgICAgIHRpdGxlOiBzZW5kZXJcbiAgICAgICAgICAgIG1lc3NhZ2U6IHRleHRcbiAgICAgICAgICAgIHdhaXQ6IHRydWVcbiAgICAgICAgICAgIHNlbmRlcjogJ2NvbS5naXRodWIueWFreWFrJ1xuICAgICAgICAgICAgc291bmQ6IHRydWVcbiAgICAgICAgLCAoZXJyLCByZXMpIC0+XG4gICAgICAgICAgaWYgcmVzPy50cmltKCkubWF0Y2goL0FjdGl2YXRlLylcbiAgICAgICAgICAgIGFjdGlvbiAnYXBwZm9jdXMnXG4gICAgICAgICAgICBhY3Rpb24gJ3NlbGVjdENvbnYnLCBjXG5cblxudGV4dE1lc3NhZ2UgPSAoY29udCwgcHJveGllZCkgLT5cbiAgICBzZWdzID0gZm9yIHNlZywgaSBpbiBjb250Py5zZWdtZW50ID8gW11cbiAgICAgICAgY29udGludWUgaWYgcHJveGllZCBhbmQgaSA8IDJcbiAgICAgICAgY29udGludWUgdW5sZXNzIHNlZy50ZXh0XG4gICAgICAgIHNlZy50ZXh0XG4gICAgc2Vncy5qb2luKCcnKVxuXG5cbm9wZW5IYW5nb3V0ID0gKGNvbnZfaWQpIC0+XG4gICAgc2hlbGwub3BlbkV4dGVybmFsIFwiaHR0cHM6Ly9wbHVzLmdvb2dsZS5jb20vaGFuZ291dHMvXy9DT05WRVJTQVRJT04vI3tjb252X2lkfVwiXG4iXX0=
