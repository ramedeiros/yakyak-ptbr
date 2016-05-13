(function() {
  var autosize, clipboard, cursorToEnd, emojiCategories, history, historyBackup, historyIndex, historyLength, historyPush, historyWalk, insertTextAtCursor, isAltCtrlMeta, isModifierKey, lastConv, later, laterMaybeFocus, maybeFocus, messages, openByDefault, openEmoticonDrawer, ref, ref1, scrollToBottom, setClass, toggleVisibility;

  autosize = require('autosize');

  clipboard = require('clipboard');

  ref = require('./messages'), scrollToBottom = ref.scrollToBottom, messages = ref.messages;

  ref1 = require('../util'), later = ref1.later, toggleVisibility = ref1.toggleVisibility;

  isModifierKey = function(ev) {
    return ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey;
  };

  isAltCtrlMeta = function(ev) {
    return ev.altKey || ev.ctrlKey || ev.metaKey;
  };

  cursorToEnd = function(el) {
    return el.selectionStart = el.selectionEnd = el.value.length;
  };

  history = [];

  historyIndex = 0;

  historyLength = 100;

  historyBackup = "";

  historyPush = function(data) {
    history.push(data);
    if (history.length === historyLength) {
      history.shift();
    }
    return historyIndex = history.length;
  };

  historyWalk = function(el, offset) {
    var val;
    if (offset === -1 && historyIndex === history.length) {
      historyBackup = el.value;
    }
    historyIndex = historyIndex + offset;
    if (historyIndex < 0) {
      historyIndex = 0;
    }
    if (historyIndex > history.length) {
      historyIndex = history.length;
    }
    val = history[historyIndex] || historyBackup;
    el.value = val;
    return setTimeout((function() {
      return cursorToEnd(el);
    }), 1);
  };

  lastConv = null;

  emojiCategories = require('./emojicategories');

  openByDefault = 'Pessoas';

  module.exports = view(function(models) {
    div({
      "class": 'input'
    }, function() {
      div({
        id: 'emoji-container'
      }, function() {
        div({
          id: 'emoji-group-selector'
        }, function() {
          var glow, i, len, name, range, results;
          results = [];
          for (i = 0, len = emojiCategories.length; i < len; i++) {
            range = emojiCategories[i];
            name = range['title'];
            glow = '';
            if (name === openByDefault) {
              glow = 'glow';
            }
            results.push(span({
              id: name + '-button',
              title: name,
              "class": 'emoticon ' + glow
            }, range['representation'], {
              onclick: (function(name) {
                return function() {
                  console.log("Abrindo " + name);
                  return openEmoticonDrawer(name);
                };
              })(name)
            }));
          }
          return results;
        });
        return div({
          "class": 'emoji-selector'
        }, function() {
          var i, len, name, range, results, visible;
          results = [];
          for (i = 0, len = emojiCategories.length; i < len; i++) {
            range = emojiCategories[i];
            name = range['title'];
            visible = '';
            if (name === openByDefault) {
              visible = 'visible';
            }
            results.push(span({
              id: name,
              "class": 'group-content ' + visible
            }, function() {
              var emoji, j, len1, ref2, results1;
              ref2 = range['range'];
              results1 = [];
              for (j = 0, len1 = ref2.length; j < len1; j++) {
                emoji = ref2[j];
                if (emoji.indexOf("\u200d") >= 0) {
                  continue;
                }
                results1.push(span({
                  "class": 'emoticon'
                }, emoji, {
                  onclick: (function(emoji) {
                    return function() {
                      var element;
                      element = document.getElementById("message-input");
                      return insertTextAtCursor(element, emoji);
                    };
                  })(emoji)
                }));
              }
              return results1;
            }));
          }
          return results;
        });
      });
      return div({
        "class": 'input-container'
      }, function() {
        textarea({
          id: 'message-input',
          autofocus: true,
          placeholder: 'Digite a mensagem',
          rows: 1
        }, '', {
          onDOMNodeInserted: function(e) {
            var ta;
            ta = e.target;
            later(function() {
              return autosize(ta);
            });
            return ta.addEventListener('autosize:resized', function() {
              ta.parentNode.style.height = (ta.offsetHeight + 24) + 'px';
              if (messages != null) {
                return messages.scrollToBottom();
              }
            });
          },
          onkeydown: function(e) {
            if ((e.metaKey || e.ctrlKey) && e.keyIdentifier === 'Up') {
              action('selectNextConv', -1);
            }
            if ((e.metaKey || e.ctrlKey) && e.keyIdentifier === 'Down') {
              action('selectNextConv', +1);
            }
            if (!isModifierKey(e)) {
              if (e.keyCode === 13) {
                e.preventDefault();
                action('sendmessage', e.target.value);
                historyPush(e.target.value);
                e.target.value = '';
                autosize.update(e.target);
              }
              if (e.target.value === '') {
                if (e.keyIdentifier === "Up") {
                  historyWalk(e.target, -1);
                }
                if (e.keyIdentifier === "Down") {
                  historyWalk(e.target, +1);
                }
              }
            }
            if (!isAltCtrlMeta(e)) {
              return action('lastkeydown', Date.now());
            }
          },
          onpaste: function(e) {
            return setTimeout(function() {
              if (!clipboard.readImage().isEmpty() && !clipboard.readText()) {
                return action('onpasteimage');
              }
            }, 2);
          }
        });
        return span({
          "class": 'button-container'
        }, function() {
          return button({
            title: 'Mostrar emoticons',
            onclick: function(ef) {
              toggleVisibility(document.querySelector('#emoji-container'));
              return scrollToBottom();
            }
          }, function() {
            return span({
              "class": 'icon-emoji'
            });
          });
        }, function() {
          button({
            title: 'Enviar foto',
            onclick: function(ev) {
              return document.getElementById('attachFile').click();
            }
          }, function() {
            return span({
              "class": 'icon-attach'
            });
          });
          return input({
            type: 'file',
            id: 'attachFile',
            accept: '.jpg,.jpeg,.png,.gif',
            onchange: function(ev) {
              return action('uploadimage', ev.target.files);
            }
          });
        });
      });
    });
    if (lastConv !== models.viewstate.selectedConv) {
      lastConv = models.viewstate.selectedConv;
      return laterMaybeFocus();
    }
  });

  laterMaybeFocus = function() {
    return later(maybeFocus);
  };

  maybeFocus = function() {
    var el, ref2;
    el = document.activeElement;
    if (!el || !((ref2 = el.nodeName) === 'INPUT' || ref2 === 'TEXTAREA')) {
      el = document.querySelector('.input textarea');
      if (el) {
        return el.focus();
      }
    }
  };

  handle('noinputkeydown', function(ev) {
    var el;
    el = document.querySelector('.input textarea');
    if (el && !isAltCtrlMeta(ev)) {
      return el.focus();
    }
  });

  openEmoticonDrawer = function(drawerName) {
    var i, len, range, results, set;
    results = [];
    for (i = 0, len = emojiCategories.length; i < len; i++) {
      range = emojiCategories[i];
      set = range['title'] === drawerName;
      setClass(set, document.querySelector('#' + range['title']), 'visible');
      results.push(setClass(set, document.querySelector('#' + range['title'] + '-button'), 'glow'));
    }
    return results;
  };

  setClass = function(boolean, element, className) {
    if (element === void 0 || element === null) {
      return console.error("Não é possível aplicar a visibilidade, porque uma variável está indefinida");
    } else {
      if (boolean) {
        return element.classList.add(className);
      } else {
        return element.classList.remove(className);
      }
    }
  };

  insertTextAtCursor = function(el, text) {
    var doc, endIndex, range, value;
    value = el.value;
    doc = el.ownerDocument;
    if (typeof el.selectionStart === "number" && typeof el.selectionEnd === "number") {
      endIndex = el.selectionEnd;
      el.value = value.slice(0, endIndex) + text + value.slice(endIndex);
      return el.selectionStart = el.selectionEnd = endIndex + text.length;
    } else if (doc.selection !== "undefined" && doc.selection.createRange) {
      el.focus();
      range = doc.selection.createRange();
      range.collapse(false);
      range.text = text;
      return range.select();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVpL3ZpZXdzL2lucHV0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztFQUNYLFNBQUEsR0FBWSxPQUFBLENBQVEsV0FBUjs7RUFDWixNQUE2QixPQUFBLENBQVEsWUFBUixDQUE3QixFQUFDLHFCQUFBLGNBQUQsRUFBaUIsZUFBQTs7RUFDakIsT0FBNEIsT0FBQSxDQUFRLFNBQVIsQ0FBNUIsRUFBQyxhQUFBLEtBQUQsRUFBUSx3QkFBQTs7RUFFUixhQUFBLEdBQWdCLFNBQUMsRUFBRDtXQUFRLEVBQUUsQ0FBQyxNQUFILElBQWEsRUFBRSxDQUFDLE9BQWhCLElBQTJCLEVBQUUsQ0FBQyxPQUE5QixJQUF5QyxFQUFFLENBQUM7RUFBcEQ7O0VBQ2hCLGFBQUEsR0FBZ0IsU0FBQyxFQUFEO1dBQVEsRUFBRSxDQUFDLE1BQUgsSUFBYSxFQUFFLENBQUMsT0FBaEIsSUFBMkIsRUFBRSxDQUFDO0VBQXRDOztFQUVoQixXQUFBLEdBQWMsU0FBQyxFQUFEO1dBQVEsRUFBRSxDQUFDLGNBQUgsR0FBb0IsRUFBRSxDQUFDLFlBQUgsR0FBa0IsRUFBRSxDQUFDLEtBQUssQ0FBQztFQUF2RDs7RUFFZCxPQUFBLEdBQVU7O0VBQ1YsWUFBQSxHQUFlOztFQUNmLGFBQUEsR0FBZ0I7O0VBQ2hCLGFBQUEsR0FBZ0I7O0VBRWhCLFdBQUEsR0FBYyxTQUFDLElBQUQ7SUFDVixPQUFPLENBQUMsSUFBUixDQUFhLElBQWI7SUFDQSxJQUFHLE9BQU8sQ0FBQyxNQUFSLEtBQWtCLGFBQXJCO01BQXdDLE9BQU8sQ0FBQyxLQUFSLENBQUEsRUFBeEM7O1dBQ0EsWUFBQSxHQUFlLE9BQU8sQ0FBQztFQUhiOztFQUtkLFdBQUEsR0FBYyxTQUFDLEVBQUQsRUFBSyxNQUFMO0FBRVYsUUFBQTtJQUFBLElBQUcsTUFBQSxLQUFVLENBQUMsQ0FBWCxJQUFpQixZQUFBLEtBQWdCLE9BQU8sQ0FBQyxN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Q0FBQyxLQUFOLENBQVksQ0FBWixFQUFlLFFBQWYsQ0FBQSxHQUEyQixJQUEzQixHQUFrQyxLQUFLLENBQUMsS0FBTixDQUFZLFFBQVo7YUFDN0MsRUFBRSxDQUFDLGNBQUgsR0FBb0IsRUFBRSxDQUFDLFlBQUgsR0FBa0IsUUFBQSxHQUFXLElBQUksQ0FBQyxPQUgxRDtLQUFBLE1BSUssSUFBRyxHQUFHLENBQUMsU0FBSixLQUFpQixXQUFqQixJQUFpQyxHQUFHLENBQUMsU0FBUyxDQUFDLFdBQWxEO01BQ0QsRUFBRSxDQUFDLEtBQUgsQ0FBQTtNQUNBLEtBQUEsR0FBUSxHQUFHLENBQUMsU0FBUyxDQUFDLFdBQWQsQ0FBQTtNQUNSLEtBQUssQ0FBQyxRQUFOLENBQWUsS0FBZjtNQUNBLEtBQUssQ0FBQyxJQUFOLEdBQWE7YUFDYixLQUFLLENBQUMsTUFBTixDQUFBLEVBTEM7O0VBUFk7QUEzSnJCIiwiZmlsZSI6InVpL3ZpZXdzL2lucHV0LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiYXV0b3NpemUgPSByZXF1aXJlICdhdXRvc2l6ZSdcbmNsaXBib2FyZCA9IHJlcXVpcmUgJ2NsaXBib2FyZCdcbntzY3JvbGxUb0JvdHRvbSwgbWVzc2FnZXN9ID0gcmVxdWlyZSAnLi9tZXNzYWdlcydcbntsYXRlciwgdG9nZ2xlVmlzaWJpbGl0eX0gPSByZXF1aXJlICcuLi91dGlsJ1xuXG5pc01vZGlmaWVyS2V5ID0gKGV2KSAtPiBldi5hbHRLZXkgfHwgZXYuY3RybEtleSB8fCBldi5tZXRhS2V5IHx8IGV2LnNoaWZ0S2V5XG5pc0FsdEN0cmxNZXRhID0gKGV2KSAtPiBldi5hbHRLZXkgfHwgZXYuY3RybEtleSB8fCBldi5tZXRhS2V5XG5cbmN1cnNvclRvRW5kID0gKGVsKSAtPiBlbC5zZWxlY3Rpb25TdGFydCA9IGVsLnNlbGVjdGlvbkVuZCA9IGVsLnZhbHVlLmxlbmd0aFxuXG5oaXN0b3J5ID0gW11cbmhpc3RvcnlJbmRleCA9IDBcbmhpc3RvcnlMZW5ndGggPSAxMDBcbmhpc3RvcnlCYWNrdXAgPSBcIlwiXG5cbmhpc3RvcnlQdXNoID0gKGRhdGEpIC0+XG4gICAgaGlzdG9yeS5wdXNoIGRhdGFcbiAgICBpZiBoaXN0b3J5Lmxlbmd0aCA9PSBoaXN0b3J5TGVuZ3RoIHRoZW4gaGlzdG9yeS5zaGlmdCgpXG4gICAgaGlzdG9yeUluZGV4ID0gaGlzdG9yeS5sZW5ndGhcblxuaGlzdG9yeVdhbGsgPSAoZWwsIG9mZnNldCkgLT5cbiAgICAjIGlmIHdlIGFyZSBzdGFydGluZyB0byBkaXZlIGludG8gaGlzdG9yeSBiZSBiYWNrdXAgY3VycmVudCBtZXNzYWdlXG4gICAgaWYgb2Zmc2V0IGlzIC0xIGFuZCBoaXN0b3J5SW5kZXggaXMgaGlzdG9yeS5sZW5ndGggdGhlbiBoaXN0b3J5QmFja3VwID0gZWwudmFsdWVcbiAgICBoaXN0b3J5SW5kZXggPSBoaXN0b3J5SW5kZXggKyBvZmZzZXRcbiAgICAjIGNvbnN0cmFpbiBpbmRleFxuICAgIGlmIGhpc3RvcnlJbmRleCA8IDAgdGhlbiBoaXN0b3J5SW5kZXggPSAwXG4gICAgaWYgaGlzdG9yeUluZGV4ID4gaGlzdG9yeS5sZW5ndGggdGhlbiBoaXN0b3J5SW5kZXggPSBoaXN0b3J5Lmxlbmd0aFxuICAgICMgaWYgZG9uJ3QgaGF2ZSBoaXN0b3J5IHZhbHVlIHJlc3RvcmUgJ2N1cnJlbnQgbWVzc2FnZSdcbiAgICB2YWwgPSBoaXN0b3J5W2hpc3RvcnlJbmRleF0gb3IgaGlzdG9yeUJhY2t1cFxuICAgIGVsLnZhbHVlID0gdmFsXG4gICAgc2V0VGltZW91dCAoLT4gY3Vyc29yVG9FbmQgZWwpLCAxXG5cbmxhc3RDb252ID0gbnVsbFxuXG5lbW9qaUNhdGVnb3JpZXMgPSByZXF1aXJlICcuL2Vtb2ppY2F0ZWdvcmllcydcbm9wZW5CeURlZmF1bHQgPSAncGVvcGxlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IHZpZXcgKG1vZGVscykgLT5cbiAgICBkaXYgY2xhc3M6J2lucHV0JywgLT5cbiAgICAgICAgZGl2IGlkOidlbW9qaS1jb250YWluZXInLCAtPlxuICAgICAgICAgICAgZGl2IGlkOidlbW9qaS1ncm91cC1zZWxlY3RvcicsIC0+XG4gICAgICAgICAgICAgICAgZm9yIHJhbmdlIGluIGVtb2ppQ2F0ZWdvcmllc1xuICAgICAgICAgICAgICAgICAgICBuYW1lID0gcmFuZ2VbJ3RpdGxlJ11cbiAgICAgICAgICAgICAgICAgICAgZ2xvdyA9ICcnXG4gICAgICAgICAgICAgICAgICAgIGlmIG5hbWUgPT0gb3BlbkJ5RGVmYXVsdFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2xvdyA9ICdnbG93J1xuICAgICAgICAgICAgICAgICAgICBzcGFuIGlkOm5hbWUrJy1idXR0b24nXG4gICAgICAgICAgICAgICAgICAgICwgdGl0bGU6bmFtZVxuICAgICAgICAgICAgICAgICAgICAsIGNsYXNzOidlbW90aWNvbiAnICsgZ2xvd1xuICAgICAgICAgICAgICAgICAgICAsIHJhbmdlWydyZXByZXNlbnRhdGlvbiddXG4gICAgICAgICAgICAgICAgICAgICwgb25jbGljazogZG8gKG5hbWUpIC0+IC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIk9wZW5pbmcgXCIgKyBuYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgb3BlbkVtb3RpY29uRHJhd2VyIG5hbWVcblxuICAgICAgICAgICAgZGl2IGNsYXNzOidlbW9qaS1zZWxlY3RvcicsIC0+XG4gICAgICAgICAgICAgICAgZm9yIHJhbmdlIGluIGVtb2ppQ2F0ZWdvcmllc1xuICAgICAgICAgICAgICAgICAgICBuYW1lID0gcmFuZ2VbJ3RpdGxlJ11cbiAgICAgICAgICAgICAgICAgICAgdmlzaWJsZSA9ICcnXG4gICAgICAgICAgICAgICAgICAgIGlmIG5hbWUgPT0gb3BlbkJ5RGVmYXVsdFxuICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZSA9ICd2aXNpYmxlJ1xuXG4gICAgICAgICAgICAgICAgICAgIHNwYW4gaWQ6bmFtZSwgY2xhc3M6J2dyb3VwLWNvbnRlbnQgJyArIHZpc2libGUsIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgZW1vamkgaW4gcmFuZ2VbJ3JhbmdlJ11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBlbW9qaS5pbmRleE9mKFwiXFx1MjAwZFwiKSA+PSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgRklYTUUgRm9yIG5vdywgaWdub3JlIGNoYXJhY3RlcnMgdGhhdCBoYXZlIHRoZSBcImdsdWVcIiBjaGFyYWN0ZXIgaW4gdGhlbTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyB0aGV5IGRvbid0IHJlbmRlciBwcm9wZXJseVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwYW4gY2xhc3M6J2Vtb3RpY29uJywgZW1vamlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIG9uY2xpY2s6IGRvIChlbW9qaSkgLT4gLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCBcIm1lc3NhZ2UtaW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zZXJ0VGV4dEF0Q3Vyc29yIGVsZW1lbnQsIGVtb2ppXG5cbiAgICAgICAgZGl2IGNsYXNzOidpbnB1dC1jb250YWluZXInLCAtPlxuICAgICAgICAgICAgdGV4dGFyZWEgaWQ6J21lc3NhZ2UtaW5wdXQnLCBhdXRvZm9jdXM6dHJ1ZSwgcGxhY2Vob2xkZXI6J01lc3NhZ2UnLCByb3dzOiAxLCAnJ1xuICAgICAgICAgICAgLCBvbkRPTU5vZGVJbnNlcnRlZDogKGUpIC0+XG4gICAgICAgICAgICAgICAgIyBhdCB0aGlzIHBvaW50IHRoZSBub2RlIGlzIHN0aWxsIG5vdCBpbnNlcnRlZFxuICAgICAgICAgICAgICAgIHRhID0gZS50YXJnZXRcbiAgICAgICAgICAgICAgICBsYXRlciAtPiBhdXRvc2l6ZSB0YVxuICAgICAgICAgICAgICAgIHRhLmFkZEV2ZW50TGlzdGVuZXIgJ2F1dG9zaXplOnJlc2l6ZWQnLCAtPlxuICAgICAgICAgICAgICAgICAgICAjIHdlIGRvIHRoaXMgYmVjYXVzZSB0aGUgYXV0b3NpemluZyBzZXRzIHRoZSBoZWlnaHQgdG8gbm90aGluZ1xuICAgICAgICAgICAgICAgICAgICAjIHdoaWxlIG1lYXN1cmluZyBhbmQgdGhhdCBjYXVzZXMgdGhlIG1lc3NhZ2VzIHNjcm9sbCBhYm92ZSB0b1xuICAgICAgICAgICAgICAgICAgICAjIG1vdmUuIGJ5IHBpbm5pbmcgdGhlIGRpdiBvZiB0aGUgb3V0ZXIgaG9sZGluZyBkaXYsIHdlXG4gICAgICAgICAgICAgICAgICAgICMgYXJlIG5vdCBtb3ZpbmcgdGhlIHNjcm9sbGVyLlxuICAgICAgICAgICAgICAgICAgICB0YS5wYXJlbnROb2RlLnN0eWxlLmhlaWdodCA9ICh0YS5vZmZzZXRIZWlnaHQgKyAyNCkgKyAncHgnXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VzLnNjcm9sbFRvQm90dG9tKCkgaWYgbWVzc2FnZXM/XG4gICAgICAgICAgICAsIG9ua2V5ZG93bjogKGUpIC0+XG4gICAgICAgICAgICAgICAgaWYgKGUubWV0YUtleSBvciBlLmN0cmxLZXkpIGFuZCBlLmtleUlkZW50aWZpZXIgPT0gJ1VwJyB0aGVuIGFjdGlvbiAnc2VsZWN0TmV4dENvbnYnLCAtMVxuICAgICAgICAgICAgICAgIGlmIChlLm1ldGFLZXkgb3IgZS5jdHJsS2V5KSBhbmQgZS5rZXlJZGVudGlmaWVyID09ICdEb3duJyB0aGVuIGFjdGlvbiAnc2VsZWN0TmV4dENvbnYnLCArMVxuICAgICAgICAgICAgICAgIHVubGVzcyBpc01vZGlmaWVyS2V5KGUpXG4gICAgICAgICAgICAgICAgICAgIGlmIGUua2V5Q29kZSA9PSAxM1xuICAgICAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb24gJ3NlbmRtZXNzYWdlJywgZS50YXJnZXQudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGhpc3RvcnlQdXNoIGUudGFyZ2V0LnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC52YWx1ZSA9ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRvc2l6ZS51cGRhdGUgZS50YXJnZXRcbiAgICAgICAgICAgICAgICAgICAgaWYgZS50YXJnZXQudmFsdWUgPT0gJydcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGUua2V5SWRlbnRpZmllciBpcyBcIlVwXCIgdGhlbiBoaXN0b3J5V2FsayBlLnRhcmdldCwgLTFcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGUua2V5SWRlbnRpZmllciBpcyBcIkRvd25cIiB0aGVuIGhpc3RvcnlXYWxrIGUudGFyZ2V0LCArMVxuICAgICAgICAgICAgICAgIGFjdGlvbiAnbGFzdGtleWRvd24nLCBEYXRlLm5vdygpIHVubGVzcyBpc0FsdEN0cmxNZXRhKGUpXG4gICAgICAgICAgICAsIG9ucGFzdGU6IChlKSAtPlxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQgKCkgLT5cbiAgICAgICAgICAgICAgICAgICAgaWYgbm90IGNsaXBib2FyZC5yZWFkSW1hZ2UoKS5pc0VtcHR5KCkgYW5kIG5vdCBjbGlwYm9hcmQucmVhZFRleHQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uICdvbnBhc3RlaW1hZ2UnXG4gICAgICAgICAgICAgICAgLCAyXG5cbiAgICAgICAgICAgIHNwYW4gY2xhc3M6J2J1dHRvbi1jb250YWluZXInLCAtPlxuICAgICAgICAgICAgICAgIGJ1dHRvbiB0aXRsZTonU2hvdyBlbW90aWNvbnMnLCBvbmNsaWNrOiAoZWYpIC0+XG4gICAgICAgICAgICAgICAgICAgIHRvZ2dsZVZpc2liaWxpdHkgZG9jdW1lbnQucXVlcnlTZWxlY3RvciAnI2Vtb2ppLWNvbnRhaW5lcidcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsVG9Cb3R0b20oKVxuICAgICAgICAgICAgICAgICwgLT5cbiAgICAgICAgICAgICAgICAgICAgc3BhbiBjbGFzczonaWNvbi1lbW9qaSdcbiAgICAgICAgICAgICwgLT5cbiAgICAgICAgICAgICAgICBidXR0b24gdGl0bGU6J0F0dGFjaCBpbWFnZScsIG9uY2xpY2s6IChldikgLT5cbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2F0dGFjaEZpbGUnKS5jbGljaygpXG4gICAgICAgICAgICAgICAgLCAtPlxuICAgICAgICAgICAgICAgICAgICBzcGFuIGNsYXNzOidpY29uLWF0dGFjaCdcbiAgICAgICAgICAgICAgICBpbnB1dCB0eXBlOidmaWxlJywgaWQ6J2F0dGFjaEZpbGUnLCBhY2NlcHQ6Jy5qcGcsLmpwZWcsLnBuZywuZ2lmJywgb25jaGFuZ2U6IChldikgLT5cbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uICd1cGxvYWRpbWFnZScsIGV2LnRhcmdldC5maWxlc1xuXG4gICAgIyBmb2N1cyB3aGVuIHN3aXRjaGluZyBjb252c1xuICAgIGlmIGxhc3RDb252ICE9IG1vZGVscy52aWV3c3RhdGUuc2VsZWN0ZWRDb252XG4gICAgICAgIGxhc3RDb252ID0gbW9kZWxzLnZpZXdzdGF0ZS5zZWxlY3RlZENvbnZcbiAgICAgICAgbGF0ZXJNYXliZUZvY3VzKClcblxubGF0ZXJNYXliZUZvY3VzID0gLT4gbGF0ZXIgbWF5YmVGb2N1c1xuXG5tYXliZUZvY3VzID0gLT5cbiAgICAjIG5vIGFjdGl2ZSBlbGVtZW50PyBvciBub3QgZm9jdXNpbmcgc29tZXRoaW5nIHJlbGV2YW50Li4uXG4gICAgZWwgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50XG4gICAgaWYgIWVsIG9yIG5vdCAoZWwubm9kZU5hbWUgaW4gWydJTlBVVCcsICdURVhUQVJFQSddKVxuICAgICAgICAjIHN0ZWFsIGl0ISEhXG4gICAgICAgIGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmlucHV0IHRleHRhcmVhJylcbiAgICAgICAgZWwuZm9jdXMoKSBpZiBlbFxuXG5oYW5kbGUgJ25vaW5wdXRrZXlkb3duJywgKGV2KSAtPlxuICAgIGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmlucHV0IHRleHRhcmVhJylcbiAgICBlbC5mb2N1cygpIGlmIGVsIGFuZCBub3QgaXNBbHRDdHJsTWV0YShldilcblxub3BlbkVtb3RpY29uRHJhd2VyID0gKGRyYXdlck5hbWUpIC0+XG4gICAgZm9yIHJhbmdlIGluIGVtb2ppQ2F0ZWdvcmllc1xuICAgICAgICBzZXQgPSAocmFuZ2VbJ3RpdGxlJ10gPT0gZHJhd2VyTmFtZSlcbiAgICAgICAgc2V0Q2xhc3Mgc2V0LCAoZG9jdW1lbnQucXVlcnlTZWxlY3RvciAnIycrcmFuZ2VbJ3RpdGxlJ10pLCAndmlzaWJsZSdcbiAgICAgICAgc2V0Q2xhc3Mgc2V0LCAoZG9jdW1lbnQucXVlcnlTZWxlY3RvciAnIycrcmFuZ2VbJ3RpdGxlJ10rJy1idXR0b24nKSwgJ2dsb3cnXG5cblxuc2V0Q2xhc3MgPSAoYm9vbGVhbiwgZWxlbWVudCwgY2xhc3NOYW1lKSAtPlxuICAgIGlmIGVsZW1lbnQgPT0gdW5kZWZpbmVkIG9yIGVsZW1lbnQgPT0gbnVsbFxuICAgICAgICBjb25zb2xlLmVycm9yIFwiQ2Fubm90IHNldCB2aXNpYmlsaXR5IGZvciB1bmRlZmluZWQgdmFyaWFibGVcIlxuICAgIGVsc2VcbiAgICAgICAgaWYgYm9vbGVhblxuICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSlcblxuXG5pbnNlcnRUZXh0QXRDdXJzb3IgPSAoZWwsIHRleHQpIC0+XG4gICAgdmFsdWUgPSBlbC52YWx1ZVxuICAgIGRvYyA9IGVsLm93bmVyRG9jdW1lbnRcbiAgICBpZiB0eXBlb2YgZWwuc2VsZWN0aW9uU3RhcnQgPT0gXCJudW1iZXJcIiBhbmQgdHlwZW9mIGVsLnNlbGVjdGlvbkVuZCA9PSBcIm51bWJlclwiXG4gICAgICAgIGVuZEluZGV4ID0gZWwuc2VsZWN0aW9uRW5kXG4gICAgICAgIGVsLnZhbHVlID0gdmFsdWUuc2xpY2UoMCwgZW5kSW5kZXgpICsgdGV4dCArIHZhbHVlLnNsaWNlKGVuZEluZGV4KVxuICAgICAgICBlbC5zZWxlY3Rpb25TdGFydCA9IGVsLnNlbGVjdGlvbkVuZCA9IGVuZEluZGV4ICsgdGV4dC5sZW5ndGhcbiAgICBlbHNlIGlmIGRvYy5zZWxlY3Rpb24gIT0gXCJ1bmRlZmluZWRcIiBhbmQgZG9jLnNlbGVjdGlvbi5jcmVhdGVSYW5nZVxuICAgICAgICBlbC5mb2N1cygpXG4gICAgICAgIHJhbmdlID0gZG9jLnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpXG4gICAgICAgIHJhbmdlLmNvbGxhcHNlKGZhbHNlKVxuICAgICAgICByYW5nZS50ZXh0ID0gdGV4dFxuICAgICAgICByYW5nZS5zZWxlY3QoKVxuIl19
