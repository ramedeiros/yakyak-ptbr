(function() {
  var nameof, scrollToBottom;

  scrollToBottom = require('./messages').scrollToBottom;

  nameof = require('../util').nameof;

  module.exports = view(function(models) {
    var c, conv, conv_id, entity, viewstate;
    viewstate = models.viewstate, conv = models.conv, entity = models.entity;
    conv_id = viewstate != null ? viewstate.selectedConv : void 0;
    c = conv[conv_id];
    if (!c) {
      return;
    }
    return div({
      "class": 'typing'
    }, function() {
      var i, j, len, name, ref, ref1, ref2, t;
      ref1 = (ref = c.typing) != null ? ref : [];
      for (i = j = 0, len = ref1.length; j < len; i = ++j) {
        t = ref1[i];
        name = nameof(entity[t.user_id.chat_id]);
        span({
          "class": "typing_" + t.status
        }, name);
        if (i < (c.typing.length - 1)) {
          pass(', ');
        }
      }
      if (c != null ? (ref2 = c.typing) != null ? ref2.length : void 0 : void 0) {
        return pass(' está digitando');
      }
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVpL3ZpZXdzL3R5cGluZ2luZm8uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxpQkFBa0IsT0FBQSxDQUFRLFlBQVIsRUFBbEI7O0VBQ0EsU0FBVyxPQUFBLENBQVEsU0FBUixFQUFYOztFQUVELE1BQU0sQ0FBQyxPQUFQLEdBQWlCLElBQUEsQ0FBSyxTQUFDLE1BQUQ7QUFDbEIsUUFBQTtJQUFDLG1CQUFBLFNBQUQsRUFBWSxjQUFBLElBQVosRUFBa0IsZ0JBQUE7SUFFbEIsT0FBQSx1QkFBVSxTQUFTLENBQUU7SUFDckIsQ0FBQSxHQUFJLElBQUssQ0FBQSxPQUFBO0lBQ1QsSUFBQSxDQUFjLENBQWQ7QUFBQSxhQUFBOztXQUVBLEdBQUEsQ0FBSTtNQUFBLE9BQUEsRUFBTSxRQUFOO0tBQUosRUFBb0IsU0FBQTtBQUNoQixVQUFBO0FBQUE7QUFBQSxXQUFBLDhDQUFBOztRQUNJLElBQUEsR0FBTyxNQUFBLENBQU8sTUFBTyxDQUFBLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBVixDQUFkO1FBQ1AsSUFBQSxDQUFLO1VBQUEsT0FBQSxFQUFNLFNBQUEsR0FBVSxDQUFDLENBQUMsTUFBbEI7U0FBTCxFQUFpQyxJQUFqQztRQUNBLElBQWEsQ0FBQSxHQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFULEdBQWtCLENBQW5CLENBQWpCO1VBQUEsSUFBQSxDQUFLLElBQUwsRUFBQTs7QUFISjtNQUlBLGdEQUE4QixDQUFFLHdCQUFoQztlQUFBLElBQUEsQ0FBSyxZQUFMLEVBQUE7O0lBTGdCLENBQXBCO0VBUGtCLENBQUw7QUFIakIiLCJmaWxlIjoidWkvdmlld3MvdHlwaW5naW5mby5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIntzY3JvbGxUb0JvdHRvbX0gPSByZXF1aXJlICcuL21lc3NhZ2VzJ1xue25hbWVvZn0gID0gcmVxdWlyZSAnLi4vdXRpbCdcblxubW9kdWxlLmV4cG9ydHMgPSB2aWV3IChtb2RlbHMpIC0+XG4gICAge3ZpZXdzdGF0ZSwgY29udiwgZW50aXR5fSA9IG1vZGVsc1xuXG4gICAgY29udl9pZCA9IHZpZXdzdGF0ZT8uc2VsZWN0ZWRDb252XG4gICAgYyA9IGNvbnZbY29udl9pZF1cbiAgICByZXR1cm4gdW5sZXNzIGNcblxuICAgIGRpdiBjbGFzczondHlwaW5nJywgLT5cbiAgICAgICAgZm9yIHQsIGkgaW4gKGMudHlwaW5nID8gW10pXG4gICAgICAgICAgICBuYW1lID0gbmFtZW9mIGVudGl0eVt0LnVzZXJfaWQuY2hhdF9pZF1cbiAgICAgICAgICAgIHNwYW4gY2xhc3M6XCJ0eXBpbmdfI3t0LnN0YXR1c31cIiwgbmFtZVxuICAgICAgICAgICAgcGFzcyAnLCAnIGlmIGkgPCAoYy50eXBpbmcubGVuZ3RoIC0gMSlcbiAgICAgICAgcGFzcyAnIGlzIHR5cGluZycgaWYgYz8udHlwaW5nPy5sZW5ndGhcbiJdfQ==
