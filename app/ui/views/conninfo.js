(function() {
  var icons;

  icons = {
    connect_failed: 'icon-block brand-warning',
    connecting: 'icon-spin1 animate-spin',
    connected: 'icon-check brand-success'
  };

  module.exports = view(function(connection) {
    return div(function() {
      return pass(connection.infoText(), ' ', function() {
        return span({
          "class": icons[connection.state]
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVpL3ZpZXdzL2Nvbm5pbmZvLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtBQUFBLE1BQUE7O0VBQUEsS0FBQSxHQUNJO0lBQUEsY0FBQSxFQUFnQiwwQkFBaEI7SUFDQSxVQUFBLEVBQWdCLHlCQURoQjtJQUVBLFNBQUEsRUFBZ0IsMEJBRmhCOzs7RUFJSixNQUFNLENBQUMsT0FBUCxHQUFpQixJQUFBLENBQUssU0FBQyxVQUFEO1dBQ2xCLEdBQUEsQ0FBSSxTQUFBO2FBQ0EsSUFBQSxDQUFLLFVBQVUsQ0FBQyxRQUFYLENBQUEsQ0FBTCxFQUE0QixHQUE1QixFQUFpQyxTQUFBO2VBQUcsSUFBQSxDQUFLO1VBQUEsT0FBQSxFQUFNLEtBQU0sQ0FBQSxVQUFVLENBQUMsS0FBWCxDQUFaO1NBQUw7TUFBSCxDQUFqQztJQURBLENBQUo7RUFEa0IsQ0FBTDtBQUxqQiIsImZpbGUiOiJ1aS92aWV3cy9jb25uaW5mby5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIlxuaWNvbnMgPVxuICAgIGNvbm5lY3RfZmFpbGVkOiAnaWNvbi1ibG9jayBicmFuZC13YXJuaW5nJ1xuICAgIGNvbm5lY3Rpbmc6ICAgICAnaWNvbi1zcGluMSBhbmltYXRlLXNwaW4nXG4gICAgY29ubmVjdGVkOiAgICAgICdpY29uLWNoZWNrIGJyYW5kLXN1Y2Nlc3MnXG5cbm1vZHVsZS5leHBvcnRzID0gdmlldyAoY29ubmVjdGlvbikgLT5cbiAgICBkaXYgLT5cbiAgICAgICAgcGFzcyBjb25uZWN0aW9uLmluZm9UZXh0KCksICcgJywgLT4gc3BhbiBjbGFzczppY29uc1tjb25uZWN0aW9uLnN0YXRlXVxuIl19
