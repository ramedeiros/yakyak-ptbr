(function() {
  var totallyunique,
    slice = [].slice;

  totallyunique = function() {
    var as;
    as = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return String(Date.now()) + (Math.random() * 1000000);
  };

  module.exports = function(fn, retry, dedupe) {
    var deduped, execNext, execing, queue;
    if (dedupe == null) {
      dedupe = totallyunique;
    }
    queue = [];
    deduped = [];
    execing = false;
    execNext = function() {
      var args;
      if (!queue.length) {
        execing = false;
        return;
      }
      execing = true;
      args = queue[0];
      return fn.apply(null, args).then(function() {
        queue.shift();
        return deduped.shift();
      }).fail(function(err) {
        if (!retry) {
          queue.shift();
          return deduped.shift();
        }
      }).then(function() {
        return execNext();
      });
    };
    return function() {
      var as, d, i;
      as = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      d = dedupe.apply(null, as);
      if ((i = deduped.indexOf(d)) >= 0) {
        queue[i] = as;
      } else {
        queue.push(as);
        deduped.push(d);
      }
      if (!execing) {
        return execNext();
      }
    };
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlcXJlcS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFBQSxNQUFBLGFBQUE7SUFBQTs7RUFBQSxhQUFBLEdBQWdCLFNBQUE7QUFBVyxRQUFBO0lBQVY7V0FBVSxNQUFBLENBQU8sSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQUFQLENBQUEsR0FBcUIsQ0FBQyxJQUFJLENBQUMsTUFBTCxDQUFBLENBQUEsR0FBZ0IsT0FBakI7RUFBaEM7O0VBU2hCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsRUFBRCxFQUFLLEtBQUwsRUFBWSxNQUFaO0FBRWIsUUFBQTs7TUFGeUIsU0FBUzs7SUFFbEMsS0FBQSxHQUFRO0lBQ1IsT0FBQSxHQUFVO0lBQ1YsT0FBQSxHQUFVO0lBR1YsUUFBQSxHQUFXLFNBQUE7QUFDUCxVQUFBO01BQUEsSUFBQSxDQUFPLEtBQUssQ0FBQyxNQUFiO1FBQ0ksT0FBQSxHQUFVO0FBQ1YsZUFGSjs7TUFHQSxPQUFBLEdBQVU7TUFDVixJQUFBLEdBQU8sS0FBTSxDQUFBLENBQUE7YUFDYixFQUFBLGFBQUcsSUFBSCxDQUFXLENBQUMsSUFBWixDQUFpQixTQUFBO1FBRWIsS0FBSyxDQUFDLEtBQU4sQ0FBQTtlQUFlLE9BQU8sQ0FBQyxLQUFSLENBQUE7TUFGRixDQUFqQixDQUdBLENBQUMsSUFIRCxDQUdNLFNBQUMsR0FBRDtRQUdGLElBQUEsQ0FBd0MsS0FBeEM7VUFBQyxLQUFLLENBQUMsS0FBTixDQUFBO2lCQUFlLE9BQU8sQ0FBQyxLQUFSLENBQUEsRUFBaEI7O01BSEUsQ0FITixDQU9BLENBQUMsSUFQRCxDQU9NLFNBQUE7ZUFDRixRQUFBLENBQUE7TUFERSxDQVBOO0lBTk87V0FnQlgsU0FBQTtBQUNJLFVBQUE7TUFESDtNQUNHLENBQUEsR0FBSSxNQUFBLGFBQU8sRUFBUDtNQUNKLElBQUcsQ0FBQyxDQUFBLEdBQUksT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsQ0FBaEIsQ0FBTCxDQUFBLElBQTRCLENBQS9CO1FBR0ksS0FBTSxDQUFBLENBQUEsQ0FBTixHQUFXLEdBSGY7T0FBQSxNQUFBO1FBTUksS0FBSyxDQUFDLElBQU4sQ0FBVyxFQUFYO1FBQ0EsT0FBTyxDQUFDLElBQVIsQ0FBYSxDQUFiLEVBUEo7O01BUUEsSUFBQSxDQUFrQixPQUFsQjtlQUFBLFFBQUEsQ0FBQSxFQUFBOztJQVZKO0VBdkJhO0FBVGpCIiwiZmlsZSI6InNlcXJlcS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIlxudG90YWxseXVuaXF1ZSA9IChhcy4uLikgLT4gU3RyaW5nKERhdGUubm93KCkpICsgKE1hdGgucmFuZG9tKCkgKiAxMDAwMDAwKVxuXG4jIGZuIGlzIGV4cGVjdGVkIHRvIHJldHVybiBhIHByb21pc2VkIHRoYXQgZmluaXNoZXNcbiMgd2hlbiBmbiBpcyBmaW5pc2hlZC5cbiNcbiMgcmV0cnkgaXMgd2hldGhlciB3ZSByZXRyeSBmYWlsdXJlcyBvZiBmblxuI1xuIyBkZWR1cGUgaXMgYSBmdW5jdGlvbiB0aGF0IG1hc2hlcyB0aGUgYXJndW1lbnRzIHRvIGZuXG4jIGludG8gYSBkZWR1cGUgdmFsdWUuXG5tb2R1bGUuZXhwb3J0cyA9IChmbiwgcmV0cnksIGRlZHVwZSA9IHRvdGFsbHl1bmlxdWUpIC0+XG5cbiAgICBxdWV1ZSA9IFtdICAgICAgIyB0aGUgcXVldWUgb2YgYXJncyB0byBleGVjXG4gICAgZGVkdXBlZCA9IFtdICAgICMgdGhlIGRlZHVwZShhcmdzKSBmb3IgZGVkdXBpbmdcbiAgICBleGVjaW5nID0gZmFsc2UgIyBmbGFnIGluZGljYXRpbmcgd2hldGhlciBleGVjTmV4dCBpcyBydW5uaW5nXG5cbiAgICAjIHdpbGwgcGVycGV0dWFsbHkgZXhlYyBuZXh0IHVudGlsIHF1ZXVlIGlzIGVtcHR5XG4gICAgZXhlY05leHQgPSAtPlxuICAgICAgICB1bmxlc3MgcXVldWUubGVuZ3RoXG4gICAgICAgICAgICBleGVjaW5nID0gZmFsc2VcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBleGVjaW5nID0gdHJ1ZVxuICAgICAgICBhcmdzID0gcXVldWVbMF0gIyBuZXh0IGFyZ3MgdG8gdHJ5XG4gICAgICAgIGZuKGFyZ3MuLi4pLnRoZW4gLT5cbiAgICAgICAgICAgICMgaXQgZmluaXNoZWQsIGRyb3AgYXJnc1xuICAgICAgICAgICAgcXVldWUuc2hpZnQoKTsgZGVkdXBlZC5zaGlmdCgpXG4gICAgICAgIC5mYWlsIChlcnIpIC0+XG4gICAgICAgICAgICAjIGl0IGZhaWxlZC5cbiAgICAgICAgICAgICMgbm8gcmV0cnk/IHRoZW4ganVzdCBkcm9wIGFyZ3NcbiAgICAgICAgICAgIChxdWV1ZS5zaGlmdCgpOyBkZWR1cGVkLnNoaWZ0KCkpIHVubGVzcyByZXRyeVxuICAgICAgICAudGhlbiAtPlxuICAgICAgICAgICAgZXhlY05leHQoKVxuXG4gICAgKGFzLi4uKSAtPlxuICAgICAgICBkID0gZGVkdXBlIGFzLi4uXG4gICAgICAgIGlmIChpID0gZGVkdXBlZC5pbmRleE9mKGQpKSA+PSAwXG4gICAgICAgICAgICAjIHJlcGxhY2UgZW50cnksIG5vdGljZSB0aGlzIGNhbiByZXBsYWNlXG4gICAgICAgICAgICAjIGEgY3VycmVudGx5IGV4ZWNpbmcgZW50cnlcbiAgICAgICAgICAgIHF1ZXVlW2ldID0gYXNcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgIyBwdXNoIGEgbmV3IGVudHJ5XG4gICAgICAgICAgICBxdWV1ZS5wdXNoIGFzXG4gICAgICAgICAgICBkZWR1cGVkLnB1c2ggZFxuICAgICAgICBleGVjTmV4dCgpIHVubGVzcyBleGVjaW5nXG4iXX0=
