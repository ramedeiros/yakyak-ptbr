(function() {
  var Menu, Tray, compact, create, destroy, path, quit, remote, tray, trayIcons, update;

  remote = require('remote');

  Tray = remote.require('tray');

  Menu = remote.require('menu');

  path = require('path');

  trayIcons = {
    "read": path.join(__dirname, '..', '..', 'icons', 'icon.png'),
    "unread": path.join(__dirname, '..', '..', 'icons', 'icon-unread.png')
  };

  tray = null;

  quit = function() {};

  compact = function(array) {
    var i, item, len, results;
    results = [];
    for (i = 0, len = array.length; i < len; i++) {
      item = array[i];
      if (item) {
        results.push(item);
      }
    }
    return results;
  };

  create = function() {
    tray = new Tray(trayIcons["read"]);
    tray.setToolTip('YakYak - Hangouts client');
    return tray.on('clicked', function() {
      return action('showwindow');
    });
  };

  destroy = function() {
    if (tray) {
      tray.destroy();
    }
    return tray = null;
  };

  update = function(unreadCount, viewstate) {
    var contextMenu, e, error, templateContextMenu;
    templateContextMenu = compact([
      {
        label: 'Recolher para/da barra de tarefas',
        click: function() {
          return action('togglewindow');
        }
      }, {
        label: "Iniciar minimizado na barra de tarefas",
        type: "checkbox",
        checked: viewstate.startminimizedtotray,
        click: function() {
          return action('togglestartminimizedtotray');
        }
      }, require('os').platform() === 'darwin' ? {
        label: 'Esconder ícone do Dock',
        type: 'checkbox',
        checked: viewstate.hidedockicon,
        click: function() {
          return action('togglehidedockicon');
        }
      } : void 0, {
        label: 'Sair',
        click: function() {
          return action('quit');
        }
      }
    ]);
    contextMenu = Menu.buildFromTemplate(templateContextMenu);
    tray.setContextMenu(contextMenu);
    try {
      if (unreadCount > 0) {
        return tray.setImage(trayIcons["unread"]);
      } else {
        return tray.setImage(trayIcons["read"]);
      }
    } catch (error) {
      e = error;
      return console.log('faltando ícones', e);
    }
  };

  module.exports = function(arg) {
    var conv, viewstate;
    viewstate = arg.viewstate, conv = arg.conv;
    if (viewstate.showtray) {
      if (!tray) {
        create();
      }
      return update(conv.unreadTotal(), viewstate);
    } else {
      if (tray) {
        return destroy();
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVpL3ZpZXdzL3RyYXlpY29uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUNULElBQUEsR0FBTyxNQUFNLENBQUMsT0FBUCxDQUFlLE1BQWY7O0VBQ1AsSUFBQSxHQUFPLE1BQU0sQ0FBQyxPQUFQLENBQWUsTUFBZjs7RUFDUCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsU0FBQSxHQUNJO0lBQUEsTUFBQSxFQUFRLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQixJQUFyQixFQUEyQixJQUEzQixFQUFpQyxPQUFqQyxFQUEwQyxVQUExQyxDQUFSO0lBQ0EsUUFBQSxFQUFVLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQixJQUFyQixFQUEyQixJQUEzQixFQUFpQyxPQUFqQyxFQUEwQyxpQkFBMUMsQ0FEVjs7O0VBRUosSUFBQSxHQUFPOztFQUdQLElBQUEsR0FBTyxTQUFBLEdBQUE7O0VBRVAsT0FBQSxHQUFVLFNBQUMsS0FBRDtBQUFXLFFBQUE7QUFBQTtTQUFBLHVDQUFBOztVQUE0QjtxQkFBNUI7O0FBQUE7O0VBQVg7O0VBRVYsTUFBQSxHQUFTLFNBQUE7SUFDTCxJQUFBLEdBQVcsSUFBQSxJQUFBLENBQUssU0FBVSxDQUFBLE1BQUEsQ0FBZjtJQUNYLElBQUksQ0FBQyxVQUFMLENBQWdCLDBCQUFoQjtXQUVBLElBQUksQ0FBQyxFQUFMLENBQVEsU0FBUixFQUFtQixTQUFBO2FBQUcsTUFBQSxDQUFPLFlBQVA7SUFBSCxDQUFuQjtFQUpLOztFQU1ULE9BQUEsR0FBVSxTQUFBO0lBQ04sSUFBa0IsSUFBbEI7TUFBQSxJQUFJLENBQUMsT0FBTCxDQUFBLEVBQUE7O1dBQ0EsSUFBQSxHQUFPO0VBRkQ7O0VBSVYsTUFBQSxHQUFTLFNBQUMsV0FBRCxFQUFjLFNBQWQ7QUFFTCxRQUFBO0lBQUEsbUJBQUEsR0FBc0IsT0FBQSxDQUFRO01BQzFCO1FBQ0UsS0FBQSxFQUFPLHlCQURUO1FBRUUsS0FBQSxFQUFPLFNBQUE7aUJBQUcsTUFBQSxDQUFPLGNBQVA7UUFBSCxDQUZUO09BRDBCLEVBTTFCO1FBQ0UsS0FBQSxFQUFPLHdCQURUO1FBRUUsSUFBQSxFQUFNLFVBRlI7UUFHRSxPQUFBLEVBQVMsU0FBUyxDQUFDLG9CQUhyQjtRQUlFLEtBQUEsRUFBTyxTQUFBO2lCQUFHLE1BQUEsQ0FBTyw0QkFBUDtRQUFILENBSlQ7T0FOMEIsRUFrQnJCLE9BQUEsQ0FBUSxJQUFSLENBQWEsQ0FBQyxRQUFkLENBQUEsQ0FBQSxLQUE0QixRQUxqQyxHQUFBO1FBQ0UsS0FBQSxFQUFPLGdCQURUO1FBRUUsSUFBQSxFQUFNLFVBRlI7UUFHRSxPQUFBLEVBQVMsU0FBUyxDQUFDLFlBSHJCO1FBSUUsS0FBQSxFQUFPLFNBQUE7aUJBQUcsTUFBQSxDQUFPLG9CQUFQO1FBQUgsQ0FKVDtPQUFBLEdBQUEsTUFiMEIsRUFvQjFCO1FBQUUsS0FBQSxFQUFPLE1BQVQ7UUFBaUIsS0FBQSxFQUFPLFNBQUE7aUJBQUcsTUFBQSxDQUFPLE1BQVA7UUFBSCxDQUF4QjtPQXBCMEI7S0FBUjtJQXVCdEIsV0FBQSxHQUFjLElBQUksQ0FBQyxpQkFBTCxDQUF1QixtQkFBdkI7SUFDZCxJQUFJLENBQUMsY0FBTCxDQUFvQixXQUFwQjtBQUdBO01BQ0UsSUFBRyxXQUFBLEdBQWMsQ0FBakI7ZUFDSSxJQUFJLENBQUMsUUFBTCxDQUFjLFNBQVUsQ0FBQSxRQUFBLENBQXhCLEVBREo7T0FBQSxNQUFBO2VBR0ksSUFBSSxDQUFDLFFBQUwsQ0FBYyxTQUFVLENBQUEsTUFBQSxDQUF4QixFQUhKO09BREY7S0FBQSxhQUFBO01BS007YUFDSixPQUFPLENBQUMsR0FBUixDQUFZLGVBQVosRUFBNkIsQ0FBN0IsRUFORjs7RUE3Qks7O0VBc0NULE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsR0FBRDtBQUNiLFFBQUE7SUFEZSxnQkFBQSxXQUFXLFdBQUE7SUFDMUIsSUFBRyxTQUFTLENBQUMsUUFBYjtNQUNFLElBQVksQ0FBSSxJQUFoQjtRQUFBLE1BQUEsQ0FBQSxFQUFBOzthQUNBLE1BQUEsQ0FBTyxJQUFJLENBQUMsV0FBTCxDQUFBLENBQVAsRUFBMkIsU0FBM0IsRUFGRjtLQUFBLE1BQUE7TUFJRSxJQUFhLElBQWI7ZUFBQSxPQUFBLENBQUEsRUFBQTtPQUpGOztFQURhO0FBL0RqQiIsImZpbGUiOiJ1aS92aWV3cy90cmF5aWNvbi5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbInJlbW90ZSA9IHJlcXVpcmUgJ3JlbW90ZSdcblRyYXkgPSByZW1vdGUucmVxdWlyZSAndHJheSdcbk1lbnUgPSByZW1vdGUucmVxdWlyZSAnbWVudSdcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG50cmF5SWNvbnMgPVxuICAgIFwicmVhZFwiOiBwYXRoLmpvaW4gX19kaXJuYW1lLCAnLi4nLCAnLi4nLCAnaWNvbnMnLCAnaWNvbi5wbmcnXG4gICAgXCJ1bnJlYWRcIjogcGF0aC5qb2luIF9fZGlybmFtZSwgJy4uJywgJy4uJywgJ2ljb25zJywgJ2ljb24tdW5yZWFkLnBuZydcbnRyYXkgPSBudWxsXG5cbiMgVE9ETzogdGhpcyBpcyBhbGwgV0lQXG5xdWl0ID0gLT5cblxuY29tcGFjdCA9IChhcnJheSkgLT4gaXRlbSBmb3IgaXRlbSBpbiBhcnJheSB3aGVuIGl0ZW1cblxuY3JlYXRlID0gKCkgLT5cbiAgICB0cmF5ID0gbmV3IFRyYXkgdHJheUljb25zW1wicmVhZFwiXVxuICAgIHRyYXkuc2V0VG9vbFRpcCAnWWFrWWFrIC0gSGFuZ291dHMgY2xpZW50J1xuICAgICMgRW1pdHRlZCB3aGVuIHRoZSB0cmF5IGljb24gaXMgY2xpY2tlZFxuICAgIHRyYXkub24gJ2NsaWNrZWQnLCAtPiBhY3Rpb24gJ3Nob3d3aW5kb3cnXG4gICAgXG5kZXN0cm95ID0gLT5cbiAgICB0cmF5LmRlc3Ryb3koKSBpZiB0cmF5XG4gICAgdHJheSA9IG51bGxcblxudXBkYXRlID0gKHVucmVhZENvdW50LCB2aWV3c3RhdGUpIC0+XG4gICAgIyB1cGRhdGUgbWVudVxuICAgIHRlbXBsYXRlQ29udGV4dE1lbnUgPSBjb21wYWN0KFtcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiAnVG9nZ2xlIG1pbmltaXplIHRvIHRyYXknXG4gICAgICAgICAgY2xpY2s6IC0+IGFjdGlvbiAndG9nZ2xld2luZG93J1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6IFwiU3RhcnQgbWluaW16ZWQgdG8gdHJheVwiXG4gICAgICAgICAgdHlwZTogXCJjaGVja2JveFwiXG4gICAgICAgICAgY2hlY2tlZDogdmlld3N0YXRlLnN0YXJ0bWluaW1pemVkdG90cmF5XG4gICAgICAgICAgY2xpY2s6IC0+IGFjdGlvbiAndG9nZ2xlc3RhcnRtaW5pbWl6ZWR0b3RyYXknXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHsgXG4gICAgICAgICAgbGFiZWw6ICdIaWRlIERvY2sgaWNvbidcbiAgICAgICAgICB0eXBlOiAnY2hlY2tib3gnXG4gICAgICAgICAgY2hlY2tlZDogdmlld3N0YXRlLmhpZGVkb2NraWNvblxuICAgICAgICAgIGNsaWNrOiAtPiBhY3Rpb24gJ3RvZ2dsZWhpZGVkb2NraWNvbidcbiAgICAgICAgfSBpZiByZXF1aXJlKCdvcycpLnBsYXRmb3JtKCkgPT0gJ2RhcndpbidcbiAgICAgICAgXG4gICAgICAgIHsgbGFiZWw6ICdRdWl0JywgY2xpY2s6IC0+IGFjdGlvbiAncXVpdCcgfVxuICAgIF0pXG5cbiAgICBjb250ZXh0TWVudSA9IE1lbnUuYnVpbGRGcm9tVGVtcGxhdGUgdGVtcGxhdGVDb250ZXh0TWVudVxuICAgIHRyYXkuc2V0Q29udGV4dE1lbnUgY29udGV4dE1lbnVcblxuICAgICMgdXBkYXRlIGljb25cbiAgICB0cnkgXG4gICAgICBpZiB1bnJlYWRDb3VudCA+IDBcbiAgICAgICAgICB0cmF5LnNldEltYWdlIHRyYXlJY29uc1tcInVucmVhZFwiXVxuICAgICAgZWxzZVxuICAgICAgICAgIHRyYXkuc2V0SW1hZ2UgdHJheUljb25zW1wicmVhZFwiXVxuICAgIGNhdGNoIGVcbiAgICAgIGNvbnNvbGUubG9nICdtaXNzaW5nIGljb25zJywgZVxuXG5cbm1vZHVsZS5leHBvcnRzID0gKHt2aWV3c3RhdGUsIGNvbnZ9KSAtPlxuICAgIGlmIHZpZXdzdGF0ZS5zaG93dHJheVxuICAgICAgY3JlYXRlKCkgaWYgbm90IHRyYXlcbiAgICAgIHVwZGF0ZShjb252LnVucmVhZFRvdGFsKCksIHZpZXdzdGF0ZSlcbiAgICBlbHNlXG4gICAgICBkZXN0cm95KCkgaWYgdHJheVxuIl19
