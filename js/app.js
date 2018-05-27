(function() {
  const colorClick = e => {
    e.preventDefault();
    let color = e.target.className,
      currentSvg = document.querySelector('.current.svg'),
      status = document.querySelector('[role="status"]'),
      correct = false;
    if (color && currentSvg) {
      status.className = '';

      // hide selected color
      e.target.style.visibility = 'hidden';

      // add color class to fill color in svg
      currentSvg.classList.add(color);

      // remove .color class for selected color. No color = nothing left to guess
      Array.prototype.forEach.call(document.querySelectorAll('.current.svg .color.' + color), item => {
        item.classList.remove('color');
        correct = true;
      });
      setTimeout(() => {
        if (!document.querySelectorAll('.current.svg .color').length) {
          status.innerHTML = '<p>Klart!</p><button>Gå till nästa</button>';
          status.className = 'correct next';
        } else {
          if (correct) {
            status.innerHTML = '<p>Rätt!</p>';
            status.className = 'correct';
          } else {
            status.innerHTML = '<p>Fel!</p>';
            status.className = 'wrong';
          }
        }
      }, 100);
    }
  };

  let colorButtons = document.querySelectorAll('nav a');
  Array.prototype.forEach.call(colorButtons, button => {
    button.addEventListener('click', colorClick, false);
  });
})();
