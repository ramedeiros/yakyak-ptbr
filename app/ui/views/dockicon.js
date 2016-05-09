(function() {
  var app;

  app = require('remote').require('app');

  module.exports = function(viewstate) {
    if (require('os').platform() !== 'darwin') {
      return;
    }
    if (viewstate.hidedockicon) {
      return app.dock.hide();
    } else {
      return app.dock.show();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVpL3ZpZXdzL2RvY2tpY29uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSLENBQWlCLENBQUMsT0FBbEIsQ0FBMEIsS0FBMUI7O0VBRU4sTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxTQUFEO0lBQ2YsSUFBRyxPQUFBLENBQVEsSUFBUixDQUFhLENBQUMsUUFBZCxDQUFBLENBQUEsS0FBOEIsUUFBakM7QUFBK0MsYUFBL0M7O0lBQ0EsSUFBRyxTQUFTLENBQUMsWUFBYjthQUErQixHQUFHLENBQUMsSUFBSSxDQUFDLElBQVQsQ0FBQSxFQUEvQjtLQUFBLE1BQUE7YUFBb0QsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFULENBQUEsRUFBcEQ7O0VBRmU7QUFGakIiLCJmaWxlIjoidWkvdmlld3MvZG9ja2ljb24uanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJhcHAgPSByZXF1aXJlKCdyZW1vdGUnKS5yZXF1aXJlKCdhcHAnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh2aWV3c3RhdGUpIC0+XG4gIGlmIHJlcXVpcmUoJ29zJykucGxhdGZvcm0oKSBpc250ICdkYXJ3aW4nIHRoZW4gcmV0dXJuXG4gIGlmIHZpZXdzdGF0ZS5oaWRlZG9ja2ljb24gdGhlbiBhcHAuZG9jay5oaWRlKCkgZWxzZSBhcHAuZG9jay5zaG93KCkiXX0=