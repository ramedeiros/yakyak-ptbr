(function() {
  var BrowserWindow, Client, Menu, Q, app, client, clipboard, fs, ipc, loadAppWindow, login, logout, mainWindow, path, paths, plug, quit, readyToClose, seqreq, tmp, toggleWindowVisible, wait,
    slice = [].slice;

  Client = require('hangupsjs');

  Q = require('q');

  login = require('./login');

  ipc = require('ipc');

  fs = require('fs');

  path = require('path');

  tmp = require('tmp');

  clipboard = require('clipboard');

  Menu = require('menu');

  tmp.setGracefulCleanup();

  app = require('app');

  BrowserWindow = require('browser-window');

  paths = {
    rtokenpath: path.normalize(path.join(app.getPath('userData'), 'refreshtoken.txt')),
    cookiespath: path.normalize(path.join(app.getPath('userData'), 'cookies.json')),
    chromecookie: path.normalize(path.join(app.getPath('userData'), 'Cookies')),
    configpath: path.normalize(path.join(app.getPath('userData'), 'config.json'))
  };

  client = new Client({
    rtokenpath: paths.rtokenpath,
    cookiespath: paths.cookiespath
  });

  if (fs.existsSync(paths.chromecookie)) {
    fs.unlinkSync(paths.chromecookie);
  }

  plug = function(rs, rj) {
    return function(err, val) {
      if (err) {
        return rj(err);
      } else {
        return rs(val);
      }
    };
  };

  logout = function() {
    var promise;
    promise = client.logout();
    promise.then(function(res) {
      var argv, spawn;
      argv = process.argv;
      spawn = require('child_process').spawn;
      spawn(argv.shift(), argv, {
        cwd: process.cwd,
        env: process.env,
        stdio: 'inherit'
      });
      return quit();
    });
    return promise;
  };

  seqreq = require('./seqreq');

  mainWindow = null;

  readyToClose = false;

  quit = function() {
    readyToClose = true;
    return app.quit();
  };

  app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
      return app.quit();
    }
  });

  app.on('activate-with-no-open-windows', function() {
    if (process.platform === 'darwin') {
      return mainWindow.show();
    }
  });

  app.on('before-quit', function() {
    return mainWindow != null ? mainWindow.forceClose = true : void 0;
  });

  loadAppWindow = function() {
    return mainWindow.loadUrl('file://' + __dirname + '/ui/index.html');
  };

  toggleWindowVisible = function() {
    if (mainWindow.isVisible()) {
      return mainWindow.hide();
    } else {
      return mainWindow.show();
    }
  };

  wait = function(t) {
    return Q.Promise(function(rs) {
      return setTimeout(rs, t);
    });
  };

  app.on('ready', function() {
    var creds, ipcsend, proxycheck, reconnect, reconnectCount, sendInit, syncrecent;
    proxycheck = function() {
      var todo;
      todo = [
        {
          url: 'http://plus.google.com',
          env: 'HTTP_PROXY'
        }, {
          url: 'https://plus.google.com',
          env: 'HTTPS_PROXY'
        }
      ];
      return Q.all(todo.map(function(t) {
        return Q.Promise(function(rs) {
          return app.resolveProxy(t.url, function(proxyURL) {
            var _, base, name1, purl, ref;
            ref = proxyURL.split(' '), _ = ref[0], purl = ref[1];
            if ((base = process.env)[name1 = t.env] == null) {
              base[name1] = purl ? "http://" + purl : "";
            }
            return rs();
          });
        });
      }));
    };
    mainWindow = new BrowserWindow({
      width: 730,
      height: 590,
      "min-width": 620,
      "min-height": 420,
      icon: path.join(__dirname, 'icons', 'icon.png'),
      show: true
    });
    loadAppWindow();
    ipcsend = function() {
      var as, ref;
      as = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref = mainWindow.webContents).send.apply(ref, as);
    };
    creds = function() {
      var loginWindow, prom;
      console.log("pedindo as credenciais para o login");
      loginWindow = new BrowserWindow({
        width: 730,
        height: 590,
        "min-width": 620,
        "min-height": 420,
        icon: path.join(__dirname, 'icons', 'icon.png'),
        show: true
      });
      mainWindow.hide();
      loginWindow.focus();
      prom = login(loginWindow).then(function(rs) {
        loginWindow.forceClose = true;
        loginWindow.close();
        mainWindow.show();
        return rs;
      });
      return {
        auth: function() {
          return prom;
        }
      };
    };
    sendInit = function() {
      var ref;
      if (!(client != null ? (ref = client.init) != null ? ref.self_entity : void 0 : void 0)) {
        return false;
      }
      ipcsend('init', {
        init: client.init
      });
      return true;
    };
    reconnect = function() {
      return proxycheck().then(function() {
        return client.connect(creds);
      });
    };
    reconnectCount = 0;
    ipc.on('hangupsConnect', function() {
      console.log('hconnect');
      return reconnect().then(function() {
        console.log('connected', reconnectCount);
        if (reconnectCount === 0) {
          sendInit();
        } else {
          syncrecent();
        }
        return reconnectCount++;
      });
    });
    ipc.on('hangupsDisconnect', function() {
      console.log('hdisconnect');
      reconnectCount = 0;
      return client.disconnect();
    });
    mainWindow.on('resize', function(ev) {
      return ipcsend('resize', mainWindow.getSize());
    });
    mainWindow.on('move', function(ev) {
      return ipcsend('move', mainWindow.getPosition());
    });
    client.on('connect_failed', function() {
      console.log('connect_failed');
      return wait(3000).then(function() {
        return reconnect();
      });
    });
    ipc.on('reqinit', function() {
      if (sendInit()) {
        return syncrecent();
      }
    });
    ipc.on('sendchatmessage', seqreq(function(ev, msg) {
      var client_generated_id, conv_id, image_id, otr, segs;
      conv_id = msg.conv_id, segs = msg.segs, client_generated_id = msg.client_generated_id, image_id = msg.image_id, otr = msg.otr;
      return client.sendchatmessage(conv_id, segs, image_id, otr, client_generated_id).then(function(r) {
        return ipcsend('sendchatmessage:result', r);
      }, true);
    }));
    ipc.on('setpresence', seqreq(function() {
      return client.setpresence(true);
    }, false, function() {
      return 1;
    }));
    ipc.on('setactiveclient', seqreq(function(ev, active, secs) {
      return client.setactiveclient(active, secs);
    }, false, function() {
      return 1;
    }));
    ipc.on('updatewatermark', seqreq(function(ev, conv_id, time) {
      return client.updatewatermark(conv_id, time);
    }, true, function(ev, conv_id, time) {
      return conv_id;
    }));
    ipc.on('uploadimage', seqreq(function(ev, spec) {
      var client_generated_id, conv_id;
      path = spec.path, conv_id = spec.conv_id, client_generated_id = spec.client_generated_id;
      ipcsend('uploadingimage', {
        conv_id: conv_id,
        client_generated_id: client_generated_id,
        path: path
      });
      return client.uploadimage(path).then(function(image_id) {
        return client.sendchatmessage(conv_id, null, image_id, null, client_generated_id);
      });
    }, true));
    ipc.on('uploadclipboardimage', seqreq(function(ev, spec) {
      var client_generated_id, conv_id, file, pngData;
      conv_id = spec.conv_id, client_generated_id = spec.client_generated_id;
      file = tmp.fileSync({
        postfix: ".png"
      });
      pngData = clipboard.readImage().toPng();
      ipcsend('uploadingimage', {
        conv_id: conv_id,
        client_generated_id: client_generated_id,
        path: file.name
      });
      return Q.Promise(function(rs, rj) {
        return fs.writeFile(file.name, pngData, plug(rs, rj));
      }).then(function() {
        return client.uploadimage(file.name);
      }).then(function(image_id) {
        return client.sendchatmessage(conv_id, null, image_id, null, client_generated_id);
      }).then(function() {
        return file.removeCallback();
      });
    }, true));
    ipc.on('setconversationnotificationlevel', seqreq(function(ev, conv_id, level) {
      return client.setconversationnotificationlevel(conv_id, level);
    }, true, function(ev, conv_id, level) {
      return conv_id;
    }));
    ipc.on('deleteconversation', seqreq(function(ev, conv_id) {
      return client.deleteconversation(conv_id);
    }, true));
    ipc.on('removeuser', seqreq(function(ev, conv_id) {
      return client.removeuser(conv_id);
    }, true));
    ipc.on('setfocus', seqreq(function(ev, conv_id) {
      return client.setfocus(conv_id);
    }, false, function(ev, conv_id) {
      return conv_id;
    }));
    ipc.on('appfocus', function() {
      app.focus();
      return mainWindow.focus();
    });
    ipc.on('settyping', seqreq(function(ev, conv_id, v) {
      return client.settyping(conv_id, v);
    }, false, function(ev, conv_id) {
      return conv_id;
    }));
    ipc.on('updatebadge', function(ev, value) {
      if (app.dock) {
        return app.dock.setBadge(value);
      }
    });
    ipc.on('searchentities', function(ev, query, max_results) {
      var promise;
      promise = client.searchentities(query, max_results);
      return promise.then(function(res) {
        return ipcsend('searchentities:result', res);
      });
    });
    ipc.on('createconversation', function(ev, ids, name, forcegroup) {
      var conv, promise;
      if (forcegroup == null) {
        forcegroup = false;
      }
      promise = client.createconversation(ids, forcegroup);
      conv = null;
      promise.then(function(res) {
        var conv_id;
        conv = res.conversation;
        conv_id = conv.id.id;
        if (name) {
          return client.renameconversation(conv_id, name);
        }
      });
      return promise = promise.then(function(res) {
        return ipcsend('createconversation:result', conv, name);
      });
    });
    ipc.on('adduser', function(ev, conv_id, toadd) {
      return client.adduser(conv_id, toadd);
    });
    ipc.on('renameconversation', function(ev, conv_id, newname) {
      return client.renameconversation(conv_id, newname);
    });
    ipc.on('getentity', seqreq(function(ev, ids, data) {
      return client.getentitybyid(ids).then(function(r) {
        return ipcsend('getentity:result', r, data);
      });
    }, false, function(ev, ids) {
      return ids.sort().join(',');
    }));
    ipc.on('syncallnewevents', seqreq(function(ev, time) {
      console.log('syncallnew');
      return client.syncallnewevents(time).then(function(r) {
        return ipcsend('syncallnewevents:response', r);
      });
    }, false, function(ev, time) {
      return 1;
    }));
    ipc.on('syncrecentconversations', syncrecent = seqreq(function(ev) {
      console.log('syncrecent');
      return client.syncrecentconversations().then(function(r) {
        ipcsend('syncrecentconversations:response', r);
        return ipcsend('connected');
      });
    }, false, function(ev, time) {
      return 1;
    }));
    ipc.on('getconversation', seqreq(function(ev, conv_id, timestamp, max) {
      return client.getconversation(conv_id, timestamp, max).then(function(r) {
        return ipcsend('getconversation:response', r);
      });
    }, false, function(ev, conv_id, timestamp, max) {
      return conv_id;
    }));
    ipc.on('togglefullscreen', function() {
      return mainWindow.setFullScreen(!mainWindow.isFullScreen());
    });
    ipc.on('logout', logout);
    ipc.on('quit', quit);
    require('./ui/events').forEach(function(n) {
      return client.on(n, function(e) {
        return ipcsend(n, e);
      });
    });
    mainWindow.on('closed', function() {
      return mainWindow = null;
    });
    return mainWindow.on('close', function(ev) {
      var darwinHideOnly;
      darwinHideOnly = process.platform === 'darwin' && !(mainWindow != null ? mainWindow.forceClose : void 0);
      if (darwinHideOnly) {
        ev.preventDefault();
        return mainWindow.hide();
      }
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,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c291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiQ2xpZW50ICAgID0gcmVxdWlyZSAnaGFuZ3Vwc2pzJ1xuUSAgICAgICAgID0gcmVxdWlyZSAncSdcbmxvZ2luICAgICA9IHJlcXVpcmUgJy4vbG9naW4nXG5pcGMgICAgICAgPSByZXF1aXJlICdpcGMnXG5mcyAgICAgICAgPSByZXF1aXJlICdmcydcbnBhdGggICAgICA9IHJlcXVpcmUgJ3BhdGgnXG50bXAgICAgICAgPSByZXF1aXJlICd0bXAnXG5jbGlwYm9hcmQgPSByZXF1aXJlICdjbGlwYm9hcmQnXG5NZW51ICAgICAgPSByZXF1aXJlICdtZW51J1xuXG50bXAuc2V0R3JhY2VmdWxDbGVhbnVwKClcblxuYXBwID0gcmVxdWlyZSAnYXBwJ1xuXG5Ccm93c2VyV2luZG93ID0gcmVxdWlyZSAnYnJvd3Nlci13aW5kb3cnXG5cbnBhdGhzID1cbiAgICBydG9rZW5wYXRoOiAgcGF0aC5ub3JtYWxpemUgcGF0aC5qb2luIGFwcC5nZXRQYXRoKCd1c2VyRGF0YScpLCAncmVmcmVzaHRva2VuLnR4dCdcbiAgICBjb29raWVzcGF0aDogcGF0aC5ub3JtYWxpemUgcGF0aC5qb2luIGFwcC5nZXRQYXRoKCd1c2VyRGF0YScpLCAnY29va2llcy5qc29uJ1xuICAgIGNocm9tZWNvb2tpZTogcGF0aC5ub3JtYWxpemUgcGF0aC5qb2luIGFwcC5nZXRQYXRoKCd1c2VyRGF0YScpLCAnQ29va2llcydcbiAgICBjb25maWdwYXRoOiBwYXRoLm5vcm1hbGl6ZSBwYXRoLmpvaW4gYXBwLmdldFBhdGgoJ3VzZXJEYXRhJyksICdjb25maWcuanNvbidcblxuY2xpZW50ID0gbmV3IENsaWVudFxuICAgIHJ0b2tlbnBhdGg6ICBwYXRocy5ydG9rZW5wYXRoXG4gICAgY29va2llc3BhdGg6IHBhdGhzLmNvb2tpZXNwYXRoXG5cbmlmIGZzLmV4aXN0c1N5bmMgcGF0aHMuY2hyb21lY29va2llXG4gICAgZnMudW5saW5rU3luYyBwYXRocy5jaHJvbWVjb29raWVcblxucGx1ZyA9IChycywgcmopIC0+IChlcnIsIHZhbCkgLT4gaWYgZXJyIHRoZW4gcmooZXJyKSBlbHNlIHJzKHZhbClcblxubG9nb3V0ID0gLT5cbiAgICBwcm9taXNlID0gY2xpZW50LmxvZ291dCgpXG4gICAgcHJvbWlzZS50aGVuIChyZXMpIC0+XG4gICAgICBhcmd2ID0gcHJvY2Vzcy5hcmd2XG4gICAgICBzcGF3biA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKS5zcGF3blxuICAgICAgc3Bhd24gYXJndi5zaGlmdCgpLCBhcmd2LFxuICAgICAgICBjd2Q6IHByb2Nlc3MuY3dkXG4gICAgICAgIGVudjogcHJvY2Vzcy5lbnZcbiAgICAgICAgc3RkaW86ICdpbmhlcml0J1xuICAgICAgcXVpdCgpXG4gICAgcmV0dXJuIHByb21pc2UgIyBsaWtlIGl0IG1hdHRlcnNcblxuc2VxcmVxID0gcmVxdWlyZSAnLi9zZXFyZXEnXG5cbm1haW5XaW5kb3cgPSBudWxsXG5cbiMgTm8gbW9yZSBtaW5pbWl6aW5nIHRvIHRyYXksIGp1c3QgY2xvc2UgaXRcbnJlYWR5VG9DbG9zZSA9IGZhbHNlXG5xdWl0ID0gLT5cbiAgICByZWFkeVRvQ2xvc2UgPSB0cnVlXG4gICAgYXBwLnF1aXQoKVxuXG4jIFF1aXQgd2hlbiBhbGwgd2luZG93cyBhcmUgY2xvc2VkLlxuYXBwLm9uICd3aW5kb3ctYWxsLWNsb3NlZCcsIC0+XG4gICAgYXBwLnF1aXQoKSBpZiAocHJvY2Vzcy5wbGF0Zm9ybSAhPSAnZGFyd2luJylcblxuIyBGb3IgT1NYIHNob3cgd2luZG93IG1haW4gd2luZG93IGlmIHdlJ3ZlIGhpZGRlbiBpdC5cbmFwcC5vbiAnYWN0aXZhdGUtd2l0aC1uby1vcGVuLXdpbmRvd3MnLCAtPlxuICAgIG1haW5XaW5kb3cuc2hvdygpIGlmIChwcm9jZXNzLnBsYXRmb3JtID09ICdkYXJ3aW4nKVxuXG4jIElmIHdlJ3JlIGFjdHVhbGx5IHRyeWluZyB0byBjbG9zZSB0aGUgYXBwIHNldCBpdCB0byBmb3JjZSBjbG9zZVxuYXBwLm9uICdiZWZvcmUtcXVpdCcsIC0+XG4gICAgbWFpbldpbmRvdz8uZm9yY2VDbG9zZSA9IHRydWVcblxubG9hZEFwcFdpbmRvdyA9IC0+XG4gICAgbWFpbldpbmRvdy5sb2FkVXJsICdmaWxlOi8vJyArIF9fZGlybmFtZSArICcvdWkvaW5kZXguaHRtbCdcblxudG9nZ2xlV2luZG93VmlzaWJsZSA9IC0+XG4gICAgaWYgbWFpbldpbmRvdy5pc1Zpc2libGUoKSB0aGVuIG1haW5XaW5kb3cuaGlkZSgpIGVsc2UgbWFpbldpbmRvdy5zaG93KClcblxuIyBoZWxwZXIgd2FpdCBwcm9taXNlXG53YWl0ID0gKHQpIC0+IFEuUHJvbWlzZSAocnMpIC0+IHNldFRpbWVvdXQgcnMsIHRcblxuYXBwLm9uICdyZWFkeScsIC0+XG5cbiAgICBwcm94eWNoZWNrID0gLT5cbiAgICAgICAgdG9kbyA9IFtcbiAgICAgICAgICAge3VybDonaHR0cDovL3BsdXMuZ29vZ2xlLmNvbScsICBlbnY6J0hUVFBfUFJPWFknfVxuICAgICAgICAgICB7dXJsOidodHRwczovL3BsdXMuZ29vZ2xlLmNvbScsIGVudjonSFRUUFNfUFJPWFknfVxuICAgICAgICBdXG4gICAgICAgIFEuYWxsIHRvZG8ubWFwICh0KSAtPiBRLlByb21pc2UgKHJzKSAtPiBhcHAucmVzb2x2ZVByb3h5IHQudXJsLCAocHJveHlVUkwpIC0+XG4gICAgICAgICAgICAjIEZvcm1hdCBvZiBwcm94eVVSTCBpcyBlaXRoZXIgXCJESVJFQ1RcIiBvciBcIlBST1hZIDEyNy4wLjAuMTo4ODg4XCJcbiAgICAgICAgICAgIFtfLCBwdXJsXSA9IHByb3h5VVJMLnNwbGl0ICcgJ1xuICAgICAgICAgICAgcHJvY2Vzcy5lbnZbdC5lbnZdID89IGlmIHB1cmwgdGhlbiBcImh0dHA6Ly8je3B1cmx9XCIgZWxzZSBcIlwiXG4gICAgICAgICAgICBycygpXG5cbiAgICAjIENyZWF0ZSB0aGUgYnJvd3NlciB3aW5kb3cuXG4gICAgbWFpbldpbmRvdyA9IG5ldyBCcm93c2VyV2luZG93IHtcbiAgICAgICAgd2lkdGg6IDczMFxuICAgICAgICBoZWlnaHQ6IDU5MFxuICAgICAgICBcIm1pbi13aWR0aFwiOiA2MjBcbiAgICAgICAgXCJtaW4taGVpZ2h0XCI6IDQyMFxuICAgICAgICBpY29uOiBwYXRoLmpvaW4gX19kaXJuYW1lLCAnaWNvbnMnLCAnaWNvbi5wbmcnXG4gICAgICAgIHNob3c6IHRydWVcbiAgICB9XG4gICAgXG5cbiAgICAjIGFuZCBsb2FkIHRoZSBpbmRleC5odG1sIG9mIHRoZSBhcHAuIHRoaXMgbWF5IGhvd2V2ZXIgYmUgeWFua2VkXG4gICAgIyBhd2F5IGlmIHdlIG11c3QgZG8gYXV0aC5cbiAgICBsb2FkQXBwV2luZG93KClcblxuICAgICMgc2hvcnQgaGFuZFxuICAgIGlwY3NlbmQgPSAoYXMuLi4pIC0+ICBtYWluV2luZG93LndlYkNvbnRlbnRzLnNlbmQgYXMuLi5cblxuICAgICMgY2FsbGJhY2sgZm9yIGNyZWRlbnRpYWxzXG4gICAgY3JlZHMgPSAtPlxuICAgICAgICBjb25zb2xlLmxvZyBcImFza2luZyBmb3IgbG9naW4gY3JlZGVudGlhbHNcIlxuICAgICAgICBsb2dpbldpbmRvdyA9IG5ldyBCcm93c2VyV2luZG93IHtcbiAgICAgICAgICAgIHdpZHRoOiA3MzBcbiAgICAgICAgICAgIGhlaWdodDogNTkwXG4gICAgICAgICAgICBcIm1pbi13aWR0aFwiOiA2MjBcbiAgICAgICAgICAgIFwibWluLWhlaWdodFwiOiA0MjBcbiAgICAgICAgICAgIGljb246IHBhdGguam9pbiBfX2Rpcm5hbWUsICdpY29ucycsICdpY29uLnBuZydcbiAgICAgICAgICAgIHNob3c6IHRydWVcbiAgICAgICAgfVxuICAgICAgICBtYWluV2luZG93LmhpZGUoKVxuICAgICAgICBsb2dpbldpbmRvdy5mb2N1cygpXG4gICAgICAgICMgcmVpbnN0YXRlIGFwcCB3aW5kb3cgd2hlbiBsb2dpbiBmaW5pc2hlc1xuICAgICAgICBwcm9tID0gbG9naW4obG9naW5XaW5kb3cpXG4gICAgICAgIC50aGVuIChycykgLT5cbiAgICAgICAgICBsb2dpbldpbmRvdy5mb3JjZUNsb3NlID0gdHJ1ZVxuICAgICAgICAgIGxvZ2luV2luZG93LmNsb3NlKClcbiAgICAgICAgICBtYWluV2luZG93LnNob3coKVxuICAgICAgICAgIHJzXG4gICAgICAgIGF1dGg6IC0+IHByb21cblxuICAgICMgc2VuZHMgdGhlIGluaXQgc3RydWN0dXJlcyB0byB0aGUgY2xpZW50XG4gICAgc2VuZEluaXQgPSAtPlxuICAgICAgICAjIHdlIGhhdmUgbm8gaW5pdCBkYXRhIGJlZm9yZSB0aGUgY2xpZW50IGhhcyBjb25uZWN0ZWQgZmlyc3RcbiAgICAgICAgIyB0aW1lLlxuICAgICAgICByZXR1cm4gZmFsc2UgdW5sZXNzIGNsaWVudD8uaW5pdD8uc2VsZl9lbnRpdHlcbiAgICAgICAgaXBjc2VuZCAnaW5pdCcsIGluaXQ6IGNsaWVudC5pbml0XG4gICAgICAgIHJldHVybiB0cnVlXG5cbiAgICAjIGtlZXBzIHRyeWluZyB0byBjb25uZWMgdGhlIGhhbmd1cHNqcyBhbmQgY29tbXVuaWNhdGVzIHRob3NlXG4gICAgIyBhdHRlbXB0cyB0byB0aGUgY2xpZW50LlxuICAgIHJlY29ubmVjdCA9IC0+IHByb3h5Y2hlY2soKS50aGVuIC0+IGNsaWVudC5jb25uZWN0KGNyZWRzKVxuXG4gICAgIyBjb3VudGVyIGZvciByZWNvbm5lY3RzXG4gICAgcmVjb25uZWN0Q291bnQgPSAwXG5cbiAgICAjIHdoZXRoZXIgdG8gY29ubmVjdCBpcyBkaWN0YXRlZCBieSB0aGUgY2xpZW50LlxuICAgIGlwYy5vbiAnaGFuZ3Vwc0Nvbm5lY3QnLCAtPlxuICAgICAgICBjb25zb2xlLmxvZyAnaGNvbm5lY3QnXG4gICAgICAgICMgZmlyc3QgY29ubmVjdFxuICAgICAgICByZWNvbm5lY3QoKVxuICAgICAgICAudGhlbiAtPlxuICAgICAgICAgICAgY29uc29sZS5sb2cgJ2Nvbm5lY3RlZCcsIHJlY29ubmVjdENvdW50XG4gICAgICAgICAgICAjIG9uIGZpcnN0IGNvbm5lY3QsIHNlbmQgaW5pdCwgYWZ0ZXIgdGhhdCBvbmx5IHJlc3luY1xuICAgICAgICAgICAgaWYgcmVjb25uZWN0Q291bnQgPT0gMFxuICAgICAgICAgICAgICAgIHNlbmRJbml0KClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzeW5jcmVjZW50KClcbiAgICAgICAgICAgIHJlY29ubmVjdENvdW50KytcblxuICAgIGlwYy5vbiAnaGFuZ3Vwc0Rpc2Nvbm5lY3QnLCAtPlxuICAgICAgICBjb25zb2xlLmxvZyAnaGRpc2Nvbm5lY3QnXG4gICAgICAgIHJlY29ubmVjdENvdW50ID0gMFxuICAgICAgICBjbGllbnQuZGlzY29ubmVjdCgpXG5cbiAgICAjIGNsaWVudCBkZWFscyB3aXRoIHdpbmRvdyBzaXppbmdcbiAgICBtYWluV2luZG93Lm9uICdyZXNpemUnLCAoZXYpIC0+IGlwY3NlbmQgJ3Jlc2l6ZScsIG1haW5XaW5kb3cuZ2V0U2l6ZSgpXG4gICAgbWFpbldpbmRvdy5vbiAnbW92ZScsICAoZXYpIC0+IGlwY3NlbmQgJ21vdmUnLCBtYWluV2luZG93LmdldFBvc2l0aW9uKClcblxuICAgICMgd2hlbmV2ZXIgaXQgZmFpbHMsIHdlIHRyeSBhZ2FpblxuICAgIGNsaWVudC5vbiAnY29ubmVjdF9mYWlsZWQnLCAtPlxuICAgICAgICBjb25zb2xlLmxvZyAnY29ubmVjdF9mYWlsZWQnXG4gICAgICAgIHdhaXQoMzAwMCkudGhlbiAtPiByZWNvbm5lY3QoKVxuXG4gICAgIyB3aGVuIGNsaWVudCByZXF1ZXN0cyAocmUtKWluaXQgc2luY2UgdGhlIGZpcnN0IGluaXRcbiAgICAjIG9iamVjdCBpcyBzZW50IGFzIHNvb24gYXMgcG9zc2libGUgb24gc3RhcnR1cFxuICAgIGlwYy5vbiAncmVxaW5pdCcsIC0+IHN5bmNyZWNlbnQoKSBpZiBzZW5kSW5pdCgpXG5cbiAgICAjIHNlbmRjaGF0bWVzc2FnZSwgZXhlY3V0ZWQgc2VxdWVudGlhbGx5IGFuZFxuICAgICMgcmV0cmllZCBpZiBub3Qgc2VudCBzdWNjZXNzZnVsbHlcbiAgICBpcGMub24gJ3NlbmRjaGF0bWVzc2FnZScsIHNlcXJlcSAoZXYsIG1zZykgLT5cbiAgICAgICAge2NvbnZfaWQsIHNlZ3MsIGNsaWVudF9nZW5lcmF0ZWRfaWQsIGltYWdlX2lkLCBvdHJ9ID0gbXNnXG4gICAgICAgIGNsaWVudC5zZW5kY2hhdG1lc3NhZ2UoY29udl9pZCwgc2VncywgaW1hZ2VfaWQsIG90ciwgY2xpZW50X2dlbmVyYXRlZF9pZCkudGhlbiAocikgLT5cbiAgICAgICAgICAgIGlwY3NlbmQgJ3NlbmRjaGF0bWVzc2FnZTpyZXN1bHQnLCByXG4gICAgICAgICwgdHJ1ZSAjIGRvIHJldHJ5XG5cbiAgICAjIG5vIHJldHJ5LCBvbmx5IG9uZSBvdXRzdGFuZGluZyBjYWxsXG4gICAgaXBjLm9uICdzZXRwcmVzZW5jZScsIHNlcXJlcSAtPlxuICAgICAgICBjbGllbnQuc2V0cHJlc2VuY2UodHJ1ZSlcbiAgICAsIGZhbHNlLCAtPiAxXG5cbiAgICAjIG5vIHJldHJ5LCBvbmx5IG9uZSBvdXRzdGFuZGluZyBjYWxsXG4gICAgaXBjLm9uICdzZXRhY3RpdmVjbGllbnQnLCBzZXFyZXEgKGV2LCBhY3RpdmUsIHNlY3MpIC0+XG4gICAgICAgIGNsaWVudC5zZXRhY3RpdmVjbGllbnQgYWN0aXZlLCBzZWNzXG4gICAgLCBmYWxzZSwgLT4gMVxuXG4gICAgIyB3YXRlcm1hcmtpbmcgaXMgb25seSBpbnRlcmVzdGluZyBmb3IgdGhlIGxhc3Qgb2YgZWFjaCBjb252X2lkXG4gICAgIyByZXRyeSBzZW5kIGFuZCBkZWR1cGUgZm9yIGVhY2ggY29udl9pZFxuICAgIGlwYy5vbiAndXBkYXRld2F0ZXJtYXJrJywgc2VxcmVxIChldiwgY29udl9pZCwgdGltZSkgLT5cbiAgICAgICAgY2xpZW50LnVwZGF0ZXdhdGVybWFyayBjb252X2lkLCB0aW1lXG4gICAgLCB0cnVlLCAoZXYsIGNvbnZfaWQsIHRpbWUpIC0+IGNvbnZfaWRcblxuICAgICMgZ2V0ZW50aXR5IGlzIG5vdCBzdXBlciBpbXBvcnRhbnQsIHRoZSBjbGllbnQgd2lsbCB0cnkgYWdhaW4gd2hlbiBlbmNvdW50ZXJpbmdcbiAgICAjIGVudGl0aWVzIHdpdGhvdXQgcGhvdG9fdXJsLiBzbyBubyByZXRyeSwgYnV0IGRvIGV4ZWN1dGUgYWxsIHN1Y2ggcmVxc1xuICAgICMgaXBjLm9uICdnZXRlbnRpdHknLCBzZXFyZXEgKGV2LCBpZHMpIC0+XG4gICAgIyAgICAgY2xpZW50LmdldGVudGl0eWJ5aWQoaWRzKS50aGVuIChyKSAtPiBpcGNzZW5kICdnZXRlbnRpdHk6cmVzdWx0JywgclxuICAgICMgLCBmYWxzZVxuXG4gICAgIyB3ZSB3YW50IHRvIHVwbG9hZC4gaW4gdGhlIG9yZGVyIHNwZWNpZmllZCwgd2l0aCByZXRyeVxuICAgIGlwYy5vbiAndXBsb2FkaW1hZ2UnLCBzZXFyZXEgKGV2LCBzcGVjKSAtPlxuICAgICAgICB7cGF0aCwgY29udl9pZCwgY2xpZW50X2dlbmVyYXRlZF9pZH0gPSBzcGVjXG4gICAgICAgIGlwY3NlbmQgJ3VwbG9hZGluZ2ltYWdlJywge2NvbnZfaWQsIGNsaWVudF9nZW5lcmF0ZWRfaWQsIHBhdGh9XG4gICAgICAgIGNsaWVudC51cGxvYWRpbWFnZShwYXRoKS50aGVuIChpbWFnZV9pZCkgLT5cbiAgICAgICAgICAgIGNsaWVudC5zZW5kY2hhdG1lc3NhZ2UgY29udl9pZCwgbnVsbCwgaW1hZ2VfaWQsIG51bGwsIGNsaWVudF9nZW5lcmF0ZWRfaWRcbiAgICAsIHRydWVcblxuICAgICMgd2Ugd2FudCB0byB1cGxvYWQuIGluIHRoZSBvcmRlciBzcGVjaWZpZWQsIHdpdGggcmV0cnlcbiAgICBpcGMub24gJ3VwbG9hZGNsaXBib2FyZGltYWdlJywgc2VxcmVxIChldiwgc3BlYykgLT5cbiAgICAgICAge2NvbnZfaWQsIGNsaWVudF9nZW5lcmF0ZWRfaWR9ID0gc3BlY1xuICAgICAgICBmaWxlID0gdG1wLmZpbGVTeW5jIHBvc3RmaXg6IFwiLnBuZ1wiXG4gICAgICAgIHBuZ0RhdGEgPSBjbGlwYm9hcmQucmVhZEltYWdlKCkudG9QbmcoKVxuICAgICAgICBpcGNzZW5kICd1cGxvYWRpbmdpbWFnZScsIHtjb252X2lkLCBjbGllbnRfZ2VuZXJhdGVkX2lkLCBwYXRoOmZpbGUubmFtZX1cbiAgICAgICAgUS5Qcm9taXNlIChycywgcmopIC0+XG4gICAgICAgICAgICBmcy53cml0ZUZpbGUgZmlsZS5uYW1lLCBwbmdEYXRhLCBwbHVnKHJzLCByailcbiAgICAgICAgLnRoZW4gLT5cbiAgICAgICAgICAgIGNsaWVudC51cGxvYWRpbWFnZShmaWxlLm5hbWUpXG4gICAgICAgIC50aGVuIChpbWFnZV9pZCkgLT5cbiAgICAgICAgICAgIGNsaWVudC5zZW5kY2hhdG1lc3NhZ2UgY29udl9pZCwgbnVsbCwgaW1hZ2VfaWQsIG51bGwsIGNsaWVudF9nZW5lcmF0ZWRfaWRcbiAgICAgICAgLnRoZW4gLT5cbiAgICAgICAgICAgIGZpbGUucmVtb3ZlQ2FsbGJhY2soKVxuICAgICwgdHJ1ZVxuXG4gICAgIyByZXRyeSBvbmx5IGxhc3QgcGVyIGNvbnZfaWRcbiAgICBpcGMub24gJ3NldGNvbnZlcnNhdGlvbm5vdGlmaWNhdGlvbmxldmVsJywgc2VxcmVxIChldiwgY29udl9pZCwgbGV2ZWwpIC0+XG4gICAgICAgIGNsaWVudC5zZXRjb252ZXJzYXRpb25ub3RpZmljYXRpb25sZXZlbCBjb252X2lkLCBsZXZlbFxuICAgICwgdHJ1ZSwgKGV2LCBjb252X2lkLCBsZXZlbCkgLT4gY29udl9pZFxuXG4gICAgIyByZXRyeVxuICAgIGlwYy5vbiAnZGVsZXRlY29udmVyc2F0aW9uJywgc2VxcmVxIChldiwgY29udl9pZCkgLT5cbiAgICAgICAgY2xpZW50LmRlbGV0ZWNvbnZlcnNhdGlvbiBjb252X2lkXG4gICAgLCB0cnVlXG5cbiAgICBpcGMub24gJ3JlbW92ZXVzZXInLCBzZXFyZXEgKGV2LCBjb252X2lkKSAtPlxuICAgICAgICBjbGllbnQucmVtb3ZldXNlciBjb252X2lkXG4gICAgLCB0cnVlXG5cbiAgICAjIG5vIHJldHJpZXMsIGRlZHVwZSBvbiBjb252X2lkXG4gICAgaXBjLm9uICdzZXRmb2N1cycsIHNlcXJlcSAoZXYsIGNvbnZfaWQpIC0+XG4gICAgICAgIGNsaWVudC5zZXRmb2N1cyBjb252X2lkXG4gICAgLCBmYWxzZSwgKGV2LCBjb252X2lkKSAtPiBjb252X2lkXG5cbiAgICBpcGMub24gJ2FwcGZvY3VzJywgLT5cbiAgICAgIGFwcC5mb2N1cygpXG4gICAgICBtYWluV2luZG93LmZvY3VzKClcblxuICAgICMgbm8gcmV0cmllcywgZGVkdXBlIG9uIGNvbnZfaWRcbiAgICBpcGMub24gJ3NldHR5cGluZycsIHNlcXJlcSAoZXYsIGNvbnZfaWQsIHYpIC0+XG4gICAgICAgIGNsaWVudC5zZXR0eXBpbmcgY29udl9pZCwgdlxuICAgICwgZmFsc2UsIChldiwgY29udl9pZCkgLT4gY29udl9pZFxuXG4gICAgaXBjLm9uICd1cGRhdGViYWRnZScsIChldiwgdmFsdWUpIC0+XG4gICAgICAgIGFwcC5kb2NrLnNldEJhZGdlKHZhbHVlKSBpZiBhcHAuZG9ja1xuXG4gICAgaXBjLm9uICdzZWFyY2hlbnRpdGllcycsIChldiwgcXVlcnksIG1heF9yZXN1bHRzKSAtPlxuICAgICAgICBwcm9taXNlID0gY2xpZW50LnNlYXJjaGVudGl0aWVzIHF1ZXJ5LCBtYXhfcmVzdWx0c1xuICAgICAgICBwcm9taXNlLnRoZW4gKHJlcykgLT5cbiAgICAgICAgICAgIGlwY3NlbmQgJ3NlYXJjaGVudGl0aWVzOnJlc3VsdCcsIHJlc1xuICAgIGlwYy5vbiAnY3JlYXRlY29udmVyc2F0aW9uJywgKGV2LCBpZHMsIG5hbWUsIGZvcmNlZ3JvdXA9ZmFsc2UpIC0+XG4gICAgICAgIHByb21pc2UgPSBjbGllbnQuY3JlYXRlY29udmVyc2F0aW9uIGlkcywgZm9yY2Vncm91cFxuICAgICAgICBjb252ID0gbnVsbFxuICAgICAgICBwcm9taXNlLnRoZW4gKHJlcykgLT5cbiAgICAgICAgICAgIGNvbnYgPSByZXMuY29udmVyc2F0aW9uXG4gICAgICAgICAgICBjb252X2lkID0gY29udi5pZC5pZFxuICAgICAgICAgICAgY2xpZW50LnJlbmFtZWNvbnZlcnNhdGlvbiBjb252X2lkLCBuYW1lIGlmIG5hbWVcbiAgICAgICAgcHJvbWlzZSA9IHByb21pc2UudGhlbiAocmVzKSAtPlxuICAgICAgICAgICAgaXBjc2VuZCAnY3JlYXRlY29udmVyc2F0aW9uOnJlc3VsdCcsIGNvbnYsIG5hbWVcbiAgICBpcGMub24gJ2FkZHVzZXInLCAoZXYsIGNvbnZfaWQsIHRvYWRkKSAtPlxuICAgICAgICBjbGllbnQuYWRkdXNlciBjb252X2lkLCB0b2FkZCAjwqB3aWxsIGF1dG9tYXRpY2FsbHkgdHJpZ2dlciBtZW1iZXJzaGlwX2NoYW5nZVxuICAgIGlwYy5vbiAncmVuYW1lY29udmVyc2F0aW9uJywgKGV2LCBjb252X2lkLCBuZXduYW1lKSAtPlxuICAgICAgICBjbGllbnQucmVuYW1lY29udmVyc2F0aW9uIGNvbnZfaWQsIG5ld25hbWUgIyB3aWxsIHRyaWdnZXIgY29udmVyc2F0aW9uX3JlbmFtZVxuXG4gICAgIyBubyByZXRyaWVzLCBqdXN0IGRlZHVwZSBvbiB0aGUgaWRzXG4gICAgaXBjLm9uICdnZXRlbnRpdHknLCBzZXFyZXEgKGV2LCBpZHMsIGRhdGEpIC0+XG4gICAgICAgIGNsaWVudC5nZXRlbnRpdHlieWlkKGlkcykudGhlbiAocikgLT5cbiAgICAgICAgICAgIGlwY3NlbmQgJ2dldGVudGl0eTpyZXN1bHQnLCByLCBkYXRhXG4gICAgLCBmYWxzZSwgKGV2LCBpZHMpIC0+IGlkcy5zb3J0KCkuam9pbignLCcpXG5cbiAgICAjIG5vIHJldHJ5LCBqdXN0IG9uZSBzaW5nbGUgcmVxdWVzdFxuICAgIGlwYy5vbiAnc3luY2FsbG5ld2V2ZW50cycsIHNlcXJlcSAoZXYsIHRpbWUpIC0+XG4gICAgICAgIGNvbnNvbGUubG9nICdzeW5jYWxsbmV3J1xuICAgICAgICBjbGllbnQuc3luY2FsbG5ld2V2ZW50cyh0aW1lKS50aGVuIChyKSAtPlxuICAgICAgICAgICAgaXBjc2VuZCAnc3luY2FsbG5ld2V2ZW50czpyZXNwb25zZScsIHJcbiAgICAsIGZhbHNlLCAoZXYsIHRpbWUpIC0+IDFcblxuICAgICMgbm8gcmV0cnksIGp1c3Qgb25lIHNpbmdsZSByZXF1ZXN0XG4gICAgaXBjLm9uICdzeW5jcmVjZW50Y29udmVyc2F0aW9ucycsIHN5bmNyZWNlbnQgPSBzZXFyZXEgKGV2KSAtPlxuICAgICAgICBjb25zb2xlLmxvZyAnc3luY3JlY2VudCdcbiAgICAgICAgY2xpZW50LnN5bmNyZWNlbnRjb252ZXJzYXRpb25zKCkudGhlbiAocikgLT5cbiAgICAgICAgICAgIGlwY3NlbmQgJ3N5bmNyZWNlbnRjb252ZXJzYXRpb25zOnJlc3BvbnNlJywgclxuICAgICAgICAgICAgIyB0aGlzIGlzIGJlY2F1c2Ugd2UgdXNlIHN5bmNyZWNlbnQgb24gcmVxaW5pdCAoZGV2LW1vZGVcbiAgICAgICAgICAgICMgcmVmcmVzaCkuIGlmIHdlIHN1Y2NlZWRlZCBnZXR0aW5nIGEgcmVzcG9uc2UsIHdlIGNhbGwgaXRcbiAgICAgICAgICAgICMgY29ubmVjdGVkLlxuICAgICAgICAgICAgaXBjc2VuZCAnY29ubmVjdGVkJ1xuICAgICwgZmFsc2UsIChldiwgdGltZSkgLT4gMVxuXG4gICAgIyByZXRyeSwgb25lIHNpbmdsZSBwZXIgY29udl9pZFxuICAgIGlwYy5vbiAnZ2V0Y29udmVyc2F0aW9uJywgc2VxcmVxIChldiwgY29udl9pZCwgdGltZXN0YW1wLCBtYXgpIC0+XG4gICAgICAgIGNsaWVudC5nZXRjb252ZXJzYXRpb24oY29udl9pZCwgdGltZXN0YW1wLCBtYXgpLnRoZW4gKHIpIC0+XG4gICAgICAgICAgICBpcGNzZW5kICdnZXRjb252ZXJzYXRpb246cmVzcG9uc2UnLCByXG4gICAgLCBmYWxzZSwgKGV2LCBjb252X2lkLCB0aW1lc3RhbXAsIG1heCkgLT4gY29udl9pZFxuXG4gICAgaXBjLm9uICd0b2dnbGVmdWxsc2NyZWVuJywgLT5cbiAgICAgIG1haW5XaW5kb3cuc2V0RnVsbFNjcmVlbiBub3QgbWFpbldpbmRvdy5pc0Z1bGxTY3JlZW4oKVxuXG4gICAgIyBieWUgYnllXG4gICAgaXBjLm9uICdsb2dvdXQnLCBsb2dvdXRcblxuICAgIGlwYy5vbiAncXVpdCcsIHF1aXRcblxuICAgICMgcHJvcGFnYXRlIHRoZXNlIGV2ZW50cyB0byB0aGUgcmVuZGVyZXJcbiAgICByZXF1aXJlKCcuL3VpL2V2ZW50cycpLmZvckVhY2ggKG4pIC0+XG4gICAgICAgIGNsaWVudC5vbiBuLCAoZSkgLT5cbiAgICAgICAgICAgIGlwY3NlbmQgbiwgZVxuXG4gICAgIyBFbWl0dGVkIHdoZW4gdGhlIHdpbmRvdyBpcyBhY3R1YWxseSBjbG9zZWQuXG4gICAgbWFpbldpbmRvdy5vbiAnY2xvc2VkJywgLT5cbiAgICAgICAgbWFpbldpbmRvdyA9IG51bGxcblxuICAgICMgRW1pdHRlZCB3aGVuIHRoZSB3aW5kb3cgaXMgYWJvdXQgdG8gY2xvc2UuXG4gICAgIyBGb3IgT1NYIG9ubHkgaGlkZXMgdGhlIHdpbmRvdyBpZiB3ZSdyZSBub3QgZm9yY2UgY2xvc2luZy5cbiAgICBtYWluV2luZG93Lm9uICdjbG9zZScsIChldikgLT5cbiAgICAgICAgZGFyd2luSGlkZU9ubHkgPSBwcm9jZXNzLnBsYXRmb3JtID09ICdkYXJ3aW4nIGFuZCBub3QgbWFpbldpbmRvdz8uZm9yY2VDbG9zZVxuXG4gICAgICAgIGlmIGRhcndpbkhpZGVPbmx5XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICBtYWluV2luZG93LmhpZGUoKVxuIl19
