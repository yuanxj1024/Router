/**
 * 作者：狼族小狈
 * QQ群：133240225
 * 使用原生js简单的实现路由功能
 */
/**
 * 构建路由对象
 */
function Router() {
  this.controller = []; //存储路由和方法  
}

/**
 * 路由初始化方法
 * @param {function} callback [[Description]]
 */
Router.prototype.init = function (callback) {
  callback.bind(this)();
  this.change();
  window.addEventListener('hashchange', function () {
    this.change();
  }.bind(this), false);
}

/**
 * url改变触发方法
 */
Router.prototype.change = function () {
  var _this = this;
  var aUrl = location.hash.split('?');
  _this.notFound = false;
  var app = {
    pathName: aUrl[0],
    search: aUrl[1] || null,
    aHash: null,
    notFound: true, //true 页面不存在，404错误，false 页面存在
    init: function () {
      var aQueue = [];
      app.aHash = app.pathName.split('/');

      for (var i = 0; i < _this.controller.length; i++) {

        var router = _this.controller[i].router;
        var callback = _this.controller[i].callback;
        var queue = {
          req: {
            query: app.getQuery(),
            param: null,
            router: _this.controller[i].router,
          },
          callback: null
        };

        if (app.test(_this.controller[i])) {
          queue.req.param = app.getParam(router);
          queue.callback = callback;
          aQueue.push(queue);
        } else if (_this.controller[i].router == undefined) {
          queue.callback = callback;
          aQueue.push(queue);
        }
      }

      for (var i = 0; i < aQueue.length; i++) {
        var router = aQueue[i].req.router;
        if (typeof (router) == 'string') { //路由存在
          aQueue[i].callback(aQueue[i].req);
        } else if (router == undefined && app.notFound) {
          aQueue[i].callback(aQueue[i].req);
        }

      }
    },
    test: function (controller) {
      var router = controller.router;
      var callback = controller.callback;

      if (typeof (router) != 'string') {
        return false;
      }

      //通配符匹配模式
      var bAll = Boolean(router == '*');

      //正则匹配模式
      var sRe = '';
      sRe = router.replace(/\/:\w[^\/]+/g, '\/([^\/]+)');
      sRe = sRe.replace(/\//g, '\\/');
      sRe = '^#' + sRe + '$';
      var bRe = Boolean(new RegExp(sRe).test(app.pathName));

      //首页单独匹配模式
      var bIndex = Boolean(app.pathName == '' && router == '/');

      if (bRe || bIndex) {
        app.notFound = false;
      }

      return Boolean(bAll || bRe || bIndex);
    },
    getParam: function (router) {
      var param = {};
      var aRouter = router.split('/');

      for (var j = 0; j < aRouter.length; j++) {

        if (/^:\w[\w\d]*$/.test(aRouter[j])) {
          param[aRouter[j].replace(/^:/, '')] = app.aHash[j];
        }
      }

      return param;
    },
    getQuery: function () {
      var query = {};

      if (typeof (app.search) != 'string') {
        return query;
      }

      var arr = app.search.split('&');

      for (var i = 0; i < arr.length; i++) {
        var aQuery = arr[i].split('=');
        query[aQuery[0]] = aQuery[1] || null;
      }
      return query;
    }
  };

  app.init();
}

/**
 * 前端路由模拟get请求
 * @param {string} router   路由匹配规则
 * @param {function} callback 路由匹配成功后执行方法
 */
Router.prototype.get = function (router, callback) {
  var data = {
    router: router,
    callback: callback
  };
  this.controller.push(data);
}

/**
 * 路由中间件
 * @param {function} callback 执行是方法
 */
Router.prototype.use = function (callback) {

  var data = {
    router: '*',
    callback: callback
  };

  this.controller.push(data);
}

/**
 * 404错误，页面不存在时执行
 * @param {function} callback 404错误时执行方法
 */
Router.prototype.error = function (callback) {
  var data = {
    router: undefined,
    callback: callback
  };

  this.controller.push(data);
}