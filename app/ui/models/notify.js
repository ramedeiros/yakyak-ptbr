(function() {
  var tonotify;

  tonotify = [];

  module.exports = {
    addToNotify: function(ev) {
      return tonotify.push(ev);
    },
    popToNotify: function() {
      var t;
      if (!tonotify.length) {
        return [];
      }
      t = tonotify;
      tonotify = [];
      return t;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVpL21vZGVscy9ub3RpZnkuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0FBQUEsTUFBQTs7RUFBQSxRQUFBLEdBQVc7O0VBRVgsTUFBTSxDQUFDLE9BQVAsR0FDSTtJQUFBLFdBQUEsRUFBYSxTQUFDLEVBQUQ7YUFBUSxRQUFRLENBQUMsSUFBVCxDQUFjLEVBQWQ7SUFBUixDQUFiO0lBQ0EsV0FBQSxFQUFhLFNBQUE7QUFDVCxVQUFBO01BQUEsSUFBQSxDQUFpQixRQUFRLENBQUMsTUFBMUI7QUFBQSxlQUFPLEdBQVA7O01BQ0EsQ0FBQSxHQUFJO01BQ0osUUFBQSxHQUFXO0FBQ1gsYUFBTztJQUpFLENBRGI7O0FBSEoiLCJmaWxlIjoidWkvbW9kZWxzL25vdGlmeS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIlxudG9ub3RpZnkgPSBbXVxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gICAgYWRkVG9Ob3RpZnk6IChldikgLT4gdG9ub3RpZnkucHVzaCBldlxuICAgIHBvcFRvTm90aWZ5OiAtPlxuICAgICAgICByZXR1cm4gW10gdW5sZXNzIHRvbm90aWZ5Lmxlbmd0aFxuICAgICAgICB0ID0gdG9ub3RpZnlcbiAgICAgICAgdG9ub3RpZnkgPSBbXVxuICAgICAgICByZXR1cm4gdFxuIl19
