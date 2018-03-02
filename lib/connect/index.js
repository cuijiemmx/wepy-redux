'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = connect;

var _store = require('../store');

var _helpers = require('../helpers');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function connect(states, actions) {
  var getStore = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _store.getStore;

  states = (0, _helpers.mapState)(states || {}, getStore);

  return function connectComponent(Component) {
    var unSubscribe = null;

    var _onLoad = Component.prototype.onLoad;
    var _onUnload = Component.prototype.onUnload;

    var onStateChange = function onStateChange() {
      var _this = this;

      var hasChanged = false;
      Object.keys(states).forEach(function (k) {
        var newV = states[k].call(_this);
        if (_this[k] !== newV) {
          _this[k] = newV;
          hasChanged = true;
        }
      });
      hasChanged && this.$apply();
    };
    return function (_Component) {
      _inherits(_class, _Component);

      function _class() {
        _classCallCheck(this, _class);

        var _this2 = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this));

        _this2.computed = Object.assign(_this2.computed || {}, states, (0, _helpers.mapState)({
          $state: function $state(state) {
            return state;
          }
        }, getStore.bind(_this2)));

        actions = (0, _helpers.mapActions)(actions || {}, getStore.bind(_this2));
        _this2.methods = Object.assign(_this2.methods || {}, actions);
        return _this2;
      }

      _createClass(_class, [{
        key: 'onLoad',
        value: function onLoad() {
          var store = getStore.call(this);
          unSubscribe = store.subscribe(onStateChange.bind(this));
          onStateChange.call(this);
          _onLoad && _onLoad.apply(this, arguments);
        }
      }, {
        key: 'onUnload',
        value: function onUnload() {
          unSubscribe && unSubscribe();
          unSubscribe = null;
          _onUnload && _onUnload.apply(this, arguments);
        }
      }]);

      return _class;
    }(Component);
  };
}