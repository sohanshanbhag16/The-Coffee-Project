/* ---------------- COFFEE TYPES ---------------- */
export const coffeeTypes = [
  {
    prefix: "AN",
    name: "Espresso",
    espresso: 100,
    milk: 0,
    water: 0,
    foam: 0,
    description: "Bold, intense, and unapologetically pure — the soul of every coffee."
  },
  {
    prefix: "AN",
    name: "Americano",
    espresso: 25,
    water: 75,
    milk: 0,
    foam: 0,
    description: "Smooth strength, softened with water — like espresso taking a deep breath."
  },
  {
    prefix: "A",
    name: "Latte",
    espresso: 20,
    milk: 75,
    foam: 5,
    water: 0,
    description: "Soft, creamy, and comforting — coffee wrapped in a blanket of milk."
  },
  {
    prefix: "A",
    name: "Cappuccino",
    espresso: 33,
    milk: 33,
    foam: 34,
    water: 0,
    description: "Perfectly balanced — rich espresso, silky milk, and airy foam in harmony."
  },
  {
    prefix: "A",
    name: "Flat White",
    espresso: 30,
    milk: 65,
    foam: 5,
    water: 0,
    description: "Velvety and bold — a smoother, stronger latte with a refined edge."
  },
  {
    prefix: "A",
    name: "Macchiato",
    espresso: 90,
    milk: 5,
    foam: 5,
    water: 0,
    description: "A sharp espresso kissed by milk — small, strong, and full of character."
  },
  {
    prefix: "A",
    name: "Mocha",
    espresso: 20,
    milk: 70,
    foam: 10,
    water: 0,
    description: "Where coffee meets chocolate — rich, indulgent, and dessert-like."
  }
];

/* ---------------- NORMALIZE ---------------- */
export const normalizeValues = ({ espresso, milk, water, foam }) => {
  const total = espresso + milk + water + foam || 1;

  return {
    espresso: (espresso / total) * 100,
    milk: (milk / total) * 100,
    water: (water / total) * 100,
    foam: (foam / total) * 100
  };
};

/* ---------------- SCORE ---------------- */
export const getCoffeeScore = (coffee, current) => {
  return (
    Math.abs(coffee.espresso - current.espresso) +
    Math.abs(coffee.milk - current.milk) +
    Math.abs(coffee.water - current.water) +
    Math.abs(coffee.foam - current.foam)
  );
};

/* ---------------- MAIN ENGINE ---------------- */
export const findBestCoffee = (values) => {
  const { espresso, milk, water, foam } = values;

  /* -------- EDGE CASES -------- */

  // Nothing
  if (espresso === 0 && milk === 0 && water === 0 && foam === 0) {
    return {
      coffee: {
        name: "Nothing yet",
        description: "Start adding ingredients to craft your drink."
      },
      score: 0
    };
  }

  // Only one ingredient
  const active = [espresso, milk, water, foam].filter(v => v > 0).length;

  if (active === 1) {
    if (espresso > 0) {
      return {
        coffee: coffeeTypes[0], // Espresso
        score: 1
      };
    }

    if (water > 0) {
      return {
        coffee: {
          name: "Hot Water",
          description: "Just water — not quite coffee yet."
        },
        score: 0
      };
    }

    if (milk > 0) {
      return {
        coffee: {
          name: "Steamed Milk",
          description: "Warm and creamy, but missing the coffee kick."
        },
        score: 0
      };
    }

    if (foam > 0) {
      return {
        coffee: {
          name: "Milk Foam",
          description: "Light and airy, but not a drink on its own."
        },
        score: 0
      };
    }
  }

  // No espresso → not coffee
  if (espresso === 0) {
    return {
      coffee: {
        name: "Not a Coffee",
        description: "Missing espresso — this isn’t a coffee drink."
      },
      score: 0
    };
  }

  /* -------- NORMAL MATCHING -------- */

  const current = normalizeValues(values);

  let bestCoffee = null;
  let bestScore = Infinity;

  for (const coffee of coffeeTypes) {
    const score = getCoffeeScore(coffee, current);

    if (score < bestScore) {
      bestScore = score;
      bestCoffee = coffee;
    }
  }

  // normalize score → 0 to 1
  const normalizedScore = 1 - bestScore / 400;

  return {
    coffee: bestCoffee,
    score: normalizedScore
  };
};

/* ---------------- MATCH % ---------------- */
export const getMatchPercentage = (score) => {
  return Math.round(score * 100);
};