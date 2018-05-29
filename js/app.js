(function() {
  let level = 1,
    lives = 3;

  const status = document.querySelector('[role="status"]');
  const main = document.querySelector('main');
  const colorButtons = document.querySelectorAll('nav a');

  const displayLives = () => {
    return `<button aria-disabled="true">${lives} &#x2764;&#xFE0F;</button>`;
  };

  const colorClick = e => {
    if (e.target.style.visibility === 'hidden' || status.classList.contains('next') || status.classList.contains('gameover')) {
      if (status.classList.contains('next') || status.classList.contains('gameover')) {
        status.querySelector('button').focus();
      }
      return false;
    }
    e.preventDefault();
    let color = e.target.className,
      currentSvg = document.querySelector('.current.svg'),
      correct = false;
    if (color && currentSvg) {
      status.className = '';

      // hide selected color
      e.target.setAttribute('aria-disabled', 'true');

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
          status.innerHTML = `<div><h1>Nivå ${level}</h1><p>Rätt! +1 &#x2764;&#xFE0F;</p></div><button class="nextlevel">Nästa nivå &#x27A1;&#xFE0F;</button>`;
          status.className = 'correct next';
        } else {
          if (correct) {
          status.innerHTML = `<div><h1>Nivå ${level}</h1><p>Rätt! Fortsätt gissa!</p></div>${displayLives()}`;
            status.className = 'correct';
          } else {
            lives -= 1;
            if (lives <= 0) {
              status.innerHTML = `<div><h1>Game over!</h1><p>Nivå ${level}</div><button class="playagain">Spela igen &#x1F504;</button>`;
              status.className = 'wrong gameover';
            } else {
              status.innerHTML = `<div><h1>Nivå ${level}</h1><p>Fel! Försök igen!</p></div>${displayLives()}`
              status.className = 'wrong';
            }
          }
        }
      }, 100);
    }
  };

  const nextSvg = () => {
    let randomChoice = Math.floor(Math.random() * svgs.length),
      randomSvg = svgs[randomChoice];
    if (randomSvg) {
      let newSvg = document.createElement('div'),
        currentSvg = document.querySelector('.svg.current');
      newSvg.className = 'svg new';
      newSvg.innerHTML = randomSvg;
      main.appendChild(newSvg);
      svgs.splice(randomChoice, 1);
      if (currentSvg) {
        currentSvg.classList.remove('current');
        currentSvg.classList.add('done');
        setTimeout(() => {
          main.removeChild(currentSvg);
        }, 600);
      }
      setTimeout(() => {
        newSvg.classList.remove('new');
        newSvg.classList.add('current');
      }, 500);
      Array.prototype.forEach.call(colorButtons, (button, i) => {
        setTimeout(() => {
          button.setAttribute('aria-disabled', 'false');
        }, i * 50);
      });
      status.className = '';
      setTimeout(() => {
        status.className = 'status';
        status.innerHTML = `<div><h1>Nivå ${level}</h1><p>Börja gissa!</p></div>${displayLives()}`;
      }, 100);
    }
  };

  Array.prototype.forEach.call(colorButtons, button => {
    button.addEventListener('click', colorClick, false);
  });

  document.addEventListener('click', e => {
    if (e.target.classList.contains('playagain')) {
      document.location.reload();
    }
    if (e.target.classList.contains('nextlevel')) {
      if (svgs && svgs.length) {
        level += 1;
        nextSvg();
      } else {
        status.innerHTML = '<div><h1>Du klarade det!</h1><p>Bra jobbat!</p></div><button class="playagain">Spela igen &#x1F504;</button>';
        status.className = 'correct gameover';
      }
    }
  });
  status.className = 'status';
  status.innerHTML = `<p>Nivå ${level}</p>${displayLives()}`;

  if (svgs && svgs.length) {
    nextSvg();
  } else {
    status.innerHTML = '<div><h1>Något gick fel!</h1></div><button class="playagain">Spela igen &#x1F504;</button>';
    status.className = 'wrong gameover';
  }
})();
