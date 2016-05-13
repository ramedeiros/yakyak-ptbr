(function() {
  var Menu, remote, templateOsx, templateOthers;

  remote = require('remote');

  Menu = remote.require('menu');

  templateOsx = function(viewstate) {
    return [
      {
        label: 'Configurações',
        submenu: [
          {
            label: 'Sobre o YakYak',
            selector: 'orderFrontStandardAboutPanel:'
          }, {
            type: 'separator'
          }, {
            label: 'Esconder YakYak',
            accelerator: 'Command+H',
            selector: 'hide:'
          }, {
            label: 'Esconder outras aplicações',
            accelerator: 'Command+Shift+H',
            selector: 'hideOtherApplications:'
          }, {
            label: 'Mostrar tudo',
            selector: 'unhideAllApplications:'
          }, {
            type: 'separator'
          }, {
            label: 'Abrir inspetor',
            accelerator: 'Command+Alt+I',
            click: function() {
              return action('devtools');
            }
          }, {
            type: 'separator'
          }, {
            label: 'Fazer Logout',
            click: function() {
              return action('logout');
            },
            enabled: viewstate.loggedin
          }, {
            label: 'Sair',
            accelerator: 'Command+Q',
            click: function() {
              return action('quit');
            }
          }
        ]
      }, {
        label: 'Editar',
        submenu: [
          {
            label: 'Desfazer',
            accelerator: 'Command+Z',
            selector: 'undo:'
          }, {
            label: 'Refazer',
            accelerator: 'Command+Shift+Z',
            selector: 'redo:'
          }, {
            type: 'separator'
          }, {
            label: 'Cortar',
            accelerator: 'Command+X',
            selector: 'cut:'
          }, {
            label: 'Copiar',
            accelerator: 'Command+C',
            selector: 'copy:'
          }, {
            label: 'Colar',
            accelerator: 'Command+V',
            selector: 'paste:'
          }, {
            label: 'Selecionar tudo',
            accelerator: 'Command+A',
            selector: 'selectAll:'
          }
        ]
      }, {
        label: 'Visualização',
        submenu: [
          {
            type: 'checkbox',
            label: 'Mostrar foto nas conversas',
            checked: viewstate.showConvThumbs,
            enabled: viewstate.loggedin,
            click: function(it) {
              return action('showconvthumbs', it.checked);
            }
          }, {
            label: 'Tela cheia',
            accelerator: 'Command+Control+F',
            click: function() {
              return action('togglefullscreen');
            }
          }, {
            label: 'Aumentar zoom',
            accelerator: 'Command+Plus',
            click: function() {
              return action('zoom', +0.25);
            }
          }, {
            label: 'Diminuir zoom',
            accelerator: 'Command+-',
            click: function() {
              return action('zoom', -0.25);
            }
          }, {
            label: 'Resetar zoom',
            accelerator: 'Command+0',
            click: function() {
              return action('zoom');
            }
          }, {
            type: 'separator'
          }, {
            label: 'Conversas anteriores',
            enabled: viewstate.loggedin,
            click: function() {
              return action('selectNextConv', -1);
            }
          }, {
            label: 'Próxima conversa',
            enabled: viewstate.loggedin,
            click: function() {
              return action('selectNextConv', +1);
            }
          }, {
            type: 'separator'
          }, {
            label: 'Temas',
            submenu: [
              {
                label: 'Claro',
                type: 'checkbox',
                checked: viewstate.theme === 'light-theme',
                click: function() {
                  return action('toggletheme', 'light-theme');
                }
              }, {
                label: 'Escuro',
                type: 'checkbox',
                checked: viewstate.theme === 'dark-theme',
                click: function() {
                  return action('toggletheme', 'dark-theme');
                }
              }
            ]
          }, {
            label: 'Mostrar ícone na barra de tarefas',
            type: 'checkbox',
            enabled: !viewstate.hidedockicon,
            checked: viewstate.showtray,
            click: function() {
              return action('toggleshowtray');
            }
          }, {
            label: 'Esconder ícone do dock',
            type: 'checkbox',
            enabled: viewstate.showtray,
            checked: viewstate.hidedockicon,
            click: function() {
              return action('togglehidedockicon');
            }
          }
        ]
      }, {
        label: 'Janela',
        submenu: [
          {
            label: 'Minimizar',
            accelerator: 'Command+M',
            selector: 'performMiniaturize:'
          }, {
            label: 'Fechar',
            accelerator: 'Command+W',
            selector: 'performClose:'
          }, {
            type: 'separator'
          }, {
            label: 'À frente de todas as janelas',
            selector: 'arrangeInFront:'
          }
        ]
      }
    ];
  };

  templateOthers = function(viewstate) {
    return [
      {
        label: 'Opções',
        submenu: [
          {
            label: 'Abrir inspetor',
            accelerator: 'Control+Alt+I',
            click: function() {
              return action('devtools');
            }
          }, {
            type: 'separator'
          }, {
            label: 'Fazer Logout',
            click: function() {
              return action('logout');
            },
            enabled: viewstate.loggedin
          }, {
            label: 'Sair',
            accelerator: 'Control+Q',
            click: function() {
              return action('quit');
            }
          }
        ]
      }, {
        label: 'Visualização',
        submenu: [
          {
            type: 'checkbox',
            label: 'Mostrar foto nas conversas',
            checked: viewstate.showConvThumbs,
            enabled: viewstate.loggedin,
            click: function(it) {
              return action('showconvthumbs', it.checked);
            }
          }, {
            label: 'Tela cheia',
            accelerator: 'Control+Alt+F',
            click: function() {
              return action('togglefullscreen');
            }
          }, {
            label: 'Aumentar zoom',
            accelerator: 'Control+Plus',
            click: function() {
              return action('zoom', +0.25);
            }
          }, {
            label: 'Diminuir zoom',
            accelerator: 'Control+-',
            click: function() {
              return action('zoom', -0.25);
            }
          }, {
            label: 'Resetar zoom',
            accelerator: 'Control+0',
            click: function() {
              return action('zoom');
            }
          }, {
            type: 'separator'
          }, {
            label: 'Conversa anterior',
            accelerator: 'Control+K',
            click: function() {
              return action('selectNextConv', -1);
            },
            enabled: viewstate.loggedin
          }, {
            label: 'Pŕoxima conversa',
            accelerator: 'Control+J',
            click: function() {
              return action('selectNextConv', +1);
            },
            enabled: viewstate.loggedin
          }, {
            type: 'separator'
          }, {
            label: 'Temas',
            submenu: [
              {
                label: 'Claro',
                type: 'checkbox',
                checked: viewstate.theme === 'light-theme',
                click: function() {
                  return action('toggletheme', 'light-theme');
                }
              }, {
                label: 'Escuro',
                type: 'checkbox',
                checked: viewstate.theme === 'dark-theme',
                click: function() {
                  return action('toggletheme', 'dark-theme');
                }
              }
            ]
          }, {
            label: 'Mostrar ícone na barra de tarefas',
            type: 'checkbox',
            enabled: !viewstate.hidedockicon,
            checked: viewstate.showtray,
            click: function() {
              return action('toggleshowtray');
            }
          }
        ]
      }
    ];
  };

  module.exports = function(viewstate) {
    if (require('os').platform() === 'darwin') {
      return Menu.setApplicationMenu(Menu.buildFromTemplate(templateOsx(viewstate)));
    } else {
      return Menu.setApplicationMenu(Menu.buildFromTemplate(templateOthers(viewstate)));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,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UjtZQUVDLElBQUEsRUFBTSxVQUZQO1lBR0MsT0FBQSxFQUFTLENBQUksU0FBUyxDQUFDLFlBSHhCO1lBSUMsT0FBQSxFQUFVLFNBQVMsQ0FBQyxRQUpyQjtZQUtDLEtBQUEsRUFBTyxTQUFBO3FCQUFHLE1BQUEsQ0FBTyxnQkFBUDtZQUFILENBTFI7V0FyREU7U0FGTDtPQVp3Qjs7RUFBZjs7RUE2RWpCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsU0FBRDtJQUNiLElBQUcsT0FBQSxDQUFRLElBQVIsQ0FBYSxDQUFDLFFBQWQsQ0FBQSxDQUFBLEtBQTRCLFFBQS9CO2FBQ0ksSUFBSSxDQUFDLGtCQUFMLENBQXdCLElBQUksQ0FBQyxpQkFBTCxDQUF1QixXQUFBLENBQVksU0FBWixDQUF2QixDQUF4QixFQURKO0tBQUEsTUFBQTthQUdJLElBQUksQ0FBQyxrQkFBTCxDQUF3QixJQUFJLENBQUMsaUJBQUwsQ0FBdUIsY0FBQSxDQUFlLFNBQWYsQ0FBdkIsQ0FBeEIsRUFISjs7RUFEYTtBQXhNakIiLCJmaWxlIjoidWkvdmlld3MvbWVudS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbInJlbW90ZSA9IHJlcXVpcmUgJ3JlbW90ZSdcbk1lbnUgPSByZW1vdGUucmVxdWlyZSAnbWVudSdcblxudGVtcGxhdGVPc3ggPSAodmlld3N0YXRlKSAtPiBbe1xuICAgIGxhYmVsOiAnWWFrWWFrJ1xuICAgIHN1Ym1lbnU6IFtcbiAgICAgICAgeyBsYWJlbDogJ0Fib3V0IFlha1lhaycsIHNlbGVjdG9yOiAnb3JkZXJGcm9udFN0YW5kYXJkQWJvdXRQYW5lbDonIH1cbiAgICAgICAgeyB0eXBlOiAnc2VwYXJhdG9yJyB9XG4gICAgICAgICMgeyBsYWJlbDogJ1ByZWZlcmVuY2VzLi4uJywgYWNjZWxlcmF0b3I6ICdDb21tYW5kKywnLCBjbGljazogPT4gZGVsZWdhdGUub3BlbkNvbmZpZygpIH1cbiAgICAgICAgeyB0eXBlOiAnc2VwYXJhdG9yJyB9XG4gICAgICAgIHsgbGFiZWw6ICdIaWRlIFlha1lhaycsIGFjY2VsZXJhdG9yOiAnQ29tbWFuZCtIJywgc2VsZWN0b3I6ICdoaWRlOicgfVxuICAgICAgICB7IGxhYmVsOiAnSGlkZSBPdGhlcnMnLCBhY2NlbGVyYXRvcjogJ0NvbW1hbmQrU2hpZnQrSCcsIHNlbGVjdG9yOiAnaGlkZU90aGVyQXBwbGljYXRpb25zOicgfVxuICAgICAgICB7IGxhYmVsOiAnU2hvdyBBbGwnLCBzZWxlY3RvcjogJ3VuaGlkZUFsbEFwcGxpY2F0aW9uczonIH1cbiAgICAgICAgeyB0eXBlOiAnc2VwYXJhdG9yJyB9XG4gICAgICAgIHsgbGFiZWw6ICdPcGVuIEluc3BlY3RvcicsIGFjY2VsZXJhdG9yOiAnQ29tbWFuZCtBbHQrSScsIGNsaWNrOiAtPiBhY3Rpb24gJ2RldnRvb2xzJyB9XG4gICAgICAgIHsgdHlwZTogJ3NlcGFyYXRvcicgfVxuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6ICdMb2dvdXQnLFxuICAgICAgICAgIGNsaWNrOiAtPiBhY3Rpb24gJ2xvZ291dCdcbiAgICAgICAgICBlbmFibGVkOiB2aWV3c3RhdGUubG9nZ2VkaW5cbiAgICAgICAgfVxuICAgICAgICB7IGxhYmVsOiAnUXVpdCcsIGFjY2VsZXJhdG9yOiAnQ29tbWFuZCtRJywgY2xpY2s6IC0+IGFjdGlvbiAncXVpdCcgfVxuICAgIF19LHtcbiAgICBsYWJlbDogJ0VkaXQnXG4gICAgc3VibWVudTogW1xuICAgICAgICB7IGxhYmVsOiAnVW5kbycsIGFjY2VsZXJhdG9yOiAnQ29tbWFuZCtaJywgc2VsZWN0b3I6ICd1bmRvOicgfVxuICAgICAgICB7IGxhYmVsOiAnUmVkbycsIGFjY2VsZXJhdG9yOiAnQ29tbWFuZCtTaGlmdCtaJywgc2VsZWN0b3I6ICdyZWRvOicgfVxuICAgICAgICB7IHR5cGU6ICdzZXBhcmF0b3InIH1cbiAgICAgICAgeyBsYWJlbDogJ0N1dCcsIGFjY2VsZXJhdG9yOiAnQ29tbWFuZCtYJywgc2VsZWN0b3I6ICdjdXQ6JyB9XG4gICAgICAgIHsgbGFiZWw6ICdDb3B5JywgYWNjZWxlcmF0b3I6ICdDb21tYW5kK0MnLCBzZWxlY3RvcjogJ2NvcHk6JyB9XG4gICAgICAgIHsgbGFiZWw6ICdQYXN0ZScsIGFjY2VsZXJhdG9yOiAnQ29tbWFuZCtWJywgc2VsZWN0b3I6ICdwYXN0ZTonIH1cbiAgICAgICAgeyBsYWJlbDogJ1NlbGVjdCBBbGwnLCBhY2NlbGVyYXRvcjogJ0NvbW1hbmQrQScsIHNlbGVjdG9yOiAnc2VsZWN0QWxsOicgfVxuICAgIF19LHtcbiAgICBsYWJlbDogJ1ZpZXcnXG4gICAgc3VibWVudTogW1xuICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiAnY2hlY2tib3gnXG4gICAgICAgICAgICBsYWJlbDogJ1Nob3cgQ29udmVyc2F0aW9uIFRodW1ibmFpbHMnXG4gICAgICAgICAgICBjaGVja2VkOnZpZXdzdGF0ZS5zaG93Q29udlRodW1ic1xuICAgICAgICAgICAgZW5hYmxlZDogdmlld3N0YXRlLmxvZ2dlZGluXG4gICAgICAgICAgICBjbGljazogKGl0KSAtPiBhY3Rpb24gJ3Nob3djb252dGh1bWJzJywgaXQuY2hlY2tlZFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBsYWJlbDogJ1RvZ2dsZSBGdWxsIFNjcmVlbicsXG4gICAgICAgICAgICBhY2NlbGVyYXRvcjogJ0NvbW1hbmQrQ29udHJvbCtGJyxcbiAgICAgICAgICAgIGNsaWNrOiAtPiBhY3Rpb24gJ3RvZ2dsZWZ1bGxzY3JlZW4nXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgICMgc2VlZSBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9lbGVjdHJvbi9pc3N1ZXMvMTUwN1xuICAgICAgICAgICAgbGFiZWw6ICdab29tIEluJyxcbiAgICAgICAgICAgIGFjY2VsZXJhdG9yOiAnQ29tbWFuZCtQbHVzJyxcbiAgICAgICAgICAgIGNsaWNrOiAtPiBhY3Rpb24gJ3pvb20nLCArMC4yNVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBsYWJlbDogJ1pvb20gT3V0JyxcbiAgICAgICAgICAgIGFjY2VsZXJhdG9yOiAnQ29tbWFuZCstJyxcbiAgICAgICAgICAgIGNsaWNrOiAtPiBhY3Rpb24gJ3pvb20nLCAtMC4yNVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBsYWJlbDogJ1Jlc2V0IFpvb20nLFxuICAgICAgICAgICAgYWNjZWxlcmF0b3I6ICdDb21tYW5kKzAnLFxuICAgICAgICAgICAgY2xpY2s6IC0+IGFjdGlvbiAnem9vbSdcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgdHlwZTogJ3NlcGFyYXRvcidcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgbGFiZWw6ICdQcmV2aW91cyBDb252ZXJzYXRpb24nLFxuICAgICAgICAgICAgZW5hYmxlZDogdmlld3N0YXRlLmxvZ2dlZGluXG4gICAgICAgICAgICBjbGljazogLT4gYWN0aW9uICdzZWxlY3ROZXh0Q29udicsIC0xXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGxhYmVsOiAnTmV4dCBDb252ZXJzYXRpb24nLFxuICAgICAgICAgICAgZW5hYmxlZDogdmlld3N0YXRlLmxvZ2dlZGluXG4gICAgICAgICAgICBjbGljazogLT4gYWN0aW9uICdzZWxlY3ROZXh0Q29udicsICsxXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIHR5cGU6ICdzZXBhcmF0b3InXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGxhYmVsOiAnVGhlbWUnLFxuICAgICAgICAgICAgc3VibWVudTogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdMaWdodCBUaGVtZScsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ6IHZpZXdzdGF0ZS50aGVtZSA9PSAnbGlnaHQtdGhlbWUnLFxuICAgICAgICAgICAgICAgICAgICBjbGljazogLT4gYWN0aW9uICd0b2dnbGV0aGVtZScsICdsaWdodC10aGVtZSdcbiAgICAgICAgICAgICAgICB9LHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdEYXJrIFRoZW1lJyxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tlZDogdmlld3N0YXRlLnRoZW1lID09ICdkYXJrLXRoZW1lJyxcbiAgICAgICAgICAgICAgICAgICAgY2xpY2s6IC0+IGFjdGlvbiAndG9nZ2xldGhlbWUnLCAnZGFyay10aGVtZSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGxhYmVsOiAnU2hvdyB0cmF5IGljb24nXG4gICAgICAgICAgICB0eXBlOiAnY2hlY2tib3gnXG4gICAgICAgICAgICBlbmFibGVkOiBub3Qgdmlld3N0YXRlLmhpZGVkb2NraWNvblxuICAgICAgICAgICAgY2hlY2tlZDogIHZpZXdzdGF0ZS5zaG93dHJheVxuICAgICAgICAgICAgY2xpY2s6IC0+IGFjdGlvbiAndG9nZ2xlc2hvd3RyYXknXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGxhYmVsOiAnSGlkZSBEb2NrIGljb24nXG4gICAgICAgICAgICB0eXBlOiAnY2hlY2tib3gnXG4gICAgICAgICAgICBlbmFibGVkOiB2aWV3c3RhdGUuc2hvd3RyYXlcbiAgICAgICAgICAgIGNoZWNrZWQ6ICB2aWV3c3RhdGUuaGlkZWRvY2tpY29uXG4gICAgICAgICAgICBjbGljazogLT4gYWN0aW9uICd0b2dnbGVoaWRlZG9ja2ljb24nXG4gICAgICAgIH1cbiAgICBdfSx7XG4gICAgbGFiZWw6ICdXaW5kb3cnLFxuICAgIHN1Ym1lbnU6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6ICdNaW5pbWl6ZScsXG4gICAgICAgICAgICBhY2NlbGVyYXRvcjogJ0NvbW1hbmQrTScsXG4gICAgICAgICAgICBzZWxlY3RvcjogJ3BlcmZvcm1NaW5pYXR1cml6ZTonXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiAnQ2xvc2UnLFxuICAgICAgICAgICAgYWNjZWxlcmF0b3I6ICdDb21tYW5kK1cnLFxuICAgICAgICAgICAgc2VsZWN0b3I6ICdwZXJmb3JtQ2xvc2U6J1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiAnc2VwYXJhdG9yJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogJ0JyaW5nIEFsbCB0byBGcm9udCcsXG4gICAgICAgICAgICBzZWxlY3RvcjogJ2FycmFuZ2VJbkZyb250OidcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH1cbl1cblxuIyBUT0RPOiBmaW5kIHByb3BlciB3aW5kb3dzL2xpbnV4IGFjY2VsZXJhdG9yc1xudGVtcGxhdGVPdGhlcnMgPSAodmlld3N0YXRlKSAtPiBbe1xuICAgIGxhYmVsOiAnWWFrWWFrJ1xuICAgIHN1Ym1lbnU6IFtcbiAgICAgICAgeyBsYWJlbDogJ09wZW4gSW5zcGVjdG9yJywgYWNjZWxlcmF0b3I6ICdDb250cm9sK0FsdCtJJywgY2xpY2s6IC0+IGFjdGlvbiAnZGV2dG9vbHMnIH1cbiAgICAgICAgeyB0eXBlOiAnc2VwYXJhdG9yJyB9XG4gICAgICAgIHsgdHlwZTogJ3NlcGFyYXRvcicgfVxuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6ICdMb2dvdXQnLFxuICAgICAgICAgIGNsaWNrOiAtPiBhY3Rpb24gJ2xvZ291dCdcbiAgICAgICAgICBlbmFibGVkOiB2aWV3c3RhdGUubG9nZ2VkaW5cbiAgICAgICAgfVxuICAgICAgICB7IGxhYmVsOiAnUXVpdCcsIGFjY2VsZXJhdG9yOiAnQ29udHJvbCtRJywgY2xpY2s6IC0+IGFjdGlvbiAncXVpdCcgfVxuICAgIF19LCB7XG4gICAgbGFiZWw6ICdWaWV3J1xuICAgIHN1Ym1lbnU6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgdHlwZTonY2hlY2tib3gnXG4gICAgICAgICAgICBsYWJlbDogJ1Nob3cgQ29udmVyc2F0aW9uIFRodW1ibmFpbHMnXG4gICAgICAgICAgICBjaGVja2VkOnZpZXdzdGF0ZS5zaG93Q29udlRodW1ic1xuICAgICAgICAgICAgZW5hYmxlZDogdmlld3N0YXRlLmxvZ2dlZGluXG4gICAgICAgICAgICBjbGljazogKGl0KSAtPiBhY3Rpb24gJ3Nob3djb252dGh1bWJzJywgaXQuY2hlY2tlZFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBsYWJlbDogJ1RvZ2dsZSBGdWxsIFNjcmVlbicsXG4gICAgICAgICAgICBhY2NlbGVyYXRvcjogJ0NvbnRyb2wrQWx0K0YnLFxuICAgICAgICAgICAgY2xpY2s6IC0+IGFjdGlvbiAndG9nZ2xlZnVsbHNjcmVlbidcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgIyBzZWVlIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2VsZWN0cm9uL2lzc3Vlcy8xNTA3XG4gICAgICAgICAgICBsYWJlbDogJ1pvb20gSW4nLFxuICAgICAgICAgICAgYWNjZWxlcmF0b3I6ICdDb250cm9sK1BsdXMnLFxuICAgICAgICAgICAgY2xpY2s6IC0+IGFjdGlvbiAnem9vbScsICswLjI1XG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGxhYmVsOiAnWm9vbSBPdXQnLFxuICAgICAgICAgICAgYWNjZWxlcmF0b3I6ICdDb250cm9sKy0nLFxuICAgICAgICAgICAgY2xpY2s6IC0+IGFjdGlvbiAnem9vbScsIC0wLjI1XG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGxhYmVsOiAnUmVzZXQgWm9vbScsXG4gICAgICAgICAgICBhY2NlbGVyYXRvcjogJ0NvbnRyb2wrMCcsXG4gICAgICAgICAgICBjbGljazogLT4gYWN0aW9uICd6b29tJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgdHlwZTogJ3NlcGFyYXRvcidcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgbGFiZWw6ICdQcmV2aW91cyBDb252ZXJzYXRpb24nLFxuICAgICAgICAgICAgYWNjZWxlcmF0b3I6ICdDb250cm9sK0snLFxuICAgICAgICAgICAgY2xpY2s6IC0+IGFjdGlvbiAnc2VsZWN0TmV4dENvbnYnLCAtMVxuICAgICAgICAgICAgZW5hYmxlZDogdmlld3N0YXRlLmxvZ2dlZGluXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGxhYmVsOiAnTmV4dCBDb252ZXJzYXRpb24nLFxuICAgICAgICAgICAgYWNjZWxlcmF0b3I6ICdDb250cm9sK0onLFxuICAgICAgICAgICAgY2xpY2s6IC0+IGFjdGlvbiAnc2VsZWN0TmV4dENvbnYnLCArMVxuICAgICAgICAgICAgZW5hYmxlZDogdmlld3N0YXRlLmxvZ2dlZGluXG4gICAgICAgIH0sIHtcbiAgICAgICAgICB0eXBlOiAnc2VwYXJhdG9yJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgICBsYWJlbDogJ1RoZW1lJyxcbiAgICAgICAgICAgIHN1Ym1lbnU6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnTGlnaHQgVGhlbWUnLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICAgICAgICAgICAgICBjaGVja2VkOiB2aWV3c3RhdGUudGhlbWUgPT0gJ2xpZ2h0LXRoZW1lJyxcbiAgICAgICAgICAgICAgICAgICAgY2xpY2s6IC0+IGFjdGlvbiAndG9nZ2xldGhlbWUnLCAnbGlnaHQtdGhlbWUnXG4gICAgICAgICAgICAgICAgfSx7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRGFyayBUaGVtZScsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ6IHZpZXdzdGF0ZS50aGVtZSA9PSAnZGFyay10aGVtZScsXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiAtPiBhY3Rpb24gJ3RvZ2dsZXRoZW1lJywgJ2RhcmstdGhlbWUnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBsYWJlbDogJ1Nob3cgdHJheSBpY29uJ1xuICAgICAgICAgICAgdHlwZTogJ2NoZWNrYm94J1xuICAgICAgICAgICAgZW5hYmxlZDogbm90IHZpZXdzdGF0ZS5oaWRlZG9ja2ljb25cbiAgICAgICAgICAgIGNoZWNrZWQ6ICB2aWV3c3RhdGUuc2hvd3RyYXlcbiAgICAgICAgICAgIGNsaWNrOiAtPiBhY3Rpb24gJ3RvZ2dsZXNob3d0cmF5J1xuICAgICAgICB9XG4gICAgXX1cbl1cblxubW9kdWxlLmV4cG9ydHMgPSAodmlld3N0YXRlKSAtPlxuICAgIGlmIHJlcXVpcmUoJ29zJykucGxhdGZvcm0oKSA9PSAnZGFyd2luJ1xuICAgICAgICBNZW51LnNldEFwcGxpY2F0aW9uTWVudSBNZW51LmJ1aWxkRnJvbVRlbXBsYXRlIHRlbXBsYXRlT3N4KHZpZXdzdGF0ZSlcbiAgICBlbHNlXG4gICAgICAgIE1lbnUuc2V0QXBwbGljYXRpb25NZW51IE1lbnUuYnVpbGRGcm9tVGVtcGxhdGUgdGVtcGxhdGVPdGhlcnModmlld3N0YXRlKVxuIl19
