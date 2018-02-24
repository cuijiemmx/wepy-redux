"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStore = getStore;
exports.setStore = setStore;


var store = null;

function getStore() {
  return store;
}

function setStore(s) {
  store = s;
}