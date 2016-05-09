(function() {
  var chilledaction, fixlink, inputSetValue, mayRestoreInitialValues, nameof, ref, throttle, unique,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('../util'), throttle = ref.throttle, nameof = ref.nameof, fixlink = ref.fixlink;

  chilledaction = throttle(1500, action);

  unique = function(obj) {
    return obj.id.chat_id || obj.id.gaia_id;
  };

  mayRestoreInitialValues = function(models) {
    var convsettings, initialName, initialSearchQuery;
    convsettings = models.convsettings;
    initialName = convsettings.getInitialName();
    if (initialName !== null) {
      setTimeout(function() {
        var name;
        name = document.querySelector('.name-input');
        if (name) {
          return name.value = initialName;
        }
      }, 1);
    }
    initialSearchQuery = convsettings.getInitialSearchQuery();
    if (initialSearchQuery !== null) {
      setTimeout(function() {
        var search;
        search = document.querySelector('.search-input');
        if (search) {
          return search.value = initialSearchQuery;
        }
      }, 1);
    }
    setTimeout(function() {
      var group;
      group = document.querySelector('.group');
      if (group) {
        return group.checked = convsettings.group;
      }
    });
    return null;
  };

  inputSetValue = function(sel, val) {
    setTimeout(function() {
      var el;
      el = document.querySelector(sel);
      if (el !== null) {
        return el.value = val;
      }
    }, 1);
    return null;
  };

  module.exports = view(function(models) {
    var convsettings, editing, entity;
    convsettings = models.convsettings, entity = models.entity;
    editing = convsettings.id !== null;
    return div({
      "class": 'convadd'
    }, function() {
      var style;
      if (editing) {
        h1('Opções de conversa');
      } else {
        h1('Nova conversa');
      }
      style = {};
      if (!convsettings.group) {
        style = {
          display: 'none'
        };
      }
      div({
        "class": 'input'
      }, {
        style: style
      }, function() {
        return div(function() {
          return input({
            "class": 'name-input',
            style: style,
            placeholder: 'Nome da conversa',
            onkeyup: function(e) {
              return action('conversationname', e.currentTarget.value);
            }
          });
        });
      });
      div({
        "class": 'input'
      }, function() {
        return div(function() {
          return input({
            "class": 'search-input',
            placeholder: 'Localizar pessoas',
            onkeyup: function(e) {
              chilledaction('searchentities', e.currentTarget.value, 7);
              return action('conversationquery', e.currentTarget.value, 7);
            }
          });
        });
      });
      div({
        "class": 'input'
      }, function() {
        return div(function() {
          return p(function() {
            var opts;
            opts = {
              type: 'checkbox',
              "class": 'group',
              style: {
                width: 'auto',
                'margin-right': '5px'
              },
              onchange: function(e) {
                return action('togglegroup');
              }
            };
            if (convsettings.selectedEntities.length !== 1) {
              opts.disabled = 'disabled';
            }
            input(opts);
            return 'Criar uma conversa em grupo';
          });
        });
      });
      ul(function() {
        var c, selected_ids;
        convsettings.selectedEntities.forEach(function(r) {
          var cid, ref1;
          cid = r != null ? (ref1 = r.id) != null ? ref1.chat_id : void 0 : void 0;
          return li({
            "class": 'selected'
          }, function() {
            var purl, ref2, ref3, ref4;
            if (purl = (ref2 = (ref3 = r.properties) != null ? ref3.photo_url : void 0) != null ? ref2 : (ref4 = entity[cid]) != null ? ref4.photo_url : void 0) {
              img({
                src: fixlink(purl)
              });
            } else {
              img({
                src: "images/photo.jpg"
              });
              entity.needEntity(cid);
            }
            return p(nameof(r.properties));
          }, {
            onclick: function(e) {
              if (!editing) {
                return action('deselectentity', r);
              }
            }
          });
        });
        selected_ids = (function() {
          var i, len, ref1, results;
          ref1 = convsettings.selectedEntities;
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            c = ref1[i];
            results.push(unique(c));
          }
          return results;
        })();
        return convsettings.searchedEntities.forEach(function(r) {
          var cid, ref1, ref2;
          cid = r != null ? (ref1 = r.id) != null ? ref1.chat_id : void 0 : void 0;
          if (ref2 = unique(r), indexOf.call(selected_ids, ref2) >= 0) {
            return;
          }
          return li(function() {
            var purl, ref3, ref4, ref5;
            if (purl = (ref3 = (ref4 = r.properties) != null ? ref4.photo_url : void 0) != null ? ref3 : (ref5 = entity[cid]) != null ? ref5.photo_url : void 0) {
              img({
                src: fixlink(purl)
              });
            } else {
              img({
                src: "images/photo.jpg"
              });
              entity.needEntity(cid);
            }
            return p(r.properties.display_name);
          }, {
            onclick: function(e) {
              return action('selectentity', r);
            }
          });
        });
      });
      div(function() {
        var disabled;
        disabled = null;
        if (convsettings.selectedEntities.length <= 0) {
          disabled = {
            disabled: 'disabled'
          };
        }
        return button(disabled, "OK", {
          onclick: function() {
            return action('saveconversation');
          }
        });
      });
      return mayRestoreInitialValues(models);
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVpL3ZpZXdzL2NvbnZhZGQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0FBQUEsTUFBQSw2RkFBQTtJQUFBOztFQUFBLE1BQThCLE9BQUEsQ0FBUSxTQUFSLENBQTlCLEVBQUMsZUFBQSxRQUFELEVBQVcsYUFBQSxNQUFYLEVBQW1CLGNBQUE7O0VBQ25CLGFBQUEsR0FBZ0IsUUFBQSxDQUFTLElBQVQsRUFBZSxNQUFmOztFQUVoQixNQUFBLEdBQVMsU0FBQyxHQUFEO1dBQVMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxPQUFQLElBQWtCLEdBQUcsQ0FBQyxFQUFFLENBQUM7RUFBbEM7O0VBRVQsdUJBQUEsR0FBMEIsU0FBQyxNQUFEO0FBRXRCLFFBQUE7SUFBQyxlQUFnQixPQUFoQjtJQUNELFdBQUEsR0FBYyxZQUFZLENBQUMsY0FBYixDQUFBO0lBQ2QsSUFBRyxXQUFBLEtBQWUsSUFBbEI7TUFDSSxVQUFBLENBQVcsU0FBQTtBQUNQLFlBQUE7UUFBQSxJQUFBLEdBQU8sUUFBUSxDQUFDLGFBQVQsQ0FBdUIsYUFBdkI7UUFDUCxJQUE0QixJQUE1QjtpQkFBQSxJQUFJLENBQUMsS0FBTCxHQUFhLFlBQWI7O01BRk8sQ0FBWCxFQUdFLENBSEYsRUFESjs7SUFLQSxrQkFBQSxHQUFxQixZQUFZLENBQUMscUJBQWIsQ0FBQTtJQUNyQixJQUFHLGtCQUFBLEtBQXNCLElBQXpCO01BQ0ksVUFBQSxDQUFXLFNBQUE7QUFDUCxZQUFBO1FBQUEsTUFBQSxHQUFTLFFBQVEsQ0FBQyxhQUFULENBQXVCLGVBQXZCO1FBQ1QsSUFBcUMsTUFBckM7aUJBQUEsTUFBTSxDQUFDLEtBQVAsR0FBZSxtQkFBZjs7TUFGTyxDQUFYLEVBR0UsQ0FIRixFQURKOztJQUtBLFVBQUEsQ0FBVyxTQUFBO0FBQ1AsVUFBQTtNQUFBLEtBQUEsR0FBUSxRQUFRLENBQUMsYUFBVCxDQUF1QixRQUF2QjtNQUNSLElBQXNDLEtBQXRDO2VBQUEsS0FBSyxDQUFDLE9BQU4sR0FBZ0Is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LEVBQXVCLENBQXZCO1lBQVAsQ0FBUjtXQVBGO1FBSGtDLENBQXRDO01BZEQsQ0FBSDtNQTBCQSxHQUFBLENBQUksU0FBQTtBQUNBLFlBQUE7UUFBQSxRQUFBLEdBQVc7UUFDWCxJQUFHLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUE5QixJQUF3QyxDQUEzQztVQUFrRCxRQUFBLEdBQVc7WUFBQSxRQUFBLEVBQVUsVUFBVjtZQUE3RDs7ZUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQixJQUFqQixFQUF1QjtVQUFBLE9BQUEsRUFBUSxTQUFBO21CQUFHLE1BQUEsQ0FBTyxrQkFBUDtVQUFILENBQVI7U0FBdkI7TUFIQSxDQUFKO2FBS0EsdUJBQUEsQ0FBd0IsTUFBeEI7SUF0RW9CLENBQXRCO0VBSmtCLENBQUw7QUFoQ2pCIiwiZmlsZSI6InVpL3ZpZXdzL2NvbnZhZGQuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJcbnt0aHJvdHRsZSwgbmFtZW9mLCBmaXhsaW5rfSA9IHJlcXVpcmUgJy4uL3V0aWwnXG5jaGlsbGVkYWN0aW9uID0gdGhyb3R0bGUgMTUwMCwgYWN0aW9uXG5cbnVuaXF1ZSA9IChvYmopIC0+IG9iai5pZC5jaGF0X2lkIG9yIG9iai5pZC5nYWlhX2lkXG5cbm1heVJlc3RvcmVJbml0aWFsVmFsdWVzID0gKG1vZGVscykgLT5cbiAgICAjIElmIHRoZXJlIGlzIGFuIGluaXRpYWwgdmFsdWUgd2Ugc2V0IGl0IGFuIHRoZW4gaW52YWxpZGF0ZSBpdFxuICAgIHtjb252c2V0dGluZ3N9ID0gbW9kZWxzXG4gICAgaW5pdGlhbE5hbWUgPSBjb252c2V0dGluZ3MuZ2V0SW5pdGlhbE5hbWUoKVxuICAgIGlmIGluaXRpYWxOYW1lICE9IG51bGxcbiAgICAgICAgc2V0VGltZW91dCAtPlxuICAgICAgICAgICAgbmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IgJy5uYW1lLWlucHV0J1xuICAgICAgICAgICAgbmFtZS52YWx1ZSA9IGluaXRpYWxOYW1lIGlmIG5hbWVcbiAgICAgICAgLCAxXG4gICAgaW5pdGlhbFNlYXJjaFF1ZXJ5ID0gY29udnNldHRpbmdzLmdldEluaXRpYWxTZWFyY2hRdWVyeSgpXG4gICAgaWYgaW5pdGlhbFNlYXJjaFF1ZXJ5ICE9IG51bGxcbiAgICAgICAgc2V0VGltZW91dCAtPlxuICAgICAgICAgICAgc2VhcmNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciAnLnNlYXJjaC1pbnB1dCdcbiAgICAgICAgICAgIHNlYXJjaC52YWx1ZSA9IGluaXRpYWxTZWFyY2hRdWVyeSBpZiBzZWFyY2hcbiAgICAgICAgLCAxXG4gICAgc2V0VGltZW91dCAtPlxuICAgICAgICBncm91cCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IgJy5ncm91cCdcbiAgICAgICAgZ3JvdXAuY2hlY2tlZCA9IGNvbnZzZXR0aW5ncy5ncm91cCBpZiBncm91cFxuICAgIG51bGxcblxuaW5wdXRTZXRWYWx1ZSA9IChzZWwsIHZhbCkgLT5cbiAgICBzZXRUaW1lb3V0IC0+XG4gICAgICAgIGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciBzZWxcbiAgICAgICAgZWwudmFsdWUgPSB2YWwgaWYgZWwgIT0gbnVsbFxuICAgICwgMVxuICAgIG51bGxcblxubW9kdWxlLmV4cG9ydHMgPSB2aWV3IChtb2RlbHMpIC0+XG4gICAge2NvbnZzZXR0aW5ncywgZW50aXR5fSA9IG1vZGVsc1xuICAgIGVkaXRpbmcgPSBjb252c2V0dGluZ3MuaWQgIT0gbnVsbFxuXG4gICAgZGl2IGNsYXNzOiAnY29udmFkZCcsIC0+XG4gICAgICBpZiBlZGl0aW5nIHRoZW4gaDEgJ0NvbnZlcnNhdGlvbiBlZGl0JyBlbHNlIGgxICdOZXcgY29udmVyc2F0aW9uJ1xuXG4gICAgICBzdHlsZSA9IHt9XG4gICAgICBpZiBub3QgY29udnNldHRpbmdzLmdyb3VwXG4gICAgICAgICAgc3R5bGUgPSBkaXNwbGF5OiAnbm9uZSdcbiAgICAgICAgICBcbiAgICAgIGRpdiBjbGFzczogJ2lucHV0Jywge3N0eWxlfSwgLT5cbiAgICAgICAgICBkaXYgLT5cbiAgICAgICAgICAgICAgaW5wdXRcbiAgICAgICAgICAgICAgICAgIGNsYXNzOiAnbmFtZS1pbnB1dCdcbiAgICAgICAgICAgICAgICAgIHN0eWxlOiBzdHlsZVxuICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdDb252ZXJzYXRpb24gbmFtZSdcbiAgICAgICAgICAgICAgICAgIG9ua2V5dXA6IChlKSAtPlxuICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbiAnY29udmVyc2F0aW9ubmFtZScsIGUuY3VycmVudFRhcmdldC52YWx1ZVxuXG4gICAgICBkaXYgY2xhc3M6ICdpbnB1dCcsIC0+XG4gICAgICAgICAgZGl2IC0+XG4gICAgICAgICAgICAgIGlucHV0XG4gICAgICAgICAgICAgICAgICBjbGFzczogJ3NlYXJjaC1pbnB1dCdcbiAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOidTZWFyY2ggcGVvcGxlJ1xuICAgICAgICAgICAgICAgICAgb25rZXl1cDogKGUpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgY2hpbGxlZGFjdGlvbiAnc2VhcmNoZW50aXRpZXMnLCBlLmN1cnJlbnRUYXJnZXQudmFsdWUsIDdcbiAgICAgICAgICAgICAgICAgICAgICBhY3Rpb24gJ2NvbnZlcnNhdGlvbnF1ZXJ5JywgZS5jdXJyZW50VGFyZ2V0LnZhbHVlLCA3XG4gICAgICBcbiAgICAgIGRpdiBjbGFzczogJ2lucHV0JywgLT5cbiAgICAgICAgICBkaXYgLT5cbiAgICAgICAgICAgICAgcCAtPlxuICAgICAgICAgICAgICAgICAgb3B0cyA9XG4gICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NoZWNrYm94J1xuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiAnZ3JvdXAnXG4gICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgd2lkdGg6ICdhdXRvJywgJ21hcmdpbi1yaWdodCc6ICc1cHgnIH1cbiAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogKGUpIC0+IGFjdGlvbiAgICd0b2dnbGVncm91cCdcbiAgICAgICAgICAgICAgICAgIGlmIGNvbnZzZXR0aW5ncy5zZWxlY3RlZEVudGl0aWVzLmxlbmd0aCAhPSAxXG4gICAgICAgICAgICAgICAgICAgICAgb3B0cy5kaXNhYmxlZCA9ICdkaXNhYmxlZCdcbiAgICAgICAgICAgICAgICAgIGlucHV0IG9wdHNcbiAgICAgICAgICAgICAgICAgICdDcmVhdGUgbXVsdGl1c2VyIGNoYXQnXG4gICAgICAgICAgICAgICAgICBcblxuICAgICAgdWwgLT5cbiAgICAgICAgICBjb252c2V0dGluZ3Muc2VsZWN0ZWRFbnRpdGllcy5mb3JFYWNoIChyKSAtPlxuICAgICAgICAgICAgICBjaWQgPSByPy5pZD8uY2hhdF9pZFxuICAgICAgICAgICAgICBsaSBjbGFzczogJ3NlbGVjdGVkJywgLT5cbiAgICAgICAgICAgICAgICAgIGlmIHB1cmwgPSByLnByb3BlcnRpZXM/LnBob3RvX3VybCA/IGVudGl0eVtjaWRdPy5waG90b191cmxcbiAgICAgICAgICAgICAgICAgICAgICBpbWcgc3JjOmZpeGxpbmsocHVybClcbiAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICBpbWcgc3JjOlwiaW1hZ2VzL3Bob3RvLmpwZ1wiXG4gICAgICAgICAgICAgICAgICAgICAgZW50aXR5Lm5lZWRFbnRpdHkgY2lkXG4gICAgICAgICAgICAgICAgICBwIG5hbWVvZiByLnByb3BlcnRpZXNcbiAgICAgICAgICAgICAgLCBvbmNsaWNrOihlKSAtPiBpZiBub3QgZWRpdGluZyB0aGVuIGFjdGlvbiAnZGVzZWxlY3RlbnRpdHknLCByXG5cbiAgICAgICAgICBzZWxlY3RlZF9pZHMgPSAodW5pcXVlKGMpIGZvciBjIGluIGNvbnZzZXR0aW5ncy5zZWxlY3RlZEVudGl0aWVzKVxuXG4gICAgICAgICAgY29udnNldHRpbmdzLnNlYXJjaGVkRW50aXRpZXMuZm9yRWFjaCAocikgLT5cbiAgICAgICAgICAgICAgY2lkID0gcj8uaWQ/LmNoYXRfaWRcbiAgICAgICAgICAgICAgaWYgdW5pcXVlKHIpIGluIHNlbGVjdGVkX2lkcyB0aGVuIHJldHVyblxuICAgICAgICAgICAgICBsaSAtPlxuICAgICAgICAgICAgICAgICAgaWYgcHVybCA9IHIucHJvcGVydGllcz8ucGhvdG9fdXJsID8gZW50aXR5W2NpZF0/LnBob3RvX3VybFxuICAgICAgICAgICAgICAgICAgICAgIGltZyBzcmM6Zml4bGluayhwdXJsKVxuICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgIGltZyBzcmM6XCJpbWFnZXMvcGhvdG8uanBnXCJcbiAgICAgICAgICAgICAgICAgICAgICBlbnRpdHkubmVlZEVudGl0eSBjaWRcbiAgICAgICAgICAgICAgICAgIHAgci5wcm9wZXJ0aWVzLmRpc3BsYXlfbmFtZVxuICAgICAgICAgICAgICAsIG9uY2xpY2s6KGUpIC0+IGFjdGlvbiAnc2VsZWN0ZW50aXR5JywgclxuXG4gICAgICBkaXYgLT5cbiAgICAgICAgICBkaXNhYmxlZCA9IG51bGxcbiAgICAgICAgICBpZiBjb252c2V0dGluZ3Muc2VsZWN0ZWRFbnRpdGllcy5sZW5ndGggPD0gMCB0aGVuIGRpc2FibGVkID0gZGlzYWJsZWQ6ICdkaXNhYmxlZCdcbiAgICAgICAgICBidXR0b24gZGlzYWJsZWQsIFwiT0tcIiwgb25jbGljazotPiBhY3Rpb24gJ3NhdmVjb252ZXJzYXRpb24nXG5cbiAgICAgIG1heVJlc3RvcmVJbml0aWFsVmFsdWVzIG1vZGVsc1xuIl19
