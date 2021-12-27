// black = rgb(25, 25, 25) = hex(191919)
// white = rgb(245, 245, 245) = hex(F5F5F5)
// ↓ ↑ △ ▽ ❖

let card_width = 100;
let card_height = 150;
let hand_cards = 8;
let card_rect = function(x, y) {rect(x - card_width / 2, y - card_height / 2, card_width, card_height, card_width / 10);};

let n = [];
for (let i = 2; i <= 99; i++) {n.push(i);}
let card_pile = [];
while (n.length > 0) {card_pile.push(n.splice(Math.floor(Math.random() * n.length), 1)[0]);}

Object.prototype.copy = function() {
  let copy = {};
  for (let key in this) {
    if (typeof(this[key]) == "object") {
      copy[key] = this[key].copy();
    } else {
      copy[key] = this[key];
    }
  }
  return copy;
};

Array.prototype.copy = function() {
  let copy = [];
  for (let key = 0; key < this.length; key++) {
    if (typeof(this[key]) == "object") {
      copy[key] = this[key].copy();
    } else {
      copy[key] = this[key];
    }
  }
  return copy;
};

function CardObject(x, y) {
  this.x = x;
  this.y = y;

  this.is_inside = function(x, y) {
    return (x > this.x - card_width / 2) &&
    (x < this.x + card_width / 2) &&
    (y > this.y - card_height / 2) &&
    (y < this.y + card_height / 2);
  };
}

function Pile(x, y) {
  CardObject.call(this, x, y);

  this.draw = function() {
    fill(245);
    stroke(150);
    strokeWeight(2);
    card_rect(this.x, this.y);
    fill(150);
    noStroke();
    textSize(card_width / 2);
    textFont('Courier');
    textAlign(CENTER, CENTER);
    text(card_pile.length, this.x - card_width / 2, this.y - card_height / 2, card_width * 1.3, card_height);
  };
}

function Card(x, y, n) {
  CardObject.call(this, x, y);
  this.px = x;
  this.py = y;
  this.n = n;

  this.dragging = false;
  this.drag = function(x, y) {
    this.x += x;
    this.y += y;
  };

  this.snap = function() {
    for (let i of places) {
      if (i.is_valid(this.n) && i.is_inside(this.x, this.y)) {
        i.n = this.n;
        cards.splice(cards.indexOf(this), 1);
        undo_push();
        return;
      }
    }
    for (let i of slots) {
      if (i.is_inside(this.x, this.y)) {
        for (let j of cards) {
          if ((i.x == j.x) && (i.y == j.y)) {
            j.x = this.px;
            j.y = this.py;
            j.px = this.px;
            j.py = this.py;
            break;
          }
        }
        this.x = i.x;
        this.y = i.y;
        this.px = i.x;
        this.py = i.y;
        undo_push();
        return;
      }
    }
    this.x = this.px;
    this.y = this.py;
  };

  this.draw = function() {
    fill(245);
    stroke(25);
    strokeWeight(2);
    card_rect(this.x, this.y);
    fill(25);
    noStroke();
    textSize(card_width / 2);
    textFont('Courier');
    textAlign(CENTER, CENTER);
    text(this.n, this.x - card_width / 2, this.y - card_height / 2, card_width * 1.3, card_height);
  };
}

function Slot(x, y) {
  CardObject.call(this, x, y);

  this.update = function() {
    if (card_pile.length > 0) {
      for (let i of cards) {
        if ((i.x == this.x) && (i.y == this.y)) {return;}
      }
      cards.push(new Card(this.x, this.y, card_pile.pop()));
    }
  };

  this.draw = function() {
    fill(200);
    noStroke();
    card_rect(this.x, this.y);
  };
}

function Place(x, y, start, condition) {
  CardObject.call(this, x, y);
  this.n = start;
  if (condition == undefined) {condition = "true";}
  this.condition = condition;
  // x = card on place
  // o = card to push

  this.is_valid = function(o) {
    let x = this.n;
    return !!eval(this.condition);
  };

  this.draw = function() {
    fill(245);
    stroke(25);
    strokeWeight(2);
    card_rect(this.x, this.y);
    fill(25);
    noStroke();
    textSize(card_width / 2);
    textFont('Courier');
    textAlign(CENTER, CENTER);
    text(this.n, this.x - card_width / 2, this.y - card_height / 2, card_width * 1.3, card_height);
  };
}

function Label(x, y, lines) {
  CardObject.call(this, x, y);
  this.lines = lines;

  this.draw = function() {
    fill(245);
    stroke(150);
    strokeWeight(2);
    card_rect(this.x, this.y);
    fill(150);
    noStroke();
    textSize(card_width / 2);
    textFont('Courier');
    textAlign(CENTER, CENTER);
    let lh = card_height / this.lines.length;
    for (let l = 0; l < this.lines.length; l++) {
      text(this.lines[l], this.x - card_width / 2, this.y - card_height / 2 + lh * l, card_width * 1.3, lh);
    }
  };
}

function Button(x, y, w, h, t, click) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.t = t;
  this.click = click;
  this.enabled = true;

  this.is_inside = function(x, y) {
    return (x > this.x - this.w / 2) &&
    (x < this.x + this.w / 2) &&
    (y > this.y - this.h / 2) &&
    (y < this.y + this.h / 2);
  };

  this.draw = function() {
    fill(245);
    if (this.enabled) {stroke(25);} else {stroke(150);}
    strokeWeight(2);
    rect(x - this.w / 2, y - this.h / 2, this.w, this.h, this.h / 5);
    if (this.enabled) {fill(25);} else {fill(150);}
    noStroke();
    textSize(this.h / 2.5);
    textFont('Courier');
    textAlign(CENTER, CENTER);
    text(this.t, this.x - this.w / 2, this.y - this.h / 2, this.w * 1.05, this.h);
  };
}

let undo = [];
let undo_double = true;
function undo_push() {
  undo.push({
    card_pile: card_pile.copy(),
    cards: cards.copy(),
    places: places.map(z => z.n),
  });
  undo_double = true;
}
function undo_pop() {
  if (undo.length > 0) {
    let e = undo.pop();
    card_pile = e.card_pile.copy();
    cards = e.cards.copy();
    for (let i = 0; i < places.length; i++) {
      places[i].n = e.places[i];
    }
    if (cards.length <= hand_cards - 2) {
      buttons[1].enabled = true;
    } else {
      buttons[1].enabled = false;
    }
  }
  if (undo_double) {
    undo_double = false;
    undo_pop();
  }
}

let cards = [];
let slots = [];
let places = [];
let labels = [];
let pile;
let buttons = [];

function setup() {
  createCanvas(100, 100);
  windowResized();
  card_width = (width / height > 2) ? (height / 7) : (width / 14);
  card_height = card_width * 1.5;

  labels.push(new Label(width / 13 * 3, height / 4.25 * 1, ["100", "↑", "1"]));
  labels.push(new Label(width / 13 * 4, height / 4.25 * 1, ["100", "↑", "1"]));
  labels.push(new Label(width / 13 * 5, height / 4.25 * 1, ["100", "↓", "1"]));
  labels.push(new Label(width / 13 * 6, height / 4.25 * 1, ["100", "↓", "1"]));
  places.push(new Place(width / 13 * 3, height / 4.25 * 2, 1, "(o > x) || (o == x - 10)"));
  places.push(new Place(width / 13 * 4, height / 4.25 * 2, 1, "(o > x) || (o == x - 10)"));
  places.push(new Place(width / 13 * 5, height / 4.25 * 2, 100, "(o < x) || (o == x + 10)"));
  places.push(new Place(width / 13 * 6, height / 4.25 * 2, 100, "(o < x) || (o == x + 10)"));
  slots.push(new Slot(width / 13 * 3, height / 4.25 * 3.25));
  slots.push(new Slot(width / 13 * 4, height / 4.25 * 3.25));
  slots.push(new Slot(width / 13 * 5, height / 4.25 * 3.25));
  slots.push(new Slot(width / 13 * 6, height / 4.25 * 3.25));
  slots.push(new Slot(width / 13 * 7, height / 4.25 * 3.25));
  slots.push(new Slot(width / 13 * 8, height / 4.25 * 3.25));
  slots.push(new Slot(width / 13 * 9, height / 4.25 * 3.25));
  slots.push(new Slot(width / 13 * 10, height / 4.25 * 3.25));
  pile = new Pile(width / 13 * 10, height / 4.24 * 1);
  for (let i of slots) {i.update();}

  buttons.push(new Button(width / 13 * 9, height / 4.25 * 2.65, card_width, card_height / 5, "Sortieren",
    function() {
      let s = cards.map(z => z.n).sort((a, b) => a - b);
      for (let i = 0; i < hand_cards; i++) {
        if (s[i] != undefined) {
          cards[i].n = s[i];
          cards[i].x = slots[i].x;
          cards[i].y = slots[i].y;
          cards[i].px = slots[i].x;
          cards[i].py = slots[i].y;
        }
      }
      undo_push();
    }
  ));
  buttons.push(new Button(width / 13 * 10, height / 4.25 * 2.65, card_width, card_height / 5, "Zug beenden",
    function() {
      for (let i of slots) {i.update();}
      this.enabled = false;
      undo_push();
    }
  ));
  buttons[1].enabled = false;
  undo_push();
}

function draw() {
  background(245);
  for (let i of buttons) {i.draw();}
  pile.draw();
  for (let i of labels) {i.draw();}
  for (let i of places) {i.draw();}
  for (let i of slots) {i.draw();}
  for (let i of cards) {i.draw();}
}

function mousePressed(e) {
  for (let i of buttons) {
    if (i.enabled && i.is_inside(e.x, e.y)) {
      i.click();
      return;
    }
  }
  for (let i of cards) {
    if (i.is_inside(e.x, e.y)) {
      i.dragging = true;
      return;
    }
  }
}

function mouseReleased(e) {
  for (let i of cards) {
    if (i.dragging) {
      i.dragging = false;
      i.snap();
    }
  }
  if (cards.length <= hand_cards - 2) {
    buttons[1].enabled = true;
  } else {
    buttons[1].enabled = false;
  }
}

function mouseDragged(e) {
  for (let i of cards) {
    if (i.dragging) {
      i.drag(e.movementX, e.movementY);
    }
  }
}

function keyPressed(e) {
  if (e.key == "z") {
    undo_pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth - 30, windowHeight - 30);
}
