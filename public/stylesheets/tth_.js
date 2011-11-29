_.mixin({
  random: function(list) {
    var key;
    if (_.isArray(list)) {
      return list[Math.floor(Math.random() * list.length)];
    }
    if (_.isObject(list)) {
      key = _.random(_.keys(list));
      return [key, list[key]];
    }
  }
});