document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  // Mark today's row in hours table
  var days = ['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'];
  var today = days[new Date().getDay()];
  document.querySelectorAll('table.hours tr').forEach(function (row) {
    if (row.dataset.day === today) row.classList.add('today');
  });
});
