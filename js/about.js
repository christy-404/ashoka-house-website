/**
 * Ashoka House — About page JavaScript
 * Handles feedback form submission via mailto
 */

(function () {
  'use strict';

  const form = document.getElementById('feedback-form');
  if (!form) return;

  const FEEDBACK_EMAIL = 'ashokahousekvno1kochi@gmail.com';

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const nameInput = form.querySelector('#feedback-name');
    const messageInput = form.querySelector('#feedback-message');

    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    if (!name || !message) {
      return;
    }

    const subject = encodeURIComponent('Feedback from ' + name + ' - Ashoka House Website');
    const body = encodeURIComponent(
      'Name: ' + name + '\n\n' +
      'Feedback:\n' + message + '\n\n' +
      '---\nSent from Ashoka House website feedback form'
    );

    const mailtoLink = 'mailto:' + FEEDBACK_EMAIL + '?subject=' + subject + '&body=' + body;

    window.location.href = mailtoLink;
  });
})();