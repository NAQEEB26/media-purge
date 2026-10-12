/**
 * Media Purge review notice.
 *
 * Sends Later / Already did / Never / dismiss over admin-ajax.
 * The review link itself is a normal outbound link.
 *
 * @package WP_Media_Purge
 */
(function () {
  'use strict';

  var config = window.wpmpReview;
  var notice = document.getElementById('wpmp-review-notice');

  if (!notice || !config || !config.ajaxUrl || !config.nonce || !config.action) {
    return;
  }

  var pending = false;

  function postChoice(choice, done) {
    var params = 'action=' + encodeURIComponent(config.action) +
      '&nonce=' + encodeURIComponent(config.nonce) +
      '&choice=' + encodeURIComponent(choice);
    var xhr = new XMLHttpRequest();

    xhr.open('POST', config.ajaxUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.onload = function () {
      done(xhr.status >= 200 && xhr.status < 300);
    };
    xhr.onerror = function () {
      done(false);
    };
    xhr.send(params);
  }

  function closest(node, selector) {
    var current = node;
    while (current && current !== notice) {
      if (current.matches && current.matches(selector)) {
        return current;
      }
      if (current.msMatchesSelector && current.msMatchesSelector(selector)) {
        return current;
      }
      current = current.parentNode;
    }
    return null;
  }

  function hideNotice() {
    if (notice.parentNode) {
      notice.parentNode.removeChild(notice);
    }
  }

  notice.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || pending) {
      if (pending) {
        event.preventDefault();
      }
      return;
    }

    var control = closest(target, '[data-wpmp-review]');
    var dismiss = closest(target, '.notice-dismiss');
    var choice;

    if (!control && !dismiss) {
      return;
    }

    choice = dismiss ? 'never' : control.getAttribute('data-wpmp-review');
    if (choice !== 'later' && choice !== 'done' && choice !== 'never') {
      return;
    }

    if (!control || control.tagName !== 'A') {
      event.preventDefault();
    }

    pending = true;
    postChoice(choice, function (ok) {
      pending = false;
      if (ok) {
        hideNotice();
      }
    });
  });
}());
