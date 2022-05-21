// TODO: fuzzy borders between classes, referencing Card.value from outside of card class. is this bad?
// TODO: :any typescript decorators

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

  // can call constructor with either an index, or a rank and suit.
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

  // TODO: this could be made more performant. We generate and foreach through the power set multiple times...
  get score() {
    let score = 0;
    // pairs
    // generate all possible sets of 2 cards, check for pairs.
    for (let pair of getAllSets(this.cards, 2, 2)) {
      if (pair[0].rank === pair[1].rank) {
        score += 2;
      }
    }

    // 15s
    // generate all possible sets, check for sum = 15
    for (let set of getAllSets(this.cards)) {
      const sum = set.reduce((acc: number, curr: Card) => acc + curr.value, 0);

      if (sum === 15) {
        score += 2;
      }
    }

    // runs
    // sort by set length desc
    // if run and its not a subset of previously recorded run, then score it

    // Is the first array a subset of the second array?
    const aIsSubsetOfB = (a: any[], b: any[]) =>
      a.every((val: any) => b.includes(val));

    // Is the first array a subset of any of the arrays contained in the second array?
    const aIsSubsetOfanyB = (a: any[], b: any[]) =>
      b.some((x: any[]) => aIsSubsetOfB(a, x));

    // This will hold the sets that have already been scored as runs. When we score a run of 5,6,7,8 then we can ignore
    // the sub-runs of 5,6,7 and 6,7,8 when they come up later
    const scoredRunSets = [];

    const possibleRunSets = getAllSets(this.cards)
      .filter((set: Card[]) => set.length > 2) // runs have to be 3+ cards
      .sort((a: any, b: any) => b.length - a.length); // sort by length of the possible run, so we find the longest first

    for (let set of possibleRunSets) {
      const sortedSet = set.sort((a: Card, b: Card) => a.rank - b.rank); // sort each set to make it easier to detect runs

      if (
        !aIsSubsetOfanyB(sortedSet, scoredRunSets) && // make sure we haven't scored this run as part of a super-set
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
  }

  // returns a hand
  findOptimal4() {
    if (this.cards.length < 4) {
      return this;
    }

    const allSetsOf4 = getAllSets(this.cards, 4, 4);

    let bestScore = 0;
    let bestHand;

    for (let setOf4 of allSetsOf4) {
      const hand = new Hand(setOf4)
      const score = hand.score;

      if (score >= bestScore) {
        bestScore = score;
        bestHand = hand;
      }
    }

    console.log(`    the best scoring hand was ${(bestHand as Hand).stringify()} with a score of ${bestScore} `)
    return bestHand;
  }

  stringify() {
    return this.cards.map((card) => card.stringify()).join(" ");
  }

}

const main = () => {
  // generate every possible combination of 6 cards, generate every possible kept hand of 4 cards, and score them
  const NUMBER_OF_CARDS_IN_DECK = 10;
  const deckOfCardIndexes = [...Array(NUMBER_OF_CARDS_IN_DECK - 1).keys()];

  const allPossibleDeals = getAllSets(deckOfCardIndexes, 6, 6);

  for (let possibleDeal of allPossibleDeals) {

    const hand = new Hand(
      possibleDeal.map((index: number) => new Card({ index }))
    );

    console.log(`looking for best sub-hand of ${hand.stringify()}`)

    hand.findOptimal4();
  }
};

// get all possible sets of the given array, optionally filtered by set length
function getAllSets<T> (array: T[], minLength?: number, maxLength?: number): T[][] {
  return array
    .reduce(
      (prev, curr) => {
        const mapped = prev
          .map((set) => [curr, ...set])
          .filter((set) => {
            return maxLength === undefined || set.length <= maxLength;
          });

        return prev.concat(mapped);
      },
      [[] as T[]]
    )
    .filter(
      (set: any) =>
        set.length > 0 && (minLength === undefined || set.length >= minLength)
    );
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

main();
// test();
