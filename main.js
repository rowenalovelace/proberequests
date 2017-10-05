var elements = {};
var dynamicScaleMinCount = 100;        // Min count for dynamic scale
var maxFontSizePercent = 2000;          // percent
var minOpacity = 0.1;                   // [0, 1]
var msTilFadeAway = 1000 * 60 * 60 * 3; // 3 hours in ms
var startTime = Date.now() / 1000;

var timeScalar = (1 - minOpacity) / msTilFadeAway; // % opacity per ms
var sizeScalar = (maxFontSizePercent - 100) / dynamicScaleMinCount;
function processRequests(requests) {
  console.log('updating');
  var body = $('body');
  var template = $('#template').html();
  var totalRequests = Object.keys(requests).length;
  var maxCount = 0;
  var maxLastSeen = 0;
  var created = false;
  $.each(requests, render);
  startTime = maxLastSeen;
  console.log('done');

  // dynamically compute a new sizeScalar such that the most seen entry is
  // assigned the maxFontSizePercent.
  // sizeScalar*maxCount + 100 = maxFontSizePercent
  //sizeScalar = Math.min(1, (maxFontSizePercent - 100) / maxCount);

  function render(name, request) {
    if (request.lastSeen > maxLastSeen) {
      maxLastSeen = request.lastSeen;
    }
    if (request.count > maxCount) {
      maxCount = request.count;
    }

    var $div = elements[request.name];

    if ($div) {
      update($div, request);
    } else {
      if (!created) {
        created = true;
        $div = create(request);
        elements[request.name] = $div;
      }
    }
  }

  function create(request) {
    var $div = $(template).appendTo(body);
    update($div, request);
    return $div;
  }

  function update($div, request) {
    var macList = Object.keys(request.macs).sort();
    var seconds = startTime - request.lastSeen;
    var maxTop = $div.parent().outerHeight() - $div.outerHeight();
    var decayTop = maxTop*Math.log2(seconds*0.05)/10;
    var top = Math.max(0, Math.min(maxTop, decayTop));
    var opacity = Math.max(minOpacity, 1 - ((startTime - request.lastSeen) * timeScalar));
    var fontSize = Math.min(maxFontSizePercent, 100 + sizeScalar*macList.length);
    $div.css('top', top + 'px').css('opacity', opacity);
    $div.find('.name').text(request.name).css('font-size', fontSize + '%');
    $div.find('.stats').text(request.count + '/' + macList.length);

    $div.find('.macs').html('');
    macList.forEach(function(mac) {
      $div.find('.macs').append(macToColor(mac));
    });

  }

  function macToColor(mac) {
    var $user = $('<div>').addClass('user');
    var octets = mac.split(':');
    var color = '#' + octets.splice(0,3).join('');
    $user.append(createColorSpan(color));
    var color = '#' + octets.splice(0,3).join('');
    $user.append(createColorSpan(color));
    return $user;
  }

  function createColorSpan(color) {
      var $span = $('<span class="color">').css('background-color', color);
      return $span;
  }
}

$(function() {

  poll();
  //test();

  function poll() {
    setInterval(function() {
        $.getJSON('probereq.json', processRequests);
    }, 1000);
  }

  function test() {
    var counter = 0;
    var names = Object.keys(testRequests);
    var requests = {};
    function increment(request) {
        request.lastSeen = Date.now() / 1000;
        request.count += 1;
    }
    increment(testRequests[names[names.length - 1]]);
    setInterval(function() {
        if (Math.random() < 0.1) {
          increment(testRequests.ADM);
        }
        if (Math.random() < 0.1) {
          var randomName = names[Math.floor(Math.random() * names.length/2)];
          increment(testRequests[randomName]);
        }

        var name = names[counter % names.length];
        requests[name] = testRequests[name];

        processRequests(requests);
        counter += 1;
    }, 1000);
  }

});
