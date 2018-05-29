(function() {
  let level = 1,
    lives = 3,
    storage = Boolean('localStorage' in window),
    saveState = (currentSvg, guessedColors, completed) => {
      if (storage) {
        localStorage.setItem('gamestate', JSON.stringify(
          [
            level,
            lives,
            svgs,
            guessedColors,
            currentSvg.innerHTML,
            completed
          ]
        ));
      }
    },
    restoreState = () => {
      if (storage) {
        let gamestate = JSON.parse(localStorage.getItem('gamestate'));
        if (gamestate) {
          level = gamestate[0];
          lives = gamestate[1];
          svgs = gamestate[2];
          return [gamestate[3], gamestate[4], gamestate[5]];
        }
      }
    },
    resetState = () => {
      if (storage) {
        localStorage.removeItem('gamestate');
      }
    },
    svgFromState = restoreState();

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
          saveState(currentSvg, currentSvg.className, true);
        } else {
          if (correct) {
          status.innerHTML = `<div><h1>Nivå ${level}</h1><p>Rätt! Fortsätt gissa!</p></div>${displayLives()}`;
            status.className = 'correct';
            saveState(currentSvg, currentSvg.className);
          } else {
            lives -= 1;
            if (lives <= 0) {
              status.innerHTML = `<div><h1>Game over!</h1><p>Nivå ${level}</div><button class="playagain">Spela igen &#x1F504;</button>`;
              status.className = 'wrong gameover';
              resetState();
            } else {
              status.innerHTML = `<div><h1>Nivå ${level}</h1><p>Fel! Försök igen!</p></div>${displayLives()}`
              status.className = 'wrong';
              saveState(currentSvg, currentSvg.className);
            }
          }
        }
      }, 100);
    }
  };

  const nextSvg = restoredSvg => {
    let randomChoice = Math.floor(Math.random() * svgs.length),
      randomSvg = restoredSvg ? restoredSvg[1] : svgs[randomChoice];
    if (randomSvg) {
      let newSvg = document.createElement('div'),
        currentSvg = document.querySelector('.svg.current');
      newSvg.className = 'svg new';
      newSvg.innerHTML = randomSvg;
      main.appendChild(newSvg);
      if (!restoredSvg) {
        svgs.splice(randomChoice, 1);
      }
      if (currentSvg) {
        currentSvg.classList.remove('current');
        currentSvg.classList.add('done');
        setTimeout(() => {
          main.removeChild(currentSvg);
        }, 600);
      }
      saveState(newSvg);
      setTimeout(() => {
        newSvg.classList.remove('new');
        newSvg.classList.add('current');
        if (restoredSvg && restoredSvg[0]) {
          newSvg.className = restoredSvg[0];
        }
      }, 500);
      Array.prototype.forEach.call(colorButtons, (button, i) => {
        setTimeout(() => {
          button.setAttribute('aria-disabled', 'false');
          if (restoredSvg && restoredSvg[0]) {
            if (restoredSvg[0].indexOf(button.className) > -1) {
              button.setAttribute('aria-disabled', 'true');
            }
          }
        }, i * 50);
      });
      status.className = '';
      setTimeout(() => {
        if (restoredSvg && restoredSvg[2]) {
          let lastClass = restoredSvg[0].split(' ')[restoredSvg[0].split(' ').length - 1];
          setTimeout(() => {
            colorClick({
              'target': document.querySelector(`nav.colors .${lastClass}`),
              'preventDefault': () => {
                lives -= 1;
              }
            });
          }, 600);
        } else {
          status.className = 'status';
          status.innerHTML = `<div><h1>Nivå ${level}</h1><p>Börja gissa!</p></div>${displayLives()}`;
        }
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
        resetState();
      }
    }
  });

  status.className = 'status';
  status.innerHTML = `<p>Nivå ${level}</p>${displayLives()}`;

  if (svgs && svgs.length) {
    nextSvg(svgFromState);
  } else {
    status.innerHTML = '<div><h1>Något gick fel!</h1></div><button class="playagain">Spela igen &#x1F504;</button>';
    status.className = 'wrong gameover';
  }
})();
