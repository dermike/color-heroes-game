(function game() {
  let level = 1,
    lives = 3,
    completedLevels = [],
    showNumbers = false,
    storage = Boolean('localStorage' in window),
    context,
    sounds = {
      'correct1': {
        'src': 'sounds/correct1.m4a'
      },
      'correct2': {
        'src': 'sounds/correct2.m4a'
      },
      'wrong': {
        'src': 'sounds/wrong.m4a'
      },
      'newlevel': {
        'src': 'sounds/newlevel.m4a'
      },
      'gameover': {
        'src': 'sounds/gameover.m4a'
      }
    },
    restoredState;

  const status = document.querySelector('[role="status"]');
  const main = document.querySelector('main');
  const colorButtons = document.querySelectorAll('nav a');

  const saveState = (guessedColors, completed) => {
    if (storage) {
      localStorage.setItem('gamestate', JSON.stringify(
        {
          'level': level,
          'lives': lives,
          'guessedColors': guessedColors,
          'completedLevels': completedLevels,
          'completed': completed,
          'showNumbers': showNumbers
        }
      ));
    }
  };

  const restoreState = () => {
    if (storage) {
      let gamestate = JSON.parse(localStorage.getItem('gamestate'));
      if (gamestate) {
        level = gamestate.level;
        lives = gamestate.lives;
        completedLevels = gamestate.completedLevels;
        showNumbers = gamestate.showNumbers;
        if (gamestate.completedLevels) {
          gamestate.completedLevels.forEach((val, i) => {
            if (i !== gamestate.completedLevels.length - 1) {
              svgs.splice(val, 1);
            }
          });
        }
        return gamestate;
      }
    }
    return false;
  };

  const resetState = () => {
    if (storage) {
      localStorage.removeItem('gamestate');
    }
  };

  const playSound = buffer => {
    let source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);
  };

  const loadSoundObj = obj => {
    let request = new XMLHttpRequest();
    request.open('GET', obj.src, true);
    request.responseType = 'arraybuffer';

    request.onload = function onload() {
      context.decodeAudioData(request.response, function reqload(buffer) {
        obj.buffer = buffer;
      }, function reqerr(err) {
        throw new Error(err);
      });
    };
    request.send();
  };

  const displayLives = () => {
    return `<button aria-disabled="true">${lives} &#x2764;&#xFE0F;</button>`;
  };

  const guessColor = (color, svg) => {
    let colorFound = false;
    Array.prototype.forEach.call(svg.querySelectorAll('.color.' + color), item => {
      item.classList.remove('color');
      colorFound = true;
    });
    return colorFound;
  };

  const setStatus = (markup, classes) => {
    status.className = '';
    setTimeout(() => {
      status.innerHTML = markup;
      status.className = classes ? classes : 'status';
    }, 100);
  };

  const colorClick = (e, noSound) => {
    if (e.target.getAttribute('aria-hidden') === 'true' || status.classList.contains('next') || status.classList.contains('gameover')) {
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
      // hide selected color
      e.target.setAttribute('aria-disabled', 'true');

      // add color class to fill color in svg
      currentSvg.classList.add(color);

      // remove .color class for selected color. No color = nothing left to guess
      correct = guessColor(color, currentSvg);
      if (!currentSvg.querySelectorAll('.current.svg .color').length) {
        lives += 1;
        setStatus(`<div><h1>Level ${level}</h1><p>Correct! +1 &#x2764;&#xFE0F;</p></div><button class="nextlevel">Next level &#x1F525;</button>`, 'correct next');
        playSound(!noSound ? sounds.correct2.buffer : null);
        saveState(currentSvg.className, true);
      } else {
        if (correct) {
          setStatus(`<div><h1>Level ${level}</h1><p>Correct! Keep guessing!</p></div>${displayLives()}`, 'correct');
          playSound(sounds.correct1.buffer);
          saveState(currentSvg.className);
        } else {
          lives -= 1;
          if (lives <= 0) {
            setStatus(`<div><h1>Game over!</h1><p>Level ${level}</div><button class="playagain">Play again &#x1F4AB;</button>`, 'wrong gameover');
            playSound(sounds.wrong.buffer);
            setTimeout(() => {
              playSound(sounds.gameover.buffer);
            }, 100);
            resetState();
          } else {
            setStatus(`<div><h1>Level ${level}</h1><p>Wrong! Try again!</p></div>${displayLives()}`, 'wrong');
            playSound(sounds.wrong.buffer);
            saveState(currentSvg.className);
          }
        }
      }
    }
    return true;
  };

  const nextSvg = previousState => {
    let randomChoice = Math.floor(Math.random() * svgs.length),
      svgIndex = previousState ? previousState.completedLevels[previousState.completedLevels.length - 1] : randomChoice,
      randomSvg = svgs[svgIndex];
    if (randomSvg) {
      let newSvg = document.createElement('div'),
        currentSvg = document.querySelector('.svg.current');
      newSvg.className = 'svg new';
      newSvg.innerHTML = randomSvg;
      main.appendChild(newSvg);
      if (!previousState) {
        completedLevels.push(svgIndex);
      }
      svgs.splice(svgIndex, 1);
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
        if (previousState && previousState.guessedColors) {
          newSvg.className = previousState.guessedColors;
        }
        saveState(newSvg.className);
      }, 500);
      Array.prototype.forEach.call(colorButtons, (button, i) => {
        if (showNumbers && !button.textContent) {
          button.textContent = i + 1;
        }
        setTimeout(() => {
          button.setAttribute('aria-disabled', 'false');
          if (previousState && previousState.guessedColors) {
            if (previousState.guessedColors.indexOf(button.className) > -1) {
              button.setAttribute('aria-disabled', 'true');
              guessColor(button.className, newSvg);
            }
          }
        }, i * 50);
      });
      if (previousState && previousState.completed) {
        let lastClass = previousState.guessedColors.split(' ')[previousState.guessedColors.split(' ').length - 1];
        setTimeout(() => {
          colorClick({
            'target': document.querySelector(`nav.colors .${lastClass}`),
            'preventDefault': () => {
              lives -= 1;
            }
          }, true, true);
        }, 600);
      } else {
        setStatus(`<div><h1>Level ${level}</h1><p>Start guessing!</p></div>${displayLives()}`);
        playSound(sounds.newlevel.buffer);
      }
    }
  };

  try {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();
  } catch (e) {
    throw new Error('No Web Audio support');
  }

  Array.prototype.forEach.call(colorButtons, button => {
    button.addEventListener('click', colorClick, false);
  });

  document.addEventListener('click', e => {
    if (e.target.classList.contains('startgame')) {
      if (svgs && svgs.length) {
        nextSvg();
      } else {
        setStatus('<div><h1>Something went wrong!</h1></div><button class="playagain">Play again &#x1F4AB;</button>', 'wrong gameover');
      }
    }
    if (e.target.classList.contains('playagain')) {
      document.location.reload();
    }
    if (e.target.classList.contains('nextlevel')) {
      if (svgs && svgs.length) {
        level += 1;
        nextSvg();
      } else {
        setStatus('<div><h1>You made it!</h1><p>Good job!</p></div><button class="playagain">Play again &#x1F4AB;</button>', 'correct gameover');
        resetState();
      }
    }
  });

  // Keyboard support for accessibility and feature phones with KaiOS
  // Enter/ArrowRight/ArrowDown for buttons and numbers 1-8 to select color.
  // If game is started with enter, numbers are visually added to colors.
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      let currentButton = document.querySelector('button:not([aria-disabled])');
      if (currentButton) {
        if (currentButton.classList.contains('startgame')) {
          showNumbers = true;
        }
        currentButton.blur();
        currentButton.click();
      }
    }
    if (!isNaN(e.key) && e.key > 0 && e.key < 9) {
      let colorPressed = colorButtons[e.key - 1];
      if (colorPressed && colorPressed.getAttribute('aria-disabled') !== 'true') {
        colorPressed.click();
      }
    }
  });

  loadSoundObj(sounds.correct1);
  loadSoundObj(sounds.correct2);
  loadSoundObj(sounds.wrong);
  loadSoundObj(sounds.newlevel);
  loadSoundObj(sounds.gameover);

  restoredState = restoreState();
  if (restoredState) {
    main.innerHTML = '';
    nextSvg(restoredState);
  } else {
    setStatus('<div><h1>Color Heroes &#x1F4A5;</div>' + displayLives());
  }
})();
