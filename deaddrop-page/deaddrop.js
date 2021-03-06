var state = {
  view: 'welcome',
  url: 'http://siri.cbrp3.c-base.org/deaddrop.json',
  progress: {
    message: null,
    percent: 100,
    qrcode: null
  }
};

var drawQr = function (size, element, address) {
  element.innerHTML = '';
  var qrcode = new QRCode(element.id, {
    width: size,
    height: size
  });
  qrcode.makeCode(address);
};

var renderQr = function () {
  var size = window.innerHeight * 0.5;
  var qrcodeEl = document.getElementById('qrcode')
  drawQr(size, qrcodeEl, state.progress.qrcode);
  qrcodeEl.style.width = size + 'px';
  qrcodeEl.style.height = size + 'px';

  qrcodeEl.addEventListener('click', function () {
    window.location.href = state.progress.qrcode;
  });
  var parts = state.progress.qrcode.split('/ipfs/');
  if (parts.length == 1) {
    var qrString = state.progress.qrcode;
  } else {
    var qrString = parts[0] + '/ipfs/<br>' + parts[1];
  }
  document.getElementById('address').innerHTML = qrString;
};

var renderProgress = function () {
  var statusEl = document.getElementById('status');
  statusEl.value = state.progress.percent;
};

var determineView = function () {
  if (state.progress.changed) {
    var changedDate = new Date(state.progress.changed);
    var now = new Date();
    var elapsed = now.getTime() - changedDate.getTime();
    if (elapsed > 4 * 60 * 1000) {
      state.progress.qrcode = null;
      state.progress.message = '';
    }
  }

  if (state.progress.qrcode) {
    state.view = 'result';
    return;
  }
  if (state.progress.percent === 100) {
    state.view = 'welcome';
    return;
  }
  state.view = 'progress';
};

var render = function () {
  var welcomeEl = document.getElementById('welcome');
  var progressEl = document.getElementById('progress');
  var resultEl = document.getElementById('result');

  switch (state.view) {
    case 'welcome':
      progressEl.style.display = 'none';
      resultEl.style.display = 'none';
      welcomeEl.style.display = 'block';
      break;
    case 'progress':
      state.lastShown = null;
      resultEl.style.display = 'none';
      welcomeEl.style.display = 'none';
      progressEl.style.display = 'block'
      renderProgress();
      break;
    case 'result':
      progressEl.style.display = 'none'
      welcomeEl.style.display = 'none';
      resultEl.style.display = 'block';
      renderQr();
      break;
  }
  var messageEl = document.getElementById('message');
  messageEl.innerHTML = state.progress.message;
  document.body.className = state.view;
};

var address = 'http://siri.cbrp3.c-base.org/deaddrop.json';
if (window.location.search) {
  address = window.location.search.substr(1);
}
state.url = address;

document.addEventListener('DOMContentLoaded', function () {
  render();
  setInterval(function () {
    fetchState();
  }, 1000);
  fetchState();
});
window.addEventListener('resize', function () {
  render();
});

var fetchState = function () {
  var req = new XMLHttpRequest;  
  req.open('GET', state.url, true);
  req.onload  = function() {
    if (req.readyState !== 4) {
      return;
    }
    if (req.status === 200) {
      try {
        state.progress = JSON.parse(req.responseText);
      } catch (e) {
        state.progress.message = "Error parsing server file";
      }
      determineView();
      render();
    }
  };
  req.send(null);
};
