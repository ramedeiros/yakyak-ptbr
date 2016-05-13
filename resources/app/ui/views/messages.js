(function() {
  var CUTOFF, MESSAGE_CLASSES, OBSERVE_OPTS, atTopIfSmall, drawMessage, extractObjectStyle, extractProtobufStyle, firstRender, fixProxied, fixlink, forceredraw, format, formatAttachment, getImageUrl, getProxiedName, groupEvents, ifpass, isImg, lastConv, later, linkto, moment, nameof, onMutate, onclick, preload, preload_cache, ref, scrollToBottom, shell, stripProxiedColon, throttle;

  moment = require('moment');

  shell = require('shell');

  ref = require('../util'), nameof = ref.nameof, linkto = ref.linkto, later = ref.later, forceredraw = ref.forceredraw, throttle = ref.throttle, getProxiedName = ref.getProxiedName, fixlink = ref.fixlink, isImg = ref.isImg, getImageUrl = ref.getImageUrl;

  CUTOFF = 5 * 60 * 1000 * 1000;

  fixProxied = function(e, proxied, entity) {
    var name, ref1, ref2, ref3, ref4;
    if ((e != null ? (ref1 = e.chat_message) != null ? ref1.message_content : void 0 : void 0) == null) {
      return;
    }
    e.chat_message.message_content.proxied = true;
    name = e != null ? (ref2 = e.chat_message) != null ? (ref3 = ref2.message_content) != null ? (ref4 = ref3.segment[0]) != null ? ref4.text : void 0 : void 0 : void 0 : void 0;
    if (name !== '>>') {
      return entity.add({
        id: {
          gaia_id: proxied,
          chat_id: proxied
        },
        fallback_name: name
      }, {
        silent: true
      });
    }
  };

  onclick = function(e) {
    var address;
    e.preventDefault();
    address = e.currentTarget.getAttribute('href');
    return shell.openExternal(fixlink(address));
  };

  groupEvents = function(es, entity) {
    var cid, e, group, groups, j, len, proxied, ref1, ref2, user;
    groups = [];
    group = null;
    user = null;
    for (j = 0, len = es.length; j < len; j++) {
      e = es[j];
      if (e.timestamp - ((ref1 = group != null ? group.end : void 0) != null ? ref1 : 0) > CUTOFF) {
        group = {
          byuser: [],
          start: e.timestamp,
          end: e.timestamp
        };
        user = null;
        groups.push(group);
      }
      proxied = getProxiedName(e);
      if (proxied) {
        fixProxied(e, proxied, entity);
      }
      cid = proxied ? proxied : e != null ? (ref2 = e.sender_id) != null ? ref2.chat_id : void 0 : void 0;
      if (cid !== (user != null ? user.cid : void 0)) {
        group.byuser.push(user = {
          cid: cid,
          event: []
        });
      }
      user.event.push(e);
      group.end = e.timestamp;
    }
    return groups;
  };

  MESSAGE_CLASSES = ['placeholder', 'chat_message', 'conversation_rename', 'membership_change'];

  OBSERVE_OPTS = {
    childList: true,
    attributes: true,
    attributeOldValue: true,
    subtree: true
  };

  firstRender = true;

  lastConv = null;

  module.exports = view(function(models) {
    var c, conv, conv_id, entity, viewstate;
    viewstate = models.viewstate, conv = models.conv, entity = models.entity;
    if (firstRender) {
      later(onMutate(viewstate));
    }
    firstRender = false;
    conv_id = viewstate != null ? viewstate.selectedConv : void 0;
    c = conv[conv_id];
    div({
      "class": 'messages',
      observe: onMutate(viewstate)
    }, function() {
      var g, grouped, j, len, results;
      if (!(c != null ? c.event : void 0)) {
        return;
      }
      grouped = groupEvents(c.event, entity);
      div({
        "class": 'historyinfo'
      }, function() {
        if (c.requestinghistory) {
          return pass('Recuperando histórico…', function() {
            return span({
              "class": 'icon-spin1 animate-spin'
            });
          });
        }
      });
      results = [];
      for (j = 0, len = grouped.length; j < len; j++) {
        g = grouped[j];
        results.push(div({
          "class": 'tgroup'
        }, function() {
          var clz, l, len1, ref1, results1, sender, u;
          span({
            "class": 'timestamp'
          }, moment(g.start / 1000).calendar());
          ref1 = g.byuser;
          results1 = [];
          for (l = 0, len1 = ref1.length; l < len1; l++) {
            u = ref1[l];
            sender = nameof(entity[u.cid]);
            clz = ['ugroup'];
            if (entity.isSelf(u.cid)) {
              clz.push('self');
            }
            results1.push(div({
              "class": clz.join(' ')
            }, function() {
              a({
                href: linkto(u.cid)
              }, {
                onclick: onclick
              }, {
                "class": 'sender'
              }, function() {
                var purl, ref2;
                purl = (ref2 = entity[u.cid]) != null ? ref2.photo_url : void 0;
                if (!purl) {
                  purl = "images/photo.jpg";
                  entity.needEntity(u.cid);
                }
                img({
                  src: fixlink(purl)
                });
                return span(sender);
              });
              return div({
                "class": 'umessages'
              }, function() {
                var e, len2, m, ref2, results2;
                ref2 = u.event;
                results2 = [];
                for (m = 0, len2 = ref2.length; m < len2; m++) {
                  e = ref2[m];
                  results2.push(drawMessage(e, entity));
                }
                return results2;
              });
            }));
          }
          return results1;
        }));
      }
      return results;
    });
    if (lastConv !== conv_id) {
      lastConv = conv_id;
      return later(atTopIfSmall);
    }
  });

  drawMessage = function(e, entity) {
    var c, j, len, mclz, title;
    mclz = ['message'];
    for (j = 0, len = MESSAGE_CLASSES.length; j < len; j++) {
      c = MESSAGE_CLASSES[j];
      if (e[c] != null) {
        mclz.push(c);
      }
    }
    title = e.timestamp ? moment(e.timestamp / 1000).calendar() : null;
    return div({
      id: e.event_id,
      key: e.event_id,
      "class": mclz.join(' '),
      title: title
    }, function() {
      var content, ents, names, ref1, t;
      if (e.chat_message) {
        content = (ref1 = e.chat_message) != null ? ref1.message_content : void 0;
        format(content);
        if (e.placeholder && e.uploadimage) {
          return span({
            "class": 'icon-spin1 animate-spin'
          });
        }
      } else if (e.conversation_rename) {
        return pass("Conversa renomeada para " + e.conversation_rename.new_name);
      } else if (e.membership_change) {
        t = e.membership_change.type;
        ents = e.membership_change.participant_ids.map(function(p) {
          return entity[p.chat_id];
        });
        names = ents.map(nameof).join(', ');
        if (t === 'JOIN') {
          return pass("Entrou " + names);
        } else if (t === 'LEAVE') {
          return pass(names + " saiu da conversa");
        }
      }
    });
  };

  atTopIfSmall = function() {
    var msgel, screl;
    screl = document.querySelector('.main');
    msgel = document.querySelector('.messages');
    return action('attop', (msgel != null ? msgel.offsetHeight : void 0) < (screl != null ? screl.offsetHeight : void 0));
  };

  onMutate = function(viewstate) {
    return throttle(10, function() {
      if (viewstate.atbottom) {
        return scrollToBottom();
      }
    });
  };

  scrollToBottom = module.exports.scrollToBottom = function() {
    var el;
    el = document.querySelector('.main');
    return el.scrollTop = Number.MAX_SAFE_INTEGER;
  };

  ifpass = function(t, f) {
    if (t) {
      return f;
    } else {
      return pass;
    }
  };

  format = function(cont) {
    var e, error, f, href, i, imageUrl, j, len, ref1, ref2, ref3, ref4, seg;
    if ((cont != null ? cont.attachment : void 0) != null) {
      try {
        formatAttachment(cont.attachment);
      } catch (error) {
        e = error;
        console.error(e);
      }
    }
    ref2 = (ref1 = cont != null ? cont.segment : void 0) != null ? ref1 : [];
    for (i = j = 0, len = ref2.length; j < len; i = ++j) {
      seg = ref2[i];
      if (cont.proxied && i < 1) {
        continue;
      }
      f = (ref3 = seg.formatting) != null ? ref3 : {};
      href = seg != null ? (ref4 = seg.link_data) != null ? ref4.link_target : void 0 : void 0;
      imageUrl = getImageUrl(href);
      ifpass(imageUrl, div)(function() {
        return ifpass(href, (function(f) {
          return a({
            href: href,
            onclick: onclick
          }, f);
        }))(function() {
          return ifpass(f.bold, b)(function() {
            return ifpass(f.italics, i)(function() {
              return ifpass(f.underline, u)(function() {
                return ifpass(f.strikethrough, s)(function() {
                  return ifpass(imageUrl, div)(function() {
                    if (imageUrl && (preload(imageUrl))) {
                      return img({
                        src: imageUrl
                      });
                    } else {
                      return pass(cont.proxied ? stripProxiedColon(seg.text) : seg.text);
                    }
                  });
                });
              });
            });
          });
        });
      });
    }
    return null;
  };

  stripProxiedColon = function(txt) {
    if ((txt != null ? txt.indexOf(": ") : void 0) === 0) {
      return txt.substring(2);
    } else {
      return txt;
    }
  };

  preload_cache = {};

  preload = function(href) {
    var cache, el;
    cache = preload_cache[href];
    if (!cache) {
      el = document.createElement('img');
      el.onload = function() {
        if (typeof el.naturalWidth !== 'number') {
          return;
        }
        el.loaded = true;
        return later(function() {
          return action('loadedimg');
        });
      };
      el.onerror = function() {
        return console.log('Erro ao carregar imagem', href);
      };
      el.src = href;
      preload_cache[href] = el;
    }
    return cache != null ? cache.loaded : void 0;
  };

  formatAttachment = function(att) {
    var href, ref1, ref2, ref3, ref4, ref5, ref6, thumb;
    if (att != null ? (ref1 = att[0]) != null ? (ref2 = ref1.embed_item) != null ? ref2.type_ : void 0 : void 0 : void 0) {
      ref3 = extractProtobufStyle(att), href = ref3.href, thumb = ref3.thumb;
    } else if (att != null ? (ref4 = att[0]) != null ? (ref5 = ref4.embed_item) != null ? ref5.type : void 0 : void 0 : void 0) {
      ref6 = extractObjectStyle(att), href = ref6.href, thumb = ref6.thumb;
    } else {
      if ((att != null ? att.length : void 0) !== 0) {
        console.warn('Anexo recusado', att);
      }
      return;
    }
    if (!href) {
      return;
    }
    if (preload(href)) {
      return div({
        "class": 'attach'
      }, function() {
        return a({
          href: href,
          onclick: onclick
        }, function() {
          return img({
            src: href
          });
        });
      });
    }
  };

  handle('loadedimg', function() {
    updated('beforeImg');
    updated('conv');
    return updated('afterImg');
  });

  extractProtobufStyle = function(att) {
    var data, eitem, href, k, ref1, ref2, ref3, ref4, ref5, t, thumb, type_;
    eitem = att != null ? (ref1 = att[0]) != null ? ref1.embed_item : void 0 : void 0;
    ref2 = eitem != null ? eitem : {}, data = ref2.data, type_ = ref2.type_;
    t = type_ != null ? type_[0] : void 0;
    if (t !== 249) {
      return console.warn('Extensão recusada (antiga)', att);
    }
    k = (ref3 = Object.keys(data)) != null ? ref3[0] : void 0;
    if (!k) {
      return;
    }
    href = data != null ? (ref4 = data[k]) != null ? ref4[5] : void 0 : void 0;
    thumb = data != null ? (ref5 = data[k]) != null ? ref5[9] : void 0 : void 0;
    return {
      href: href,
      thumb: thumb
    };
  };

  extractObjectStyle = function(att) {
    var eitem, href, it, ref1, ref2, thumb, type;
    eitem = att != null ? (ref1 = att[0]) != null ? ref1.embed_item : void 0 : void 0;
    type = (eitem != null ? eitem : {}).type;
    if ((type != null ? type[0] : void 0) === "PLUS_PHOTO") {
      it = eitem["embeds.PlusPhoto.plus_photo"];
      href = it != null ? it.url : void 0;
      thumb = it != null ? (ref2 = it.thumbnail) != null ? ref2.url : void 0 : void 0;
      return {
        href: href,
        thumb: thumb
      };
    } else {
      return console.warn('Extensão recusada (nova)', type);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVpL3ZpZXdzL21lc3NhZ2VzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUNULEtBQUEsR0FBUSxPQUFBLENBQVEsT0FBUjs7RUFFUixNQUNnRCxPQUFBLENBQVEsU0FBUixDQURoRCxFQUFDLGFBQUEsTUFBRCxFQUFTLGFBQUEsTUFBVCxFQUFpQixZQUFBLEtBQWpCLEVBQXdCLGtCQUFBLFdBQXhCLEVBQXFDLGVBQUEsUUFBckMsRUFDQSxxQkFBQSxjQURBLEVBQ2dCLGNBQUEsT0FEaEIsRUFDeUIsWUFBQSxLQUR6QixFQUNnQyxrQkFBQTs7RUFFaEMsTUFBQSxHQUFTLENBQUEsR0FBSSxFQUFKLEdBQVMsSUFBVCxHQUFnQjs7RUFNekIsVUFBQSxHQUFhLFNBQUMsQ0FBRCxFQUFJLE9BQUosRUFBYSxNQUFiO0FBQ1QsUUFBQTtJQUFBLElBQWMsOEZBQWQ7QUFBQSxhQUFBOztJQUNBLENBQUMsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLE9BQS9CLEdBQXlDO0lBQ3pDLElBQUEsZ0lBQW1ELENBQUU7SUFFckQsSUFBRyxJQUFBLEtBQVEsSUFBWDthQUVJLE1BQU0sQ0FBQyxHQUFQLENBQVc7UUFDUCxFQUFBLEVBQUk7VUFDQSxPQUFBLEVBQVMsT0FEVDtVQUVBLE9BQUEsRUFBUyxPQUZUO1NBREc7UUFLUCxhQUFBLEVBQWUsSUFMUjtPQUFYLEVBTUc7UUFBQSxNQUFBLEVBQU8sSUFBUDtPQU5ILEVBRko7O0VBTFM7O0VBZWIsT0FBQSxHQUFVLFNBQUMsQ0FBRDtBQUNSLFFBQUE7SUFBQSxDQUFDLENBQUMsY0FBRixDQUFBO0lBQ0EsT0FBQSxHQUFVLENBQUMsQ0FBQyxhQUFhLENBQUMsWUFBaEIsQ0FBNkIsTUFBN0I7V0FDVixLQUFLLENBQUMsWUFBTixDQUFtQixPQUFBLENBQVEsT0FBUixDQUFuQjtFQUhROztFQU1WLFdBQUEsR0FBYyxTQUFDLEVBQUQs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QUFDLElBQVIsQ0FBYSxxQkFBYixFQUFvQyxJQUFwQyxFQU5KOztFQUhpQjtBQXZQckIiLCJmaWxlIjoidWkvdmlld3MvbWVzc2FnZXMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJtb21lbnQgPSByZXF1aXJlICdtb21lbnQnXG5zaGVsbCA9IHJlcXVpcmUgJ3NoZWxsJ1xuXG57bmFtZW9mLCBsaW5rdG8sIGxhdGVyLCBmb3JjZXJlZHJhdywgdGhyb3R0bGUsXG5nZXRQcm94aWVkTmFtZSwgZml4bGluaywgaXNJbWcsIGdldEltYWdlVXJsfSAgPSByZXF1aXJlICcuLi91dGlsJ1xuXG5DVVRPRkYgPSA1ICogNjAgKiAxMDAwICogMTAwMCAjIDUgbWluc1xuXG4jIHRoaXMgaGVscHMgZml4aW5nIGhvdXRzIHByb3hpZWQgd2l0aCB0aGluZ3MgbGlrZSBoYW5ndXBzYm90XG4jIHRoZSBmb3JtYXQgb2YgcHJveGllZCBtZXNzYWdlcyBhcmVcbiMgYW5kIGhlcmUgd2UgcHV0IGVudGl0aWVzIGluIHRoZSBlbnRpdHkgZGIgZm9yXG4jIHVzZXJzIGZvdW5kIG9ubHkgaW4gcHJveGllZCBtZXNzYWdlcy5cbmZpeFByb3hpZWQgPSAoZSwgcHJveGllZCwgZW50aXR5KSAtPlxuICAgIHJldHVybiB1bmxlc3MgZT8uY2hhdF9tZXNzYWdlPy5tZXNzYWdlX2NvbnRlbnQ/XG4gICAgZS5jaGF0X21lc3NhZ2UubWVzc2FnZV9jb250ZW50LnByb3hpZWQgPSB0cnVlXG4gICAgbmFtZSA9IGU/LmNoYXRfbWVzc2FnZT8ubWVzc2FnZV9jb250ZW50Py5zZWdtZW50WzBdPy50ZXh0XG4gICAgIyB1cGRhdGUgZmFsbGJhY2tfbmFtZSBmb3IgZW50aXR5IGRhdGFiYXNlXG4gICAgaWYgbmFtZSAhPSAnPj4nXG4gICAgICAgICMgc3ludGhldGljIGFkZCBvZiBmYWxsYmFja19uYW1lXG4gICAgICAgIGVudGl0eS5hZGQge1xuICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICBnYWlhX2lkOiBwcm94aWVkXG4gICAgICAgICAgICAgICAgY2hhdF9pZDogcHJveGllZFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmFsbGJhY2tfbmFtZTogbmFtZVxuICAgICAgICB9LCBzaWxlbnQ6dHJ1ZVxuXG5vbmNsaWNrID0gKGUpIC0+XG4gIGUucHJldmVudERlZmF1bHQoKVxuICBhZGRyZXNzID0gZS5jdXJyZW50VGFyZ2V0LmdldEF0dHJpYnV0ZSAnaHJlZidcbiAgc2hlbGwub3BlbkV4dGVybmFsIGZpeGxpbmsoYWRkcmVzcylcblxuIyBoZWxwZXIgbWV0aG9kIHRvIGdyb3VwIGV2ZW50cyBpbiB0aW1lL3VzZXIgYnVuY2hlc1xuZ3JvdXBFdmVudHMgPSAoZXMsIGVudGl0eSkgLT5cbiAgICBncm91cHMgPSBbXVxuICAgIGdyb3VwID0gbnVsbFxuICAgIHVzZXIgPSBudWxsXG4gICAgZm9yIGUgaW4gZXNcbiAgICAgICAgaWYgZS50aW1lc3RhbXAgLSAoZ3JvdXA/LmVuZCA/IDApID4gQ1VUT0ZGXG4gICAgICAgICAgICBncm91cCA9IHtcbiAgICAgICAgICAgICAgICBieXVzZXI6IFtdXG4gICAgICAgICAgICAgICAgc3RhcnQ6IGUudGltZXN0YW1wXG4gICAgICAgICAgICAgICAgZW5kOiBlLnRpbWVzdGFtcFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdXNlciA9IG51bGxcbiAgICAgICAgICAgIGdyb3Vwcy5wdXNoIGdyb3VwXG4gICAgICAgIHByb3hpZWQgPSBnZXRQcm94aWVkTmFtZShlKVxuICAgICAgICBpZiBwcm94aWVkXG4gICAgICAgICAgICBmaXhQcm94aWVkIGUsIHByb3hpZWQsIGVudGl0eVxuICAgICAgICBjaWQgPSBpZiBwcm94aWVkIHRoZW4gcHJveGllZCBlbHNlIGU/LnNlbmRlcl9pZD8uY2hhdF9pZFxuICAgICAgICBpZiBjaWQgIT0gdXNlcj8uY2lkXG4gICAgICAgICAgICBncm91cC5ieXVzZXIucHVzaCB1c2VyID0ge1xuICAgICAgICAgICAgICAgIGNpZDogY2lkXG4gICAgICAgICAgICAgICAgZXZlbnQ6IFtdXG4gICAgICAgICAgICB9XG4gICAgICAgIHVzZXIuZXZlbnQucHVzaCBlXG4gICAgICAgIGdyb3VwLmVuZCA9IGUudGltZXN0YW1wXG4gICAgZ3JvdXBzXG5cbiMgcG9zc2libGUgY2xhc3NlcyBvZiBtZXNzYWdlc1xuTUVTU0FHRV9DTEFTU0VTID0gWydwbGFjZWhvbGRlcicsICdjaGF0X21lc3NhZ2UnLFxuJ2NvbnZlcnNhdGlvbl9yZW5hbWUnLCAnbWVtYmVyc2hpcF9jaGFuZ2UnXVxuXG5PQlNFUlZFX09QVFMgPVxuICAgIGNoaWxkTGlzdDp0cnVlXG4gICAgYXR0cmlidXRlczp0cnVlXG4gICAgYXR0cmlidXRlT2xkVmFsdWU6dHJ1ZVxuICAgIHN1YnRyZWU6dHJ1ZVxuXG5maXJzdFJlbmRlciAgICAgICA9IHRydWVcbmxhc3RDb252ICAgICAgICAgID0gbnVsbCAjIHRvIGRldGVjdCBjb252IHN3aXRjaGluZ1xuXG5tb2R1bGUuZXhwb3J0cyA9IHZpZXcgKG1vZGVscykgLT5cbiAgICB7dmlld3N0YXRlLCBjb252LCBlbnRpdHl9ID0gbW9kZWxzXG5cbiAgICAjIG11dGF0aW9uIGV2ZW50cyBraWNrcyBpbiBhZnRlciBmaXJzdCByZW5kZXJcbiAgICBsYXRlciBvbk11dGF0ZSh2aWV3c3RhdGUpIGlmIGZpcnN0UmVuZGVyXG4gICAgZmlyc3RSZW5kZXIgPSBmYWxzZVxuXG4gICAgY29udl9pZCA9IHZpZXdzdGF0ZT8uc2VsZWN0ZWRDb252XG4gICAgYyA9IGNvbnZbY29udl9pZF1cbiAgICBkaXYgY2xhc3M6J21lc3NhZ2VzJywgb2JzZXJ2ZTpvbk11dGF0ZSh2aWV3c3RhdGUpLCAtPlxuICAgICAgICByZXR1cm4gdW5sZXNzIGM/LmV2ZW50XG4gICAgICAgIGdyb3VwZWQgPSBncm91cEV2ZW50cyBjLmV2ZW50LCBlbnRpdHlcbiAgICAgICAgZGl2IGNsYXNzOidoaXN0b3J5aW5mbycsIC0+XG4gICAgICAgICAgICBpZiBjLnJlcXVlc3RpbmdoaXN0b3J5XG4gICAgICAgICAgICAgICAgcGFzcyAnUmVxdWVzdGluZyBoaXN0b3J54oCmJywgLT4gc3BhbiBjbGFzczonaWNvbi1zcGluMSBhbmltYXRlLXNwaW4nXG4gICAgICAgIGZvciBnIGluIGdyb3VwZWRcbiAgICAgICAgICAgIGRpdiBjbGFzczondGdyb3VwJywgLT5cbiAgICAgICAgICAgICAgICBzcGFuIGNsYXNzOid0aW1lc3RhbXAnLCBtb21lbnQoZy5zdGFydCAvIDEwMDApLmNhbGVuZGFyKClcbiAgICAgICAgICAgICAgICBmb3IgdSBpbiBnLmJ5dXNlclxuICAgICAgICAgICAgICAgICAgICBzZW5kZXIgPSBuYW1lb2YgZW50aXR5W3UuY2lkXVxuICAgICAgICAgICAgICAgICAgICBjbHogPSBbJ3Vncm91cCddXG4gICAgICAgICAgICAgICAgICAgIGNsei5wdXNoICdzZWxmJyBpZiBlbnRpdHkuaXNTZWxmKHUuY2lkKVxuICAgICAgICAgICAgICAgICAgICBkaXYgY2xhc3M6Y2x6LmpvaW4oJyAnKSwgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGEgaHJlZjpsaW5rdG8odS5jaWQpLCB7b25jbGlja30sIGNsYXNzOidzZW5kZXInLCAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1cmwgPSBlbnRpdHlbdS5jaWRdPy5waG90b191cmxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmxlc3MgcHVybFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdXJsID0gXCJpbWFnZXMvcGhvdG8uanBnXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50aXR5Lm5lZWRFbnRpdHkgdS5jaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWcgc3JjOmZpeGxpbmsocHVybClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGFuIHNlbmRlclxuICAgICAgICAgICAgICAgICAgICAgICAgZGl2IGNsYXNzOid1bWVzc2FnZXMnLCAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdNZXNzYWdlKGUsIGVudGl0eSkgZm9yIGUgaW4gdS5ldmVudFxuXG4gICAgaWYgbGFzdENvbnYgIT0gY29udl9pZFxuICAgICAgICBsYXN0Q29udiA9IGNvbnZfaWRcbiAgICAgICAgbGF0ZXIgYXRUb3BJZlNtYWxsXG5cblxuZHJhd01lc3NhZ2UgPSAoZSwgZW50aXR5KSAtPlxuICAgIG1jbHogPSBbJ21lc3NhZ2UnXVxuICAgIG1jbHoucHVzaCBjIGZvciBjIGluIE1FU1NBR0VfQ0xBU1NFUyB3aGVuIGVbY10/XG4gICAgdGl0bGUgPSBpZiBlLnRpbWVzdGFtcCB0aGVuIG1vbWVudChlLnRpbWVzdGFtcCAvIDEwMDApLmNhbGVuZGFyKCkgZWxzZSBudWxsXG4gICAgZGl2IGlkOmUuZXZlbnRfaWQsIGtleTplLmV2ZW50X2lkLCBjbGFzczptY2x6LmpvaW4oJyAnKSwgdGl0bGU6dGl0bGUsIC0+XG4gICAgICAgIGlmIGUuY2hhdF9tZXNzYWdlXG4gICAgICAgICAgICBjb250ZW50ID0gZS5jaGF0X21lc3NhZ2U/Lm1lc3NhZ2VfY29udGVudFxuICAgICAgICAgICAgZm9ybWF0IGNvbnRlbnRcbiAgICAgICAgICAgICMgbG9hZElubGluZUltYWdlcyBjb250ZW50XG4gICAgICAgICAgICBpZiBlLnBsYWNlaG9sZGVyIGFuZCBlLnVwbG9hZGltYWdlXG4gICAgICAgICAgICAgICAgc3BhbiBjbGFzczonaWNvbi1zcGluMSBhbmltYXRlLXNwaW4nXG4gICAgICAgIGVsc2UgaWYgZS5jb252ZXJzYXRpb25fcmVuYW1lXG4gICAgICAgICAgICBwYXNzIFwicmVuYW1lZCBjb252ZXJzYXRpb24gdG8gI3tlLmNvbnZlcnNhdGlvbl9yZW5hbWUubmV3X25hbWV9XCJcbiAgICAgICAgICAgICMge25ld19uYW1lOiBcImxhYmJvdFwiIG9sZF9uYW1lOiBcIlwifVxuICAgICAgICBlbHNlIGlmIGUubWVtYmVyc2hpcF9jaGFuZ2VcbiAgICAgICAgICAgIHQgPSBlLm1lbWJlcnNoaXBfY2hhbmdlLnR5cGVcbiAgICAgICAgICAgIGVudHMgPSBlLm1lbWJlcnNoaXBfY2hhbmdlLnBhcnRpY2lwYW50X2lkcy5tYXAgKHApIC0+IGVudGl0eVtwLmNoYXRfaWRdXG4gICAgICAgICAgICBuYW1lcyA9IGVudHMubWFwKG5hbWVvZikuam9pbignLCAnKVxuICAgICAgICAgICAgaWYgdCA9PSAnSk9JTidcbiAgICAgICAgICAgICAgICBwYXNzIFwiaW52aXRlZCAje25hbWVzfVwiXG4gICAgICAgICAgICBlbHNlIGlmIHQgPT0gJ0xFQVZFJ1xuICAgICAgICAgICAgICAgIHBhc3MgXCIje25hbWVzfSBsZWZ0IHRoZSBjb252ZXJzYXRpb25cIlxuXG5cbmF0VG9wSWZTbWFsbCA9IC0+XG4gICAgc2NyZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWFpbicpXG4gICAgbXNnZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWVzc2FnZXMnKVxuICAgIGFjdGlvbiAnYXR0b3AnLCBtc2dlbD8ub2Zmc2V0SGVpZ2h0IDwgc2NyZWw/Lm9mZnNldEhlaWdodFxuXG5cbiMgd2hlbiB0aGVyZSdzIG11dGF0aW9uLCB3ZSBzY3JvbGwgdG8gYm90dG9tIGluIGNhc2Ugd2UgYWxyZWFkeSBhcmUgYXQgYm90dG9tXG5vbk11dGF0ZSA9ICh2aWV3c3RhdGUpIC0+IHRocm90dGxlIDEwLCAtPlxuICAgICMganVtcCB0byBib3R0b20gdG8gZm9sbG93IGNvbnZcbiAgICBzY3JvbGxUb0JvdHRvbSgpIGlmIHZpZXdzdGF0ZS5hdGJvdHRvbVxuXG5cbnNjcm9sbFRvQm90dG9tID0gbW9kdWxlLmV4cG9ydHMuc2Nyb2xsVG9Cb3R0b20gPSAtPlxuICAgICMgZW5zdXJlIHdlJ3JlIHNjcm9sbGVkIHRvIGJvdHRvbVxuICAgIGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1haW4nKVxuICAgICMgdG8gYm90dG9tXG4gICAgZWwuc2Nyb2xsVG9wID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJcblxuXG5pZnBhc3MgPSAodCwgZikgLT4gaWYgdCB0aGVuIGYgZWxzZSBwYXNzXG5cbmZvcm1hdCA9IChjb250KSAtPlxuICAgIGlmIGNvbnQ/LmF0dGFjaG1lbnQ/XG4gICAgICAgIHRyeVxuICAgICAgICAgIGZvcm1hdEF0dGFjaG1lbnQgY29udC5hdHRhY2htZW50XG4gICAgICAgIGNhdGNoIGVcbiAgICAgICAgICBjb25zb2xlLmVycm9yIGVcbiAgICBmb3Igc2VnLCBpIGluIGNvbnQ/LnNlZ21lbnQgPyBbXVxuICAgICAgICBjb250aW51ZSBpZiBjb250LnByb3hpZWQgYW5kIGkgPCAxXG4gICAgICAgIGYgPSBzZWcuZm9ybWF0dGluZyA/IHt9XG4gICAgICAgICMgdGhlc2UgYXJlIGxpbmtzIHRvIGltYWdlcyB0aGF0IHdlIHRyeSBsb2FkaW5nXG4gICAgICAgICAjIGFzIGltYWdlcyBhbmQgc2hvdyBpbmxpbmUuIChub3QgYXR0YWNobWVudHMpXG4gICAgICAgIGhyZWYgPSBzZWc/LmxpbmtfZGF0YT8ubGlua190YXJnZXRcbiAgICAgICAgaW1hZ2VVcmwgPSBnZXRJbWFnZVVybCBocmVmICMgZmFsc2UgaWYgY2FuJ3QgZmluZCBvbmVcbiAgICAgICAgaWZwYXNzKGltYWdlVXJsLCBkaXYpIC0+XG4gICAgICAgICAgICBpZnBhc3MoaHJlZiwgKChmKSAtPiBhIHtocmVmLCBvbmNsaWNrfSwgZikpIC0+XG4gICAgICAgICAgICAgICAgaWZwYXNzKGYuYm9sZCwgYikgLT5cbiAgICAgICAgICAgICAgICAgICAgaWZwYXNzKGYuaXRhbGljcywgaSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmcGFzcyhmLnVuZGVybGluZSwgdSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZnBhc3MoZi5zdHJpa2V0aHJvdWdoLCBzKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZnBhc3MoaW1hZ2VVcmwsIGRpdikgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgcHJlbG9hZCByZXR1cm5zIHdoZXRoZXIgdGhlIGltYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIGhhcyBiZWVuIGxvYWRlZC4gcmVkcmF3IHdoZW4gaXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgbG9hZHMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1hZ2VVcmwpIGFuZCAocHJlbG9hZCBpbWFnZVVybClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWcgc3JjOiBpbWFnZVVybFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhc3MgaWYgY29udC5wcm94aWVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmlwUHJveGllZENvbG9uIHNlZy50ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWcudGV4dFxuICAgIG51bGxcblxuXG5zdHJpcFByb3hpZWRDb2xvbiA9ICh0eHQpIC0+XG4gICAgaWYgdHh0Py5pbmRleE9mKFwiOiBcIikgPT0gMFxuICAgICAgICB0eHQuc3Vic3RyaW5nKDIpXG4gICAgZWxzZVxuICAgICAgICB0eHRcblxucHJlbG9hZF9jYWNoZSA9IHt9XG5cblxucHJlbG9hZCA9IChocmVmKSAtPlxuICAgIGNhY2hlID0gcHJlbG9hZF9jYWNoZVtocmVmXVxuICAgIGlmIG5vdCBjYWNoZVxuICAgICAgICBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2ltZydcbiAgICAgICAgZWwub25sb2FkID0gLT5cbiAgICAgICAgICAgIHJldHVybiB1bmxlc3MgdHlwZW9mIGVsLm5hdHVyYWxXaWR0aCA9PSAnbnVtYmVyJ1xuICAgICAgICAgICAgZWwubG9hZGVkID0gdHJ1ZVxuICAgICAgICAgICAgbGF0ZXIgLT4gYWN0aW9uICdsb2FkZWRpbWcnXG4gICAgICAgIGVsLm9uZXJyb3IgPSAtPiBjb25zb2xlLmxvZyAnZXJyb3IgbG9hZGluZyBpbWFnZScsIGhyZWZcbiAgICAgICAgZWwuc3JjID0gaHJlZlxuICAgICAgICBwcmVsb2FkX2NhY2hlW2hyZWZdID0gZWxcbiAgICByZXR1cm4gY2FjaGU/LmxvYWRlZFxuXG5cbmZvcm1hdEF0dGFjaG1lbnQgPSAoYXR0KSAtPlxuICAgIGlmIGF0dD9bMF0/LmVtYmVkX2l0ZW0/LnR5cGVfXG4gICAgICAgIHtocmVmLCB0aHVtYn0gPSBleHRyYWN0UHJvdG9idWZTdHlsZShhdHQpXG4gICAgZWxzZSBpZiBhdHQ/WzBdPy5lbWJlZF9pdGVtPy50eXBlXG4gICAgICAgIHtocmVmLCB0aHVtYn0gPSBleHRyYWN0T2JqZWN0U3R5bGUoYXR0KVxuICAgIGVsc2VcbiAgICAgICAgY29uc29sZS53YXJuICdpZ25vcmluZyBhdHRhY2htZW50JywgYXR0IHVubGVzcyBhdHQ/Lmxlbmd0aCA9PSAwXG4gICAgICAgIHJldHVyblxuICAgIHJldHVybiB1bmxlc3MgaHJlZlxuXG4gICAgIyBoZXJlIHdlIGFzc3VtZSBhdHRhY2htZW50cyBhcmUgb25seSBpbWFnZXNcbiAgICBpZiBwcmVsb2FkIGhyZWZcbiAgICAgIGRpdiBjbGFzczonYXR0YWNoJywgLT5cbiAgICAgICAgICBhIHtocmVmLCBvbmNsaWNrfSwgLT4gaW1nIHNyYzpocmVmXG5cblxuaGFuZGxlICdsb2FkZWRpbWcnLCAtPlxuICAgICMgYWxsb3cgY29udHJvbGxlciB0byByZWNvcmQgY3VycmVudCBwb3NpdGlvblxuICAgIHVwZGF0ZWQgJ2JlZm9yZUltZydcbiAgICAjIHdpbGwgZG8gdGhlIHJlZHJhdyBpbnNlcnRpbmcgdGhlIGltYWdlXG4gICAgdXBkYXRlZCAnY29udidcbiAgICAjIGZpeCB0aGUgcG9zaXRpb24gYWZ0ZXIgcmVkcmF3XG4gICAgdXBkYXRlZCAnYWZ0ZXJJbWcnXG5cblxuZXh0cmFjdFByb3RvYnVmU3R5bGUgPSAoYXR0KSAtPlxuICAgIGVpdGVtID0gYXR0P1swXT8uZW1iZWRfaXRlbVxuICAgIHtkYXRhLCB0eXBlX30gPSBlaXRlbSA/IHt9XG4gICAgdCA9IHR5cGVfP1swXVxuICAgIHJldHVybiBjb25zb2xlLndhcm4gJ2lnbm9yaW5nIChvbGQpIGF0dGFjaG1lbnQgdHlwZScsIGF0dCB1bmxlc3MgdCA9PSAyNDlcbiAgICBrID0gT2JqZWN0LmtleXMoZGF0YSk/WzBdXG4gICAgcmV0dXJuIHVubGVzcyBrXG4gICAgaHJlZiA9IGRhdGE/W2tdP1s1XVxuICAgIHRodW1iID0gZGF0YT9ba10/WzldXG4gICAge2hyZWYsIHRodW1ifVxuXG5leHRyYWN0T2JqZWN0U3R5bGUgPSAoYXR0KSAtPlxuICAgIGVpdGVtID0gYXR0P1swXT8uZW1iZWRfaXRlbVxuICAgIHt0eXBlfSA9IGVpdGVtID8ge31cbiAgICBpZiB0eXBlP1swXSA9PSBcIlBMVVNfUEhPVE9cIlxuICAgICAgICBpdCA9IGVpdGVtW1wiZW1iZWRzLlBsdXNQaG90by5wbHVzX3Bob3RvXCJdXG4gICAgICAgIGhyZWYgPSBpdD8udXJsXG4gICAgICAgIHRodW1iID0gaXQ/LnRodW1ibmFpbD8udXJsXG4gICAgICAgIHJldHVybiB7aHJlZiwgdGh1bWJ9XG4gICAgZWxzZVxuICAgICAgICBjb25zb2xlLndhcm4gJ2lnbm9yaW5nIChuZXcpIHR5cGUnLCB0eXBlXG4iXX0=
