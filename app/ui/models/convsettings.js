(function() {
  var entity, exp;

  entity = require('./entity');

  module.exports = exp = {
    searchedEntities: [],
    selectedEntities: [],
    initialName: null,
    initialSearchQuery: null,
    name: "",
    searchQuery: "",
    id: null,
    group: false,
    setSearchedEntities: function(entities) {
      this.searchedEntities = entities || [];
      return updated('searchedentities');
    },
    addSelectedEntity: function(entity) {
      var e, exists, id, ref;
      id = ((ref = entity.id) != null ? ref.chat_id : void 0) || entity;
      exists = ((function() {
        var i, len, ref1, results;
        ref1 = this.selectedEntities;
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          e = ref1[i];
          if (e.id.chat_id === id) {
            results.push(e);
          }
        }
        return results;
      }).call(this)).length !== 0;
      if (!exists) {
        this.selectedEntities.push(entity);
        this.group = this.selectedEntities.length > 1;
        return updated('convsettings');
      }
    },
    removeSelectedEntity: function(entity) {
      var e, id, ref;
      id = ((ref = entity.id) != null ? ref.chat_id : void 0) || entity;
      this.selectedEntities = (function() {
        var i, len, ref1, results;
        ref1 = this.selectedEntities;
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          e = ref1[i];
          if (e.id.chat_id !== id) {
            results.push(e);
          }
        }
        return results;
      }).call(this);
      this.group = this.selectedEntities.length > 1;
      return updated('selectedEntities');
    },
    setSelectedEntities: function(entities) {
      this.group = entities.length > 1;
      return this.selectedEntities = entities || [];
    },
    setGroup: function(val) {
      this.group = val;
      return updated('convsettings');
    },
    setInitialName: function(name) {
      return this.initialName = name;
    },
    getInitialName: function() {
      var v;
      v = this.initialName;
      this.initialName = null;
      return v;
    },
    setInitialSearchQuery: function(query) {
      return this.initialSearchQuery = query;
    },
    getInitialSearchQuery: function() {
      var v;
      v = this.initialSearchQuery;
      this.initialSearchQuery = null;
      return v;
    },
    setName: function(name) {
      return this.name = name;
    },
    setSearchQuery: function(query) {
      return this.searchQuery = query;
    },
    loadConversation: function(c) {
      var ref, ref1;
      c.participant_data.forEach((function(_this) {
        return function(p) {
          var id;
          id = p.id.chat_id || p.id.gaia_id;
          if (entity.isSelf(id)) {
            return;
          }
          p = entity[id];
          return _this.selectedEntities.push({
            id: {
              chat_id: id
            },
            properties: {
              photo_url: p.photo_url,
              display_name: p.display_name || p.fallback_name
            }
          });
        };
      })(this));
      this.group = this.selectedEntities.length > 1;
      this.id = ((ref = c.conversation_id) != null ? ref.id : void 0) || ((ref1 = c.id) != null ? ref1.id : void 0);
      this.initialName = this.name = c.name || "";
      this.initialSearchQuery = "";
      return updated('convsettings');
    },
    reset: function() {
      this.searchedEntities = [];
      this.selectedEntities = [];
      this.initialName = "";
      this.initialSearchQuery = "";
      this.searchQuery = "";
      this.name = "";
      this.id = null;
      this.group = false;
      return updated('convsettings');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVpL21vZGVscy9jb252c2V0dGluZ3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0VBRVQsTUFBTSxDQUFDLE9BQVAsR0FBaUIsR0FBQSxHQUFNO0lBR25CLGdCQUFBLEVBQWtCLEVBSEM7SUFJbkIsZ0JBQUEsRUFBa0IsRUFKQztJQUtuQixXQUFBLEVBQWEsSUFMTTtJQU1uQixrQkFBQSxFQUFvQixJQU5EO0lBT25CLElBQUEsRUFBTSxFQVBhO0lBUW5CLFdBQUEsRUFBYSxFQVJNO0lBU25CLEVBQUEsRUFBSSxJQVRlO0lBVW5CLEtBQUEsRUFBTyxLQVZZO0lBWW5CLG1CQUFBLEVBQXFCLFNBQUMsUUFBRDtNQUNqQixJQUFDLENBQUEsZ0JBQUQsR0FBb0IsUUFBQSxJQUFZO2FBQ2hDLE9BQUEsQ0FBUSxrQkFBUjtJQUZpQixDQVpGO0lBZ0JuQixpQkFBQSxFQUFtQixTQUFDLE1BQUQ7QUFDZixVQUFBO01BQUEsRUFBQSxtQ0FBYyxDQUFFLGlCQUFYLElBQXNCO01BQzNCLE1BQUEsR0FBUzs7QUFBQztBQUFBO2FBQUEsc0NBQUE7O2NBQWtDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTCxLQUFnQjt5QkFBbEQ7O0FBQUE7O21CQUFELENBQXNELENBQUMsTUFBdkQsS0FBaUU7TUFDMUUsSUFBRyxDQUFJLE1BQVA7UUFDSSxJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsTUFBdkI7UUFDQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxNQUFsQixHQUEyQjtlQUNwQyxPQUFBLENBQVEsY0FBUixFQUhKOztJQUhlLENBaEJBO0lBd0JuQixvQkFBQSxFQUFzQixTQUFDLE1BQUQ7QUFDbEIsVUFBQTtNQUFBLEVBQUEsbUNBQWMsQ0FBRSxpQkFBWCxJQUFzQjtNQUczQixJQUFDLENBQUEsZ0JBQUQ7O0FBQXFCO0FBQUE7YUFB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Q0FBUSxjQUFSO0lBVEcsQ0FqRVk7O0FBRnZCIiwiZmlsZSI6InVpL21vZGVscy9jb252c2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJlbnRpdHkgPSByZXF1aXJlICcuL2VudGl0eSdcblxubW9kdWxlLmV4cG9ydHMgPSBleHAgPSB7XG4gICAgIyBUaGlzIGhhbmRsZXMgdGhlIGRhdGEgb2YgY29udmVyc2F0aW9uIGFkZCAvIGVkaXRcbiAgICAjIHdoZXJlIHlvdSBjYW4gc3BlY2lmeSBwYXJ0aWNpcGFudHMgY29udmVyc2F0aW9uIG5hbWUsIGV0Y1xuICAgIHNlYXJjaGVkRW50aXRpZXM6IFtdXG4gICAgc2VsZWN0ZWRFbnRpdGllczogW11cbiAgICBpbml0aWFsTmFtZTogbnVsbFxuICAgIGluaXRpYWxTZWFyY2hRdWVyeTogbnVsbFxuICAgIG5hbWU6IFwiXCJcbiAgICBzZWFyY2hRdWVyeTogXCJcIlxuICAgIGlkOiBudWxsXG4gICAgZ3JvdXA6IGZhbHNlXG5cbiAgICBzZXRTZWFyY2hlZEVudGl0aWVzOiAoZW50aXRpZXMpIC0+XG4gICAgICAgIEBzZWFyY2hlZEVudGl0aWVzID0gZW50aXRpZXMgb3IgW11cbiAgICAgICAgdXBkYXRlZCAnc2VhcmNoZWRlbnRpdGllcydcblxuICAgIGFkZFNlbGVjdGVkRW50aXR5OiAoZW50aXR5KSAtPlxuICAgICAgICBpZCA9IGVudGl0eS5pZD8uY2hhdF9pZCBvciBlbnRpdHkgI8KgbWF5IHBhc3MgaWQgZGlyZWN0bHlcbiAgICAgICAgZXhpc3RzID0gKGUgZm9yIGUgaW4gQHNlbGVjdGVkRW50aXRpZXMgd2hlbiBlLmlkLmNoYXRfaWQgPT0gaWQpLmxlbmd0aCAhPSAwXG4gICAgICAgIGlmIG5vdCBleGlzdHNcbiAgICAgICAgICAgIEBzZWxlY3RlZEVudGl0aWVzLnB1c2ggZW50aXR5XG4gICAgICAgICAgICBAZ3JvdXAgPSBAc2VsZWN0ZWRFbnRpdGllcy5sZW5ndGggPiAxXG4gICAgICAgICAgICB1cGRhdGVkICdjb252c2V0dGluZ3MnXG5cbiAgICByZW1vdmVTZWxlY3RlZEVudGl0eTogKGVudGl0eSkgLT5cbiAgICAgICAgaWQgPSBlbnRpdHkuaWQ/LmNoYXRfaWQgb3IgZW50aXR5ICPCoG1heSBwYXNzIGlkIGRpcmVjdGx5XG4gICAgICAgICMgaWYgdGhlIGNvbnZlcnNhdGlvbiB3ZSBhcmUgZWRpdGluZyBpcyBvbmUgdG8gb25lIHdlIGRvbid0IHdhbnRcbiAgICAgICAgIyB0byByZW1vdmUgdGhlIHNlbGVjdGVkIGVudGl0eVxuICAgICAgICBAc2VsZWN0ZWRFbnRpdGllcyA9IChlIGZvciBlIGluIEBzZWxlY3RlZEVudGl0aWVzIHdoZW4gZS5pZC5jaGF0X2lkICE9IGlkKVxuICAgICAgICBAZ3JvdXAgPSBAc2VsZWN0ZWRFbnRpdGllcy5sZW5ndGggPiAxXG4gICAgICAgIHVwZGF0ZWQgJ3NlbGVjdGVkRW50aXRpZXMnXG5cbiAgICBzZXRTZWxlY3RlZEVudGl0aWVzOiAoZW50aXRpZXMpIC0+XG4gICAgICAgIEBncm91cCA9IGVudGl0aWVzLmxlbmd0aCA+IDFcbiAgICAgICAgQHNlbGVjdGVkRW50aXRpZXMgPSBlbnRpdGllcyBvciBbXSAjIG5vIG5lZWQgdG8gdXBkYXRlXG4gICAgXG4gICAgc2V0R3JvdXA6ICh2YWwpIC0+IEBncm91cCA9IHZhbDsgdXBkYXRlZCAnY29udnNldHRpbmdzJ1xuXG4gICAgc2V0SW5pdGlhbE5hbWU6IChuYW1lKSAtPiBAaW5pdGlhbE5hbWUgPSBuYW1lXG4gICAgZ2V0SW5pdGlhbE5hbWU6IC0+IHYgPSBAaW5pdGlhbE5hbWU7IEBpbml0aWFsTmFtZSA9IG51bGw7IHZcblxuICAgIHNldEluaXRpYWxTZWFyY2hRdWVyeTogKHF1ZXJ5KSAtPiBAaW5pdGlhbFNlYXJjaFF1ZXJ5ID0gcXVlcnlcbiAgICBnZXRJbml0aWFsU2VhcmNoUXVlcnk6IC0+IHYgPSBAaW5pdGlhbFNlYXJjaFF1ZXJ5OyBAaW5pdGlhbFNlYXJjaFF1ZXJ5ID0gbnVsbDsgdlxuXG4gICAgc2V0TmFtZTogKG5hbWUpIC0+IEBuYW1lID0gbmFtZVxuXG4gICAgc2V0U2VhcmNoUXVlcnk6IChxdWVyeSkgLT4gQHNlYXJjaFF1ZXJ5ID0gcXVlcnlcbiAgICBcbiAgICBsb2FkQ29udmVyc2F0aW9uOiAoYykgLT5cbiAgICAgICAgYy5wYXJ0aWNpcGFudF9kYXRhLmZvckVhY2ggKHApID0+XG4gICAgICAgICAgICBpZCA9IHAuaWQuY2hhdF9pZCBvciBwLmlkLmdhaWFfaWRcbiAgICAgICAgICAgIGlmIGVudGl0eS5pc1NlbGYgaWQgdGhlbiByZXR1cm5cbiAgICAgICAgICAgIHAgPSBlbnRpdHlbaWRdXG4gICAgICAgICAgICBAc2VsZWN0ZWRFbnRpdGllcy5wdXNoXG4gICAgICAgICAgICAgICAgaWQ6IGNoYXRfaWQ6IGlkXG4gICAgICAgICAgICAgICAgcHJvcGVydGllczpcbiAgICAgICAgICAgICAgICAgICAgcGhvdG9fdXJsOiBwLnBob3RvX3VybFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5X25hbWU6IHAuZGlzcGxheV9uYW1lIG9yIHAuZmFsbGJhY2tfbmFtZVxuICAgICAgICBAZ3JvdXAgPSBAc2VsZWN0ZWRFbnRpdGllcy5sZW5ndGggPiAxXG4gICAgICAgIEBpZCA9IGMuY29udmVyc2F0aW9uX2lkPy5pZCBvciBjLmlkPy5pZFxuICAgICAgICBAaW5pdGlhbE5hbWUgPSBAbmFtZSA9IGMubmFtZSBvciBcIlwiXG4gICAgICAgIEBpbml0aWFsU2VhcmNoUXVlcnkgPSBcIlwiXG4gICAgICAgIFxuICAgICAgICB1cGRhdGVkICdjb252c2V0dGluZ3MnXG5cbiAgICByZXNldDogLT5cbiAgICAgICAgQHNlYXJjaGVkRW50aXRpZXMgPSBbXVxuICAgICAgICBAc2VsZWN0ZWRFbnRpdGllcyA9IFtdXG4gICAgICAgIEBpbml0aWFsTmFtZSA9IFwiXCJcbiAgICAgICAgQGluaXRpYWxTZWFyY2hRdWVyeSA9IFwiXCJcbiAgICAgICAgQHNlYXJjaFF1ZXJ5ID0gXCJcIlxuICAgICAgICBAbmFtZSA9IFwiXCJcbiAgICAgICAgQGlkID0gbnVsbFxuICAgICAgICBAZ3JvdXAgPSBmYWxzZVxuICAgICAgICB1cGRhdGVkICdjb252c2V0dGluZ3MnXG5cblxufVxuXG4iXX0=
