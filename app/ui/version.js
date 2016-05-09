(function() {
  var check, options, request;

  request = require('request');

  options = {
    headers: {
      'User-Agent': 'request'
    },
    url: 'https://api.github.com/repos/yakyak/yakyak/releases/latest'
  };

  check = function() {
    return request.get(options, function(err, res, body) {
      var localVersion, releasedVersion, tag, versionAdvertised;
      body = JSON.parse(body);
      tag = body.tag_name;
      releasedVersion = tag.substr(1);
      localVersion = require('remote').require('app').getVersion();
      versionAdvertised = window.localStorage.versionAdvertised || null;
      if ((releasedVersion !== localVersion) && (releasedVersion !== versionAdvertised)) {
        window.localStorage.versionAdvertised = releasedVersion;
        return alert("Uma nova versão do YakYak está disponível! " + localVersion + " => " + releasedVersion);
      } else {
        return console.log("Versão instalada: " + localVersion + ". Nova versão: " + releasedVersion);
      }
    });
  };

  module.exports = {
    check: check
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVpL3ZlcnNpb24uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0FBQUEsTUFBQTs7RUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0VBRVYsT0FBQSxHQUNFO0lBQUEsT0FBQSxFQUNFO01BQUEsWUFBQSxFQUFjLFNBQWQ7S0FERjtJQUVBLEdBQUEsRUFBSyw0REFGTDs7O0VBSUYsS0FBQSxHQUFRLFNBQUE7V0FDTixPQUFPLENBQUMsR0FBUixDQUFZLE9BQVosRUFBc0IsU0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLElBQVg7QUFDcEIsVUFBQTtNQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVg7TUFDUCxHQUFBLEdBQU0sSUFBSSxDQUFDO01BQ1gsZUFBQSxHQUFrQixHQUFHLENBQUMsTUFBSixDQUFXLENBQVg7TUFDbEIsWUFBQSxHQUFlLE9BQUEsQ0FBUSxRQUFSLENBQWlCLENBQUMsT0FBbEIsQ0FBMEIsS0FBMUIsQ0FBZ0MsQ0FBQyxVQUFqQyxDQUFBO01BQ2YsaUJBQUEsR0FBb0IsTUFBTSxDQUFDLFlBQVksQ0FBQyxpQkFBcEIsSUFBeUM7TUFDN0QsSUFBRyxDQUFDLGVBQUEsS0FBcUIsWUFBdEIsQ0FBQSxJQUF3QyxDQUFDLGVBQUEsS0FBcUIsaUJBQXRCLENBQTNDO1FBQ0UsTUFBTSxDQUFDLFlBQVksQ0FBQyxpQkFBcEIsR0FBd0M7ZUFDeEMsS0FBQSxDQUFNLG9EQUFBLEdBQXFELFlBQXJELEdBQWtFLE1BQWxFLEdBQXdFLGVBQTlFLEVBRkY7T0FBQSxNQUFBO2VBSUUsT0FBTyxDQUFDLEdBQVIsQ0FBWSwwQkFBQSxHQUEyQixZQUEzQixHQUF3Qyx3QkFBeEMsR0FBZ0UsZUFBNUUsRUFKRjs7SUFOb0IsQ0FBdEI7RUFETTs7RUFhUixNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUFDLE9BQUEsS0FBRDs7QUFwQmpCIiwiZmlsZSI6InVpL3ZlcnNpb24uanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJcbnJlcXVlc3QgPSByZXF1aXJlICdyZXF1ZXN0J1xuXG5vcHRpb25zID1cbiAgaGVhZGVyczpcbiAgICAnVXNlci1BZ2VudCc6ICdyZXF1ZXN0J1xuICB1cmw6ICdodHRwczovL2FwaS5naXRodWIuY29tL3JlcG9zL3lha3lhay95YWt5YWsvcmVsZWFzZXMvbGF0ZXN0J1xuXG5jaGVjayA9IC0+XG4gIHJlcXVlc3QuZ2V0IG9wdGlvbnMsICAoZXJyLCByZXMsIGJvZHkpIC0+XG4gICAgYm9keSA9IEpTT04ucGFyc2UgYm9keVxuICAgIHRhZyA9IGJvZHkudGFnX25hbWVcbiAgICByZWxlYXNlZFZlcnNpb24gPSB0YWcuc3Vic3RyKDEpICMgcmVtb3ZlIGZpcnN0IFwidlwiIGNoYXJcbiAgICBsb2NhbFZlcnNpb24gPSByZXF1aXJlKCdyZW1vdGUnKS5yZXF1aXJlKCdhcHAnKS5nZXRWZXJzaW9uKClcbiAgICB2ZXJzaW9uQWR2ZXJ0aXNlZCA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UudmVyc2lvbkFkdmVydGlzZWQgb3IgbnVsbFxuICAgIGlmIChyZWxlYXNlZFZlcnNpb24gaXNudCBsb2NhbFZlcnNpb24pIGFuZCAocmVsZWFzZWRWZXJzaW9uIGlzbnQgdmVyc2lvbkFkdmVydGlzZWQpXG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnZlcnNpb25BZHZlcnRpc2VkID0gcmVsZWFzZWRWZXJzaW9uXG4gICAgICBhbGVydCBcIkEgbmV3IHlha3lhayB2ZXJzaW9uIGlzIGF2YWlsYWJsZSwgcGxlYXNlIHVwZ3JhZGUgI3tsb2NhbFZlcnNpb259ID0+ICN7cmVsZWFzZWRWZXJzaW9ufVwiXG4gICAgZWxzZVxuICAgICAgY29uc29sZS5sb2cgXCJZYWtZYWsgbG9jYWwgdmVyc2lvbiBpcyAje2xvY2FsVmVyc2lvbn0sIHJlbGVhc2VkIHZlcnNpb24gaXMgI3tyZWxlYXNlZFZlcnNpb259XCJcblxubW9kdWxlLmV4cG9ydHMgPSB7Y2hlY2t9Il19
