(function() {
  var onclickaction;

  onclickaction = function(a) {
    return function(ev) {
      return action(a);
    };
  };

  module.exports = view(function(models) {
    var c, conv, viewstate;
    conv = models.conv, viewstate = models.viewstate;
    c = conv[viewstate.selectedConv];
    return div({
      "class": 'controls'
    }, function() {
      var ref;
      div({
        "class": 'button',
        title: 'Habilitar notificações',
        onclick: onclickaction('togglenotif')
      }, function() {
        if (conv.isQuiet(c)) {
          return span({
            "class": 'icon-bell-off-empty'
          });
        } else {
          return span({
            "class": 'icon-bell'
          });
        }
      });
      div({
        "class": 'button',
        title: 'Favorito',
        onclick: onclickaction('togglestar')
      }, function() {
        if (!conv.isStarred(c)) {
          return span({
            "class": 'icon-star-empty'
          });
        } else {
          return span({
            "class": 'icon-star'
          });
        }
      });
      div({
        "class": 'button',
        title: 'Opções de conversa'
      }, {
        onclick: onclickaction('convsettings')
      }, function() {
        return span({
          "class": 'icon-cog'
        });
      });
      if ((c != null ? (ref = c.type) != null ? ref.indexOf('ONE_TO_ONE') : void 0 : void 0) > 0) {
        div({
          "class": 'button',
          title: 'Apagar conversa',
          onclick: onclickaction('deleteconv')
        }, function() {
          return span({
            "class": 'icon-cancel'
          });
        });
      } else {
        div({
          "class": 'button',
          title: 'Sair da conversa',
          onclick: onclickaction('leaveconv')
        }, function() {
          return span({
            "class": 'icon-cancel'
          });
        });
      }
      div({
        "class": 'fill'
      });
      return div({
        "class": 'button',
        title: 'Adicionar nova conversa'
      }, {
        onclick: onclickaction('addconversation')
      }, function() {
        return span({
          "class": 'icon-plus'
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVpL3ZpZXdzL2NvbnRyb2xzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFPQTtBQUFBLE1BQUE7O0VBQUEsYUFBQSxHQUFnQixTQUFDLENBQUQ7V0FBTyxTQUFDLEVBQUQ7YUFBUSxNQUFBLENBQU8sQ0FBUDtJQUFSO0VBQVA7O0VBRWhCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLElBQUEsQ0FBSyxTQUFDLE1BQUQ7QUFDbEIsUUFBQTtJQUFDLGNBQUEsSUFBRCxFQUFPLG1CQUFBO0lBQ1AsQ0FBQSxHQUFJLElBQUssQ0FBQSxTQUFTLENBQUMsWUFBVjtXQUNULEdBQUEsQ0FBSTtNQUFBLE9BQUEsRUFBTSxVQUFOO0tBQUosRUFBc0IsU0FBQTtBQUNsQixVQUFBO01BQUEsR0FBQSxDQUFJO1FBQUEsT0FBQSxFQUFNLFFBQU47UUFBZ0IsS0FBQSxFQUFNLHNCQUF0QjtRQUE4QyxPQUFBLEVBQVEsYUFBQSxDQUFjLGFBQWQsQ0FBdEQ7T0FBSixFQUF3RixTQUFBO1FBQ3BGLElBQUcsSUFBSSxDQUFDLE9BQUwsQ0FBYSxDQUFiLENBQUg7aUJBQ0ksSUFBQSxDQUFLO1lBQUEsT0FBQSxFQUFNLHFCQUFOO1dBQUwsRUFESjtTQUFBLE1BQUE7aUJBR0ksSUFBQSxDQUFLO1lBQUEsT0FBQSxFQUFNLFdBQU47V0FBTCxFQUhKOztNQURvRixDQUF4RjtNQUtBLEdBQUEsQ0FBSTtRQUFBLE9BQUEsRUFBTSxRQUFOO1FBQWdCLEtBQUEsRUFBTSxhQUF0QjtRQUFxQyxPQUFBLEVBQVEsYUFBQSxDQUFjLFlBQWQsQ0FBN0M7T0FBSixFQUE4RSxTQUFBO1FBQ3RFLElBQUcsQ0FBSSxJQUFJLENBQUMsU0FBTCxDQUFlLENBQWYsQ0FBUDtpQkFDRyxJQUFBLENBQUs7WUFBQSxPQUFBLEVBQU0saUJBQU47V0FBTCxFQURIO1NBQUEsTUFBQTtpQkFHSyxJQUFBLENBQUs7WUFBQSxPQUFBLEVBQU0sV0FBTjtXQUFMLEVBSEw7O01BRHNFLENBQTlFO01BS0EsR0FBQSxDQUFJO1FBQUEsT0FBQSxFQUFNLFFBQU47UUFBZ0IsS0FBQSxFQUFNLHVCQUF0QjtPQUFKLEVBQ0k7UUFBQSxPQUFBLEVBQVEsYUFBQSxDQUFjLGNBQWQsQ0FBUjtPQURKLEVBQzJDLFNBQUE7ZUFBRyxJQUFBLENBQUs7VUFBQSxPQUFBLEVBQU0sVUFBTjtTQUFMO01BQUgsQ0FEM0M7TUFFQSw2Q0FBVSxDQUFFLE9BQVQsQ0FBaUIsWUFBakIsb0JBQUEsR0FBaUMsQ0FBcEM7UUFDSSxHQUFBLENBQUk7VUFBQSxPQUFBLEVBQU0sUUFBTjtVQUFnQixLQUFBLEVBQU0scUJBQXRCO1VBQ0osT0FBQSxFQUFRLGFBQUEsQ0FBYyxZQUFkLENBREo7U0FBSixFQUNxQyxTQUFBO2lCQUFHLElBQUEsQ0FBSztZQUFBLE9BQUEsRUFBTSxhQUFOO1dBQUw7UUFBSCxDQURyQyxFQURKO09BQUEsTUFBQTtRQUlJLEdBQUEsQ0FBSTtVQUFBLE9BQUEsRUFBTSxRQUFOO1VBQWdCLEtBQUEsRUFBTSxvQkFBdEI7VUFDSixPQUFBLEVBQVEsYUFBQSxDQUFjLFdBQWQsQ0FESjtTQUFKLEVBQ29DLFNBQUE7aUJBQUcsSUFBQSxDQUFLO1lBQUEsT0FBQSxFQUFNLGFBQU47V0FBTDtRQUFILENBRHBDLEVBSko7O01BTUEsR0FBQSxDQUFJO1FBQUEsT0FBQSxFQUFNLE1BQU47T0FBSjthQUNBLEdBQUEsQ0FBSTtRQUFBLE9BQUEsRUFBTSxRQUFOO1FBQWdCLEtBQUEsRUFBTSxzQkFBdEI7T0FBSixFQUNJO1FBQUEsT0FBQSxFQUFRLGFBQUEsQ0FBYyxpQkFBZCxDQUFSO09BREosRUFDOEMsU0FBQTtlQUFHLElBQUEsQ0FBSztVQUFBLE9BQUEsRUFBTSxXQUFOO1NBQUw7TUFBSCxDQUQ5QztJQXBCa0IsQ0FBdEI7RUFIa0IsQ0FBTDtBQUZqQiIsImZpbGUiOiJ1aS92aWV3cy9jb250cm9scy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIlxuIyBzb21lIHVudXNlZCBpY29ucy9hY3Rpb25zXG4jICAgIHtpY29uOidpY29uLXVzZXItYWRkJywgYWN0aW9uOidhZGR1c2VyJ31cbiMgICAge2ljb246J2ljb24tcGVuY2lsJywgICBhY3Rpb246J3JlbmFtZWNvbnYnfVxuIyAgICB7aWNvbjonaWNvbi12aWRlb2NhbScsIGFjdGlvbjondmlkZW9jYWxsJ31cbiMgICAge2ljb246J2ljb24tcGhvbmUnLCAgICBhY3Rpb246J3ZvaWNlY2FsbCd9XG5cbm9uY2xpY2thY3Rpb24gPSAoYSkgLT4gKGV2KSAtPiBhY3Rpb24gYVxuXG5tb2R1bGUuZXhwb3J0cyA9IHZpZXcgKG1vZGVscykgLT5cbiAgICB7Y29udiwgdmlld3N0YXRlfSA9IG1vZGVsc1xuICAgIGMgPSBjb252W3ZpZXdzdGF0ZS5zZWxlY3RlZENvbnZdXG4gICAgZGl2IGNsYXNzOidjb250cm9scycsIC0+XG4gICAgICAgIGRpdiBjbGFzczonYnV0dG9uJywgdGl0bGU6J1RvZ2dsZSBub3RpZmljYXRpb25zJywgb25jbGljazpvbmNsaWNrYWN0aW9uKCd0b2dnbGVub3RpZicpLCAtPlxuICAgICAgICAgICAgaWYgY29udi5pc1F1aWV0KGMpXG4gICAgICAgICAgICAgICAgc3BhbiBjbGFzczonaWNvbi1iZWxsLW9mZi1lbXB0eSdcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzcGFuIGNsYXNzOidpY29uLWJlbGwnXG4gICAgICAgIGRpdiBjbGFzczonYnV0dG9uJywgdGl0bGU6J1N0YXIvdW5zdGFyJywgb25jbGljazpvbmNsaWNrYWN0aW9uKCd0b2dnbGVzdGFyJyksIC0+XG4gICAgICAgICAgICAgICAgaWYgbm90IGNvbnYuaXNTdGFycmVkKGMpXG4gICAgICAgICAgICAgICAgICAgc3BhbiBjbGFzczonaWNvbi1zdGFyLWVtcHR5J1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgIHNwYW4gY2xhc3M6J2ljb24tc3RhcidcbiAgICAgICAgZGl2IGNsYXNzOididXR0b24nLCB0aXRsZTonQ29udmVyc2F0aW9uIHNldHRpbmdzJyxcbiAgICAgICAgICAgIG9uY2xpY2s6b25jbGlja2FjdGlvbignY29udnNldHRpbmdzJyksIC0+IHNwYW4gY2xhc3M6J2ljb24tY29nJ1xuICAgICAgICBpZiBjPy50eXBlPy5pbmRleE9mKCdPTkVfVE9fT05FJykgPiAwXG4gICAgICAgICAgICBkaXYgY2xhc3M6J2J1dHRvbicsIHRpdGxlOidEZWxldGUgY29udmVyc2F0aW9uJyxcbiAgICAgICAgICAgIG9uY2xpY2s6b25jbGlja2FjdGlvbignZGVsZXRlY29udicpLCAtPiBzcGFuIGNsYXNzOidpY29uLWNhbmNlbCdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZGl2IGNsYXNzOididXR0b24nLCB0aXRsZTonTGVhdmUgY29udmVyc2F0aW9uJyxcbiAgICAgICAgICAgIG9uY2xpY2s6b25jbGlja2FjdGlvbignbGVhdmVjb252JyksIC0+IHNwYW4gY2xhc3M6J2ljb24tY2FuY2VsJ1xuICAgICAgICBkaXYgY2xhc3M6J2ZpbGwnXG4gICAgICAgIGRpdiBjbGFzczonYnV0dG9uJywgdGl0bGU6J0FkZCBuZXcgY29udmVyc2F0aW9uJyxcbiAgICAgICAgICAgIG9uY2xpY2s6b25jbGlja2FjdGlvbignYWRkY29udmVyc2F0aW9uJyksIC0+IHNwYW4gY2xhc3M6J2ljb24tcGx1cydcbiJdfQ==
