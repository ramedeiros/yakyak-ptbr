(function() {
  var fixlink, nameof, nameofconv, ref;

  ref = require('../util'), nameof = ref.nameof, nameofconv = ref.nameofconv, fixlink = ref.fixlink;

  module.exports = view(function(models) {
    var clz, conv, entity, viewstate;
    conv = models.conv, entity = models.entity, viewstate = models.viewstate;
    clz = ['convlist'];
    if (viewstate.showConvThumbs) {
      clz.push('showconvthumbs');
    }
    return div({
      "class": clz.join(' ')
    }, function() {
      var c, convs, others, renderConv, starred;
      convs = conv.list();
      renderConv = function(c) {
        var cid, lastChanged, pureHang, ref1, ur;
        pureHang = conv.isPureHangout(c);
        lastChanged = conv.lastChanged(c);
        if (pureHang && (Date.now() - lastChanged) > 24 * 60 * 60 * 1000) {
          return;
        }
        cid = c != null ? (ref1 = c.conversation_id) != null ? ref1.id : void 0 : void 0;
        ur = conv.unread(c);
        clz = ['conv'];
        clz.push("type_" + c.type);
        if (models.viewstate.selectedConv === cid) {
          clz.push("selected");
        }
        if (ur) {
          clz.push("unread");
        }
        if (pureHang) {
          clz.push("purehang");
        }
        return div({
          key: cid,
          "class": clz.join(' ')
        }, function() {
          var anyTyping, ents, lbl, name, p, part, ref2, ref3, tclz;
          part = (ref2 = c != null ? c.current_participant : void 0) != null ? ref2 : [];
          ents = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = part.length; i < len; i++) {
              p = part[i];
              if (!entity.isSelf(p.chat_id)) {
                results.push(entity[p.chat_id]);
              }
            }
            return results;
          })();
          name = nameofconv(c);
          if (viewstate.showConvThumbs) {
            div({
              "class": 'thumbs'
            }, function() {
              var i, image, index, len, results;
              results = [];
              for (index = i = 0, len = ents.length; i < len; index = ++i) {
                p = ents[index];
                if (index >= 2) {
                  break;
                }
                image = p.photo_url;
                if (!image) {
                  entity.needEntity(p.id);
                  image = "images/photo.jpg";
                }
                results.push(img({
                  src: fixlink(image),
                  onerror: function() {
                    return this.src = fixlink("images/photo.jpg");
                  }
                }));
              }
              return results;
            });
          }
          span({
            "class": 'convname'
          }, name);
          if (ur > 0 && !conv.isQuiet(c)) {
            lbl = ur >= conv.MAX_UNREAD ? conv.MAX_UNREAD + "+" : ur + '';
            span({
              "class": 'unreadcount'
            }, lbl);
          }
          div({
            "class": 'divider'
          });
          if (((ref3 = c.typing) != null ? ref3.length : void 0) > 0) {
            anyTyping = c.typing.filter(function(t) {
              return (t != null ? t.status : void 0) === 'TYPING';
            }).length;
            tclz = ['convtyping'];
            if (anyTyping) {
              tclz.push('animate-growshrink');
            }
            return span({
              "class": tclz.join(' ')
            }, '⋮');
          }
        }, {
          onclick: function(ev) {
            ev.preventDefault();
            return action('selectConv', c);
          }
        });
      };
      starred = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = convs.length; i < len; i++) {
          c = convs[i];
          if (conv.isStarred(c)) {
            results.push(c);
          }
        }
        return results;
      })();
      others = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = convs.length; i < len; i++) {
          c = convs[i];
          if (!conv.isStarred(c)) {
            results.push(c);
          }
        }
        return results;
      })();
      div({
        "class": 'starred'
      }, function() {
        if (starred.length > 0) {
          div({
            "class": 'label'
          }, 'Favoritos');
        }
        return starred.forEach(renderConv);
      });
      return div({
        "class": 'others'
      }, function() {
        if (starred.length > 0) {
          div({
            "class": 'label'
          }, 'Recentes');
        }
        return others.forEach(renderConv);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVpL3ZpZXdzL2NvbnZsaXN0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBZ0MsT0FBQSxDQUFRLFNBQVIsQ0FBaEMsRUFBQyxhQUFBLE1BQUQsRUFBUyxpQkFBQSxVQUFULEVBQXFCLGNBQUE7O0VBRXJCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLElBQUEsQ0FBSyxTQUFDLE1BQUQ7QUFDbEIsUUFBQTtJQUFDLGNBQUEsSUFBRCxFQUFPLGdCQUFBLE1BQVAsRUFBZSxtQkFBQTtJQUNmLEdBQUEsR0FBTSxDQUFDLFVBQUQ7SUFDTixJQUE2QixTQUFTLENBQUMsY0FBdkM7TUFBQSxHQUFHLENBQUMsSUFBSixDQUFTLGdCQUFULEVBQUE7O1dBQ0EsR0FBQSxDQUFJO01BQUEsT0FBQSxFQUFNLEdBQUcsQ0FBQyxJQUFKLENBQVMsR0FBVCxDQUFOO0tBQUosRUFBeUIsU0FBQTtBQUNyQixVQUFBO01BQUEsS0FBQSxHQUFRLElBQUksQ0FBQyxJQUFMLENBQUE7TUFDUixVQUFBLEdBQWEsU0FBQyxDQUFEO0FBQ1QsWUFBQTtRQUFBLFFBQUEsR0FBVyxJQUFJLENBQUMsYUFBTCxDQUFtQixDQUFuQjtRQUNYLFdBQUEsR0FBYyxJQUFJLENBQUMsV0FBTCxDQUFpQixDQUFqQjtRQUVkLElBQVUsUUFBQSxJQUFhLENBQUMsSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQUFBLEdBQWEsV0FBZCxDQUFBLEdBQTZCLEVBQUEsR0FBSyxFQUFMLEdBQVUsRUFBVixHQUFlLElBQW5FO0FBQUEsaUJBQUE7O1FBQ0EsR0FBQSx3REFBd0IsQ0FBRTtRQUMxQixFQUFBLEdBQUssSUFBSSxDQUFDLE1BQUwsQ0FBWSxDQUFaO1FBQ0wsR0FBQSxHQUFNLENBQUMsTUFBRDtRQUNOLEdBQUcsQ0FBQyxJQUFKLENBQVMsT0FBQSxHQUFRLENBQUMsQ0FBQyxJQUFuQjtRQUNBLElBQXVCLE1BQU0sQ0FBQyxTQUFTLENBQUMsWUFBakIsS0FBaUMsR0FB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R0FBaUIsQ0FBcEQ7VUFBQSxHQUFBLENBQUk7WUFBQSxPQUFBLEVBQU8sT0FBUDtXQUFKLEVBQW9CLFdBQXBCLEVBQUE7O2VBQ0EsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsVUFBaEI7TUFGa0IsQ0FBdEI7YUFHQSxHQUFBLENBQUk7UUFBQSxPQUFBLEVBQU8sUUFBUDtPQUFKLEVBQXFCLFNBQUE7UUFDakIsSUFBZ0MsT0FBTyxDQUFDLE1BQVIsR0FBaUIsQ0FBakQ7VUFBQSxHQUFBLENBQUk7WUFBQSxPQUFBLEVBQU8sT0FBUDtXQUFKLEVBQW9CLFFBQXBCLEVBQUE7O2VBQ0EsTUFBTSxDQUFDLE9BQVAsQ0FBZSxVQUFmO01BRmlCLENBQXJCO0lBaERxQixDQUF6QjtFQUprQixDQUFMO0FBRmpCIiwiZmlsZSI6InVpL3ZpZXdzL2NvbnZsaXN0LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsie25hbWVvZiwgbmFtZW9mY29udiwgZml4bGlua30gPSByZXF1aXJlICcuLi91dGlsJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IHZpZXcgKG1vZGVscykgLT5cbiAgICB7Y29udiwgZW50aXR5LCB2aWV3c3RhdGV9ID0gbW9kZWxzXG4gICAgY2x6ID0gWydjb252bGlzdCddXG4gICAgY2x6LnB1c2ggJ3Nob3djb252dGh1bWJzJyBpZiB2aWV3c3RhdGUuc2hvd0NvbnZUaHVtYnNcbiAgICBkaXYgY2xhc3M6Y2x6LmpvaW4oJyAnKSwgLT5cbiAgICAgICAgY29udnMgPSBjb252Lmxpc3QoKVxuICAgICAgICByZW5kZXJDb252ID0gKGMpIC0+XG4gICAgICAgICAgICBwdXJlSGFuZyA9IGNvbnYuaXNQdXJlSGFuZ291dChjKVxuICAgICAgICAgICAgbGFzdENoYW5nZWQgPSBjb252Lmxhc3RDaGFuZ2VkKGMpXG4gICAgICAgICAgICAjIGRvbid0IGxpc3QgcHVyZSBoYW5nb3V0cyB0aGF0IGFyZSBvbGRlciB0aGFuIDI0aFxuICAgICAgICAgICAgcmV0dXJuIGlmIHB1cmVIYW5nIGFuZCAoRGF0ZS5ub3coKSAtIGxhc3RDaGFuZ2VkKSA+IDI0ICogNjAgKiA2MCAqIDEwMDBcbiAgICAgICAgICAgIGNpZCA9IGM/LmNvbnZlcnNhdGlvbl9pZD8uaWRcbiAgICAgICAgICAgIHVyID0gY29udi51bnJlYWQgY1xuICAgICAgICAgICAgY2x6ID0gWydjb252J11cbiAgICAgICAgICAgIGNsei5wdXNoIFwidHlwZV8je2MudHlwZX1cIlxuICAgICAgICAgICAgY2x6LnB1c2ggXCJzZWxlY3RlZFwiIGlmIG1vZGVscy52aWV3c3RhdGUuc2VsZWN0ZWRDb252ID09IGNpZFxuICAgICAgICAgICAgY2x6LnB1c2ggXCJ1bnJlYWRcIiBpZiB1clxuICAgICAgICAgICAgY2x6LnB1c2ggXCJwdXJlaGFuZ1wiIGlmIHB1cmVIYW5nXG4gICAgICAgICAgICBkaXYga2V5OmNpZCwgY2xhc3M6Y2x6LmpvaW4oJyAnKSwgLT5cbiAgICAgICAgICAgICAgICBwYXJ0ID0gYz8uY3VycmVudF9wYXJ0aWNpcGFudCA/IFtdXG4gICAgICAgICAgICAgICAgZW50cyA9IGZvciBwIGluIHBhcnQgd2hlbiBub3QgZW50aXR5LmlzU2VsZiBwLmNoYXRfaWRcbiAgICAgICAgICAgICAgICAgICAgZW50aXR5W3AuY2hhdF9pZF1cbiAgICAgICAgICAgICAgICBuYW1lID0gbmFtZW9mY29udiBjXG4gICAgICAgICAgICAgICAgaWYgdmlld3N0YXRlLnNob3dDb252VGh1bWJzXG4gICAgICAgICAgICAgICAgICAgIGRpdiBjbGFzczogJ3RodW1icycsIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgcCwgaW5kZXggaW4gZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrIGlmIGluZGV4ID49IDJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZSA9IHAucGhvdG9fdXJsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5sZXNzIGltYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudGl0eS5uZWVkRW50aXR5KHAuaWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlID0gXCJpbWFnZXMvcGhvdG8uanBnXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWcgc3JjOmZpeGxpbmsoaW1hZ2UpLCBvbmVycm9yOiAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNyYyA9IGZpeGxpbmsoXCJpbWFnZXMvcGhvdG8uanBnXCIpXG4gICAgICAgICAgICAgICAgc3BhbiBjbGFzczonY29udm5hbWUnLCBuYW1lXG4gICAgICAgICAgICAgICAgaWYgdXIgPiAwIGFuZCBub3QgY29udi5pc1F1aWV0KGMpXG4gICAgICAgICAgICAgICAgICAgIGxibCA9IGlmIHVyID49IGNvbnYuTUFYX1VOUkVBRCB0aGVuIFwiI3tjb252Lk1BWF9VTlJFQUR9K1wiIGVsc2UgdXIgKyAnJ1xuICAgICAgICAgICAgICAgICAgICBzcGFuIGNsYXNzOid1bnJlYWRjb3VudCcsIGxibFxuICAgICAgICAgICAgICAgIGRpdiBjbGFzczonZGl2aWRlcidcbiAgICAgICAgICAgICAgICBpZiBjLnR5cGluZz8ubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgICAgICBhbnlUeXBpbmcgPSBjLnR5cGluZy5maWx0ZXIoKHQpIC0+IHQ/LnN0YXR1cyA9PSAnVFlQSU5HJykubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHRjbHogPSBbJ2NvbnZ0eXBpbmcnXVxuICAgICAgICAgICAgICAgICAgICB0Y2x6LnB1c2ggJ2FuaW1hdGUtZ3Jvd3NocmluaycgaWYgYW55VHlwaW5nXG4gICAgICAgICAgICAgICAgICAgIHNwYW4gY2xhc3M6dGNsei5qb2luKCcgJyksICfii64nXG4gICAgICAgICAgICAsIG9uY2xpY2s6IChldikgLT5cbiAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICAgICAgYWN0aW9uICdzZWxlY3RDb252JywgY1xuXG4gICAgICAgIHN0YXJyZWQgPSAoYyBmb3IgYyBpbiBjb252cyB3aGVuIGNvbnYuaXNTdGFycmVkKGMpKVxuICAgICAgICBvdGhlcnMgPSAoYyBmb3IgYyBpbiBjb252cyB3aGVuIG5vdCBjb252LmlzU3RhcnJlZChjKSlcbiAgICAgICAgZGl2IGNsYXNzOiAnc3RhcnJlZCcsIC0+XG4gICAgICAgICAgICBkaXYgY2xhc3M6ICdsYWJlbCcsICdGYXZvcml0ZXMnIGlmIHN0YXJyZWQubGVuZ3RoID4gMFxuICAgICAgICAgICAgc3RhcnJlZC5mb3JFYWNoIHJlbmRlckNvbnZcbiAgICAgICAgZGl2IGNsYXNzOiAnb3RoZXJzJywgLT5cbiAgICAgICAgICAgIGRpdiBjbGFzczogJ2xhYmVsJywgJ1JlY2VudCcgaWYgc3RhcnJlZC5sZW5ndGggPiAwXG4gICAgICAgICAgICBvdGhlcnMuZm9yRWFjaCByZW5kZXJDb252XG4iXX0=
