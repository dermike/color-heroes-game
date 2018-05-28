(function() {
  let level = 1,
    lives = 3,
    status = document.querySelector('[role="status"]');

  const displayLives = () => {
    return `<button>${lives} &#x2764;&#xFE0F;</button>`;
  };

  const colorClick = e => {
    e.preventDefault();
    let color = e.target.className,
      currentSvg = document.querySelector('.current.svg'),
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
          lives += 1;
          status.innerHTML = '<p>Rätt!</p><button class="nextlevel">Nästa nivå &#x27A1;&#xFE0F;</button>';
          status.className = 'correct next';
        } else {
          if (correct) {
            status.innerHTML = '<p>Rätt! Gissa mer.</p>' + displayLives();
            status.className = 'correct';
          } else {
            lives -= 1;
            if (lives <= 0) {
              status.innerHTML = '<p>Game over!</p><button class="playagain">Spela igen &#x1F504;</button>';
              status.className = 'wrong gameover';
            } else {
              status.innerHTML = '<p>Fel!</p>' + displayLives();
              status.className = 'wrong';
            }
          }
        }
      }, 100);
    }
  };

  let colorButtons = document.querySelectorAll('nav a');
  Array.prototype.forEach.call(colorButtons, button => {
    button.addEventListener('click', colorClick, false);
  });

  document.addEventListener('click', e => {
    if (e.target.classList.contains('playagain')) {
      document.location.reload();
    }
  });
  status.className = 'status';
  status.innerHTML = `<p>Nivå ${level}</p>${displayLives()}`;
})();
