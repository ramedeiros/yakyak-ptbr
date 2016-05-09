(function() {
  var MessageBuilder, OffTheRecordStatus, buildChatMessage, parse, randomid, ref, split_first, urlRegexp, viewstate;

  urlRegexp = require('url-regexp');

  ref = require('hangupsjs'), MessageBuilder = ref.MessageBuilder, OffTheRecordStatus = ref.OffTheRecordStatus;

  viewstate = require('./viewstate');

  randomid = function() {
    return Math.round(Math.random() * Math.pow(2, 32));
  };

  split_first = function(str, token) {
    var first, last, start;
    start = str.indexOf(token);
    first = str.substr(0, start);
    last = str.substr(start + token.length);
    return [first, last];
  };

  parse = function(mb, txt) {
    var after, before, i, index, j, last, len, len1, line, lines, ref1, url, urls;
    lines = txt.split(/\r?\n/);
    last = lines.length - 1;
    for (index = i = 0, len = lines.length; i < len; index = ++i) {
      line = lines[index];
      urls = urlRegexp.match(line);
      for (j = 0, len1 = urls.length; j < len1; j++) {
        url = urls[j];
        ref1 = split_first(line, url), before = ref1[0], after = ref1[1];
        if (before) {
          mb.text(before);
        }
        line = after;
        mb.link(url, url);
      }
      if (line) {
        mb.text(line);
      }
      if (index !== last) {
        mb.linebreak();
      }
    }
    return null;
  };

  buildChatMessage = function(txt) {
    var client_generated_id, conv_id, mb, segs, segsj, ts;
    conv_id = viewstate.selectedConv;
    mb = new MessageBuilder();
    parse(mb, txt);
    segs = mb.toSegments();
    segsj = mb.toSegsjson();
    client_generated_id = String(randomid());
    ts = Date.now();
    return {
      segs: segs,
      segsj: segsj,
      conv_id: conv_id,
      client_generated_id: client_generated_id,
      ts: ts,
      image_id: void 0,
      otr: OffTheRecordStatus.ON_THE_RECORD
    };
  };

  module.exports = {
    buildChatMessage: buildChatMessage,
    parse: parse
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVpL21vZGVscy91c2VyaW5wdXQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxTQUFBLEdBQW1CLE9BQUEsQ0FBUSxZQUFSOztFQUNuQixNQUF1QyxPQUFBLENBQVEsV0FBUixDQUF2QyxFQUFDLHFCQUFBLGNBQUQsRUFBaUIseUJBQUE7O0VBRWpCLFNBQUEsR0FBWSxPQUFBLENBQVEsYUFBUjs7RUFFWixRQUFBLEdBQVcsU0FBQTtXQUFHLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFBLEdBQWdCLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBVCxFQUFXLEVBQVgsQ0FBM0I7RUFBSDs7RUFFWCxXQUFBLEdBQWMsU0FBQyxHQUFELEVBQU0sS0FBTjtBQUNaLFFBQUE7SUFBQSxLQUFBLEdBQVEsR0FBRyxDQUFDLE9BQUosQ0FBWSxLQUFaO0lBQ1IsS0FBQSxHQUFRLEdBQUcsQ0FBQyxNQUFKLENBQVcsQ0FBWCxFQUFjLEtBQWQ7SUFDUixJQUFBLEdBQU8sR0FBRyxDQUFDLE1BQUosQ0FBVyxLQUFBLEdBQVEsS0FBSyxDQUFDLE1BQXpCO1dBQ1AsQ0FBQyxLQUFELEVBQVEsSUFBUjtFQUpZOztFQU1kLEtBQUEsR0FBUSxTQUFDLEVBQUQsRUFBSyxHQUFMO0FBQ0osUUFBQTtJQUFBLEtBQUEsR0FBUSxHQUFHLENBQUMsS0FBSixDQUFVLE9BQVY7SUFDUixJQUFBLEdBQU8sS0FBSyxDQUFDLE1BQU4sR0FBZTtBQUN0QixTQUFBLHVEQUFBOztNQUNJLElBQUEsR0FBTyxTQUFTLENBQUMsS0FBVixDQUFnQixJQUFoQjtBQUNQLFdBQUEsd0NBQUE7O1FBQ0ksT0FBa0IsV0FBQSxDQUFZLElBQVosRUFBa0IsR0FBbEIsQ0FBbEIsRUFBQyxnQkFBRCxFQUFTO1FBQ1QsSUFBRyxNQUFIO1VBQWUsRUFBRSxDQUFDLElBQUgsQ0FBUSxNQUFSLEVBQWY7O1FBQ0EsSUFBQSxHQUFPO1FBQ1AsRUFBRSxDQUFDLElBQUgsQ0FBUSxHQUFSLEVBQWEsR0FBYjtBQUpKO01BS0EsSUFBZ0IsSUFBaEI7UUFBQSxFQUFFLENBQUMsSUFBSCxDQUFRLElBQVIsRUFBQTs7TUFDQSxJQUFzQixLQUFBLEtBQVMsSUFBL0I7UUFBQSxFQUFFLENBQUMsU0FBSCxDQUFBLEVBQUE7O0FBUko7V0FTQTtFQVpJOztFQWNSLGdCQUFBLEdBQW1CLFNBQUMsR0FBRDtBQUNmLFFBQUE7SUFBQSxPQUFBLEdBQVUsU0FBUyxDQUFDO0lBQ3BCLEVBQUEsR0FBUyxJQUFBLGNBQUEsQ0FBQTtJQUNULEtBQUEsQ0FBTSxFQUFOLEVBQVUsR0FBVjtJQUNBLElBQUEsR0FBUSxFQUFFLENBQUMsVUFBSCxDQUFBO0lBQ1IsS0FBQSxHQUFRLEVBQUUsQ0FBQyxVQUFILENBQUE7SUFDUixtQkFBQSxHQUFzQixNQUFBLENBQU8sUUFBQSxDQUFBLENBQVA7SUFDdEIsRUFBQSxHQUFLLElBQUksQ0FBQyxHQUFMLENBQUE7V0FDTDtNQUNJLE1BQUEsSUFESjtNQUVJLE9BQUEsS0FGSjtNQUdJLFNBQUEsT0FISjtNQUlJLHFCQUFBLG1CQUpKO01BS0ksSUFBQSxFQUxKO01BTUksUUFBQSxFQUFVLE1BTmQ7TUFPSSxHQUFBLEVBQUssa0JBQWtCLENBQUMsYUFQNUI7O0VBUmU7O0VBa0JuQixNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUNiLGtCQUFBLGdCQURhO0lBRWIsT0FBQSxLQUZhOztBQTdDakIiLCJmaWxlIjoidWkvbW9kZWxzL3VzZXJpbnB1dC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbInVybFJlZ2V4cCAgICAgICAgPSByZXF1aXJlICd1cmwtcmVnZXhwJ1xue01lc3NhZ2VCdWlsZGVyLCBPZmZUaGVSZWNvcmRTdGF0dXN9ID0gcmVxdWlyZSAnaGFuZ3Vwc2pzJ1xuXG52aWV3c3RhdGUgPSByZXF1aXJlICcuL3ZpZXdzdGF0ZSdcblxucmFuZG9taWQgPSAtPiBNYXRoLnJvdW5kIE1hdGgucmFuZG9tKCkgKiBNYXRoLnBvdygyLDMyKVxuXG5zcGxpdF9maXJzdCA9IChzdHIsIHRva2VuKSAtPlxuICBzdGFydCA9IHN0ci5pbmRleE9mIHRva2VuXG4gIGZpcnN0ID0gc3RyLnN1YnN0ciAwLCBzdGFydFxuICBsYXN0ID0gc3RyLnN1YnN0ciBzdGFydCArIHRva2VuLmxlbmd0aFxuICBbZmlyc3QsIGxhc3RdXG5cbnBhcnNlID0gKG1iLCB0eHQpIC0+XG4gICAgbGluZXMgPSB0eHQuc3BsaXQgL1xccj9cXG4vXG4gICAgbGFzdCA9IGxpbmVzLmxlbmd0aCAtIDFcbiAgICBmb3IgbGluZSwgaW5kZXggaW4gbGluZXNcbiAgICAgICAgdXJscyA9IHVybFJlZ2V4cC5tYXRjaCBsaW5lXG4gICAgICAgIGZvciB1cmwgaW4gdXJsc1xuICAgICAgICAgICAgW2JlZm9yZSwgYWZ0ZXJdID0gc3BsaXRfZmlyc3QgbGluZSwgdXJsXG4gICAgICAgICAgICBpZiBiZWZvcmUgdGhlbiBtYi50ZXh0KGJlZm9yZSlcbiAgICAgICAgICAgIGxpbmUgPSBhZnRlclxuICAgICAgICAgICAgbWIubGluayB1cmwsIHVybFxuICAgICAgICBtYi50ZXh0IGxpbmUgaWYgbGluZVxuICAgICAgICBtYi5saW5lYnJlYWsoKSB1bmxlc3MgaW5kZXggaXMgbGFzdFxuICAgIG51bGxcblxuYnVpbGRDaGF0TWVzc2FnZSA9ICh0eHQpIC0+XG4gICAgY29udl9pZCA9IHZpZXdzdGF0ZS5zZWxlY3RlZENvbnZcbiAgICBtYiA9IG5ldyBNZXNzYWdlQnVpbGRlcigpXG4gICAgcGFyc2UgbWIsIHR4dFxuICAgIHNlZ3MgID0gbWIudG9TZWdtZW50cygpXG4gICAgc2Vnc2ogPSBtYi50b1NlZ3Nqc29uKClcbiAgICBjbGllbnRfZ2VuZXJhdGVkX2lkID0gU3RyaW5nIHJhbmRvbWlkKClcbiAgICB0cyA9IERhdGUubm93KClcbiAgICB7XG4gICAgICAgIHNlZ3NcbiAgICAgICAgc2Vnc2pcbiAgICAgICAgY29udl9pZFxuICAgICAgICBjbGllbnRfZ2VuZXJhdGVkX2lkXG4gICAgICAgIHRzXG4gICAgICAgIGltYWdlX2lkOiB1bmRlZmluZWRcbiAgICAgICAgb3RyOiBPZmZUaGVSZWNvcmRTdGF0dXMuT05fVEhFX1JFQ09SRFxuICAgIH1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgYnVpbGRDaGF0TWVzc2FnZVxuICAgIHBhcnNlXG59XG4iXX0=
