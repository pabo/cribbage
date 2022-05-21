enum Suit {
  Hearts,
  Clubs,
  Diamonds,
  Spades,
}

const shortSuit = {
  [Suit.Hearts]: "♥",
  [Suit.Clubs]: "♣",
  [Suit.Diamonds]: "♦",
  [Suit.Spades]: "♠",
};

enum Rank {
  Ace,
  Two,
  Three,
  Four,
  Five,
  Six,
  Seven,
  Eight,
  Nine,
  Ten,
  Jack,
  Queen,
  King,
}
const shortRank = {
  [Rank.Ace]: "A",
  [Rank.Two]: "2",
  [Rank.Three]: "3",
  [Rank.Four]: "4",
  [Rank.Five]: "5",
  [Rank.Six]: "6",
  [Rank.Seven]: "7",
  [Rank.Eight]: "8",
  [Rank.Nine]: "9",
  [Rank.Ten]: "10",
  [Rank.Jack]: "J",
  [Rank.Queen]: "Q",
  [Rank.King]: "K",
};

type CardParams = {
  rank?: Rank;
  suit?: Suit;
  index?: number;
};

class Card {
  public rank: Rank;
  private suit: Suit;
  public index: number;

  constructor({ rank, suit, index }: CardParams) {
    if (index !== undefined) {
      // @ts-ignore
      this.rank = Rank[Rank[index % 13]];
      // @ts-ignore
      this.suit = Suit[Suit[Math.floor(index / 13)]];
      this.index = index;
    } else {
      // @ts-ignore
      this.rank = rank;
      // @ts-ignore
      this.suit = suit;
      this.index = this.rank + this.suit * 13;
    }
  }

  isPairWith(card: Card) {
    return this.rank === card.rank;
  }

  get value() {
    return this.rank >= 9 ? 10 : this.rank + 1;
  }

  stringify() {
    // return `${Rank[this.rank]} of ${Suit[this.suit]} (${this.index})`;
    return `${shortRank[this.rank]}${shortSuit[this.suit]}`;
  }
}

// This class 'Hand' is a collection of cards. It could be the 4 cards in a players hand,
// the 5 cards of the players hand plus the flip, or any other collection of n cards
class Hand {
  private cards: Card[];

  constructor(cards: Card[]) {
    this.cards = cards;
  }

  get numCards() {
    return this.cards.length;
  }

  get isPair() {
    return this.numCards === 2 && this.cards[0].isPairWith(this.cards[1]);
  }

  get score() {
    let score = 0;
    // pairs
    for (let pair of this.getSetsOfLength(2)) {
      if (pair[0].rank === pair[1].rank) {
        score += 2;
      }
    }

    // 15s
    for (let set of this.getPowerset()) {
      const sum = set.reduce((acc: number, curr: Card) => acc + curr.value, 0);

      if (sum === 15) {
        score += 2;
      }
    }

    // runs
    // sort by set length desc
    // if run and its not a subset of previously recorded run, then score it
    const aIsSubsetOfB = (a: any[], b: any[]) =>
      a.every((val: any) => b.includes(val));
    const aIsSubsetOfanyB = (a: any[], b: any[]) =>
      b.some((x: any[]) => aIsSubsetOfB(a, x));

    const scoredRunSets = [];

    const possibleRunSets = this.getPowerset()
      .filter((set: Card[]) => set.length > 2)
      .sort((a: any, b: any) => b.length - a.length);

    for (let set of possibleRunSets) {
      const sortedSet = set.sort((a: Card, b: Card) => a.rank - b.rank);

      if (
        !aIsSubsetOfanyB(sortedSet, scoredRunSets) &&
        sortedSet.every((card: Card, i: number) => {
          return (
            i === sortedSet.length - 1 ||
            card.rank + 1 === sortedSet[i + 1].rank
          );
        })
      ) {
        scoredRunSets.push(sortedSet);
        score += set.length;
      }
    }

    return score;
    // return this.cards.map(card => card.value).reduce((acc, curr) => acc + curr);
  }

  stringify() {
    return this.cards.map((card) => card.stringify()).join(" ");
  }

  // thisHand.length Choose 4
  // TODO: generalize to choose n

  // without order, its the same as 6 choose 2, which is 6 * 5 / 2 = 15
  // returns an array of Hands
  // 1 2 3 4 (5 6)
  // 1 2 3 5 (4 6)
  // 1 2 3 6 (4 5)
  // 1 2 4 5 (3 6)
  // 1 2 4 6 (3 5)
  // 1 2 5 6 (3 4)
  // 1 3 4 5 (2 6)
  // 1 3 4 6 (2 5)
  // 1 3 5 6 (2 4)
  // 1 4 5 6 (2 3)
  // 3 4 5 6 (1 2)
  // 2 4 5 6 (1 3)
  // 2 3 5 6 (1 4)
  // 2 3 4 6 (1 5)
  // 2 3 4 5 (1 6)

  // not truly powerset since we filter the empty set....
  getPowerset() {
    return this.cards
      .reduce(
        (prev: any, curr: any) => {
          return prev.concat(prev.map((set: any) => [curr, ...set]));
        },
        [[]]
      )
      .filter((set: any) => set.length);
  }

  getSetsOfLength = (length: number) => {
    return this.getPowerset().filter((set: any[]) => set.length === length);
  };

  choose4() {
    const choices = [];

    for (let card1 = 0; card1 < this.cards.length; card1++) {
      for (let card2 = card1 + 1; card2 < this.cards.length; card2++) {
        choices.push(
          new Hand(
            this.cards.filter(
              (card, index) => index !== card1 && index !== card2
            )
          )
        );
      }
    }

    return choices;
  }
}

// const card = new Card(Rank.Ace, Suit.Hearts);
// const card = new Card({index: 32});
// console.log(`card is ${card.stringify()} with a value of ${card.value}`);

const main = () => {
  // generate every possible combination of 6 cards, generate every possible kept hand of 4 cards, and score them
  for (let card1 = 0; card1 < 52; card1++) {
    for (let card2 = card1 + 1; card2 < 52; card2++) {
      for (let card3 = card2 + 1; card3 < 52; card3++) {
        for (let card4 = card3 + 1; card4 < 52; card4++) {
          for (let card5 = card4 + 1; card5 < 52; card5++) {
            for (let card6 = card5 + 1; card6 < 52; card6++) {
              // for(let starter = card2+1; card3 < 52; card3++) {
              const hand = new Hand([
                new Card({ index: card1 }),
                new Card({ index: card2 }),
                new Card({ index: card3 }),
                new Card({ index: card4 }),
                new Card({ index: card5 }),
                new Card({ index: card6 }),
              ]);

              console.log(
                `Here's a hand: ${hand.stringify()} whose score(sum) is ${
                  hand.score
                }`
              );
              const choices = hand.choose4();
              choices.forEach((choice) => {
                console.log(
                  `possible choice: ${choice.stringify()} whose score(sum) is ${
                    choice.score
                  }`
                );
              });
            }
          }
        }
      }
    }
  }
};

const test = () => {
  const testCases = [
    {
      hand: new Hand([
        new Card({ index: 4 }),
        new Card({ index: 5 }),
        new Card({ index: 6 }),
        new Card({ index: 7 }),
        new Card({ index: 8 }),
      ]),
      expectedScore: 9,
    },
    {
      hand: new Hand([
        new Card({ index: 4 }),
        new Card({ index: 5 }),
        new Card({ index: 11 }),
        new Card({ index: 7 }),
        new Card({ index: 8 }),
      ]),
      expectedScore: 4,
    },
  ];

  for (let { hand, expectedScore } of testCases) {
    const score = hand.score;
    console.log(
      `${hand.stringify()} has a score of: ${
        hand.score
      } (expected ${expectedScore})`
    );

    if (score !== expectedScore) {
      console.log("ERROR!!!");
    }
  }
};

// main();
test();

// functions I need
// every possible combination of (choose 6 cards without replacement from 52)
// generate powerset of a hand (every possible combination of length 0,1,2,3,4... etc), order agnostic
// generate all subsets of fixed length n (every possible pair, set of 3, etc). This -could- just filter the powerset but probably not efficient.
