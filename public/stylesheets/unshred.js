var drawImages;
window.onload = function() {
  var imageObj;
  imageObj = new Image();
  imageObj.src = "images/TokyoPanoramaShredded.png";
  return imageObj.onload = function() {
    return drawImages(this);
  };
};
drawImages = function(imageObj) {
  var STRIP_HEIGHT, STRIP_WIDTH, column_difference, data, draw, draw_from_to, getPixel, imageData, least_difference, left_edge, ordered_neighbors, pixel_difference, right_edge, shredded, shredded_context, sorted, strip, strip1, strip2, strip_difference, strips, total_difference, unscramble, unshredded, unshredded_context;
  shredded = document.getElementById("shredded");
  shredded_context = shredded.getContext("2d");
  shredded_context.drawImage(imageObj, 0, 0);
  unshredded = document.getElementById("unshredded");
  unshredded_context = unshredded.getContext("2d");
  imageData = shredded_context.getImageData(0, 0, unshredded.width, unshredded.height);
  data = imageData.data;
  STRIP_WIDTH = 32;
  STRIP_HEIGHT = 359;
  getPixel = function(x, y) {
    var start;
    start = imageData.width * 4 * y + x * 4;
    return [data[start], data[start + 1], data[start + 2], data[start + 3]];
  };
  pixel_difference = function(x1, y1, x2, y2) {
    var i, one, total, two;
    total = 0;
    one = getPixel(x1, y1);
    two = getPixel(x2, y2);
    for (i = 0; i <= 2; i++) {
      if (one[i] - two[i] > 100) {
        return 1;
      }
    }
    return 0;
  };
  column_difference = function(x1, x2) {
    var total, y, _ref;
    total = 0;
    for (y = 0, _ref = unshredded.height; 0 <= _ref ? y < _ref : y > _ref; 0 <= _ref ? y++ : y--) {
      total += pixel_difference(x1, y, x2, y);
    }
    return total;
  };
  strips = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  right_edge = function(strip) {
    return strip * STRIP_WIDTH + (STRIP_WIDTH - 1);
  };
  left_edge = function(strip) {
    return strip * STRIP_WIDTH;
  };
  strip_difference = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = strips.length; _i < _len; _i++) {
      strip1 = strips[_i];
      _results.push((function() {
        var _j, _len2, _results2;
        _results2 = [];
        for (_j = 0, _len2 = strips.length; _j < _len2; _j++) {
          strip2 = strips[_j];
          _results2.push(column_difference(right_edge(strip1), left_edge(strip2)));
        }
        return _results2;
      })());
    }
    return _results;
  })();
  ordered_neighbors = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = strips.length; _i < _len; _i++) {
      strip = strips[_i];
      _results.push(_.sortBy(_.without(strips, strip), function(other_strip) {
        return strip_difference[strip][other_strip];
      }));
    }
    return _results;
  })();
  total_difference = function(sorted_strips) {
    var idx, total, _ref;
    total = 0;
    for (idx = 0, _ref = sorted_strips.length - 2; 0 <= _ref ? idx <= _ref : idx >= _ref; 0 <= _ref ? idx++ : idx--) {
      total += strip_difference[sorted_strips[idx]][sorted_strips[idx + 1]];
    }
    return total;
  };
  draw_from_to = function(sourceStrip, targetStrip) {
    return unshredded_context.drawImage(imageObj, 0 + 32 * sourceStrip, 0, STRIP_WIDTH, STRIP_HEIGHT, 0 + 32 * targetStrip, 0, STRIP_WIDTH, STRIP_HEIGHT);
  };
  draw = function(sorted_strips) {
    var idx, strip, _results;
    _results = [];
    for (idx in sorted_strips) {
      strip = sorted_strips[idx];
      _results.push(draw_from_to(strip, idx));
    }
    return _results;
  };
  sorted = [8, 10, 14, 16, 18, 13, 7, 3, 2, 11, 4, 19, 17, 12, 6, 15, 1, 5, 0, 9];
  console.log(total_difference(sorted), sorted);
  least_difference = Number.MAX_VALUE;
  unscramble = function(unsorted, sorted, depth) {
    var next, strip, td, _i, _j, _len, _len2, _ref;
    if (sorted.length > 20) {
      return;
    }
    if (unsorted.length === 0) {
      td = total_difference(sorted);
      if (td < least_difference) {
        least_difference = td;
        console.log(td, sorted);
        draw(sorted);
      }
      return;
    }
    if (sorted.length === 0) {
      for (_i = 0, _len = unsorted.length; _i < _len; _i++) {
        strip = unsorted[_i];
        unscramble(_.without(unsorted, strip), [strip], depth);
      }
      return;
    }
    _ref = _.difference(ordered_neighbors[_.last(sorted)], sorted).slice(0, (depth + 1) || 9e9);
    for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
      next = _ref[_j];
      unscramble(_.without(unsorted, next), sorted.concat([next]), depth);
    }
  };
  unscramble(strips, [], 0);
  console.log(strip_difference[19][17]);
  return console.log(strip_difference[9][8]);
};